import React, { useState, useEffect } from "react";
import "./Home.css";
import PRChart from "./PRChart.jsx";
import SearchSection from "../Searchbar/SearchSection.jsx";
import LoadingSpinner from '../Loading & Error/LoadingSpinner.jsx';
import ErrorAlert from '../Loading & Error/ErrorAlert.jsx';
import {BASE_URL} from "../../config.jsx";


const PRHeroSection = ({ username, setUsername, handleKeyDown, fetchPR, isLoading }) => (
    <div className="pr-hero-section">
        <div className="pr-hero-content">
            <h1 className="pr-hero-title">GitHub Pull Request Analytics</h1>
            <p className="pr-hero-description">
                Analyze your GitHub pull requests with detailed insights.
                Track acceptance rates, review comments, and contribution patterns.
            </p>
            <div className="pr-hero-features">
                <div className="pr-feature-item">
                    <span>📊 PR Statistics</span>
                </div>
                <div className="pr-feature-item">
                    <span>✅ Acceptance Tracking</span>
                </div>
                <div className="pr-feature-item">
                    <span>💬 Review Analysis</span>
                </div>
                <div className="pr-feature-item">
                    <span>📈 Success Metrics</span>
                </div>
            </div>
        </div>
        <div className="pr-hero-right">
            <div className="pr-hero-search">
                <SearchSection
                    userName={username}
                    setUserName={setUsername}
                    handleKeyDown={handleKeyDown}
                    fetchRepos={fetchPR}
                    isLoading={isLoading}
                    placeholder="Enter GitHub username"
                />
            </div>
            <img
                src="/img/img_1.png"
                alt="PR Analytics Preview"
                className="pr-hero-image"
            />
        </div>
    </div>
);

const PRCard = ({ pr }) => {
    const truncateUrl = (url, maxLength = 30) => {
        return url.length <= maxLength ? url : `...${url.slice(-maxLength)}`;
    };

    return (
        <div className="pr-card">
            <h3>{pr.title}</h3>
            <p><strong>Repository:</strong> {pr.repositoryName}</p>
            <p><strong>Owner:</strong> {pr.ownerName}</p>
            <p>
                <strong>URL:</strong>
                <a href={pr.html_url} target="_blank" rel="noopener noreferrer">
                    {truncateUrl(pr.html_url)}
                </a>
            </p>
            {pr.maintainerComment ? (
                <p><strong>Maintainer Comment:</strong> {pr.maintainerComment}</p>
            ) : (
                <p><strong>Maintainer Comment:</strong> No comment</p>
            )}
            {pr.accepted && <span className="accepted-icon">✔️</span>}
        </div>
    );
};

