"use client"

import { useState, useEffect } from "react"
import { FaGithub, FaTrophy, FaChartLine, FaClock, FaCode } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import "./Comparison.css"
import SearchSection from "../Searchbar/SearchSection.jsx"
import LoadingSpinner from "../Loading & Error/LoadingSpinner.jsx"
import ErrorAlert from "../Loading & Error/ErrorAlert.jsx"
import {BASE_URL} from "../../config.jsx";

const HeroSection = ({
                         userNames,
                         setUserNames,
                         handleKeyDown,
                         handleCompare,
                         isLoading,
                         selectedTimePeriod,
                         setSelectedTimePeriod,
                     }) => (
    <div className="comparison-hero-section">
        <div className="comparison-hero-content">
            <h1 className="comparison-hero-title">GitHub Profile Comparison</h1>
            <p className="comparison-hero-description">
                Compare GitHub profiles head-to-head. Analyze repository statistics, language preferences, and development
                activity across multiple users.
            </p>
            <div className="comparison-hero-features">
                <div className="comparison-feature-item">
                    <span>🏆 Competitive Analysis</span>
                </div>
                <div className="comparison-feature-item">
                    <span>📊 Language Statistics</span>
                </div>
                <div className="comparison-feature-item">
                    <span>📈 Activity Metrics</span>
                </div>
                <div className="comparison-feature-item">
                    <span>🔄 Multi-User Support</span>
                </div>
            </div>
        </div>
        <div className="comparison-hero-right">
            <div className="comparison-hero-search">
                <SearchSection
                    userName={userNames}
                    setUserName={setUserNames}
                    handleKeyDown={handleKeyDown}
                    fetchRepos={handleCompare}
                    isLoading={isLoading}
                    placeholder="GitHub usernames (comma-separated)"
                />
                <div className="hero-month-dropdown">
                    <select
                        value={selectedTimePeriod}
                        onChange={(e) => setSelectedTimePeriod(e.target.value)}
                        className="month-select"
                    >
                        <option value="6">Last 6 Months</option>
                        <option value="12">Last 12 Months</option>
                        <option value="24">Last 24 Months</option>
                        <option value="custom">Customize</option>
                    </select>
                </div>
            </div>
            <img src="/img/img_5.png" alt="Comparison Preview" className="comparison-hero-image" />
        </div>
    </div>
)

