import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext.jsx';
import './Profile.css';
import { FaMapMarkerAlt, FaGithub, FaUserFriends, FaFolderOpen } from 'react-icons/fa';

const Profile = () => {
    const { user, loading, fetchUserData } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    useEffect(() => {
        if (!loading && !user?.isAuthenticated) {
            navigate('/login');
        }
    }, [loading, user, navigate]);

    if (loading) {
        return <div className="loading-spinner">Loading</div>;
    }

    if (!user?.isAuthenticated) {
        return null;
    }

    return (
        <div className="profile-container">
            <div className="profile-card">
                <div className="profile-sidebar">
                    <img src={user.avatarUrl} alt="Profile" className="profile-avatar" />
                    <h2 className="profile-name">{user.name}</h2>
                    <p className="profile-email">{user.email}</p>
                </div>
                <div className="profile-content">
                    <div className="profile-info">
                        <p><FaUserFriends /> <strong>User ID:</strong> {user.id}</p>
                        <p><FaMapMarkerAlt /> <strong>Location:</strong> {user.location || 'Not specified'}</p>
                        <p><strong>Bio:</strong> {user.bio || 'No bio available'}</p>
                        <p><FaFolderOpen /> <strong>Public Repositories:</strong> {user.publicRepos}</p>
                        <p><FaUserFriends /> <strong>Followers:</strong> {user.followers}</p>
                        <p><FaGithub /> <strong>GitHub Profile:</strong> <a href={user.htmlUrl} target="_blank" rel="noopener noreferrer">{user.htmlUrl}</a></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;