const Home = () => {
    const [username, setUsername] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [prData, setPrData] = useState(null);
    const [showAll, setShowAll] = useState(false);
    const [ownerComments, setOwnerComments] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [error, setError] = useState({ message: null, isVisible: false, type: null });



    const [showHero, setShowHero] = useState(() => {
        const savedUsername = localStorage.getItem('username');
        const storedData = localStorage.getItem('prData');
        return !savedUsername || !storedData;
    });

    useEffect(() => {
        const storedData = localStorage.getItem("prData");
        const storedUsername = localStorage.getItem("username");
        const storedSearchStatus = localStorage.getItem("hasSearched");

        if (storedData && storedUsername) {
            const parsedData = JSON.parse(storedData);
            setPrData(parsedData);
            setOwnerComments(parsedData.ownerComments || []);
            setUsername(storedUsername);
            setShowHero(false); // Hide hero when data is loaded
        }
        if (storedSearchStatus) {
            setHasSearched(JSON.parse(storedSearchStatus));
        }
    }, []);

    useEffect(() => {
        if (prData) {
            localStorage.setItem("prData", JSON.stringify(prData));
            localStorage.setItem("hasSearched", JSON.stringify(hasSearched));
        }
    }, [prData, hasSearched]);

    const fetchPR = async () => {
        if (!username) return;
        setIsLoading(true);
        setHasSearched(true);
        setPrData(null);
        setError({ message: null, isVisible: false, type: null });

        try {
            const response = await fetch(`${BASE_URL}/api/github/analyze/${username}/pr`);
            if (!response.ok) {
                throw {
                    message: response.status === 404
                        ? "User not found or no public data available"
                        : "Failed to fetch data",
                    type: response.status === 404 ? 'user' : 'network'
                };
            }
            const data = await response.json();
            console.log('API Response:', data);
            if (!data || !data.pullRequests || data.pullRequests.length === 0) {
                setError({
                    message: "No pull request data available for this user",
                    isVisible: true,
                    type: 'empty'
                });
                setShowHero(true);
                return;
            }
            setPrData(data);
            setOwnerComments(data.ownerComments || []);
            localStorage.setItem("prData", JSON.stringify(data));
            localStorage.setItem("username", username);
            localStorage.setItem("hasSearched", JSON.stringify(true));
            setShowHero(false);
        } catch (error) {
            console.error("Error fetching PRs:", error);
            setError({
                message: error.message || "Failed to fetch data",
                isVisible: true,
                type: error.type || 'network'
            });
            setShowHero(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") fetchPR();
    };

    const getClosedPRData = () => prData ? { totalPRs: prData.totalPRs, closedPRs: prData.acceptedPRs + prData.rejectedPRs } : null;
    const getAcceptedPRData = () => prData ? { closedPRs: prData.acceptedPRs + prData.rejectedPRs, acceptedPRs: prData.acceptedPRs } : null;

    const sortedPRs = prData?.pullRequests
        ? [...prData.pullRequests].sort((a, b) => (a.status === b.status ? 0 : a.status === "ACCEPTED" ? -1 : 1))
        : [];

    const allPRCards = sortedPRs.map(pr => {
        const [owner, repoName] = pr.repositoryName.split("/");
        const commentData = ownerComments.find(comment =>
            comment.repositoryName === pr.repositoryName &&
            comment.ownerName === owner
        );
        console.log('PR:', pr);
        console.log('Found comment:', commentData);

        return (
            <PRCard
                key={`${pr.repositoryName}-${pr.prId}`}
                pr={{
                    title: pr.title,
                    repositoryName: repoName,
                    ownerName: owner,
                    html_url: `https://github.com/${owner}/${repoName}/pull/${pr.prId}`,
                    maintainerComment: commentData ? commentData.comment : null,
                    accepted: pr.status === "ACCEPTED"
                }}
            />
        );
    });

    const visiblePRCards = showAll ? allPRCards : allPRCards.slice(0, 4);

    return (
        <div className="app-container-home">
            <ErrorAlert error={error} setError={setError} />

            {isLoading && <LoadingSpinner />}
            {(!showHero && !isLoading) && (
                <>
                    <h1 className="header-title-home">Pull Requests</h1>
                    <SearchSection
                        userName={username}
                        setUserName={setUsername}
                        handleKeyDown={handleKeyDown}
                        fetchRepos={fetchPR}
                        isLoading={isLoading}
                    />
                </>
            )}
            {(showHero || isLoading) && (
                <PRHeroSection
                    username={username}
                    setUsername={setUsername}
                    handleKeyDown={handleKeyDown}
                    fetchPR={fetchPR}
                    isLoading={isLoading}
                />
            )}
            {hasSearched && prData && !isLoading && (
                <>
                    <section className="results-section-home">
                        {getClosedPRData() && <PRChart data={getClosedPRData()} type="closed" />}
                        <div className="pr-summary">
                            <p>Total Pull Requests: {prData.totalPRs}</p>
                            <p>Total Accepted Requests: {prData.acceptedPRs}</p>
                        </div>
                        {getAcceptedPRData() && <PRChart data={getAcceptedPRData()} type="accepted" />}
                    </section>

                    <section className="PRcards">
                        {visiblePRCards}

                        {!showAll && allPRCards.length > 4 && (
                            <button className="show-all-button" onClick={() => setShowAll(true)}>
                                Show All
                            </button>
                        )}
                    </section>
                </>
            )}
        </div>
    );
};

export default Home;
