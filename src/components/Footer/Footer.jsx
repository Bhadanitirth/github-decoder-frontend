import React, { useState } from 'react';
import { FaEnvelope, FaArrowUp, FaKey, FaCheck, FaTimes } from 'react-icons/fa';
import './Footer.css';
import { Link } from 'react-router-dom';
import { BASE_URL } from '../config'; // Ensure BASE_URL is imported from your config file

const Footer = () => {
    const [showTokenInput, setShowTokenInput] = useState(false);
    const [newToken, setNewToken] = useState('');
    const [status, setStatus] = useState(null); // 'loading', 'success', 'error'

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleUpdateToken = async () => {
        if (!newToken.trim()) return;

        setStatus('loading');
        try {
            // Using the new Admin API to update token without server restart
            const response = await fetch(`${BASE_URL}/api/admin/update-token?token=${newToken}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setStatus('success');
                setTimeout(() => {
                    setShowTokenInput(false);
                    setStatus(null);
                    setNewToken('');
                    alert("GitHub Token updated successfully! Server is live with new key.");
                }, 1000);
            } else {
                setStatus('error');
                alert("Failed to update token. Check connection.");
            }
        } catch (error) {
            console.error("Error updating token:", error);
            setStatus('error');
            alert("Error connecting to server.");
        }
    };

    return (
        <footer className="footer">
            <button className="back-to-top" onClick={scrollToTop}>
                <FaArrowUp />
            </button>
            <p>&copy; 2025 DDU BTech(IT) . All rights reserved.</p>
            <div className="contact-info">
                <div className="contact-item">
                    <FaEnvelope className="contact-icon" />
                    <span>bhadanitirth@gmail.com, Agrawalgaurang@gmail.com</span>
                </div>
            </div>
            <div className="footer-links">
                <Link to="/privacy-policy" className="footer-link">Privacy Policy</Link>
                <Link to="/terms-of-service" className="footer-link">Terms of Service</Link>

                {/* --- NEW TOKEN UPDATER BUTTON --- */}
                <button
                    className="footer-link token-btn"
                    onClick={() => setShowTokenInput(!showTokenInput)}
                    title="Update Server API Key"
                >
                    <FaKey size={12} style={{ marginRight: '5px' }} /> Update Key
                </button>
            </div>

            {/* --- TOKEN INPUT FORM (Appears when clicked) --- */}
            {showTokenInput && (
                <div className="token-updater-container">
                    <input
                        type="password"
                        placeholder="Paste new GitHub Token (ghp_...)"
                        value={newToken}
                        onChange={(e) => setNewToken(e.target.value)}
                        className="token-input"
                    />
                    <button
                        onClick={handleUpdateToken}
                        disabled={status === 'loading'}
                        className="token-save-btn"
                    >
                        {status === 'loading' ? 'Saving...' : 'Save'}
                    </button>

                    {/* Status Icons */}
                    {status === 'success' && <FaCheck className="status-icon success" />}
                    {status === 'error' && <FaTimes className="status-icon error" />}
                </div>
            )}
        </footer>
    );
};

export default Footer;