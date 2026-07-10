import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'

const Register = () => {
    const navigate = useNavigate()
    const { loading, handleRegister } = useAuth()

    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("") // ✅ Added local error state

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("") // Clear prior errors

        try {
            await handleRegister({ username, email, password })
            navigate("/")
        } catch (err) {
            // ✅ Safely captures the thrown backend message or applies a fallback
            setError(err.response?.data?.message || "Registration failed. Try again.")
            console.error("Registration Error:", err)
        }
    }

    if (loading) {
        return (<main className="loading-state"><h1>Creating Account...</h1></main>)
    }

    return (
        <main className="auth-page">
            <div className="form-container">
                {/* Brand Header */}
                <div className="brand-header">
                    <span className="brand-icon">💠</span>
                    <h1>Interview<span className="highlight">Ace</span></h1>
                </div>

                {/* ✅ Render the error notification if registration fails */}
                {error && <p className="error-message" style={{ color: '#ff4d4d', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            required // ✅ Don't let users send empty text
                            onChange={(e) => { setUsername(e.target.value) }}
                            type="text" id="username" name='username' placeholder='Enter username' />
                    </div>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            required // ✅ Validates email presence
                            onChange={(e) => { setEmail(e.target.value) }}
                            type="email" id="email" name='email' placeholder='Enter email address' />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            required // ✅ Validates password presence
                            onChange={(e) => { setPassword(e.target.value) }}
                            type="password" id="password" name='password' placeholder='Enter password' />
                    </div>

                    <button type="submit" className='button primary-button'>Register</button>
                </form>

                <p>Already have an account? <Link to={"/login"}>Login</Link> </p>
            </div>
        </main>
    )
}

export default Register