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
      You are an AI Resume Analysis Engine integrated into an ATS system.
      Compare the following RESUME with the JOB DESCRIPTION and return a detailed JSON analysis.

      ### TASK:
      Extract and evaluate the following fields:
      1. **overall_score** (0–100)
      2. **ats_compatibility_score** (0–100)
      3. **keyword_match_score** (0–100)
      4. **missing_keywords**: [list of missing important terms from the job description]
      5. **skills_extracted**: { "technical": [], "soft": [], "domain": [] }
      6. **experience_analysis**: {
            "total_years": number,
            "relevant_experience": short summary (2–3 lines),
            "action_verbs_used": number,
            "quantified_results": number
        }
      7. **education_analysis**: {
            "degree": string,
            "relevance_to_job": string (e.g., "Highly relevant", "Partially relevant", "Not relevant")
        }
      8. **formatting_score** (0–100)
      9. **readability_score** (0–100)
      10. **job_match_summary**: short paragraph (40–60 words) summarizing overall fit
      11. **recommendations**: [3–5 bullet points on how to improve resume for this job]

      Return response in **STRICT JSON format** only, no Markdown, no commentary.

      ### RESUME:
      ${resumeText}

      ### JOB DESCRIPTION:
      ${jobDescription}

      Expected output:
      {
        "overall_score": 82,
        "ats_compatibility_score": 90,
        "keyword_match_score": 76,
        "missing_keywords": ["AWS", "CI/CD", "Microservices"],
        "skills_extracted": {
          "technical": ["Python", "TensorFlow", "React"],
          "soft": ["Leadership", "Communication"],
          "domain": ["AI", "Cybersecurity"]
        },
        "experience_analysis": {
          "total_years": 3,
          "relevant_experience": "Worked on ML model deployment using TensorFlow and FastAPI.",
          "action_verbs_used": 14,
          "quantified_results": 4
        },
        "education_analysis": {
          "degree": "B.Tech in Computer Science",
          "relevance_to_job": "Highly relevant"
        },
        "formatting_score": 88,
        "readability_score": 80,
        "job_match_summary": "Strong ML and Python background, good fit for AI roles but lacks cloud tools.",
        "recommendations": [
          "Add AWS or cloud-related experience.",
          "Quantify achievements with metrics.",
          "Include CI/CD pipeline experience."
        ]
      }
        `;
      } else {
        prompt = `
      You are an AI Resume Analysis Engine.
      Analyze the following RESUME and return a detailed JSON analysis focusing on overall quality and ATS-readiness.

      ### TASK:
      Extract and evaluate the following fields:
      1. **overall_score** (0–100)
      2. **ats_compatibility_score** (0–100)
      3. **skills_extracted**: { "technical": [], "soft": [], "domain": [] }
      4. **experience_analysis**: {
            "total_years": number,
            "action_verbs_used": number,
            "quantified_results": number,
            "summary": short description
        }
      5. **education_analysis**: {
            "degree": string,
            "institution": string,
            "relevance_to_industry": string
        }
      6. **formatting_score** (0–100)
      7. **readability_score** (0–100)
      8. **general_comment**: short paragraph (40–60 words)
      9. **recommendations**: [3–5 points for improvement]

      Return response in **STRICT JSON format** only.

      ### RESUME:
      ${resumeText}

      Expected output:
      {
        "overall_score": 85,
        "ats_compatibility_score": 92,
        "skills_extracted": {
          "technical": ["Python", "SQL", "React"],
          "soft": ["Teamwork", "Communication"],
          "domain": ["Data Analysis"]
        },
        "experience_analysis": {
          "total_years": 2,
          "action_verbs_used": 10,
          "quantified_results": 3,
          "summary": "Hands-on with ML and web development projects."
        },
        "education_analysis": {
          "degree": "B.Tech in Computer Science",
          "institution": "XYZ University",
          "relevance_to_industry": "Highly relevant"
        },
        "formatting_score": 88,
        "readability_score": 84,
        "general_comment": "Good overall structure and readability; could improve metrics in experience section.",
        "recommendations": [
          "Add quantified achievements.",
          "Highlight technical certifications.",
          "Keep consistent formatting across sections."
        ]
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
