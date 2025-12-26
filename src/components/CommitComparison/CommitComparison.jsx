"use client";

import React, { useEffect, useMemo, useState } from "react";
import { FaTrophy, FaChartLine, FaBug, FaGithub, FaSearch, FaSyncAlt } from "react-icons/fa";
import "./CommitComparison.css";
import { BASE_URL } from '../../config';

async function fetchAnalyzeForUser(username) {
    const url = `${BASE_URL}/api/github/analyze/${encodeURIComponent(username)}`;
    try {
        const res = await fetch(url);
        if (!res.ok) {
            const txt = await res.text().catch(() => "");
            throw new Error(txt || `Analyze API returned ${res.status}`);
        }
        const json = await res.json();
        if (!json || !Array.isArray(json.repositories)) {
            throw new Error("Unexpected analyze payload shape");
        }
        return json;
    } catch (err) {
        console.warn("fetchAnalyze error:", err);
        throw err;
    }
}

function safeNum(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}

function computeMetricsForUser(data, categoryFilter = "All") {
    const repos = Array.isArray(data.repositories) ? data.repositories : [];
    const commits = [];
    for (const r of repos) {
        const cs = Array.isArray(r.commits) ? r.commits : [];
        for (const c of cs) {
            if (!c) continue;
            if (categoryFilter && categoryFilter !== "All") {
                if (((c.category || "")).toLowerCase() !== categoryFilter.toLowerCase()) continue;
            }
            commits.push({ ...c, repoName: r.repositoryName });
        }
    }

    const totalCommits = commits.length;
    const totalSimilarity = commits.reduce((s, c) => s + safeNum(c.similarity_score), 0);
    const maxCommitSimilarity = commits.reduce((m, c) => Math.max(m, safeNum(c.similarity_score)), 0);

    let totalCcn = 0;
    let functionCount = 0;
    let maxFunctionCcn = 0;

    for (const c of commits) {
        const oldA = (c.gitDiffAnalysis && c.gitDiffAnalysis.old_code_analysis) || [];
        const newA = (c.gitDiffAnalysis && c.gitDiffAnalysis.new_code_analysis) || [];
        for (const fn of [...oldA, ...newA]) {
            const ccn = safeNum(fn?.ccn);
            totalCcn += ccn;
            functionCount += 1;
            if (ccn > maxFunctionCcn) maxFunctionCcn = ccn;
        }
    }

    const totalCcnPerFunction = functionCount ? (totalCcn / functionCount) : 0;

    return {
        totalCommits,
        totalSimilarity,
        avgSimilarityPerCommit: totalCommits ? (totalSimilarity / totalCommits) : 0,
        maxCommitSimilarity,
        totalCcn,
        functionCount,
        totalCcnPerFunction,
        maxFunctionCcn,
        commits,
        repositories: repos,
    };
}

function decideWinners(metricsByUser) {
    const usernames = Object.keys(metricsByUser);
    if (usernames.length === 0) return { metricWinners: {}, scoreCounts: {}, overallWinner: null };

    const metricWinners = {
        highestFunctionCCN: null,
        totalCcnPerFunction: null,
        highestCommitSimilarity: null,
        totalSimilarityPerCommit: null,
        commitCount: null,
    };

    const values = {
        highestFunctionCCN: usernames.map(u => ({ user: u, value: metricsByUser[u].maxFunctionCcn })),
        totalCcnPerFunction: usernames.map(u => ({ user: u, value: metricsByUser[u].totalCcnPerFunction })),
        highestCommitSimilarity: usernames.map(u => ({ user: u, value: metricsByUser[u].maxCommitSimilarity })),
        totalSimilarityPerCommit: usernames.map(u => ({ user: u, value: metricsByUser[u].avgSimilarityPerCommit })),
        commitCount: usernames.map(u => ({ user: u, value: metricsByUser[u].totalCommits })),
    };

    for (const [metric, arr] of Object.entries(values)) {
        let sorted = [...arr].sort((a, b) => b.value - a.value);
        if (sorted.length === 0) continue;
        const top = sorted[0];
        const topEquals = sorted.filter(x => Math.abs(x.value - top.value) < 1e-9).map(x => x.user);
        if (top.value <= 0 || topEquals.length > 1) {
            metricWinners[metric] = null;
        } else {
            metricWinners[metric] = top.user;
        }
    }

    const scoreCounts = {};
    for (const u of usernames) scoreCounts[u] = 0;
    for (const m of Object.values(metricWinners)) {
        if (m && scoreCounts[m] !== undefined) scoreCounts[m] += 1;
    }

    const sortedCounts = Object.entries(scoreCounts).sort((a, b) => b[1] - a[1]);
    const topCount = sortedCounts[0] ? sortedCounts[0][1] : 0;
    const winners = sortedCounts.filter(([_, c]) => c === topCount).map(([u]) => u);
    const overallWinner = (winners.length === 1 && topCount > 0) ? winners[0] : null;

    return { metricWinners, scoreCounts, overallWinner };
}

