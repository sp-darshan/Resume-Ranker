import fs from "fs";
import { PDFParse } from "pdf-parse";
import { GoogleGenAI } from "@google/genai";
import mammoth from 'mammoth'
import User from '../models/userModel.js'
import Analysis from '../models/analysisModel.js'
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const JOB_MATCH_WEIGHTS = {
  keywordMatch: 0.4,
  experience: 0.25,
  education: 0.1,
  ats: 0.1,
  formatting: 0.1,
  readability: 0.05
}

const RESUME_ONLY_WEIGHTS = {
  ats: 0.35,
  formatting: 0.25,
  readability: 0.2,
  skillsCoverage: 0.2
}

const toScore = (value) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return 0
  return Math.max(0, Math.min(100, parsed))
}

const computeJobMatchOverall = (analysis) => {
  const keywordMatch = toScore(analysis.keyword_match_score)
  const experience = toScore(analysis.experience_score)
  const education = toScore(analysis.education_score)
  const ats = toScore(analysis.ats_compatibility_score)
  const formatting = toScore(analysis.formatting_score)
  const readability = toScore(analysis.readability_score)

  return Math.round(
    keywordMatch * JOB_MATCH_WEIGHTS.keywordMatch +
      experience * JOB_MATCH_WEIGHTS.experience +
      education * JOB_MATCH_WEIGHTS.education +
      ats * JOB_MATCH_WEIGHTS.ats +
      formatting * JOB_MATCH_WEIGHTS.formatting +
      readability * JOB_MATCH_WEIGHTS.readability
  )
}

const computeResumeOnlyOverall = (analysis) => {
  const ats = toScore(analysis.ats_compatibility_score)
  const formatting = toScore(analysis.formatting_score)
  const readability = toScore(analysis.readability_score)
  const skillsCoverage = toScore(analysis.skills_coverage_score)

  return Math.round(
    ats * RESUME_ONLY_WEIGHTS.ats +
      formatting * RESUME_ONLY_WEIGHTS.formatting +
      readability * RESUME_ONLY_WEIGHTS.readability +
      skillsCoverage * RESUME_ONLY_WEIGHTS.skillsCoverage
  )
}

const buildScoreBreakdown = (analysis, overallScore, hasJobDescription) => {
  if (hasJobDescription) {
    return {
      keyword_match: toScore(analysis.keyword_match_score),
      experience: toScore(analysis.experience_score),
      ats: toScore(analysis.ats_compatibility_score),
      formatting: toScore(analysis.formatting_score),
      readability: toScore(analysis.readability_score),
      education: toScore(analysis.education_score),
      overall: overallScore
    }
  }

  return {
    ats: toScore(analysis.ats_compatibility_score),
    formatting: toScore(analysis.formatting_score),
    readability: toScore(analysis.readability_score),
    skills_coverage: toScore(analysis.skills_coverage_score),
    overall: overallScore
  }
}

const hasRawScoreFields = (analysis, hasJobDescription) =>
  [
    'ats_compatibility_score',
    'formatting_score',
    'readability_score',
    ...(hasJobDescription ? ['keyword_match_score', 'experience_score', 'education_score'] : ['skills_coverage_score'])
  ].some((field) => analysis?.[field] !== undefined && analysis?.[field] !== null)

const extractTextFromFile = async (file) => {
  if (!file) return ''

  const filePath = file.path
  const fileName = (file.originalname || '').toLowerCase()
  const mimeType = file.mimetype || ''
  const buffer = await fs.promises.readFile(filePath)

  if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) {
    const parser = new PDFParse({ data: buffer })
    const result = await parser.getText()
    await parser.destroy()
    return result.text || ''
  }

  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.docx')
  ) {
    const { value } = await mammoth.extractRawText({ buffer })
    return value || ''
  }

  throw new Error('Only PDF and DOCX files are supported')
}

