import React from 'react';
import { FaFacebook, FaEnvelope, FaPhone, FaTwitter, FaLinkedin, FaInstagram, FaArrowUp } from 'react-icons/fa';
import './Footer.css';
import { Link } from 'react-router-dom';

const Footer = () => {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
            </div>
            {/*<div className="social-media">*/}
            {/*    <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">*/}
            {/*        <FaFacebook />*/}
            {/*    </a>*/}
            {/*    <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">*/}
            {/*        <FaTwitter />*/}
            {/*    </a>*/}
            {/*    <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link">*/}
            {/*        <FaLinkedin />*/}
            {/*    </a>*/}
            {/*    <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">*/}
            {/*        <FaInstagram />*/}
            {/*    </a>*/}
            {/*</div>*/}

        </footer>
    );
};

export default Footer;