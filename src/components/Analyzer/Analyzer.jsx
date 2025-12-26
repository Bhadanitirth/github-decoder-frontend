import React, { useState, useRef, useEffect } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { useLocation } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import "./Analyzer.css";
import headerImage from "/img/back2.jpg";
import SearchSection from "../Searchbar/SearchSection.jsx";
import LoadingSpinner from "../Loading & Error/LoadingSpinner.jsx";
import CommitInsights from '../CommitInsights/CommitInsights';
import { BASE_URL } from '../../config';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const HeroSection = ({ inputValue, setInputValue, handleKeyDown, handleSearch, isLoading }) => (
    <div className="analyzer-hero-section">
        <div className="analyzer-hero-content">
            <h1 className="analyzer-hero-title">GitHub Repository Analyzer</h1>
            <p className="analyzer-hero-description">
                Transform your repository data into intuitive visualizations.
                Analyze language distributions, contributor insights, and commit patterns.
            </p>
            <div className="analyzer-hero-features">
                <div className="analyzer-feature-item">
                    <span>📊 Language Analytics</span>
                </div>
                <div className="analyzer-feature-item">
                    <span>👥 Contributor Insights</span>
                </div>
                <div className="analyzer-feature-item">
                    <span>📈 Total Commit</span>
                </div>
                <div className="analyzer-feature-item">
                    <span>⏱️ Project Timeline</span>
                </div>
            </div>
        </div>
        <div className="analyzer-hero-right">
            <div className="analyzer-hero-search">
                <SearchSection
                    userName={inputValue}
                    setUserName={setInputValue}
                    handleKeyDown={handleKeyDown}
                    fetchRepos={handleSearch}
                    isLoading={isLoading}
                    placeholder="Enter repository URL"
                />
            </div>
            <img
                src="/img/img.png"
                alt="Repository Analysis Preview"
                className="analyzer-hero-image"
            />
        </div>
    </div>
);