export const analyzeResume = async (req, res) => {
  const uploadedFiles = []
  try {
    console.log("Files received:", req.files);

    const resumeFile = req.files?.resume?.[0]
    const jobDescriptionFile = req.files?.jobDescriptionFile?.[0]

    if (!resumeFile) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    uploadedFiles.push(resumeFile.path)
    if (jobDescriptionFile) {
      uploadedFiles.push(jobDescriptionFile.path)
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

    const analysisNumber = (await Analysis.countDocuments({ userUid: clerkId })) + 1;

    const requiredTokens = 2;
    if (user.tokens < requiredTokens) {
      return res.status(400).json({ 
        message: "Insufficient tokens", 
        required: requiredTokens, 
        available: user.tokens 
      });
    }

    // Step 1: Read uploaded file
    const resumeText = await extractTextFromFile(resumeFile)

    console.log(
      "Resume text extracted:",
      resumeText.slice(0, 200) + "..."
    )

    // Step 3: Job description (optional)
    const typedJobDescription = (req.body?.jobDescription || req.body?.jobDescriptionText || '').trim()
    const uploadedJobDescription = jobDescriptionFile ? await extractTextFromFile(jobDescriptionFile) : ''
    const jobDescription = typedJobDescription || uploadedJobDescription || null;

    const currentDate = new Date().toISOString();

    // Step 4: Build prompt - short and score-focused
    let prompt;
    if (jobDescription) {
      prompt = `
      You are an AI Resume Analysis Engine integrated into an ATS system.

      CURRENT DATE:
      ${currentDate}

      DATE INTERPRETATION RULES:
      - Use the CURRENT DATE above as the source of truth.
      - Any experience whose start date is after CURRENT DATE must be treated as FUTURE EXPERIENCE.
      - Future experience must NOT contribute to total years of experience.
      - Future internships/jobs must be explicitly identified as future engagements in a new BULLETIN point and return in the same experience section.
      - Only completed or currently active experience should contribute to experience scoring.
      - Assume "Present" means active.
      - Do not assume "Present" means active if the start date is in the future.

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

      1. **ats_compatibility_score (0-100)**
        - Based on strict ATS parsing rules: standard sections, reverse chronological order, no tables, no columns, no graphics, no icons, and contact details present.

      2. **keyword_match_score (0-100)**
        - Based on exact and semantic overlap with the job description.
        - Penalize missing critical technical and domain terms.

      3. **experience_score (0-100)**
        - Score the quality of work history only.
        - No experience: 30, projects only: 50, internship: 65, multiple internships: 75, industry experience: 85, strong measurable impact: 95.

      4. **education_score (0-100)**
        - Score how well the education aligns with the role and domain.

      5. **missing_keywords**
        - List of important technical, domain, and tool-related terms present in the JOB DESCRIPTION but absent from the RESUME.

      6. **skills_extracted**
      {
        "technical": [],
        "soft": [],
        "domain": []
      }
        - Extract ONLY explicitly stated skills.
        - Do NOT infer skills from project titles or degree names.

      7. **experience_analysis**
      {
        "total_years": number,
        "relevant_experience": "2-3 line factual summary aligned strictly to the job description",
        "action_verbs_used": number,
        "quantified_results": number
      }
        - Count only resume-visible experience.
        - Projects/internships count only if clearly scoped and described.

      8. **education_analysis**
      {
        "degree": "string",
        "relevance_to_job": "Highly relevant | Partially relevant | Not relevant"
      }

      9. **formatting_score (0-100)**
        - Penalize dense text, inconsistent headings, weak sectioning, or non-standard formatting.

      10. **readability_score (0-100)**
        - Based on clarity, conciseness, grammar, and technical precision.

      11. **job_match_summary**
        - 40-60 words.
        - Neutral, ATS-style assessment of overall fit. No encouragement.

      12. **recommendations**
        - 3-5 critical, actionable improvements required to increase shortlisting chances.
        - No generic advice.

      Return response in **STRICT JSON format only, No Markdown, No commentary.**
      

      ### RESUME:
      ${resumeText}

      ### JOB DESCRIPTION:
      ${jobDescription}

      Expected output:
      {
        "ats_compatibility_score": 90,
        "keyword_match_score": 76,
        "experience_score": 80,
        "education_score": 85,
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
        "score_breakdown": {
          "keyword_match": 76,
          "experience": 80,
          "ats": 90,
          "formatting": 88,
          "readability": 80,
          "education": 85
        },
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

      CURRENT DATE:
      ${currentDate}

      DATE INTERPRETATION RULES:
      - Use the CURRENT DATE above as the source of truth.
      - Any experience whose start date is after CURRENT DATE must be treated as FUTURE EXPERIENCE.
      - Future experience must NOT contribute to total years of experience.
      - Future internships/jobs must be explicitly identified as future engagements in a new BULLETIN point and return in the same experience section.
      - Only completed or currently active experience should contribute to experience scoring.
      - Assume "Present" means active.
      - Do not assume "Present" means active if the start date is in the future.

      Analyze the following RESUME and return a detailed JSON analysis focusing on overall quality and ATS-readiness.

      ### TASK:
      Extract and evaluate the following fields:
      1. **ats_compatibility_score** (0-100)
      2. **skills_coverage_score** (0-100)
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
        "ats_compatibility_score": 92,
        "skills_coverage_score": 80,
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
        "score_breakdown": {
          "ats": 92,
          "skills_coverage": 80,
          "formatting": 88,
          "readability": 84
        },
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

    const hasJobDescription = Boolean(jobDescription)
    const validScoringPayload = analysis && typeof analysis === 'object' && hasRawScoreFields(analysis, hasJobDescription)

    if (validScoringPayload) {
      const computedOverallScore = hasJobDescription
        ? computeJobMatchOverall(analysis)
        : computeResumeOnlyOverall(analysis)
      analysis.overall_score = computedOverallScore
      analysis.score_breakdown = {
        ...(analysis.score_breakdown || {}),
        ...buildScoreBreakdown(analysis, computedOverallScore, hasJobDescription)
      }
    }

    // Step 7: ONLY IF ANALYSIS SUCCEEDS - Deduct tokens atomically
    if (validScoringPayload && Number.isFinite(analysis.overall_score)) {
      const savedAnalysis = await Analysis.create({
        userUid: clerkId,
        resumeName: resumeFile.originalname,
        jobDescription: jobDescription || '',
        analysisNumber,
        analysisMode: hasJobDescription ? 'job-match' : 'resume-only',
        overallScore: analysis.overall_score,
        formattingScore: toScore(analysis.formatting_score),
        readabilityScore: toScore(analysis.readability_score),
        atsScore: toScore(analysis.ats_compatibility_score),
        keywordScore: toScore(analysis.keyword_match_score),
        experienceScore: toScore(analysis.experience_score),
        educationScore: toScore(analysis.education_score),
        skillsCoverageScore: toScore(analysis.skills_coverage_score),
        scoreBreakdown: analysis.score_breakdown,
        tokenCost: requiredTokens,
        analysis
      })

      const updatedUser = await User.findOneAndUpdate(
        { uid: clerkId, tokens: { $gte: requiredTokens } },
        { $inc: { tokens: -requiredTokens } },
        { new: true }
      );

      if (!updatedUser) {
        await Analysis.deleteOne({ _id: savedAnalysis._id })
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
        analysisId: savedAnalysis._id,
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
    for (const filePath of uploadedFiles) {
      if (filePath && fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        console.log("Temporary file deleted:", filePath);
      }
    }
  }
};