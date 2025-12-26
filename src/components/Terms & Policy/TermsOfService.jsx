import React, { useEffect } from 'react';
import './Policy.css';

const TermsOfService = () => {

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="policy-container">
            <h1>Terms of Service</h1>
            <div className="policy-content">
                <section>
                    <h2>Service Usage</h2>
                    <p>By using GitHub Repository Decoder, you agree to:</p>
                    <ul>
                        <li>Follow GitHub's API usage guidelines</li>
                        <li>Use the service for legitimate repository analysis only</li>
                        <li>Not attempt to abuse or overload our systems</li>
                        <li>Maintain the security of your account credentials</li>
                    </ul>
                </section>

                <section>
                    <h2>User Responsibilities</h2>
                    <ul>
                        <li>Provide accurate information for authentication</li>
                        <li>Respect repository owners' privacy and rights</li>
                        <li>Not use the service for unauthorized data collection</li>
                        <li>Report any security vulnerabilities discovered</li>
                    </ul>
                </section>

                <section>
                    <h2>Service Limitations</h2>
                    <p>We reserve the right to:</p>
                    <ul>
                        <li>Modify or discontinue services without notice</li>
                        <li>Limit analysis requests per user</li>
                        <li>Block access for terms violation</li>
                        <li>Update these terms as needed</li>
                    </ul>
                </section>

                <section>
                    <h2>Intellectual Property</h2>
                    <ul>
                        <li>Our analysis tools and interfaces are proprietary</li>
                        <li>Repository data remains property of respective owners</li>
                        <li>Generated reports are for personal use only</li>
                    </ul>
                </section>

                <section>
                    <h2>Disclaimer</h2>
                    <p>The service is provided "as is" without warranties. We are not responsible for:</p>
                    <ul>
                        <li>Accuracy of analyzed repository data</li>
                        <li>Service interruptions or data loss</li>
                        <li>Third-party API availability</li>
                    </ul>
                </section>
            </div>
        </div>
    );
};

export default TermsOfService;