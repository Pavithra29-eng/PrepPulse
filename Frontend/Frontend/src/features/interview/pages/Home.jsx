import React, { useState, useRef, useEffect } from 'react'
import "../style/home.scss"
import { useInterview } from '../hooks/useInterview.js'
import { useAuth } from '../../auth/hooks/useAuth.js'
import { useNavigate } from 'react-router'

const Home = () => {
    const { generating, generateReport, error } = useInterview()
    const { handleLogout } = useAuth()
    const [jobDescription, setJobDescription] = useState("")
    const [selfDescription, setSelfDescription] = useState("")
    const [fileName, setFileName] = useState("")
    const [loadingStep, setLoadingStep] = useState(0)
    const [formError, setFormError] = useState("")

    const resumeInputRef = useRef()
    const navigate = useNavigate()

    const loadingMessages = [
        "Reading your resume...",
        "Analyzing job requirements...",
        "Identifying skill gaps...",
        "Generating interview questions...",
        "Finalizing your roadmap..."
    ];

    useEffect(() => {
        let interval;
        if (generating) {
            interval = setInterval(() => {
                setLoadingStep((prev) => (prev < 4 ? prev + 1 : prev));
            }, 6000);
        } else {
            setLoadingStep(0);
        }
        return () => clearInterval(interval);
    }, [generating]);

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (file.type !== "application/pdf") {
                setFormError("Only PDF resumes are supported.")
                e.target.value = ""
                setFileName("")
                return
            }
            if (file.size > 3 * 1024 * 1024) {
                setFormError("Resume file is too large. Maximum allowed size is 3MB.")
                e.target.value = ""
                setFileName("")
                return
            }
            setFormError("")
            setFileName(file.name)
        }
    }

    const handleGenerateReport = async () => {
        setFormError("")

        if (!jobDescription.trim()) {
            setFormError("Please provide a target job description.")
            return
        }

        try {
            const resumeFile = resumeInputRef.current?.files[0]

            // Call the generate function from your hook
            const data = await generateReport({
                jobDescription,
                selfDescription,
                resumeFile
            })

            // Only navigate if we actually got a response with an ID
            if (data && data._id) {
                navigate(`/interview/${data._id}`)
            }
        } catch (err) {
            console.error("Error generating report:", err)
        }
    }

    const handleLogoutClick = async () => {
        try {
            await handleLogout()
        } finally {
            navigate("/login", { replace: true })
        }
    }

    if (generating) {
        return (
            <main className='loading-screen'>
                <div className="loader-container">
                    <div className="spinner"></div>
                    <h1>Generating your personalized plan...</h1>
                    <div className="status-steps">
                        {loadingMessages.map((msg, index) => (
                            <p key={index} className={`status-msg ${index === loadingStep ? 'active' : index < loadingStep ? 'completed' : 'pending'}`}>
                                {index < loadingStep ? "✓ " : index === loadingStep ? "→ " : "○ "}
                                {msg}
                            </p>
                        ))}
                    </div>
                </div>
            </main>
        )
    }

    return (
        <div className='home-page'>
            <header className='page-header'>
                <h1>Create Your Custom <span className='highlight'>Interview Plan</span></h1>
                <p>Let our AI analyze the job requirements and your unique profile to build a winning strategy.</p>
            </header>

            {(formError || error) && (
                <p className="error-message" style={{ color: '#ff4d4d', textAlign: 'center', marginBottom: '1rem' }}>
                    {formError || error}
                </p>
            )}

            <div className='interview-card'>
                <div className='interview-card__body'>
                    <div className='panel panel--left'>
                        <div className='panel__header'>
                            <span className='panel__icon'><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg></span>
                            <h2>Target Job Description</h2>
                            <span className='badge badge--required'>Required</span>
                        </div>
                        <textarea
                            onChange={(e) => { setJobDescription(e.target.value) }}
                            className='panel__textarea'
                            placeholder={`Paste the job description here...`}
                            maxLength={5000}
                        />
                        <div className='char-counter'>{jobDescription.length} / 5000 chars</div>
                    </div>

                    <div className='panel-divider' />

                    <div className='panel panel--right'>
                        <div className='panel__header'>
                            <span className='panel__icon'><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg></span>
                            <h2>Your Profile</h2>
                        </div>
                        <div className='upload-section'>
                            <label className={`dropzone ${fileName ? 'dropzone--active' : ''}`} htmlFor='resume'>
                                {fileName ? (
                                    <div className='file-info'>
                                        <p className='dropzone__title' style={{ color: '#4ade80' }}>✓ {fileName}</p>
                                        <p className='dropzone__subtitle'>Click to change file</p>
                                    </div>
                                ) : (
                                    <>
                                        <p className='dropzone__title'>Click to upload Resume</p>
                                        <p className='dropzone__subtitle'>PDF only (Max 3MB)</p>
                                    </>
                                )}
                                <input ref={resumeInputRef} hidden type='file' id='resume' onChange={handleFileChange} accept='.pdf,application/pdf' />
                            </label>
                        </div>
                        <div className='or-divider'><span>OR</span></div>
                        <textarea
                            onChange={(e) => { setSelfDescription(e.target.value) }}
                            className='panel__textarea panel__textarea--short'
                            placeholder="Briefly describe your experience..."
                        />
                    </div>
                </div>

                <div className='interview-card__footer'>
                    <span className='footer-info'>AI-Powered Strategy &bull; Approx 30s</span>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {/* Logout Button */}
                        <button
                            onClick={handleLogoutClick}
                            className='generate-btn'
                            style={{ background: '#333', border: '1px solid #444' }}
                        >
                            Logout
                        </button>

                        {/* Generate Button */}
                        <button onClick={handleGenerateReport} className='generate-btn'>
                            Generate My Interview Strategy
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home