const Comparison = ({ user }) => {
    // Initialize states with localStorage values

    const [availableLanguages, setAvailableLanguages] = useState(["All"])
    // const [selectedLanguage, setSelectedLanguage] = useState(() =>
    //     localStorage.getItem('compareLanguage') || 'All'
    // );
    const [selectedLanguage, setSelectedLanguage] = useState("All")

    const [selectedTimePeriod, setSelectedTimePeriod] = useState("6")

    const [userNames, setUserNames] = useState(() => localStorage.getItem("compareUserNames") || "")
    const [isLoading, setIsLoading] = useState(false)
    const [compareData, setCompareData] = useState(() => {
        const saved = localStorage.getItem("compareData")
        return saved ? JSON.parse(saved) : []
    })

    const [showHero, setShowHero] = useState(() => {
        const savedData = localStorage.getItem("compareData")
        return !savedData
    })
    const [hasSearched, setHasSearched] = useState(() => localStorage.getItem("compareHasSearched") === "true")
    const [userData, setUserData] = useState(() => {
        const saved = localStorage.getItem("compareUserData")
        return saved ? JSON.parse(saved) : null
    })
    const [error, setError] = useState({ message: null, isVisible: false, type: null })
    const navigate = useNavigate()

    // Persist state changes to localStorage
    useEffect(() => {
        if (userNames) localStorage.setItem("compareUserNames", userNames)
        if (compareData.length > 0) localStorage.setItem("compareData", JSON.stringify(compareData))
        if (userData) localStorage.setItem("compareUserData", JSON.stringify(userData))
        localStorage.setItem("compareLanguage", selectedLanguage)
        localStorage.setItem("compareTimePeriod", selectedTimePeriod)
        localStorage.setItem("compareHasSearched", hasSearched.toString())
    }, [userNames, compareData, userData, selectedLanguage, selectedTimePeriod, hasSearched])

    // Load saved data on component mount
    useEffect(() => {
        const loadSavedData = async () => {
            const savedUserNames = localStorage.getItem("compareUserNames")
            const savedData = localStorage.getItem("compareData")

            if (savedUserNames && savedData) {
                try {
                    setUserNames(savedUserNames)
                    const parsedData = JSON.parse(savedData)
                    setCompareData(parsedData)
                    setShowHero(false)
                } catch (error) {
                    console.error("Error loading saved data:", error)
                }
            }
        }

        loadSavedData()
    }, [])

    // Recalculate scores when language changes
    useEffect(() => {
        if (userData) {
            const newScores = calculateScores(userData)
            setCompareData(newScores)
            localStorage.setItem("compareData", JSON.stringify(newScores))
        }
    }, [selectedLanguage])

    useEffect(() => {
        if (userNames) {
            localStorage.setItem("compareUserNames", userNames)
        }
        if (userData) {
            localStorage.setItem("compareUserData", JSON.stringify(userData))
        }
    }, [userNames, userData])

    const fetchUserData = async (username) => {
        try {
            console.log(`Fetching data for: ${username}`)

            // Fetch repositories
            const repoResponse = await fetch(`${BASE_URL}/api/github/repositories/${username}`)
            const repositories = await repoResponse.json()
            console.log(`Repositories for ${username}:`, repositories)

            if (!Array.isArray(repositories)) {
                console.error(`Invalid repositories data for ${username}`)
                return null
            }

            // Fetch PR data
            const prResponse = await fetch(`${BASE_URL}/api/github/analyze/${username}/pr`)
            const pullRequests = await prResponse.json()

            // Fetch commit data for each repository with language information
            const repoData = await Promise.all(
                repositories.map(async (repo) => {
                    try {
                        const [commitResponse, durationResponse] = await Promise.all([
                            fetch(`${BASE_URL}/api/github/commits/${username}/${repo.name}`),
                            fetch(`${BASE_URL}/api/duration/${username}/${repo.name}`),
                        ])

                        if (!commitResponse.ok || !durationResponse.ok) {
                            console.error(`Failed to fetch data for repo ${repo.name}`)
                            return null
                        }

                        const commitData = await commitResponse.json()
                        const durationData = await durationResponse.json()

                        // Inside fetchUserData function
                        console.log("Repository language data:", {
                            name: repo.name,
                            language: repo.language,
                            languages: repo.languages,
                            languageCommits: commitData.languageCommits,
                        })

                        return {
                            name: repo.name,
                            language: repo.language,
                            languages: repo.languages,
                            commits: commitData,
                            languageCommits: commitData.languageCommits || {},
                            duration: durationData,
                        }
                    } catch (error) {
                        console.error(`Error processing repo ${repo.name}:`, error)
                        return null
                    }
                }),
            )

            const validRepoData = repoData.filter(Boolean)
            if (validRepoData.length === 0) {
                console.error(`No valid repository data found for ${username}`)
                return null
            }

            return {
                username,
                repositories,
                pullRequests: pullRequests || { totalPRs: 0, acceptedPRs: 0 },
                repoData: validRepoData,
            }
        } catch (error) {
            console.error(`Error fetching data for ${username}:`, error)
            return null
        }
    }

    const calculateScores = (data) => {
        console.log("Calculating scores for users:", data)

        // Calculate max repos based on selected language
        const maxRepos = Math.max(
            ...data.map((user) => {
                if (selectedLanguage === "All") {
                    return user.repositories.length
                }
                return user.repositories.filter(
                    (repo) => repo.language === selectedLanguage || (repo.languages && repo.languages.includes(selectedLanguage)),
                ).length
            }),
            1,
        )

        const maxPRs = Math.max(...data.map((user) => user.pullRequests?.totalPRs || 0), 1)
        const maxAcceptedPRs = Math.max(...data.map((user) => user.pullRequests?.acceptedPRs || 0), 1)

        // Find max commits per language across all users
        const maxLanguageCommits = {}
        data.forEach((user) => {
            if (user.repoData) {
                user.repoData.forEach((repo) => {
                    if (repo.languageCommits && repo.languages) {
                        Object.entries(repo.languageCommits).forEach(([lang, commits]) => {
                            if (repo.languages.includes(lang)) {
                                maxLanguageCommits[lang] = Math.max(maxLanguageCommits[lang] || 0, commits)
                            }
                        })
                    }
                })
            }
        })

        return data
            .map((user) => {
                console.log(`Processing user: ${user.username}`)

                // Repository Score (25%) - Based on selected language
                let repoCount
                if (selectedLanguage === "All") {
                    repoCount = user.repositories.length
                } else {
                    repoCount = user.repositories.filter(
                        (repo) =>
                            repo.language === selectedLanguage || (repo.languages && repo.languages.includes(selectedLanguage)),
                    ).length
                }
                const repoScore = (repoCount / maxRepos) * 25

                // Language Score (25%)
                let languageScore = 0
                const languageStats = {}
                const languageActivity = {}

                if (user.repoData) {
                    // Filter repositories based on selected language
                    const relevantRepos =
                        selectedLanguage === "All"
                            ? user.repoData
                            : user.repoData.filter(
                                (repo) =>
                                    repo.language === selectedLanguage || (repo.languages && repo.languages.includes(selectedLanguage)),
                            )

                    // First pass: Collect language statistics
                    relevantRepos.forEach((repo) => {
                        if (repo.languages && repo.languageCommits) {
                            repo.languages.forEach((lang) => {
                                if (selectedLanguage === "All" || lang === selectedLanguage) {
                                    const commits = repo.languageCommits[lang] || 0
                                    languageStats[lang] = (languageStats[lang] || 0) + commits

                                    if (!languageActivity[lang]) {
                                        languageActivity[lang] = {
                                            repos: 1,
                                            commits,
                                            isActive: commits > 0,
                                        }
                                    } else {
                                        languageActivity[lang].repos++
                                        languageActivity[lang].commits += commits
                                        languageActivity[lang].isActive = languageActivity[lang].isActive || commits > 0
                                    }
                                }
                            })
                        }
                    })

                    // Calculate language score
                    // Inside calculateScores function, update the language score calculation:
                    if (selectedLanguage !== "All") {
                        if (languageStats[selectedLanguage]) {
                            const maxCommitsForLanguage = maxLanguageCommits[selectedLanguage] || 1
                            // Only calculate score if there are actual commits
                            if (maxCommitsForLanguage > 0) {
                                const normalizedCommits = (languageStats[selectedLanguage] / maxCommitsForLanguage) * 100
                                const activityBonus = languageActivity[selectedLanguage]?.isActive ? 5 : 0
                                const repoBonus = Math.min((languageActivity[selectedLanguage]?.repos || 0) * 2, 10)

                                languageScore = Math.min(((normalizedCommits * 0.6 + activityBonus + repoBonus) / 100) * 25, 25)
                            }
                        }
                    } else {
                        // For 'All' languages
                        const activeLanguages = Object.entries(languageStats).filter(([_, commits]) => commits > 0)

                        if (activeLanguages.length > 0) {
                            const languageScores = activeLanguages.map(([lang, commits]) => {
                                const maxCommits = maxLanguageCommits[lang] || 1
                                return (commits / maxCommits) * 100
                            })

                            const avgScore = languageScores.reduce((acc, score) => acc + score, 0) / languageScores.length
                            const diversityBonus = Math.min(activeLanguages.length * 5, 20)

                            languageScore = Math.min(((avgScore * 0.6 + diversityBonus) / 100) * 25, 25)
                        }
                    }
                }

                console.log("Language stats for", user.username, {
                    languageStats,
                    languageActivity,
                    selectedLanguage,
                    languageScore,
                    maxLanguageCommits,
                })

                console.log(`${user.username}'s language score details:`, {
                    selectedLanguage,
                    languageStats,
                    languageActivity,
                    finalScore: languageScore,
                })

                const prScore =
                    ((user.pullRequests?.totalPRs || 0) / maxPRs) * 12.5 +
                    ((user.pullRequests?.acceptedPRs || 0) / maxAcceptedPRs) * 12.5

                let durationScore = 0
                let totalCommitsPerDay = 0
                let activeRepositories = 0
                let totalDuration = 0

                // Filter duration calculations based on selected language
                if (user.repoData) {
                    const relevantRepos =
                        selectedLanguage === "All"
                            ? user.repoData
                            : user.repoData.filter(
                                (repo) =>
                                    repo.language === selectedLanguage || (repo.languages && repo.languages.includes(selectedLanguage)),
                            )

                    relevantRepos.forEach((repo) => {
                        if (repo?.duration) {
                            totalCommitsPerDay += repo.duration.commitsPerDay || 0
                            totalDuration += repo.duration.durationInDays || 0
                            if (repo.commits?.totalCommits > 0) activeRepositories++
                        }
                    })
                }

                const averageCommitsPerDay = totalCommitsPerDay / Math.max(activeRepositories, 1)
                const averageDuration = totalDuration / Math.max(activeRepositories, 1)

                const commitFrequencyScore = Math.min((averageCommitsPerDay / 5) * 12.5, 12.5)
                const durationWeightScore = Math.min((averageDuration / 30) * 12.5, 12.5)
                durationScore = commitFrequencyScore + durationWeightScore

                const totalScore = repoScore + languageScore + prScore + durationScore

                return {
                    ...user,
                    languageStats,
                    languageActivity,
                    scores: {
                        repoScore,
                        languageScore,
                        prScore,
                        durationScore,
                        totalScore,
                        commitStats: {
                            averageCommitsPerDay,
                            activeRepositories,
                            averageDuration,
                        },
                    },
                }
            })
            .sort((a, b) => b.scores.totalScore - a.scores.totalScore)
    }

    const handleCompare = async () => {
        if (!userNames.trim()) return
        setIsLoading(true)
        setHasSearched(true)
        setError({ message: null, isVisible: false, type: null })
        setCompareData([])

        try {
            const users = userNames
                .split(",")
                .map((name) => name.trim())
                .filter(Boolean)
            if (users.length === 0) {
                setError({
                    message: "Please enter at least one valid username.",
                    isVisible: true,
                    type: "validation",
                })
                setShowHero(true)
                return
            }

            const userDataResults = await Promise.all(
                users.map(async (user) => {
                    const data = await fetchUserData(user)
                    return { username: user, data }
                }),
            )

            const invalidUsers = userDataResults.filter((result) => !result.data).map((result) => result.username)

            if (invalidUsers.length > 0) {
                setError({
                    message: `Invalid username${invalidUsers.length > 1 ? "s" : ""}: ${invalidUsers.join(", ")}`,
                    isVisible: true,
                    type: "notFound",
                })
                setShowHero(true)
                return
            }

            const validData = userDataResults.map((result) => result.data)
            setUserData(validData)
            const calculatedScores = calculateScores(validData)
            setCompareData(calculatedScores)
            setShowHero(false)

            setAvailableLanguages(extractUniqueLanguages(validData))

            localStorage.setItem("compareUserData", JSON.stringify(validData))
            localStorage.setItem("compareData", JSON.stringify(calculatedScores))
            localStorage.setItem("compareHasSearched", "true")
        } catch (error) {
            console.error("Comparison error:", error)
            setError({
                message: "Failed to compare users. Please try again.",
                isVisible: true,
                type: "network",
            })
            setShowHero(true)
            setUserData(null)
            localStorage.removeItem("compareData")
            localStorage.removeItem("compareUserData")
        } finally {
            setIsLoading(false)
        }
    }

    const extractUniqueLanguages = (data) => {
        const languages = new Map()
        languages.set("All", true)

        data.forEach((user) => {
            if (user.repoData) {
                user.repoData.forEach((repo) => {
                    if (repo.languageCommits) {
                        Object.entries(repo.languageCommits).forEach(([lang, commits]) => {
                            if (commits > 0) {
                                languages.set(lang, true)
                            }
                        })
                    }
                })
            }
        })

        return Array.from(languages.keys())
    }

    return (
        <div className="comparison-container">
            <ErrorAlert error={error} setError={setError} />

            {isLoading && <LoadingSpinner />}

            {(showHero || isLoading) && (
                <HeroSection
                    userNames={userNames}
                    setUserNames={setUserNames}
                    handleKeyDown={(e) => {
                        if (e.key === "Enter") handleCompare()
                    }}
                    handleCompare={handleCompare}
                    isLoading={isLoading}
                    selectedTimePeriod={selectedTimePeriod}
                    setSelectedTimePeriod={setSelectedTimePeriod}
                />
            )}

            {!showHero && !isLoading && (
                <>
                    <div className="input-section">
                        <h2 className="comparison-title">GitHub Profile Comparison</h2>
                        <SearchSection
                            userName={userNames}
                            setUserName={setUserNames}
                            handleKeyDown={(e) => {
                                if (e.key === "Enter") handleCompare()
                            }}
                            fetchRepos={handleCompare}
                            isLoading={isLoading}
                        />
                        <div className="dropdown-container">
                            <select
                                value={selectedTimePeriod}
                                onChange={(e) => setSelectedTimePeriod(e.target.value)}
                                className="time-period-select"
                            >
                                <option value="6">Last 6 Months</option>
                                <option value="12">Last 12 Months</option>
                                <option value="24">Last 24 Months</option>
                                <option value="custom">Customize</option>
                            </select>
                            <select
                                value={selectedLanguage}
                                onChange={(e) => setSelectedLanguage(e.target.value)}
                                className="language-select"
                            >
                                {availableLanguages.map((language) => (
                                    <option key={language} value={language}>
                                        {language}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </>
            )}

            {compareData.length > 0 && (
                <div className="results-section">
                    {compareData.map((user, index) => (
                        <div key={user.username} className={`user-card ${index === 0 ? "winner" : ""}`}>
                            {index === 0 && <FaTrophy className="winner-icon" />}
                            <h3>{user.username}</h3>
                            <div className="score-grid">
                                <div className="score-item">
                                    <FaGithub />
                                    <span>Repo Score: {user.scores.repoScore.toFixed(1)}</span>
                                </div>
                                <div className="score-item">
                                    <FaCode />
                                    <span>Language Score: {user.scores.languageScore.toFixed(1)}</span>
                                </div>
                                <div className="score-item">
                                    <FaChartLine />
                                    <span>PR Score: {user.scores.prScore.toFixed(1)}</span>
                                </div>
                                <div className="score-item">
                                    <FaClock />
                                    <span>Activity Score: {user.scores.durationScore.toFixed(1)}</span>
                                </div>
                            </div>
                            <div className="total-score">Total Score: {user.scores.totalScore.toFixed(1)}</div>
                            <div className="additional-stats">
                                <p>Average Commits/Day: {user.scores.commitStats.averageCommitsPerDay.toFixed(1)}</p>
                                <p>Public Repositories: {user.scores.commitStats.activeRepositories}</p>
                                <p>Average Duration: {user.scores.commitStats.averageDuration.toFixed(1)} days</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Comparison
