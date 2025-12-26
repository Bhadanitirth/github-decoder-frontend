// Frontend/src/components/ErrorAlert.jsx
import React, { useEffect } from 'react';
import './ErrorAlert.css';

const ErrorAlert = ({ error, setError }) => {
    useEffect(() => {
        if (error.message) {
            const timer = setTimeout(() => {
                setError(prev => ({ ...prev, isVisible: false }));
                setTimeout(() => {
                    setError({ message: null, isVisible: false });
                }, 300);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [error.message, setError]);

    if (!error.message) return null;

    return (
        <div className={`error-alert ${!error.isVisible ? 'hiding' : ''}`}>
            <span className="error-icon">
                {error.type === 'user' ? '👤' :
                 error.type === 'empty' ? '📭' :
                 error.type === 'network' ? '🌐' : '⚠️'}
            </span>
            {error.message}
        </div>
    );
};

export default ErrorAlert;