const Analyzer = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const repoUrl = params.get("repo");

    const [inputValue, setInputValue] = useState(repoUrl || localStorage.getItem("inputValue") || "");
    const [languagesData, setLanguagesData] = useState(() => {
        const saved = localStorage.getItem('languagesData');
        return saved ? JSON.parse(saved) : {
            labels: [],
            datasets: [{ data: [], backgroundColor: [], hoverBackgroundColor: [] }]
        };
    });

    const [maxvalue, setMaxvalue] = useState(0);
    useEffect(() => {
        if (languagesData.datasets[0].data.length > 0) {
            setMaxvalue(Math.max(...languagesData.datasets[0].data));
        }
    }, [languagesData]);

    const [contributorData, setContributorData] = useState(() => {
        const saved = localStorage.getItem('contributorData');
        return saved ? JSON.parse(saved) : {
            labels: [],
            datasets: [{ data: [], backgroundColor: [], hoverBackgroundColor: [] }]
        };
    });

    const [commitsInfo, setCommitsInfo] = useState(() => {
        const saved = localStorage.getItem('commitsInfo');
        return saved ? JSON.parse(saved) : [];
    });

    const [duration, setDuration] = useState(() =>
        localStorage.getItem('duration') || ""
    );

    const [durationDate, setDurationDate] = useState(() =>
        localStorage.getItem('durationDate') || ""
    );

    const [repoName, setRepoName] = useState(() =>
        localStorage.getItem('repoName') || ""
    );
    const [commitAnalysisData, setCommitAnalysisData] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState(null);
    const [languageContributors, setLanguageContributors] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showHelperText, setShowHelperText] = useState(true);
    const [isSearched, setIsSearched] = useState(() => {
        const hasStoredData = localStorage.getItem('languagesData') &&
            localStorage.getItem('contributorData') &&
            localStorage.getItem('commitsInfo');
        return Boolean(hasStoredData);
    });
    const chartRef = useRef(null);
    const modalRef = useRef(null);
    const dashboardRef = useRef(null);

    const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"];
    const [showCommitInsights, setShowCommitInsights] = useState(false);

    useEffect(() => {
        localStorage.setItem('languagesData', JSON.stringify(languagesData));
    }, [languagesData]);

    useEffect(() => {
        localStorage.setItem('contributorData', JSON.stringify(contributorData));
    }, [contributorData]);

    useEffect(() => {
        localStorage.setItem('commitsInfo', JSON.stringify(commitsInfo));
    }, [commitsInfo]);

    useEffect(() => {
        localStorage.setItem('duration', duration);
    }, [duration]);

    useEffect(() => {
        localStorage.setItem('durationDate', durationDate);
    }, [durationDate]);

    useEffect(() => {
        localStorage.setItem('repoName', repoName);
    }, [repoName]);

    useEffect(() => {
        if (repoUrl) {
            clearStoredData();
            setInputValue(repoUrl);
            handleKeyDown({ key: 'Enter' });
            //handleSearch();
        }
    }, [repoUrl]);

    useEffect(() => {
        const fetchCommitAnalysis = async () => {
            if (!inputValue) return;

            try {
                const match = inputValue.match(/https?:\/\/github\.com\/([^/]+)\/([^/]+)/);
                if (!match) return;

                const [_, username, repository] = match;
                const response = await fetch(`${BASE_URL}/api/github/analyze/${username}/${repository}`);
                const data = await response.json();

                if (data.status === "success") {
                    setCommitAnalysisData(data);
                }
            } catch (error) {
                console.error("Error fetching commit analysis:", error);
            }
        };

        fetchCommitAnalysis();
    }, [inputValue]);

    useEffect(() => {
        localStorage.setItem("inputValue", inputValue);
    }, [inputValue]);

    useEffect(() => {
        if (localStorage.getItem("inputValue")) {
            //handleSearch();
        }
    }, []);

    useEffect(() => {
        if (isSearched && dashboardRef.current) {
            dashboardRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [isSearched]);

    const handleCommitsHeaderClick = () => {
        setShowCommitInsights(true);
    };

    const clearStoredData = () => {
        localStorage.removeItem('languagesData');
        localStorage.removeItem('contributorData');
        localStorage.removeItem('commitsInfo');
        localStorage.removeItem('duration');
        localStorage.removeItem('durationDate');
        localStorage.removeItem('repoName');
        setIsSearched(false);
    };

    const handleSearch = async () => {

        setTimeout(() => {
            if (dashboardRef.current) {
                dashboardRef.current.scrollIntoView({ behavior: "smooth" });
            }
        }, 200); // delay

        setLoading(true);
        setShowHelperText(false);

        try {
            const match = inputValue.match(/https?:\/\/github\.com\/([^/]+)\/([^/]+)/);
            if (!match) {
                alert("Please enter a valid GitHub repository URL.");
                setLoading(false);
                return;
            }

            const [_, username, repository] = match;
            setRepoName(repository);

            const effortApiUrl = `${BASE_URL}/api/effort/${username}/${repository}/analyze`;
            const languagesApiUrl = `${BASE_URL}/api/languages/${username}/${repository}`;
            const durationApiUrl = `${BASE_URL}/api/duration/${username}/${repository}`;

            const [effortResponse, languagesResponse, durationResponse] = await Promise.all([
                fetch(effortApiUrl),
                fetch(languagesApiUrl),
                fetch(durationApiUrl),
            ]);

            const effortData = await effortResponse.json();
            const languages = await languagesResponse.json();
            const durationData = await durationResponse.json();

            console.log("effortData", effortData);
            console.log("languages", languages);
            console.log("durationData", durationData);

            const contributorEfforts = effortData.contributorEfforts;
            const contributorLabels = Object.keys(contributorEfforts);
            const efforts = contributorLabels.map(
                (label) => contributorEfforts[label].effortPercentage.toFixed(1)
            );

            const contributorChartColors = contributorLabels.map(
                (_, index) => colors[index % colors.length]
            );

            setContributorData({
                labels: contributorLabels,
                datasets: [{ data: efforts, backgroundColor: contributorChartColors, hoverBackgroundColor: contributorChartColors }],
            });

            const totalContributions = languages.totalContributions;
            const languageLabels = Object.keys(totalContributions);
            const languageValues = Object.values(totalContributions);

            const languageChartColors = languageLabels.map(
                (_, index) => colors[index % colors.length]
            );

            setLanguagesData({
                labels: languageLabels,
                datasets: [{ data: languageValues, backgroundColor: languageChartColors, hoverBackgroundColor: languageChartColors }],
            });

            const commits = contributorLabels.map((contributor) => ({
                name: contributor,
                count: contributorEfforts[contributor]?.commits || 0,
            }));

            setCommitsInfo(commits);

            const durationInDays = durationData.durationInDays + 1;
            const months = (durationInDays / 30).toFixed(2);
            setDuration(`DURATION: ${durationInDays} days (${months} month${months >= 1.0 ? "s" : ""})`);

            const durationfirstCommitDate = durationData.firstCommitDate;
            const durationlastCommitDate = durationData.lastCommitDate;
            setDurationDate(`${durationfirstCommitDate.substring(0, 10)} to ${durationlastCommitDate.substring(0, 10)}`);

            setLoading(false);
            setIsSearched(true);

        } catch (error) {
            console.error("Error fetching or processing data:", error);
            alert("Failed to fetch data. Please try again.");
            clearStoredData();
            setLoading(false);
        }
    };


    const handleLanguageClick = async (event) => {
        const chart = chartRef.current;
        if (!chart) return;

        const elements = chart.getElementsAtEventForMode(
            event.nativeEvent,
            "nearest",
            { intersect: true },
            true
        );

        if (elements.length > 0) {
            const clickedIndex = elements[0].index;
            const language = languagesData.labels[clickedIndex];

            try {
                const match = inputValue.match(/https?:\/\/github\.com\/([^/]+)\/([^/]+)/);
                if (!match) {
                    alert("Invalid repository URL. Please re-enter.");
                    return;
                }

                const [_, username, repository] = match;
                const languagesApiUrl = `${BASE_URL}/api/languages/${username}/${repository}`;

                const languagesResponse = await fetch(languagesApiUrl);
                const languages = await languagesResponse.json();

                const languageData = languages.percentages;
                const contributors = Object.entries(languageData).map(
                    ([contributor, langData]) => ({
                        name: contributor,
                        percentage: (langData[language] || 0).toFixed(1),
                    })
                );

                setSelectedLanguage({ language });
                setLanguageContributors(contributors);
                setIsModalOpen(true);
            } catch (error) {
                console.error("Error fetching language contributors:", error);
                alert("Failed to fetch contributors for this language.");
            }
        }
    };

    const closeModal = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
            setIsModalOpen(false);
        }
    };

    useEffect(() => {
        if (isModalOpen) {
            document.addEventListener("click", closeModal);
        } else {
            document.removeEventListener("click", closeModal);
        }
        return () => document.removeEventListener("click", closeModal);
    }, [isModalOpen]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const chartOptionsLoc = {
        plugins: {
            legend: { display: true },
            datalabels: {
                color: "black",
                formatter: (value, context) => {
                    return value < (maxvalue / 100) ? null : `${value} Loc`;
                },
                font: { weight: "bold", size: 14 },
                anchor: (context) => {
                    return context.dataset.data[context.dataIndex] < (maxvalue / 30) ? "end" : "end";
                },
                align: (context) => {
                    return context.dataset.data[context.dataIndex] < (maxvalue / 30) ? "end" : "start";
                },
            },
        },
    };

    const chartOptionsPercentage = {
        plugins: {
            legend: { display: true },
            datalabels: {
                color: "black",
                formatter: (value) => `${value}%`,
                font: { weight: "bold", size: 12 },
                anchor: "center",
                align: "center",
            },
        },
    };

    return (
        <div className="app-container-analyzer">

            <HeroSection
                inputValue={inputValue}
                setInputValue={setInputValue}
                handleKeyDown={handleKeyDown}
                handleSearch={handleSearch}
                isLoading={loading}
            />

            {loading && <LoadingSpinner />}

            {(isSearched && inputValue && (
                    <section className="dashboard" ref={dashboardRef}>
                        <section className="repo-display">
                            <h2>{repoName}</h2>
                        </section>
                        <div className="stats-container">
                            <div className="chart">
                                <h3>-:LANGUAGES:-</h3>
                                <Pie ref={chartRef} data={languagesData} options={chartOptionsLoc} onClick={handleLanguageClick} />
                            </div>
                            <div className="commits-and-duration">
                                <div id="commits-info">
                                    {/*<h3*/}
                                    {/*    onClick={handleCommitsHeaderClick}*/}
                                    {/*    className="commits-header"*/}
                                    {/*>*/}
                                    {/*    <span className="commits-header-icon">📊</span>*/}
                                    {/*    COMMITS*/}
                                    {/*    <span style={{ fontSize: '0.8em', opacity: 0.8 }}>(Click for AI Analysis)</span>*/}
                                    {/*</h3>*/}
                                    <h3>-:COMMITS:-</h3>
                                    {commitsInfo.map((commit, index) => (
                                        <p key={index}>
                                            {commit.name} - {commit.count} COMMITS
                                        </p>
                                    ))}
                                </div>

                                {showCommitInsights && (
                                    <CommitInsights
                                        onClose={() => setShowCommitInsights(false)}
                                        analysisData={commitAnalysisData}
                                    />
                                )}

                                <div className="duration-info">
                                    <h3>-:DURATION:-</h3>
                                    <p>{duration}</p>
                                    <p>{durationDate}</p>
                                </div>
                            </div>
                            <div className="chart">
                                <h3>-:CONTRIBUTERS:-</h3>
                                <Pie data={contributorData} options={chartOptionsPercentage} />
                            </div>
                        </div>
                    </section>
                )
            )}

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" ref={modalRef}>
                        <h2>{selectedLanguage.language} Contributors</h2>
                        <Pie
                            options={chartOptionsPercentage}
                            data={{
                                labels: languageContributors.map((contributor) => contributor.name),
                                datasets: [
                                    {
                                        data: languageContributors.map((contributor) => contributor.percentage),
                                        backgroundColor: languageContributors.map(
                                            (_, index) => colors[index % colors.length]
                                        ),
                                        hoverBackgroundColor: languageContributors.map(
                                            (_, index) => colors[index % colors.length]
                                        ),
                                    },
                                ],
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Analyzer;