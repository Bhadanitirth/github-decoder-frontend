import React, { createContext, useState, useContext, useCallback } from 'react';
import {BASE_URL} from "../config.jsx";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUserData = useCallback(async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/user/user-info`, {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Not authenticated');
            }

            const data = await response.json();
            const userData = {
                email: data.email || `${data.login}@github.com`,
                avatarUrl: data.avatar_url,
                name: data.name || data.login,
                id: data.id,
                location: data.location || 'Not specified',
                bio: data.bio || 'No bio available',
                publicRepos: data.public_repos,
                followers: data.followers,
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

    const logout = useCallback(() => {
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