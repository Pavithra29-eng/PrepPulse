const pdfParse = require("pdf-parse"); // Correct standard default initialization
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");

/**
 * @description Controller to generate interview report based on user data layers
 */
async function generateInterViewReportController(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Resume file upload is missing from request." });
        }

        // Use standard pdf-parse handling directly on the file buffer
        let resumeText;
        try {
            const result = await pdfParse(req.file.buffer);
            resumeText = result.text;
        } catch (pdfError) {
            console.error("PDF Parsing Inner Error:", pdfError);
            return res.status(400).json({ message: "Failed to parse text from the uploaded PDF document." });
        }

        const { selfDescription, jobDescription } = req.body;

        const interViewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription,
            jobDescription
        });

        // Fallback to "guest" if req.user doesn't exist
        const interviewReport = await interviewReportModel.create({
            user: req.user?.id || "guest",
            resume: resumeText,
            selfDescription,
            jobDescription,
            ...interViewReportByAi
        });

        res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        });
    } catch (error) {
        console.error("Generation Controller Error:", error);
        res.status(500).json({ message: "Internal server error during report generation." });
    }
}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {
    try {
        const { interviewId } = req.params;
        const interviewReport = await interviewReportModel.findOne({ _id: interviewId });

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            });
        }

        res.status(200).json({
            message: "Interview report fetched successfully.",
            interviewReport
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
    }
}

/** 
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    try {
        const interviewReports = await interviewReportModel.find({})
            .sort({ createdAt: -1 })
            .select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan");

        res.status(200).json({
            message: "Interview reports fetched successfully.",
            interviewReports
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
    }
}

/**
 * @description Controller to generate resume document based on user information.
 */
async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params;
        const interviewReport = await interviewReportModel.findById(interviewReportId);

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            });
        }

        const { resume, jobDescription, selfDescription } = interviewReport;

        const htmlContent = await generateResumePdf({ resume, jobDescription, selfDescription });

        res.set({
            "Content-Type": "text/html",
            "Content-Disposition": `attachment; filename=tailored_resume_${interviewReportId}.html`,
            "Content-Length": Buffer.byteLength(htmlContent)
        });

        res.send(htmlContent);
    } catch (error) {
        console.error("Document Controller Error:", error);
        res.status(500).json({ message: "Failed to compile document binary." });
    }
}

module.exports = {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController
};