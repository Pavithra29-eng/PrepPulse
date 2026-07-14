const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")

// Create instance using your specific environment key
const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

// Validation Schema configuration
const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job description"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question that can be asked in the interview"),
        intention: z.string().describe("The intention of the interviewer written in simple, easy words"),
        answer: z.string().describe("Model Answer: High-level guidance outlining core key terms and concepts in simple words"),
        sampleAnswer: z.string().describe("Sample Answer: A clear, direct, realistic interview response written in first-person ('I worked on...', 'In my experience...') from a smart candidate's point of view. Completely simple and easy to understand.")
    })).describe("Technical questions with simple intention, model answer guidelines, and direct candidate responses"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The behavioral question that can be asked in the interview"),
        intention: z.string().describe("The intention of the interviewer written in simple, easy words"),
        answer: z.string().describe("Model Answer: High-level guidelines outlining the required professional traits in simple words"),
        sampleAnswer: z.string().describe("Sample Answer: A clear, first-person narrative response ('When I faced...', 'My approach was...') simulating an ideal interview candidate. Direct, grounded, and easy to understand.")
    })).describe("Behavioral questions with simple intention, model answer guidelines, and direct candidate responses"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum(["low", "medium", "high"]).describe("The severity of this skill gap")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in simple terms"),
        tasks: z.array(z.string()).describe("List of simple, action-oriented tasks to be done on this day")
    })).describe("A day-wise preparation plan for the candidate to follow"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    const prompt = `Generate a realistic interview preparation report based on the following context details:
                    Resume: ${resume}
                    Self Description: ${selfDescription}
                    Job Description: ${jobDescription}

                    CRITICAL INSTRUCTIONS:
                    1. Keep all language simple, clear, and extremely easy to understand. Omit abstract jargon.
                    2. Provide direct answers. Do not include meta-commentary, introductory filler text, or external meta-suggestions.
                    3. For both technical and behavioral fields, ensure the "sampleAnswer" is written dynamically in the first person ("I built...", "In my past team...") as a perfect response spoken directly by a candidate during an interview.`

    // Pull the schema structure configuration
    const parsedSchema = zodToJsonSchema(interviewReportSchema);

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: parsedSchema
        }
    })

    return JSON.parse(response.text)
}

async function generatePdfFromHtml(htmlContent) {
    // Modified: Appended --no-sandbox flags so Chromium compiles successfully inside server containers
    const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    })
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4",
        margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    })

    await browser.close()
    return pdfBuffer
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using puppeteer")
    })

    const parsedResumeSchema = zodToJsonSchema(resumePdfSchema);

    const prompt = `Generate a professional resume for a candidate with the following details:
                    Resume: ${resume}
                    Self Description: ${selfDescription}
                    Job Description: ${jobDescription}

                    The response should be a JSON object with a single field "html" containing clean HTML layout rules. 
                    The resume must be tailored for the given job description, human-sounding, professional, ATS-friendly, and formatted to translate perfectly into a clean 1-2 page A4 PDF document.`

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: parsedResumeSchema
        }
    })

    const jsonContent = JSON.parse(response.text)
    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)
    return pdfBuffer
}

module.exports = { generateInterviewReport, generateResumePdf }