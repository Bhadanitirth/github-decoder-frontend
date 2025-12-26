import React, { useState, useEffect } from "react";
import "react-calendar-heatmap/dist/styles.css";
import "./Heatmap.css";
import { format } from "date-fns";
import SearchSection from "../Searchbar/SearchSection.jsx";
import LoadingSpinner from "../Loading & Error/LoadingSpinner.jsx";
import ErrorAlert from '../Loading & Error/ErrorAlert.jsx';
import {BASE_URL} from "../../config.jsx";

const displayMonths = [0,3,6,9]; // March and September

const HeroSection = ({ username, setUsername, handleKeyDown, fetchUserData, isLoading }) => (
    <div className="heatmap-hero-section">
        <div className="heatmap-hero-content">
            <h1 className="heatmap-hero-title">GitHub Activity Visualization</h1>
            <p className="heatmap-hero-description">
                Transform your GitHub contribution history into an intuitive, interactive heatmap.
                Track your coding journey across repositories and discover your most productive periods.
            </p>
            <div className="heatmap-hero-features">
                <div className="heatmap-feature-item">
                    <span>📊 Visual Analytics</span>
                </div>
                <div className="heatmap-feature-item">
                    <span>🔍 Repository Filtering</span>
                </div>
                <div className="heatmap-feature-item">
                    <span>📅 Multi-Year View</span>
                </div>
                <div className="heatmap-feature-item">
                    <span>📈 Repository-wise Stats</span>
                </div>
            </div>
        </div>
        <div className="heatmap-hero-right">
            <div className="heatmap-hero-search">
                <SearchSection
                    userName={username}
                    setUserName={setUsername}
                    handleKeyDown={handleKeyDown}
                    fetchRepos={fetchUserData}
                    isLoading={isLoading}
                    placeholder="Enter GitHub username"
                />
            </div>
            <img
                src="/img/img_3.png"
                alt="GitHub Heatmap Preview"
                className="heatmap-hero-image"
            />
        </div>
    </div>
);

