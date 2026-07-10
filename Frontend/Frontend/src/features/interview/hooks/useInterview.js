import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api"
import { useContext, useEffect } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"

export const useInterview = () => {
    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, generating, setGenerating, report, setReport, reports, setReports, error, setError } = context

    // 1. Generate new report
    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setGenerating(true)
        setError(null)
        let response = null
        try {
            response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            setReport(response.interviewReport)
        } catch (error) {
            console.error("Generate Report Error:", error)
            setError(error.response?.data?.message || "Failed to generate your interview report. Please try again.")
            throw error
        } finally {
            setGenerating(false)
        }
        return response?.interviewReport
    }

    // 2. Fetch a specific report
    const getReportById = async (id) => {
        setLoading(true)
        setError(null)
        let response = null
        try {
            response = await getInterviewReportById(id)
            setReport(response.interviewReport)
        } catch (error) {
            console.error("Get Report By ID Error:", error)
            setError(error.response?.data?.message || "Failed to load this interview report.")
        } finally {
            setLoading(false)
        }
        return response?.interviewReport
    }

    // 3. Fetch all history
    const getReports = async () => {
        setLoading(true)
        let response = null
        try {
            response = await getAllInterviewReports()
            setReports(response.interviewReports)
        } catch (error) {
            console.error("Get Reports Error:", error)
        } finally {
            setLoading(false)
        }
        return response?.interviewReports
    }

    // 4. Download PDF with proper Blob handling
    const getResumePdf = async (id) => {
        try {
            const response = await generateResumePdf({ interviewReportId: id })

            // Convert raw streaming response structure directly into standard Document Blob layout
            const blob = new Blob([response], { type: "application/pdf" })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `Interview_Strategy_${id}.pdf`)
            document.body.appendChild(link)
            link.click()

            // Memory cleanup
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error("PDF Download Error:", error)
        }
    }

    // Auto-fetch data safely depending on routing perspective
    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        } else {
            getReports()
        }
    }, [interviewId])

    return {
        loading,
        generating,
        error,
        report,
        reports,
        generateReport,
        getReportById,
        getReports,
        getResumePdf
    }
}