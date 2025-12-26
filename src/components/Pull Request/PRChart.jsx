import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import "./PRChart.css"; // Import the CSS file

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const PRChart = ({ data, type }) => {
    const chartData = {
        labels: type === "closed" ? ["PR reviewed", "PR pending review"] : ["Accepted PRs", "Not Accepted PRs"],
        datasets: [
            {
                data: type === "closed" ? [data.closedPRs, data.totalPRs - data.closedPRs] : [data.acceptedPRs, data.closedPRs - data.acceptedPRs],
                backgroundColor: ["#36A2EB", "#4BC0C0"],
                hoverBackgroundColor: ["#5AB3F0", "#66D1D1"],
                borderWidth: 1,
                cutout: "50%",
                rotation: 240,
                circumference: 240
            }
        ]
    };

    const options = {
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    color: '#FFFFFF' // Change label color
                }
            },
            datalabels: {
                color: '#FFFFFF',
                font: {
                    weight: 'bold',
                    size: 14
                },
                formatter: (value, context) => {
                    return value;
                }
            }
        }
    };

    return (
        <div className="chart-container">
            <Doughnut data={chartData} options={options} />
        </div>
    );
};

export default PRChart;