const Heatmap = () => {
    const currentYear = new Date().getFullYear();
    const [showHero, setShowHero] = useState(() => {
        const savedUsername = localStorage.getItem('Husername');
        return !savedUsername;
    });
    const [hasSearched, setHasSearched] = useState(false);
    const [error, setError] = useState({ message: null, isVisible: false, type: null });


    const getYearRange = () => {
        const diff = endYear - startYear;
        return diff + 1; // Include both start and end year
    };

    // Initialize state with values from localStorage if they exist
    const [startYear, setStartYear] = useState(() => {
        const saved = localStorage.getItem('startYear');
        return saved ? parseInt(saved) : currentYear - 3;
    });

    const [endYear, setEndYear] = useState(() => {
        const saved = localStorage.getItem('endYear');
        return saved ? parseInt(saved) : currentYear;
    });

    const [username, setUsername] = useState(() =>
        localStorage.getItem('Husername') || ""
    );

    const [userData, setUserData] = useState(() => {
        const saved = localStorage.getItem('userData');
        return saved ? JSON.parse(saved) : null;
    });

    const [selectedRepos, setSelectedRepos] = useState(() => {
        const saved = localStorage.getItem('selectedRepos');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isRepoDropdownOpen, setIsRepoDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        localStorage.setItem('startYear', startYear.toString());
        localStorage.setItem('endYear', endYear.toString());
        localStorage.setItem('Husername', username);
        if (userData) {
            localStorage.setItem('userData', JSON.stringify(userData));
        }
        localStorage.setItem('selectedRepos', JSON.stringify([...selectedRepos]));
    }, [startYear, endYear, username, userData, selectedRepos]);

    useEffect(() => {

        const savedUsername = localStorage.getItem('Husername');
        const savedUserData = localStorage.getItem('userData');

        if (savedUsername && savedUserData) {
            try {
                const parsedData = JSON.parse(savedUserData);
                setUserData(parsedData);
                setShowHero(false);
            } catch (error) {
                console.error('Error parsing saved data:', error);
                localStorage.removeItem('userData');
                localStorage.removeItem('Husername');
                setShowHero(true);
            }
        }

        if (savedUsername) {
            fetchUserData();
        }
    }, []);

    const fetchUserData = async () => {
        if (!username) return;
        setIsLoading(true);
        setHasSearched(true); // Add this line
        setError({ message: null, isVisible: false, type: null });
        try {
            const response = await fetch(`${BASE_URL}/api/github/user/${username}`);
            if (!response.ok) {
                throw new Error(response.status === 404
                    ? { message: "User not found or no public data available", type: 'user' }
                    : { message: "Failed to fetch data", type: 'network' }
                );
            }
            const data = await response.json();
            if (!data || !data.repositories || data.repositories.length === 0) {
                setError({
                    message: "No repository data available for this user",
                    isVisible: true,
                    type: 'empty'
                });
                setShowHero(true);
                return;
            }
            setUserData(data);
            setSelectedRepos(new Set());
            setSearchTerm("");
            setShowHero(false);
            localStorage.setItem("userData", JSON.stringify(data));
            localStorage.setItem("Husername", username);
        } catch (error) {
            console.error("Error fetching user data:", error);
            setError({
                message: error.message,
                isVisible: true,
                type: error.type || 'network'
            });
            setShowHero(true);
            setUserData(null);
            localStorage.removeItem('Husername');
            localStorage.removeItem('userData');
        } finally {
            setIsLoading(false);
        }
    };

    const adjustYears = (start, end) => {
        if (end > currentYear) {
            end = currentYear;
            setEndYear(currentYear);
        }

        const diff = end - start;

        if (diff < 0) {
            setEndYear(start);
        }

        else if (diff > 3) {

            if (end === endYear) {
                const newEnd = Math.min(start + 3, currentYear);
                setEndYear(newEnd);
            } else {

                setStartYear(Math.max(2000, end - 3));
            }
        }
    };

    const handleRepoSelect = (repoName) => {
        setSelectedRepos(prev => {
            const newSet = new Set(prev);
            if (newSet.has(repoName)) {
                newSet.delete(repoName);
            } else {
                newSet.add(repoName);
            }
            return newSet;
        });
    };

    const handleSelectAllRepos = () => {
        if (selectedRepos.size === repositories.length) {
            setSelectedRepos(new Set());
        } else {
            setSelectedRepos(new Set(repositories));
        }
    };

    // Process API data into a format suitable for display
    const processCommitData = (repositories) => {
        if (!repositories || !Array.isArray(repositories)) return {};

        const processedData = {};
        repositories.forEach(repo => {
            if (!repo || !repo.name || !repo.commitStats) return;

            processedData[repo.name] = [];

            for (let year = startYear; year <= endYear; year++) {
                for (let month = 0; month < 12; month++) {
                    const yearMonth = format(new Date(year, month, 1), "yyyy-MM");
                    const commitData = repo.commitStats.find(stat => stat.yearMonth === yearMonth);
                    processedData[repo.name].push({
                        date: yearMonth,
                        count: commitData ? commitData.commitCount : 0
                    });
                }
            }
        });
        return processedData;
    };

    const contributions = userData?.repositories ? processCommitData(userData.repositories) : {};
    const repositories = userData?.repositories?.map(repo => repo.name) || [];

    const formatMonthNumber = (month) => {
        return (month + 1).toString().padStart(2, '0');
    };

    // Filter repositories based on selection
    const displayedRepos = repositories.filter(repo =>
        selectedRepos.size === 0 || selectedRepos.has(repo)
    );

    // Filter repositories based on search term
    const filteredRepos = repositories.filter(repo =>
        repo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleClickOutside = (event) => {
        if (!event.target.closest('.repo-dropdown-container')) {
            setIsRepoDropdownOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === "Enter") fetchUserData();
    };

    const handleStartYearChange = (e) => {
        const newStart = Math.max(2000, Math.min(parseInt(e.target.value), currentYear));
        setStartYear(newStart);
        // Automatically set end year to start year + 3, but not exceeding current year
        setEndYear(Math.min(newStart + 3, currentYear));
    };

    const handleEndYearChange = (e) => {
        const newEnd = Math.min(parseInt(e.target.value), currentYear);
        if (newEnd >= startYear && newEnd <= startYear + 3) {
            setEndYear(newEnd);
        }
    };

    return (
        <div className="comparison-container">
            <ErrorAlert error={error} setError={setError} />

            {isLoading && <LoadingSpinner />}
            {(!showHero && !isLoading) && (
                <>
                    <h2 className="comparison-title">Monthly Contributions Heatmap</h2>
                    <SearchSection
                        userName={username}
                        setUserName={setUsername}
                        handleKeyDown={handleKeyDown}
                        fetchRepos={fetchUserData}
                        isLoading={isLoading}
                        placeholder="Enter GitHub username"
                    />
                </>
            )}

            {(showHero || isLoading) && (
                <HeroSection
                    username={username}
                    setUsername={setUsername}
                    handleKeyDown={handleKeyDown}
                    fetchUserData={fetchUserData}
                    isLoading={isLoading}
                />
            )}

            {hasSearched && userData && !isLoading && (
                <>
                <div className="controls-row">
                    <div className="year-selector">
                        <div className="year-input">
                            <label>Start Year:</label>
                            <input
                                type="number"
                                min="2000"
                                max={currentYear}
                                value={startYear}
                                onChange={handleStartYearChange}
                            />
                        </div>
                        <div className="year-input">
                            <label>End Year:</label>
                            <input
                                type="number"
                                min={startYear}
                                max={Math.min(currentYear, startYear + 3)}
                                value={endYear}
                                onChange={handleEndYearChange}
                            />
                        </div>
                    </div>

                    <div className="repo-dropdown-container">
                        <button
                            className="repo-dropdown-button"
                            onClick={() => setIsRepoDropdownOpen(!isRepoDropdownOpen)}
                        >
                            Select Repositories ({selectedRepos.size || 'All'})
                            <span className="dropdown-arrow">▼</span>
                        </button>

                        {isRepoDropdownOpen && (
                            <div className="repo-dropdown-content">
                                <div className="repo-dropdown-header">
                                    <input
                                        type="text"
                                        placeholder="Search repositories..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="repo-search-input"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                                <div className="repo-dropdown-list">
                                    <label className="select-all-label">
                                        <input
                                            type="checkbox"
                                            checked={selectedRepos.size === filteredRepos.length}
                                            onChange={handleSelectAllRepos}
                                        />
                                        <span>Select All</span>
                                    </label>
                                    {filteredRepos.map(repo => (
                                        <label key={repo} className="repo-checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={selectedRepos.has(repo)}
                                                onChange={() => handleRepoSelect(repo)}
                                            />
                                            <span title={repo}>{repo}</span>
                                        </label>
                                    ))}
                                    {filteredRepos.length === 0 && (
                                        <div className="no-results">No repositories found</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="table-container" data-width={100 + (getYearRange() - 1) * 100} >
                    <table className="comparison-table">
                        <thead>
                        <tr>
                            <th rowSpan="2">Repository</th>
                            {Array.from({ length: getYearRange() }, (_, i) => startYear + i).map(year => (
                                <th key={year} colSpan="12">{year}</th>
                            ))}
                        </tr>
                        <tr>
                            {Array.from({ length: getYearRange() }, (_, i) => startYear + i).flatMap(year =>
                                [...Array(12).keys()].map(month => (
                                    <th
                                        key={`${year}-${month}`}
                                        title={format(new Date(year, month, 1), "MMMM")}
                                        className="month-header"
                                    >
                                        {displayMonths.includes(month) ? formatMonthNumber(month) : ""}
                                    </th>
                                ))
                            )}
                        </tr>
                        </thead>
                        <tbody>
                        {displayedRepos.map(repo => (
                            <tr key={repo}>
                                <td title={repo}>
                                    <a
                                        href={`https://github.com/${username}/${repo}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="repo-link"
                                    >
                                        {repo.length > 15 ? `${repo.substring(0, 15)}...` : repo}
                                    </a>
                                </td>
                                {contributions[repo]?.map(({ date, count }) => (
                                    <td
                                        key={date}
                                        className={`heatmap-cell ${count > 0 ? `color-scale-${Math.min(Math.max(Math.ceil(count / 5), 1), 4)}` : 'empty'}`}
                                        title={`${date}: ${count} contributions`}
                                    >
                                    </td>
                                ))}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                </>
            )}
        </div>
    );
};

export default Heatmap;