// Frontend/src/components/CommitInsights/CommitInsights.jsx
import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import './CommitInsights.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const CommitInsights = ({ onClose, analysisData }) => {
    const [isModalOpen] = useState(true);
    const [selectedContributor, setSelectedContributor] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (analysisData && analysisData.contributors.length > 0) {
            setSelectedContributor(analysisData.contributors[0]);
        }
    }, [analysisData]);

    if (!analysisData) {
        return (
            <div className="ai-insights-wrapper">
                <div className="ai-chart-modal-overlay">
                    <div className="ai-chart-modal">
                        <button className="ai-close-modal-btn" onClick={onClose}>×</button>
                        <div className="ai-loading-container">
                            <div className="ai-loading-spinner"></div>
                            <p className="ai-loading-text">Analyzing repository data...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="ai-insights-wrapper">
                <div className="ai-chart-modal-overlay">
                    <div className="ai-chart-modal">
                        <button className="ai-close-modal-btn" onClick={onClose}>×</button>
                        <div className="loading-spinner">Loading...</div>
                    </div>
                </div>
            </div>
        );
    }

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: {
                display: true,
                text: [
                    `${analysisData.repositoryName} - Commit Analysis`,
                    `Selected Contributor: ${selectedContributor?.contributorName}`,
                    `Total Commits: ${selectedContributor?.totalCommits}`
                ],
                font: { size: 14 },
                padding: { bottom: 10 }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            }
        }
    };

    const chartData = {
        labels: ['Feature Additions', 'Bug Fixes', 'Code Refactoring', 'Maintenance & Other'],
        datasets: [{
            label: 'Number of Commits',
            data: [
                selectedContributor?.categories.featureAddition,
                selectedContributor?.categories.bugFix,
                selectedContributor?.categories.codeRefactoring,
                selectedContributor?.categories.maintenanceOther
            ],
            backgroundColor: [
                'rgba(75, 192, 192, 0.6)',
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)'
            ]
        }]
    };

    return (
        <div className="ai-insights-wrapper">
            <div className="ai-chart-modal-overlay">
                <div className="ai-chart-modal">
                    <button className="ai-close-modal-btn" onClick={onClose}>×</button>
                    <div className="ai-modal-content">
                        <div className="ai-contributors-list">
                            <h3>Contributors</h3>
                            {analysisData.contributors.map(contributor => (
                                <div
                                    key={contributor.contributorName}
                                    className={`ai-contributor-item ${selectedContributor?.contributorName === contributor.contributorName ? 'selected' : ''}`}
                                    onClick={() => setSelectedContributor(contributor)}
                                >
                                    {contributor.contributorName}
                                    <span>({contributor.totalCommits} commits)</span>
                                </div>
                            ))}
                        </div>
                        <div className="ai-modal-chart-wrapper">
                            <Bar options={chartOptions} data={chartData} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommitInsights;