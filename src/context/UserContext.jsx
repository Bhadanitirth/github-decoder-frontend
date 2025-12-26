import React, { createContext, useState, useContext, useCallback } from 'react';
import { BASE_URL } from "../config.jsx";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUserData = useCallback(async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/user/user-info`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Not authenticated');
            }

            const data = await response.json();

            // Map the data (Your logic here is fine)
            const userData = {
                email: data.email || `${data.login}@github.com`,
                avatarUrl: data.avatar_url || data.picture,
                name: data.name || data.login,
                id: data.id || data.githubId,
                location: data.location || 'Not specified',
                bio: data.bio || 'No bio available',
                publicRepos: data.public_repos || 0,
                followers: data.followers || 0,
                htmlUrl: data.html_url,
                isAuthenticated: true
            };
            setUser(userData);
        } catch (error) {
            console.error('Auth check failed:', error);
            setUser({ isAuthenticated: false });
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await fetch(`${BASE_URL}/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (e) {
            console.error("Logout error", e);
        }
        setUser({ isAuthenticated: false });
        setLoading(false);
    }, []);

    const value = {
        user,
        loading,
        fetchUserData,
        logout
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === null) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};