export default function CommitComparison() {
    const [input, setInput] = useState("");
    const [category, setCategory] = useState("All");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [results, setResults] = useState({});
    const [metrics, setMetrics] = useState({});
    const [metricDecision, setMetricDecision] = useState(null);

    const knownCategories = useMemo(() => ["All", "bug fix", "new feature", "update", "documentation"], []);

    const handleCompare = async () => {
        setError(null);
        const names = input.split(",").map(s => s.trim()).filter(Boolean);
        if (names.length < 2) {
            setError("Please enter at least two GitHub usernames, comma-separated.");
            return;
        }

        setIsLoading(true);
        setResults({});
        setMetrics({});
        setMetricDecision(null);

        try {
            const fetches = names.map((n) =>
                fetchAnalyzeForUser(n)
                    .then(data => ({ username: n, data }))
                    .catch(err => ({ username: n, error: err.message || String(err) }))
            );

            const resolved = await Promise.all(fetches);

            const failed = resolved.filter(r => r.error || !r.data);
            if (failed.length > 0) {
                setError(`Failed to fetch analyze for: ${failed.map(f => f.username).join(", ")}. Check API & CORS.`);
            }

            const ok = resolved.filter(r => r.data);
            if (ok.length === 0) {
                setIsLoading(false);
                return;
            }

            const resultMap = {};
            const metricsMap = {};
            for (const r of ok) {
                resultMap[r.username] = r.data;
                metricsMap[r.username] = computeMetricsForUser(r.data, category);
            }

            setResults(resultMap);
            setMetrics(metricsMap);
            const decision = decideWinners(metricsMap);
            setMetricDecision(decision);
        } catch (err) {
            console.error(err);
            setError("Unexpected error while comparing. See console for details.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!results || Object.keys(results).length === 0) return;
        const newMetrics = {};
        for (const [u, data] of Object.entries(results)) {
            newMetrics[u] = computeMetricsForUser(data, category);
        }
        setMetrics(newMetrics);
        setMetricDecision(decideWinners(newMetrics));
    }, [category, results]);

    const pct = (v, digits = 2) => `${(safeNum(v) * 100).toFixed(digits)}%`;
    const fmt = (v, digits = 2) => safeNum(v).toFixed(digits);

    return (
        <div className="cmp-container">
            <div className="cmp-hero">
                <div className="cmp-hero-left">
                    <h1>Commit Comparison</h1>
                    <p>Enter two or more GitHub usernames (comma-separated) and compare them on 5 metrics derived from commit analysis.</p>

                    <div className="cmp-input-row">
                        <input
                            placeholder="e.g. alice, bob, carol"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="cmp-input"
                        />
                        <button className="cmp-button" onClick={handleCompare} disabled={isLoading}>
                            {isLoading ? <FaSyncAlt className="spin" /> : <FaSearch />} Compare
                        </button>
                    </div>

                    <div className="cmp-filters">
                        <label>Commit category filter:</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="cmp-select">
                            {knownCategories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    {error && <div className="cmp-error">{error}</div>}
                </div>

                <div className="cmp-hero-right">
                    <div className="cmp-score-summary">
                        <div className="cmp-winner-block">
                            <FaTrophy />
                            <div className="cmp-winner-text">
                                <div className="label">Winner</div>
                                <div className="value">{metricDecision && metricDecision.overallWinner ? metricDecision.overallWinner : "—"}</div>
                            </div>
                        </div>
                        <div className="cmp-detail-stat">
                            <div className="label">Users</div>
                            <div className="value">{Object.keys(results).length || input.split(",").filter(Boolean).length || 0}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="cmp-metrics-legend">
                <div><strong>Metric mapping:</strong> Highest function CCN · CCN per function · Highest commit similarity · Avg similarity/commit · Commit count</div>
                <div className="cmp-small-note">Filter applies to commits used for metric computation.</div>
            </div>

            <div className="cmp-results-grid">
                {Object.keys(metrics).length === 0 && !isLoading && <div className="cmp-hint">No comparison yet — enter usernames and press Compare.</div>}
                {isLoading && <div className="cmp-loading">Loading analyze data…</div>}

                {Object.entries(metrics).map(([username, m]) => {
                    const winners = metricDecision ? metricDecision.metricWinners : {};
                    const userWins = metricDecision ? (metricDecision.scoreCounts[username] || 0) : 0;
                    const isOverallWinner = metricDecision && metricDecision.overallWinner === username;

                    return (
                        <div className={`cmp-card ${isOverallWinner ? "cmp-card-winner" : ""}`} key={username}>
                            <div className="cmp-card-header">
                                <div className="cmp-user-name"><FaGithub /> {username}</div>
                                <div className="cmp-wins-count">Wins: <strong>{userWins}</strong>/5</div>
                            </div>

                            <div className="cmp-stats-grid">
                                <div className={`cmp-stat ${winners.highestFunctionCCN === username ? "cmp-stat-win" : ""}`}>
                                    <div className="cmp-stat-label">Highest function CCN</div>
                                    <div className="cmp-stat-value">{fmt(m.maxFunctionCcn,0)}</div>
                                    <div className="cmp-stat-sub">max across all functions</div>
                                </div>

                                <div className={`cmp-stat ${winners.totalCcnPerFunction === username ? "cmp-stat-win" : ""}`}>
                                    <div className="cmp-stat-label">Total CCN / Function</div>
                                    <div className="cmp-stat-value">{fmt(m.totalCcnPerFunction,2)}</div>
                                    <div className="cmp-stat-sub">total CCN: {fmt(m.totalCcn,0)} · functions: {m.functionCount}</div>
                                </div>

                                <div className={`cmp-stat ${winners.highestCommitSimilarity === username ? "cmp-stat-win" : ""}`}>
                                    <div className="cmp-stat-label">Highest commit similarity</div>
                                    <div className="cmp-stat-value">{pct(m.maxCommitSimilarity,2)}</div>
                                    <div className="cmp-stat-sub">best single commit</div>
                                </div>

                                <div className={`cmp-stat ${winners.totalSimilarityPerCommit === username ? "cmp-stat-win" : ""}`}>
                                    <div className="cmp-stat-label">Total similarity / commit</div>
                                    <div className="cmp-stat-value">{pct(m.avgSimilarityPerCommit,2)}</div>
                                    <div className="cmp-stat-sub">sum sim: {fmt(m.totalSimilarity,3)} · commits: {m.totalCommits}</div>
                                </div>

                                <div className={`cmp-stat ${winners.commitCount === username ? "cmp-stat-win" : ""}`}>
                                    <div className="cmp-stat-label">Number of commits</div>
                                    <div className="cmp-stat-value">{m.totalCommits}</div>
                                    <div className="cmp-stat-sub">commits in filter</div>
                                </div>
                            </div>

                            <div className="cmp-card-footer">
                                <div className="cmp-footer-note">
                                    {/*<small>Metrics use filtered commits only. Remove the list and raw-action for a cleaner comparison card.</small>*/}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/*{metricDecision && (*/}
            {/*    <div className="cmp-decision-footer">*/}
            {/*        <div className="cmp-decision-inner">*/}
            {/*            <div><strong>Metric winners</strong></div>*/}
            {/*            <div className="cmp-metric-winners">*/}
            {/*                <div>Highest function CCN: <span>{metricDecision.metricWinners.highestFunctionCCN || "—"}</span></div>*/}
            {/*                <div>CCN / function: <span>{metricDecision.metricWinners.totalCcnPerFunction || "—"}</span></div>*/}
            {/*                <div>Highest commit similarity: <span>{metricDecision.metricWinners.highestCommitSimilarity || "—"}</span></div>*/}
            {/*                <div>Similarity/commit: <span>{metricDecision.metricWinners.totalSimilarityPerCommit || "—"}</span></div>*/}
            {/*                <div>Commit count: <span>{metricDecision.metricWinners.commitCount || "—"}</span></div>*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*)}*/}
        </div>
    );
}
