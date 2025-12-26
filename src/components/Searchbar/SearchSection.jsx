import React from "react";
import "./SearchSection.css";

const SearchSection = ({ userName, setUserName, handleKeyDown, fetchRepos, isLoading ,placeholder}) => {
    return (
        <section className="search-section">
            <div className="search-area-button">
                <input
                    type="text"
                    className="user-name"
                    placeholder={placeholder  || "Enter GitHub usernames separated by commas..."}
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                />
                <button className="search-btn" onClick={fetchRepos} disabled={isLoading}>
                    <span className="front">{isLoading ? "Loading..." : "Start"}</span>
                </button>
            </div>
        </section>
    );
};

export default SearchSection;