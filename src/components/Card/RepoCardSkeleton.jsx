import React from 'react';
import './RepoCardSkeleton.css';

const RepoCardSkeleton = () => {
    return (
        <div className="skeleton-card">
            <div className="skeleton-header"></div>
            <div className="skeleton-title"></div>
            <div className="skeleton-link"></div>
            <div className="skeleton-footer">
                <div className="skeleton-lang"></div>
                <div className="skeleton-icon"></div>
                <div className="skeleton-icon"></div>
            </div>
        </div>
    );
};

export default RepoCardSkeleton;