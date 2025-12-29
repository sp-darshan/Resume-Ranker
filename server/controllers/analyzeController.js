import fs from "fs";
import { PDFParse } from "pdf-parse";
import { GoogleGenAI } from "@google/genai";
import User from '../models/userModel.js'
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

    // Step 0: Check user authentication and tokens
    const clerkId = req.user?.sub;
    if (!clerkId) {
      return res.status(401).json({ message: "Unauthorized: No user ID found" });
    }

    // Check if user has sufficient tokens BEFORE processing
    const user = await User.findOne({ uid: clerkId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const requiredTokens = 2;
    if (user.tokens < requiredTokens) {
      return res.status(400).json({ 
        message: "Insufficient tokens", 
        required: requiredTokens, 
        available: user.tokens 
      });
    }

    // Step 1: Read uploaded file
    filePath = req.file.path;
    const pdfBuffer = fs.readFileSync(filePath);

    // Step 2: Extract text
    const parser = new PDFParse({ data: pdfBuffer });
    const result = await parser.getText();
    await parser.destroy();

    const resumeText = result.text || "";
    console.log("PDF text extracted successfully:", resumeText.slice(0, 200) + "...");

    // Step 3: Job description (optional)
    const jobDescription = req.body?.jobDescription || null;

    // Step 4: Build prompt - short and score-focused
    let prompt;
    if (jobDescription) {
      prompt = `
      You are an AI Resume Analysis Engine integrated into an ATS system.

      Your evaluation must follow a STRICT, DETERMINISTIC, and MENTOR-STYLE grading pattern.

      **CRITICAL EVALUATION RULES (MANDATORY):**
      - **Be direct, critical, and professional. No sugarcoating.**
      - **Do NOT assume skills, intent, or potential. Evaluate ONLY what is explicitly written.**
      - **Penalize missing keywords, vague experience, weak alignment, and poor formatting heavily.**
      - **Scores MUST NOT fluctuate across multiple runs for identical input.**
      - **Partial matches receive partial credit. Inferred skills receive ZERO credit.**
      - **If evidence is weak or absent, score low.**

      **Compare the following RESUME with the JOB DESCRIPTION and return a detailed JSON analysis.**

      ### TASK:
      Extract and evaluate the following fields:

      1. **overall_score (0-100)**
        - Fixed composite score based on skills match, experience relevance, education alignment, and ATS readiness.

      2. **ats_compatibility_score (0-100)**
        - Based on structure, section clarity, ATS parsability, and absence of ATS-breaking elements.

      3. **keyword_match_score (0-100)**
        - Based on exact and semantic overlap with the job description.
        - Penalize missing critical technical and domain terms.

      4. **missing_keywords**
        - List of important technical, domain, and tool-related terms present in the JOB DESCRIPTION but absent from the RESUME.

      5. **skills_extracted**
      {
        "technical": [],
        "soft": [],
        "domain": []
      }
        - Extract ONLY explicitly stated skills.
        - Do NOT infer skills from project titles or degree names.

      6. **experience_analysis**
      {
        "total_years": number,
        "relevant_experience": "2-3 line factual summary aligned strictly to the job description",
        "action_verbs_used": number,
        "quantified_results": number
      }
        - Count only resume-visible experience.
        - Projects/internships count only if clearly scoped and described.

      7. **education_analysis**
      {
        "degree": "string",
        "relevance_to_job": "Highly relevant | Partially relevant | Not relevant"
      }

      8. **formatting_score (0-100)**
        - Penalize dense text, inconsistent headings, weak sectioning, or non-standard formatting.

      9. **readability_score (0-100)**
        - Based on clarity, conciseness, grammar, and technical precision.

      10. **job_match_summary**
        - 40-60 words.
        - Neutral, ATS-style assessment of overall fit. No encouragement.

      11. **recommendations**
        - 3-5 critical, actionable improvements required to increase shortlisting chances.
        - No generic advice.

      Return response in **STRICT JSON format only, No Markdown, No commentary.**
      

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
      1. **overall_score** (0-100)
      2. **ats_compatibility_score** (0-100)
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
      6. **formatting_score** (0-100)
      7. **readability_score** (0-100)
      8. **general_comment**: short paragraph (40-60 words)
      9. **recommendations**: [3-5 points for improvement]

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

    // Step 7: ONLY IF ANALYSIS SUCCEEDS - Deduct tokens atomically
    if (analysis && (analysis.overall_score !== null && analysis.overall_score !== undefined)) {
      const updatedUser = await User.findOneAndUpdate(
        { uid: clerkId, tokens: { $gte: requiredTokens } },
        { $inc: { tokens: -requiredTokens } },
        { new: true }
      );

      if (!updatedUser) {
        // Race condition - someone else used tokens
        return res.status(400).json({ 
          message: "Insufficient tokens", 
          required: requiredTokens,
          available: user.tokens
        });
      }

      console.log(`Tokens deducted successfully. Remaining: ${updatedUser.tokens}`);

      // Step 8: Send successful response with analysis and updated token count
      res.json({
        message: jobDescription
          ? "Resume analyzed against job description successfully"
          : "Resume analyzed successfully",
        analysis,
        tokensDeducted: requiredTokens,
        remainingTokens: updatedUser.tokens
      });
    } else {
      // Analysis failed - no tokens deducted
      res.status(500).json({
        message: "Analysis failed - invalid response from AI model",
        error: "No valid analysis result generated"
      });
    }

  } catch (error) {
    console.error("Error analyzing resume:", error);
    res.status(500).json({
      message: "Error analyzing resume",
      error: error.message,
    });
  } finally {
    // Always delete temporary file
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("Temporary file deleted:", filePath);
    }
  }
};