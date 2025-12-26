import React, { useEffect } from 'react';
import './Policy.css';

const PrivacyPolicy = () => {

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="policy-container">
            <h1>Privacy Policy</h1>
            <div className="policy-content">
                <section>
                    <h2>Information We Collect</h2>
                    <p>When you use GitHub Repository Decoder, we collect:</p>
                    <ul>
                        <li>GitHub profile information through OAuth authentication</li>
                        <li>Repository access data and analysis preferences</li>
                        <li>Usage statistics and interaction data</li>
                        <li>Search history and repository analysis records</li>
                    </ul>
                </section>

                <section>
                    <h2>How We Use Your Information</h2>
                    <ul>
                        <li>To provide repository analysis and insights</li>
                        <li>To generate activity heatmaps and statistics</li>
                        <li>To analyze pull requests and contribution patterns</li>
                        <li>To improve our services and user experience</li>
                    </ul>
                </section>

                <section>
                    <h2>Data Storage and Security</h2>
                    <p>We implement security measures to protect your information:</p>
                    <ul>
                        <li>Secure OAuth authentication with GitHub</li>
                        <li>Encrypted data transmission</li>
                        <li>Regular security updates and monitoring</li>
                        <li>Limited data retention periods</li>
                    </ul>
                </section>

                <section>
                    <h2>Third-Party Access</h2>
                    <p>We only share data with:</p>
                    <ul>
                        <li>GitHub API (for repository and user data)</li>
                        <li>Analytics services for performance monitoring</li>
                    </ul>
                </section>

                <section>
                    <h2>Contact Us</h2>
                    <p>For privacy concerns or questions, contact us at privacy@githubdecoder.com</p>
                </section>
            </div>
        </div>
    );
};

export default PrivacyPolicy;