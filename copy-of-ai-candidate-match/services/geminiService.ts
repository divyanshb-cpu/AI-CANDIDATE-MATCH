
import { GoogleGenAI, Type } from "@google/genai";
import { type Candidate, type ParsedResume } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      candidateName: {
        type: Type.STRING,
        description: "The full name of the candidate, extracted from the resume or file name."
      },
      matchPercentage: {
        type: Type.INTEGER,
        description: "A score from 0 to 100 indicating how well the candidate's resume matches the job description."
      },
      keyNotes: {
        type: Type.STRING,
        description: "A brief, 1-2 sentence summary explaining the match score. Mention key skills that match, relevant experience, and any notable missing qualifications."
      }
    },
    required: ["candidateName", "matchPercentage", "keyNotes"]
  }
};

const buildPrompt = (resumes: ParsedResume[], jobDescription: string): string => {
  const resumeTexts = resumes.map(resume => 
    `--- RESUME START: ${resume.fileName} ---\n${resume.content}\n--- RESUME END: ${resume.fileName} ---`
  ).join('\n\n');

  return `
    **Objective:** You are an expert technical recruiter. Your task is to analyze the provided resumes against the given job description and return a ranked list of candidates.

    **Job Description:**
    ${jobDescription}

    **Resumes:**
    ${resumeTexts}

    **Instructions:**
    1.  Carefully read the job description to understand the key requirements, skills, and experience needed.
    2.  For each resume, compare the candidate's qualifications against the job description.
    3.  Assign a "matchPercentage" from 0 to 100. A higher score means a better fit.
    4.  Extract the candidate's name. If the name is not obvious, use the file name as the candidate's name.
    5.  Write a concise "keyNotes" summary for each candidate, highlighting their strengths (e.g., "Excellent match for React and Node.js skills") and weaknesses (e.g., "Lacks required 5 years of management experience").
    6.  Return the analysis as a JSON array of objects, strictly following the provided schema. Do not include any text outside of the JSON array.
  `;
};

export async function analyzeResumes(resumes: ParsedResume[], jobDescription: string): Promise<Candidate[]> {
  const prompt = buildPrompt(resumes, jobDescription);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2,
      },
    });

    const responseText = response.text.trim();
    const result = JSON.parse(responseText);
    
    // Basic validation to ensure we have an array of candidates
    if (Array.isArray(result) && result.every(item => 'candidateName' in item && 'matchPercentage' in item && 'keyNotes' in item)) {
        return result as Candidate[];
    } else {
        throw new Error("AI response did not match the expected format.");
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get a valid response from the AI. The model may be overloaded or the prompt was too complex.");
  }
}
