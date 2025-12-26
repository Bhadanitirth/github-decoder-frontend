import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./Find.css";
import RepoCardSkeleton from "../Card/RepoCardSkeleton.jsx";
import RepoCard from "../Card/RepoCard.jsx";
import NoDataImg from "/img/no-data1.png";
import SearchSection from "../Searchbar/SearchSection.jsx";
import ErrorAlert from '../Loading & Error/ErrorAlert.jsx';
import LoadingSpinner from '../Loading & Error/LoadingSpinner.jsx';
import {BASE_URL} from "../../config.jsx";

const HeroSection = ({ username, setUsername, handleKeyDown, fetchRepos, isLoading }) => (
    <div className="find-hero-section">
        <div className="find-hero-content">
            <h1 className="find-hero-title">Find All Repositories by Username</h1>
            <p className="find-hero-description">
                Explore and analyze GitHub repositories by entering usernames.
                Search through repositories, analyze metrics, and apply filters
                to decode repository insights.
            </p>
            <div className="find-hero-features">
                <div className="find-feature-item">
                    <span>🔍 Repository Search</span>
                </div>
                <div className="find-feature-item">
                    <span>⭐ Repository Stats</span>
                </div>
                <div className="find-feature-item">
                    <span>📊 Repository Analysis</span>
                </div>
                <div className="find-feature-item">
                    <span>🔠 Filter by Language</span>
                </div>
            </div>
        </div>
        <div className="find-hero-right">
            <div className="find-hero-search">
                <SearchSection
                    userName={username}
                    setUserName={setUsername}
                    handleKeyDown={handleKeyDown}
                    fetchRepos={fetchRepos}
                    isLoading={isLoading}
                    placeholder="Enter GitHub username..."
                />
            </div>
            <img
                src="/img/img_2.png"
                alt="Repository Analysis Preview"
                className="find-hero-image"
            />
        </div>
    </div>
);

