import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import languageIcons from "../Lang icons/LanguageIcons.jsx";
import "./RepoCard.css";
import { FaEye, FaStar } from "react-icons/fa";

const RepoCard = ({ repo, visible, onToggleFavorite }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(`/analyzer?repo=${encodeURIComponent(repo.html_url)}`);
    };

    const toggleHeartColor = (e) => {
        e.stopPropagation();
        onToggleFavorite(repo.html_url);
    };

    return (
        <div className={`repo-card ${visible ? 'visible' : ''}`} onClick={handleCardClick}>
            <div className="header">
                <div className="language-icon-circle">
                    {languageIcons[repo.language] || "🔹"}
                </div>
                <FaHeart
                    className={`heart-icon ${repo.isFavorite ? 'red' : 'white'}`}
                    onClick={toggleHeartColor}
                />
            </div>
            <div className="info">
                <p className="repo-name">
                    {repo.name.length > 25 ? repo.name.slice(0, -15) : repo.name}
                </p>
                <p className="repo-owner">
                    @{repo.login}
                </p>
                <a href={repo.html_url} className="repo-url" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                    {repo.html_url.length > 35 ? `.${repo.html_url.slice(-30)}` : repo.html_url}
                </a>
                <div className="repo-languages">
                    <p>languages : </p>
                    {repo.languages.length > 0 ? (
                        repo.languages.slice(0, 3).map((lang, index) => (
                            <span key={index} className="language-icon-small">
                                {languageIcons[lang] || "🔹"}
                            </span>
                        ))
                    ) : (
                        <span className="no-language">🔹</span>
                    )}
                    {repo.languages.length > 3 && <span className="more-languages">...</span>}
                </div>

                <div className="watchers-stars">
                    <div className="watchers">
                        <FaEye className="icon" />
                        <span>{repo.watchers}</span>
                    </div>
                    <div className="stars">
                        <FaStar className="icon" />
                        <span>{repo.stars}</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default RepoCard;