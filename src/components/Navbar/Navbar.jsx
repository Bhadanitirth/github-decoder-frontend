import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    FaHome,
    FaSearch,
    FaChartBar,
    FaBalanceScale,
    FaUser,
    FaSignInAlt,
    FaFire,
    FaSignOutAlt,
    FaGithub,
    FaCodeBranch,
    FaProjectDiagram,
    FaColumns,
    FaTrash // Imported FaTrash for the clear button icon
} from 'react-icons/fa';
import { GoGitPullRequest } from 'react-icons/go';
import { useUser } from '../../context/UserContext.jsx';
import './Navbar.css';
import { BASE_URL } from '../../config';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, loading, fetchUserData, logout } = useUser();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        if (!user) {
            fetchUserData();
        }
    }, [fetchUserData, user]);

    const handleSignIn = () => {
        window.location.href = '${BASE_URL}/oauth2/authorization/github';
    };

    const handleSignOut = () => {
        // localStorage.clear();
        logout();
        navigate('/');
        window.location.href = '${BASE_URL}/logout';
    };

    const handleClearData = async () => {
        const confirmDelete = window.confirm("Are you sure you want to clear all table data? This action cannot be undone.");

        if (!confirmDelete) return;

        try {
            const response = await fetch("${BASE_URL}/api/database/clear-all", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                alert("All table data cleared successfully");
                setIsDropdownOpen(false);
            } else {
                alert("Failed to clear data. Please try again.");
            }
        } catch (error) {
            console.error("Error clearing database:", error);
            alert("An error occurred while connecting to the server.");
        }
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <header className="header" style={{ backgroundColor: '#1E3A5F' }}>
            <Link to="/" className="brand">
                <div>
                    <img
                        src="/img/logo2.jpg"
                        alt="Repository Analysis Preview"
                        className="navbar-logo"
                    />                    GitHub Repository Decoder
                </div>
            </Link>
            <nav className="navbar">
                <ul className="nav-list">
                    {user?.isAuthenticated ? (
                        <>
                            <li>
                                <Link to="/Find" className={`nav-link ${location.pathname === "/Find" ? "active" : ""}`}>
                                    <FaSearch className="nav-icon" />
                                    <span className="nav-text">Find</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/Heatmap" className={`nav-link ${location.pathname === "/Heatmap" ? "active" : ""}`}>
                                    <FaFire className="nav-icon" />
                                    <span className="nav-text">Heatmap</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/Home" className={`nav-link ${location.pathname === "/Home" ? "active" : ""}`}>
                                    <GoGitPullRequest className="nav-icon" />
                                    <span className="nav-text">Pull Req.</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/Comparison" className={`nav-link ${location.pathname === "/Comparison" ? "active" : ""}`}>
                                    <FaBalanceScale className="nav-icon" />
                                    <span className="nav-text">Compare</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/Analyzer" className={`nav-link ${location.pathname === "/Analyzer" ? "active" : ""}`}>
                                    <FaChartBar className="nav-icon" />
                                    <span className="nav-text">Analyzer</span>
                                </Link>
                            </li>
                        </>
                    ) : null}
                    {!user?.isAuthenticated ? (
                        <li>
                            <button onClick={handleSignIn} className="sign-in-btn">
                                <div className="sign-in-content">
                                    <FaGithub className="github-icon" />
                                    <div className="sign-in-text">
                                        <span className="sign-in-primary">Sign in with GitHub</span>
                                        <span className="sign-in-secondary">Analyze repositories now</span>
                                    </div>
                                </div>
                                <div className="pulse-effect"></div>
                            </button>
                        </li>
                    ) : (
                        <li className="profile-section"
                            onMouseEnter={() => setIsDropdownOpen(true)}
                            onMouseLeave={() => setIsDropdownOpen(false)}>
                            <img
                                src={user.avatarUrl}
                                alt="Profile"
                                className="profile-image"
                            />
                            <div className={`profile-dropdown ${isDropdownOpen ? 'show' : ''}`}>
                                <div className="dropdown-header">
                                    <p className="user-Name">{user.name}</p>
                                    <p className="user-Email">{user.email}</p>
                                </div>
                                <div className="dropdown-items">
                                    <Link
                                        to="/UserProfile"
                                        className="dropdown-item"
                                        onClick={() => setIsDropdownOpen(false)}
                                    >
                                        <FaUser />
                                        Profile
                                    </Link>

                                    <button
                                        title="Warning: This will permanently delete all your Previous analysis data from Database."
                                        onClick={handleClearData}
                                        className="sign-out-btn"
                                        style={{ borderTop: '1px solid #eee' }}
                                    >
                                        <FaTrash />
                                        Clear Data
                                    </button>

                                    <button onClick={handleSignOut} className="sign-out-btn">
                                        <FaSignOutAlt />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </li>
                    )}
                </ul>
            </nav>
        </header>
    );
};

export default Navbar;