const Find = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState(localStorage.getItem("userName") || "");
    const [isLoading, setIsLoading] = useState(false);
    const [visibleCardsFind, setVisibleCardsFind] = useState([]);
    const [searchData, setSearchData] = useState(localStorage.getItem("searchTerm") || "");
    const [repoDetails, setRepoDetails] = useState(() =>
        JSON.parse(localStorage.getItem("repoDetails")) || []
    );
    const [showAllRepos, setShowAllRepos] = useState(false);
    const [filters, setFilters] = useState({
        language: "All",
        user: "All",
        sort: "score"
    });
    const [error, setError] = useState({ message: null, isVisible: false, type: null });
    const [showHero, setShowHero] = useState(() => {
        const savedUsername = localStorage.getItem('userName');
        return !savedUsername;
    });
    const [hasSearched, setHasSearched] = useState(() =>
        localStorage.getItem('hasSearched') === 'true'
    );

    const [userData, setUserData] = useState(() => {
        const saved = localStorage.getItem('userData');
        return saved ? JSON.parse(saved) : null;
    });

    const calculateScore = (metrics) => {
        if (!metrics) return 0;

        const commitsPerDay = metrics.commitsPerDay || 0;
        const totalCommits = metrics.totalCommits || 0;
        const activeDuration = metrics.durationInDays || 0;

        // Normalize and weight the metrics
        const normalizedCommits = Math.log10(totalCommits + 1) * 40; // 40% weight
        const normalizedActivity = Math.min(commitsPerDay * 100, 100) * 0.35; // 35% weight
        const normalizedDuration = Math.min(Math.sqrt(activeDuration) * 5, 100) * 0.25; // 25% weight

        const score = normalizedCommits + normalizedActivity + normalizedDuration;
        return Math.round(score * 100) / 100;
    };

    const getSortValue = (repo) => {
        return calculateScore(repo?.metrics, filters.sort);
    };

    const filteredRepos = useMemo(() => {
        return repoDetails
            .filter(repo =>
                repo.name.toLowerCase().includes(searchData.toLowerCase()) &&
                (filters.language === "All" || repo.language === filters.language.split(" ")[0]) &&
                (filters.user === "All" || repo.login === filters.user.split(" ")[0])
            );
    }, [repoDetails, filters.language, filters.user, searchData]);

    useEffect(() => {
        localStorage.setItem('hasSearched', hasSearched);
    }, [hasSearched]);

    useEffect(() => {
        if (repoDetails.length > 0) {
            setVisibleCardsFind([]);
            const timeout = setTimeout(() => {
                filteredRepos.forEach((_, index) => {
                    setTimeout(() => {
                        setVisibleCardsFind(prev => [...prev, index]);
                    }, index * 100);
                });
            }, 100);
            return () => clearTimeout(timeout);
        }
    }, [filteredRepos]);

    useEffect(() => {
        localStorage.setItem("userName", userName);
    }, [userName]);

    useEffect(() => {
        localStorage.setItem("repoDetails", JSON.stringify(repoDetails));
    }, [repoDetails]);

    const updateFilter = (key, value) => {
        if (filters[key] === value) {
            return;
        }
        setFilters(prev => ({ ...prev, [key]: value }));
        setVisibleCardsFind([]);
    };

    const fetchRepos = async () => {
        if (!userName) return;
        setHasSearched(true);
        localStorage.setItem('hasSearched', 'true');

        const userNames = userName.split(",").map(name => name.trim()).filter(name => name);
        if (userNames.length === 0) {
            alert("Please enter at least one GitHub username before starting!");
            return;
        }
        setIsLoading(true);
        setError({ message: null, isVisible: false, type: null });

        try {
            const allRepoDetails = [];
            const userData = { repositories: [] };

            for (const name of userNames) {
                const repoResponse = await fetch(`${BASE_URL}/api/github/repositories/${name}`);
                if (!repoResponse.ok) throw new Error(`Failed to fetch repos for ${name}`);
                const repositories = await repoResponse.json();
                console.log("name :",name," , repositories :", repositories);

                const repoDetailsPromises = repositories.map(async (repo) => {
                    try {
                        const [commitData, durationData] = await Promise.all([
                            fetch(`${BASE_URL}/api/github/commits/${name}/${repo.name}`)
                                .then(res => res.json()),
                            fetch(`${BASE_URL}/api/duration/${name}/${repo.name}`)
                                .then(res => res.json())
                        ]);

                        console.log(`User: ${name}, Repo: ${repo.name}`);
                        console.log("Commit Data:", commitData);
                        console.log("Duration Data:", durationData);

                        const repoMetrics = {
                            name: repo.name,
                            commitsPerDay: durationData.commitsPerDay || 0,
                            totalCommits: commitData.totalCommits || 0,
                            durationInDays: durationData.durationInDays || 0
                        };

                        const score = calculateScore(repoMetrics);

                        console.log(`User: ${name}, Repo: ${repo.name}`);
                        console.log("Metrics:", repoMetrics);
                        console.log("Calculated Score:", score);
                        console.log("--------------------------------");

                        return {
                            ...repo,
                            metrics: {
                                ...repoMetrics,
                                score
                            }
                        };

                        userData.repositories.push(enrichedRepo);
                        return enrichedRepo;
                    } catch (error) {
                        console.error(`Error fetching details for ${repo.name}:`, error);
                        return null;
                    }
                });

                const repoDetails = await Promise.all(repoDetailsPromises);
                allRepoDetails.push(...repoDetails.filter(Boolean));
            }

            // Sort repos by score before setting state
            const sortedRepos = allRepoDetails.sort((a, b) => b.metrics.score - a.metrics.score);
            setRepoDetails(sortedRepos);
            setUserData(userData);
            setVisibleCardsFind([]);
            localStorage.setItem("repoDetails", JSON.stringify(sortedRepos));
            localStorage.setItem("userData", JSON.stringify(userData));
            setShowHero(false);
        } catch (error) {
            console.error("Error fetching repositories:", error);
            setError({
                message: error.message || "Failed to fetch repositories",
                isVisible: true,
                type: error.type || 'network'
            });
            setShowHero(true);
            setUserData(null);
            localStorage.removeItem('userData');
            localStorage.removeItem('hasSearched');
            setHasSearched(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") fetchRepos();
    };

    const toggleFavorite = (repoUrl) => {
        setRepoDetails(prevRepoDetails =>
            prevRepoDetails.map(repo =>
                repo.html_url === repoUrl ? { ...repo, isFavorite: !repo.isFavorite } : repo
            )
        );
    };

    const languageRepoCount = repoDetails.reduce((acc, repo) => {
        if (repo.language) {
            acc[repo.language] = (acc[repo.language] || 0) + 1;
        }
        return acc;
    }, {});

    const userRepoCount = repoDetails.reduce((acc, repo) => {
        acc[repo.login] = (acc[repo.login] || 0) + 1;
        return acc;
    }, {});

    const filterOptions = {
        language: ["All", ...Object.entries(languageRepoCount).map(([lang, count]) => `${lang} (${count})`)],
        user: ["All", ...Object.entries(userRepoCount).map(([user, count]) => `${user} (${count})`)]
    };

    return (
        <div className="app-container-find">
            <ErrorAlert error={error} setError={setError} />

            {isLoading && <LoadingSpinner />}
            {(!showHero && !isLoading) && (
                <>
                    <h2 className="find-title">Find All Repositories by Username</h2>
                    <SearchSection
                        userName={userName}
                        setUserName={setUserName}
                        handleKeyDown={handleKeyDown}
                        fetchRepos={fetchRepos}
                        isLoading={isLoading}
                    />
                </>
            )}

            {(showHero || isLoading) && (
                <HeroSection
                    username={userName}
                    setUsername={setUserName}
                    handleKeyDown={handleKeyDown}
                    fetchRepos={fetchRepos}
                    isLoading={isLoading}
                />
            )}

            {hasSearched && userData && !isLoading && (
                <>
                    <div className="filter-bar">
                        <input
                            type="text"
                            className="search-input-find"
                            placeholder="Search repository..."
                            value={searchData}
                            onChange={(e) => setSearchData(e.target.value)}
                        />
                        {Object.keys(filterOptions).map((filter) => (
                            <div key={filter} className="dropdown">
                                <button className="dropdown-button">
                                    {filter.charAt(0).toUpperCase() + filter.slice(1)}: {filters[filter]} ▼
                                </button>
                                <div className="dropdown-content">
                                    {filterOptions[filter].map((option) => (
                                        <div
                                            key={option}
                                            onClick={() => {
                                                // Only update if value is different
                                                if (filters[filter] !== option) {
                                                    updateFilter(filter, option);
                                                }
                                            }}
                                            className={filters[filter] === option ? 'active' : ''}
                                        >
                                            {option}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <p>Total Repositories: {filteredRepos.length}</p>
                    </div>


                    <div className="repo-grid-find">
                        {isLoading ? (
                            Array.from({ length: 6 }).map((_, index) => <RepoCardSkeleton key={index} />)
                        ) : filteredRepos.length > 0 ? (
                            (showAllRepos ? filteredRepos : filteredRepos.slice(0, 8)).map((repo, index) => (
                                <RepoCard
                                    key={`${repo.html_url}-${filters.sort}`}
                                    repo={repo}
                                    visible={visibleCardsFind.includes(index)}
                                    onToggleFavorite={toggleFavorite}
                                />
                            ))
                        ) : (
                            <div className="nodata-find">
                                <img src={NoDataImg} alt="No Data" className="NoDataImg" />
                            </div>
                        )}
                    </div>

                    {!showAllRepos && filteredRepos.length > 8 && (
                        <button className="show-all-button" onClick={() => setShowAllRepos(true)}>
                            Show All
                        </button>
                    )}
                </>
            )}
        </div>
    );
};

export default Find;