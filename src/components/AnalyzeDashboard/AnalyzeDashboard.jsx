import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { FaSearch, FaCodeBranch, FaChevronRight, FaChevronDown, FaBug, FaFilter, FaSync } from "react-icons/fa";
import { BASE_URL } from '../../config';

const styles = {
    page: { minHeight: "100vh", background: "#0D1F2D", color: "#fff", padding: "24px", fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif" },
    header: { maxWidth: 1280, margin: "0 auto 16px", display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between" },
    titleWrap: { display: "flex", alignItems: "center", gap: 12 },
    title: { fontSize: 24, fontWeight: 700 },
    pill: { background: "#1E3A5F", border: "1px solid rgba(255,255,255,0.08)", padding: "6px 10px", borderRadius: 999, fontSize: 12, display: "inline-flex", alignItems: "center", gap: 6 },
    controls: { display: "flex", alignItems: "center", gap: 10 },
    input: { background: "#0f2536", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", padding: "10px 12px", borderRadius: 8, minWidth: 260, outline: "none" },
    select: { background: "#0f2536", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", padding: "10px 12px", borderRadius: 8, outline: "none" },
    button: { background: "#31A8E0", color: "#001018", border: "none", padding: "10px 14px", borderRadius: 8, fontWeight: 600, cursor: "pointer" },
    grid: { maxWidth: 1280, margin: "16px auto 80px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 },
    card: { background: "#D0E6F2", color: "#0f172a", borderRadius: 14, boxShadow: "0 6px 14px rgba(0,0,0,.15)", overflow: "hidden", transform: "translateY(0)", transition: "transform .2s ease, box-shadow .2s ease" },
    cardHeader: { background: "#1E3A5F", color: "#fff", padding: 14, display: "flex", alignItems: "center", justifyContent: "space-between" },
    repoName: { fontSize: 18, fontWeight: 700 },
    statRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, padding: 14 },
    stat: { background: "#f0f7fb", borderRadius: 10, padding: 10, textAlign: "center", transition: "transform 150ms ease, box-shadow 150ms ease" },
    statLabel: { fontSize: 12, color: "#334155" },
    statValue: { fontSize: 18, fontWeight: 800, color: "#0f172a" },
    commitsWrap: { padding: 14 },
    commitHeader: { display: "flex", alignItems: "center", gap: 8, color: "#0f172a", fontWeight: 700 },
    commit: { background: "#ffffff", border: "1px solid #e6eef4", borderRadius: 10, padding: 12, marginTop: 10 },
    commitMeta: { display: "flex", flexWrap: "wrap", gap: 8, fontSize: 12, color: "#334155" },
    tag: { display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 8px", borderRadius: 999, background: "#e8f4fb", border: "1px solid #d7eaf6", color: "#0b3b56", fontWeight: 600 },
    diffBlock: { background: "#0f2536", color: "#dcf1ff", borderRadius: 12, padding: 12, marginTop: 10 },
    table: { width: "100%", borderCollapse: "separate", borderSpacing: 0, overflow: "hidden", borderRadius: 8 },
    th: { textAlign: "left", fontSize: 12, opacity: 0.9, padding: "8px 10px", background: "#113348" },
    td: { fontSize: 13, padding: "8px 10px", borderBottom: "1px solid rgba(255,255,255,0.08)" },
    modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 9999 },
    modalBox: { width: "min(1000px, 96vw)", height: "min(80vh, 900px)", background: "#D0E6F2", color: "#0f172a", borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.35)", overflow: "hidden", display: "flex", flexDirection: "column" },
    modalHead: { background: "#1E3A5F", color: "#fff", padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between" },
    modalBody: { padding: 16, overflow: "auto" },
    closeBtn: { background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.35)", padding: "6px 10px", borderRadius: 8, cursor: "pointer", fontWeight: 700 },
};

const fmt = (n, d = 2) => (Number(n) || 0).toLocaleString(undefined, { maximumFractionDigits: d, minimumFractionDigits: d });

function sumSimilarity(repo) {
    return (repo.commits || []).reduce((acc, c) => acc + (Number(c?.similarity_score) || 0), 0);
}
function sumCCN(repo) {
    const commits = repo.commits || [];
    let total = 0;
    for (const c of commits) {
        const oldA = c?.gitDiffAnalysis?.old_code_analysis || [];
        const newA = c?.gitDiffAnalysis?.new_code_analysis || [];
        for (const fn of oldA) total += Number(fn?.ccn) || 0;
        for (const fn of newA) total += Number(fn?.ccn) || 0;
    }
    return total;
}
function countFunctions(repo) {
    let n = 0;
    for (const c of repo.commits || []) {
        n += (c?.gitDiffAnalysis?.old_code_analysis?.length || 0);
        n += (c?.gitDiffAnalysis?.new_code_analysis?.length || 0);
    }
    return n;
}

function EmptyMini({ label = "No data" }) {
    return <div style={{ padding: 12, border: "1px dashed rgba(255,255,255,0.25)", borderRadius: 8, opacity: 0.8 }}>{label}</div>;
}

function FnTable({ items }) {
    return (
        <table style={styles.table}>
            <thead>
            <tr>
                <th style={styles.th}>Function</th>
                <th style={styles.th}>NLOC</th>
                <th style={styles.th}>CCN</th>
                <th style={styles.th}>Tokens</th>
                <th style={styles.th}>Params</th>
                <th style={styles.th}>Location</th>
            </tr>
            </thead>
            <tbody>
            {items.map((x, i) => (
                <tr key={i}>
                    <td style={styles.td}>{x.name || "—"}</td>
                    <td style={styles.td}>{x.nloc ?? "—"}</td>
                    <td style={styles.td}>{x.ccn ?? "—"}</td>
                    <td style={styles.td}>{x.token_count ?? "—"}</td>
                    <td style={styles.td}>{x.parameter_count ?? "—"}</td>
                    <td style={styles.td}>{x.location || "—"}</td>
                </tr>
            ))}
            </tbody>
        </table>
    );
}

function CommitItem({ commit }) {
    const [open, setOpen] = useState(false);
    const oldA = commit?.gitDiffAnalysis?.old_code_analysis || [];
    const newA = commit?.gitDiffAnalysis?.new_code_analysis || [];
    const totalCcn = [...oldA, ...newA].reduce((a, b) => a + (b?.ccn || 0), 0);

    const CATEGORY_META = {
        "new feature": { label: "This commit is for New Feature", bg: "#e6fff4", fg: "#054a2f", emoji: "🆕" },
        "bug fix": { label: "This commit is for Bug Fixing", bg: "#fff1f3", fg: "#5c0a1b", emoji: "🐞" },
        update: { label: "This commit is for Update/Refactor", bg: "#eef2ff", fg: "#1e2a78", emoji: "🛠️" },
        documentation: { label: "This commit is for Documentation", bg: "#fff7e6", fg: "#5b3b00", emoji: "📚" },
        unknown: { label: "This commit category is Unknown", bg: "#f1f5f9", fg: "#0f172a", emoji: "🏷️" },
    };
    const catKey = (commit?.category || "unknown").toLowerCase();
    const meta = CATEGORY_META[catKey] || CATEGORY_META.unknown;

    return (
        <div style={styles.commit}>
            <div style={{ background: meta.bg, color: meta.fg, border: `1px solid rgba(0,0,0,0.06)`, borderRadius: 8, padding: "8px 10px", marginBottom: 10, display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 700 }} title={commit?.category || "category"}>
                <span style={{ fontSize: 18 }}>{meta.emoji}</span> {meta.label}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div>
                    <div style={{ fontWeight: 700, color: "#0b1d2a" }}>{commit.originalCommitMessage}</div>
                    <div style={styles.commitMeta}>
                        <span style={styles.tag}>sim: {fmt(commit.similarity_score, 6)}</span>
                        <span style={styles.tag}>CCN: {totalCcn}</span>
                    </div>
                    {commit.generatedCommitMessage && <div style={{ marginTop: 6, fontSize: 13, color: "#334155" }}>{commit.generatedCommitMessage}</div>}
                </div>
                <button style={{ ...styles.button, background: "#1E3A5F", color: "#fff" }} onClick={() => setOpen((v) => !v)}>
                    {open ? <FaChevronDown /> : <FaChevronRight />} Details
                </button>
            </div>

            {open && (
                <div style={styles.diffBlock}>
                    <div style={{ fontWeight: 800, marginBottom: 8 }}>Git Diff Analysis</div>

                    {oldA.length > 0 && newA.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <div>
                                <div style={{ opacity: 0.8, marginBottom: 6 }}>Old code analysis</div>
                                <FnTable items={oldA} />
                            </div>
                            <div>
                                <div style={{ opacity: 0.8, marginBottom: 6 }}>New code analysis</div>
                                <FnTable items={newA} />
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
                            <div>
                                <div style={{ opacity: 0.8, marginBottom: 6 }}>Old code analysis</div>
                                {oldA.length === 0 ? <EmptyMini label="No old-code entries" /> : <FnTable items={oldA} />}
                            </div>
                            <div>
                                <div style={{ opacity: 0.8, marginBottom: 6 }}>New code analysis</div>
                                {newA.length === 0 ? <EmptyMini label="No new-code entries" /> : <FnTable items={newA} />}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function RepoCard({ repo, onOpen }) {
    const totalSimilarity = useMemo(() => sumSimilarity(repo), [repo]);
    const totalCCN = useMemo(() => sumCCN(repo), [repo]);
    const fnCount = useMemo(() => countFunctions(repo), [repo]);
    const commits = repo.commits || [];

    const avgSimPercent = commits.length ? (totalSimilarity / commits.length) * 100 : 0;

    return (
        <div style={styles.card} onClick={() => onOpen(repo)}>
            <div style={styles.cardHeader}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ ...styles.pill, background: "#2b4f7b", color: "#dbefff" }}>
                        <FaCodeBranch /> {commits.length} commits
                    </div>
                    <div style={{ ...styles.pill, background: "#2b4f7b", color: "#dbefff" }}>
                        <FaBug /> {fnCount} fns
                    </div>
                </div>
                <button style={styles.button} onClick={(e) => { e.stopPropagation(); onOpen(repo); }}>View Details</button>
            </div>

            <div style={{ padding: 14 }}>
                <div style={styles.repoName}>{repo.repositoryName}</div>
                <div style={{ marginTop: 10 }}>
                    <div style={styles.statRow}>
                        <div style={styles.stat}>
                            <div style={styles.statLabel}>Total Similarity</div>
                            <div style={styles.statValue}>{fmt(totalSimilarity)}</div>
                        </div>
                        <div style={styles.stat}>
                            <div style={styles.statLabel}>Total CCN</div>
                            <div style={styles.statValue}>{totalCCN}</div>
                        </div>
                        <div style={styles.stat}>
                            <div style={styles.statLabel}>Avg Sim / Commit (%)</div>
                            <div style={styles.statValue}>{fmt(avgSimPercent)}%</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function useLockBody(locked) {
    useEffect(() => {
        if (!locked) return;
        const { overflow } = document.body.style;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = overflow;
        };
    }, [locked]);
}

function RepoModal({ repo, onClose }) {
    const [mounted, setMounted] = useState(false);
    useLockBody(Boolean(repo));

    useEffect(() => {
        setMounted(true);
        const onKey = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    if (!repo) return null;

    const totalSimilarity = sumSimilarity(repo);
    const totalCCN = sumCCN(repo);
    const fnCount = countFunctions(repo);
    const commits = repo.commits || [];

    return createPortal(
        <div style={{ ...styles.modalOverlay, opacity: mounted ? 1 : 0, transition: "opacity 180ms ease" }} onClick={onClose} role="dialog" aria-modal="true">
            <div style={{ ...styles.modalBox, transform: mounted ? "translateY(0) scale(1)" : "translateY(10px) scale(0.98)", transition: "transform 180ms ease, box-shadow 180ms ease" }} onClick={(e) => e.stopPropagation()}>
                <div style={styles.modalHead}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                        <div style={{ fontSize: 18, fontWeight: 800 }}>{repo.repositoryName}</div>
                        <div style={{ ...styles.pill, background: "#2b4f7b", color: "#dbefff" }}>
                            <FaCodeBranch /> {commits.length} commits
                        </div>
                        <div style={{ ...styles.pill, background: "#2b4f7b", color: "#dbefff" }}>
                            <FaBug /> {fnCount} fns
                        </div>
                    </div>
                    <button style={styles.closeBtn} onClick={onClose} aria-label="Close details">Close ✕</button>
                </div>
                <div style={styles.modalBody}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 12 }}>
                        <div style={{ ...styles.stat, background: "#eef7fd" }}>
                            <div style={styles.statLabel}>Total Similarity</div>
                            <div style={styles.statValue}>{fmt(totalSimilarity)}</div>
                        </div>
                        <div style={{ ...styles.stat, background: "#eef7fd" }}>
                            <div style={styles.statLabel}>Total CCN</div>
                            <div style={styles.statValue}>{totalCCN}</div>
                        </div>
                        <div style={{ ...styles.stat, background: "#eef7fd" }}>
                            <div style={styles.statLabel}>Avg Sim / Commit (%)</div>
                            <div style={styles.statValue}>{fmt(commits.length ? (totalSimilarity / commits.length) * 100 : 0)}%</div>
                        </div>
                    </div>

                    <div style={styles.commitHeader}>
                        <FaCodeBranch /> Commits
                    </div>
                    {commits.length === 0 ? <EmptyMini label="No commits in this repo" /> : commits.map((c, idx) => <CommitItem key={idx} commit={c} />)}
                </div>
            </div>
        </div>,
        document.body
    );
}

async function fetchAnalyze(username) {
    const url = `${BASE_URL}/api/github/analyze/${encodeURIComponent(username)}`;
    try {
        const res = await fetch(url);
        if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(text || `Analyze endpoint returned status ${res.status}`);
        }
        const data = await res.json().catch(() => null);
        if (!data || !Array.isArray(data.repositories)) {
            return null;
        }
        return data;
    } catch (e) {
        console.warn("Analyze API fetch failed:", e?.message || e);
        throw e;
    }
}

export default function AnalyzeDashboard({ defaultUser = "Bhadanitirth" }) {
    const qs = new URLSearchParams(window.location.search);
    const qsUser = qs.get("user");
    const [user, setUser] = useState(qsUser || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [data, setData] = useState(null);

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [selectedRepo, setSelectedRepo] = useState(null);

    const [hoverSim, setHoverSim] = useState(false);
    const [hoverCcn, setHoverCcn] = useState(false);

    const filteredReposUnsorted = useMemo(() => {
        if (!data?.repositories) return [];
        return data.repositories
            .map((r) => ({ ...r, commits: r.commits || [] }))
            .filter((r) => r.repositoryName.toLowerCase().includes(search.toLowerCase()))
            .map((r) => {
                if (category === "All") return r;
                const commits = (r.commits || []).filter((c) => (c?.category || "").toLowerCase() === category.toLowerCase());
                return { ...r, commits };
            });
    }, [data, search, category]);

    const filteredRepos = useMemo(() => {
        // compute avg similarity percent per repo and sort descending
        const withAvg = filteredReposUnsorted.map((r) => {
            const totalSim = sumSimilarity(r);
            const commits = r.commits || [];
            const avgPercent = commits.length ? (totalSim / commits.length) * 100 : 0;
            return { repo: r, avgPercent };
        });
        withAvg.sort((a, b) => b.avgPercent - a.avgPercent);
        return withAvg.map(x => x.repo);
    }, [filteredReposUnsorted]);

    const categories = useMemo(() => {
        const set = new Set();
        (data?.repositories || []).forEach((r) => (r.commits || []).forEach((c) => c?.category && set.add(c.category)));
        return ["All", ...Array.from(set)];
    }, [data]);

    async function load() {
        if (!user || !user.trim()) {
            setError("Please enter a username to fetch.");
            setData(null);
            return;
        }
        setLoading(true);
        setError("");
        setData(null);
        try {
            const res = await fetchAnalyze(user.trim());
            if (!res) {
                setData({ username: user.trim(), repositories: [] });
            } else {
                setData(res);
            }
        } catch (e) {
            setError(e?.message || "Failed to load");
            setData(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { }, []);

    const handleSearchKey = (e) => { if (e.key === "Enter") load(); };

    const totalRepos = data?.repositories?.length || 0;
    const totalCommitsAll = (data?.repositories || []).reduce((a, r) => a + (r.commits?.length || 0), 0);

    const grandSimilarity = useMemo(() => filteredRepos.reduce((acc, r) => acc + sumSimilarity(r), 0), [filteredRepos]);
    const grandCCN = useMemo(() => filteredRepos.reduce((acc, r) => acc + sumCCN(r), 0), [filteredRepos]);
    const grandCommits = useMemo(() => filteredRepos.reduce((acc, r) => acc + (r.commits?.length || 0), 0), [filteredRepos]);
    const totalFunctions = useMemo(() => filteredRepos.reduce((acc, r) => acc + countFunctions(r), 0), [filteredRepos]);
    const avgSimilarityPerRepo = useMemo(() => (filteredRepos.length ? grandSimilarity / filteredRepos.length : 0), [filteredRepos, grandSimilarity]);

    const similarityPerCommitPercent = grandCommits ? (grandSimilarity / grandCommits) * 100 : 0;
    const totalCcnPerFunction = totalFunctions ? grandCCN / totalFunctions : 0;

    const maxCommitSimilarity = useMemo(() => {
        let max = 0;
        for (const r of filteredRepos) {
            for (const c of r.commits || []) {
                const v = Number(c?.similarity_score) || 0;
                if (v > max) max = v;
            }
        }
        return max;
    }, [filteredRepos]);

    const maxFunctionCcn = useMemo(() => {
        let max = 0;
        for (const r of filteredRepos) {
            for (const c of r.commits || []) {
                const oldA = c?.gitDiffAnalysis?.old_code_analysis || [];
                const newA = c?.gitDiffAnalysis?.new_code_analysis || [];
                for (const fn of [...oldA, ...newA]) {
                    const v = Number(fn?.ccn) || 0;
                    if (v > max) max = v;
                }
            }
        }
        return max;
    }, [filteredRepos]);

    const showNoDataFound = !loading && data && Array.isArray(data.repositories) && data.repositories.length === 0;

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <div style={styles.titleWrap}>
                    <span style={styles.title}>Commit Analyzer</span>
                    <span style={styles.pill}>
                        <FaFilter /> {totalRepos} repos • {totalCommitsAll} commits
                    </span>
                </div>
                <div style={styles.controls}>
                    <div style={{ position: "relative" }}>
                        <FaSearch style={{ position: "absolute", top: 12, left: 10, opacity: 0.6 }} />
                        <input style={{ ...styles.input, paddingLeft: 34 }} placeholder="Filter repos by name..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <select style={styles.select} value={category} onChange={(e) => setCategory(e.target.value)}>
                        {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
                    </select>
                    <input style={styles.input} placeholder="Username (Enter to fetch)" value={user} onKeyDown={handleSearchKey} onChange={(e) => setUser(e.target.value)} />
                    <button style={styles.button} onClick={load}><FaSync style={{ marginRight: 6 }} /> Fetch</button>
                </div>
            </div>

            {error && (
                <div style={{ maxWidth: 1280, margin: "0 auto", background: "#3b0b0b", border: "1px solid #5e1515", padding: 12, borderRadius: 8 }}>
                    {error}
                </div>
            )}

            {!loading && showNoDataFound && (
                <div style={{ maxWidth: 1280, margin: "10px auto 6px" }}>
                    <div style={{ ...styles.statRow, padding: 0, display: "grid", gridTemplateColumns: "repeat(1,1fr)", gap: 10 }}>
                        <div style={{ ...styles.stat, background: "#fff4f4" }}>
                            <div style={styles.statLabel}>Data not found</div>
                            <div style={{ color: "#7a1f1f", marginTop: 6 }}>No repositories found for the username '{user}'.</div>
                        </div>
                    </div>
                </div>
            )}

            {!loading && filteredRepos.length > 0 && (
                <div style={{ maxWidth: 1280, margin: "10px auto 6px" }}>
                    <div style={{ ...styles.statRow, padding: 0, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
                        <div
                            style={{
                                ...styles.stat,
                                background: "#eef7fd",
                                transform: hoverSim ? "scale(1.05)" : undefined,
                                boxShadow: hoverSim ? "0 8px 24px rgba(0,0,0,0.25)" : undefined,
                                position: "relative"
                            }}
                            onMouseEnter={() => setHoverSim(true)}
                            onMouseLeave={() => setHoverSim(false)}
                        >
                            <div style={styles.statLabel}>Similarity per Commit (%)</div>
                            <div style={styles.statValue}>{fmt(similarityPerCommitPercent)}%</div>
                            {hoverSim && (
                                <div style={{ marginTop: 8, padding: 8, background: "#dff6ff", borderRadius: 8, color: "#053445", fontWeight: 700 }}>
                                    Max single-commit similarity: {fmt(maxCommitSimilarity * 100, 3)}%
                                </div>
                            )}
                        </div>

                        <div
                            style={{
                                ...styles.stat,
                                background: "#eef7fd",
                                transform: hoverCcn ? "scale(1.05)" : undefined,
                                boxShadow: hoverCcn ? "0 8px 24px rgba(0,0,0,0.25)" : undefined,
                                position: "relative"
                            }}
                            onMouseEnter={() => setHoverCcn(true)}
                            onMouseLeave={() => setHoverCcn(false)}
                        >
                            <div style={styles.statLabel}>Total CCN per Function</div>
                            <div style={styles.statValue}>{fmt(totalCcnPerFunction)}</div>
                            {hoverCcn && (
                                <div style={{ marginTop: 8, padding: 8, background: "#fff6e6", borderRadius: 8, color: "#5b3b00", fontWeight: 700 }}>
                                    Max function CCN: {fmt(maxFunctionCcn, 0)}
                                </div>
                            )}
                        </div>

                        <div style={{ ...styles.stat, background: "#eef7fd" }}>
                            <div style={styles.statLabel}>Avg Similarity / Repo</div>
                            <div style={styles.statValue}>{fmt(avgSimilarityPerRepo)}</div>
                        </div>
                        <div style={{ ...styles.stat, background: "#eef7fd" }}>
                            <div style={styles.statLabel}>Commits (Current Filter)</div>
                            <div style={styles.statValue}>{grandCommits}</div>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div style={{ maxWidth: 1280, margin: "40px auto", opacity: 0.8 }}>Loading…</div>
            ) : (
                <div style={styles.grid}>
                    {filteredRepos.map((repo, i) => <RepoCard key={repo.repositoryName + i} repo={repo} onOpen={setSelectedRepo} />)}
                    {(!data || filteredRepos.length === 0) && !showNoDataFound && (
                        <div style={{ maxWidth: 1280, margin: "16px auto", opacity: 0.8 }}>
                            Enter a username and click Fetch to load data.
                        </div>
                    )}
                </div>
            )}

            {selectedRepo && <RepoModal repo={selectedRepo} onClose={() => setSelectedRepo(null)} />}
        </div>
    );
}
