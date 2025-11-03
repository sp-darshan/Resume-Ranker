import fs from "fs";
import { PDFParse } from "pdf-parse";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const analyzeResume = async (req, res) => {
  let filePath;
  try {
    console.log("File received:", req.file);

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Step 1: Read uploaded file
    const filePath = req.file.path;
    const pdfBuffer = fs.readFileSync(filePath);

    // Step 2: Extract text
    const parser = new PDFParse({ data: pdfBuffer });
    const result = await parser.getText();
    await parser.destroy();

    const resumeText = result.text || "";
    console.log("PDF text extracted successfully:", resumeText.slice(0, 200) + "...");

    // Step 3: Job description (optional)
    const jobDescription = req.body?.jobDescription || null;

    // Step 4: Build prompt — short and score-focused
    let prompt;
    if (jobDescription) {
      prompt = `
        You are an AI resume evaluator.
        Compare the resume to the following job description and provide:
        1. A suitability score between 0–100 (integer only)
        2. A very short comment (10–20 words) summarizing fit/strength/weakness.

        --- Resume ---
        ${resumeText}

        --- Job Description ---
        ${jobDescription}

        Respond in strict JSON format like:
        {
          "score": 85,
          "comment": "Strong in ML and Python but lacks cloud experience."
        }
      `;
    } else {
      prompt = `
        You are an AI resume evaluator.
        Based on the resume alone, provide:
        1. An overall quality score between 0–100 (integer only)
        2. A brief (10–20 words) professional comment on the resume.

        --- Resume ---
        ${resumeText}

        Respond in strict JSON format like:
        {
          "score": 90,
          "comment": "Excellent academic and ML experience, strong technical foundation."
        }
      `;
    }

    console.log("Sending to Gemini model...");

    // Step 5: Use Gemini API
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });


    // Step 6: Parse clean JSON output
    let text = response.text.trim();
    console.log("Gemini raw response:", text);
    // Remove Markdown-style code fences like ```json ... ```
    text = text.replace(/```json|```/g, "").trim();

    let analysis;
    try {
      analysis = JSON.parse(text);
    } catch {
      analysis = { score: null, comment: text };
    }

    // Step 7: Send response
    res.json({
      message: jobDescription
        ? "Resume analyzed against job description successfully"
        : "Resume analyzed successfully",
      analysis,
    });
  } catch (error) {
    console.error("Error analyzing resume:", error);
    res.status(500).json({
      message: "Error analyzing resume",
      error: error.message,
    });
    // step 8: Temporary files deletion
  } finally {
    // Always delete file, success or failure
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("Temporary file deleted:", filePath);
    }
  }
};
