import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGithub, FaChartLine, FaSearch, FaBalanceScale, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useUser } from '../../context/UserContext.jsx';
import './FirstPage.css';
import analytics from "../../../public/img/img.png";
import heatmap from "../../../public/img/img_3.png";
import PR from "../../../public/img/img_1.png";
import Repo from "../../../public/img/img_2.png";
import com from "../../../public/img/img_4.png";
import { BASE_URL } from '../../config';

const FirstPage = () => {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    const { user } = useUser();
    const [isHovered, setIsHovered] = useState(false);

    const slides = [
        {
            image: Repo,
            title: "Find GitHub Users",
            description: "Search any GitHub username to explore their complete profile, repositories, and contribution history. Get instant access to user statistics, starred repositories, and organization memberships. Analyze user activity patterns and coding preferences all in one place.",
            button: {
                text: "Search Users",
                path: "/Find",
                icon: <FaSearch />
            }
        },
        {
            image: heatmap,
            title: "Activity Heatmap",
            description: "Visualize monthly GitHub activities with an interactive heatmap showing contribution patterns over time. Track commit frequency, identify peak productivity periods, and analyze contribution trends across different repositories. Perfect for understanding long-term development patterns and team dynamics.",
            button: {
                text: "View Heatmap",
                path: "/Heatmap",
                icon: <FaChartLine />
            }
        },
        {
            image: PR,
            title: "Pull Request Analysis",
            description: "Track pull request history and analyze collaboration patterns across repositories. Get insights into review cycles, merge rates, and response times. Understand team collaboration efficiency with detailed PR statistics and identify bottlenecks in your development workflow.",
            button: {
                text: "Analyze PRs",
                path: "/Home",
                icon: <FaGithub />
            }
        },
        {
            image: analytics,
            title: "Repository Analytics",
            description: "Get detailed insights into repository metrics, commit frequency, and code statistics. Analyze code quality trends, contributor distributions, and project velocity. Track language usage, dependency updates, and identify areas for optimization in your codebase with comprehensive repository health checks.",
            button: {
                text: "View Analytics",
                path: "/Analyzer",
                icon: <FaChartLine />
            }
        },
        {
            image: com,
            title: "Compare GitHub Users",
            description: "Enter multiple GitHub usernames to analyze and compare their repositories, contributions, and activity levels. Evaluate users based on repository count, programming language expertise, pull request contributions, and overall engagement. Identify top performers and gain insights into coding trends—all in one place.",
            button: {
                text: "Compare github users",
                path: "/Comparison",
                icon: <FaBalanceScale />
            }
        }
    ];


    const nextSlide = () => {
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    };

    useEffect(() => {
        if (!isHovered) {  // Only run timer when not hovered
            const timer = setInterval(nextSlide, 3000);
            return () => clearInterval(timer);
        }
    }, [isHovered]);  // Add isHovered to dependencies

    useEffect(() => {
        const observerCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        };

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        document.querySelectorAll('.how-it-works, .step, .slide').forEach(element => {
            observer.observe(element);
        });

        return () => observer.disconnect();
    }, []);

    const handleGetStarted = () => {
        window.location.href = '${BASE_URL}/oauth2/authorization/github';
    };

    return (
        <div className="first-page">
            {!user?.isAuthenticated && (
                <section className="hero-section">
                    <h1>GitHub Repository Decoder</h1>
                    <p className="subtitle">Analyze, Compare, and Explore GitHub Repositories with Ease</p>
                    <button className="get-started-btn" onClick={handleGetStarted}>
                        <FaGithub className="github-icon" />
                        Get Started with GitHub
                    </button>
                </section>
            )}

            <section
                className="slider-section"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <h2>Our Services</h2>
                <div className="slider" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                    {slides.map((slide, index) => (
                        <div key={index} className="slide">
                            <img
                                src={slide.image}
                                alt={slide.title}
                                className="slide-image"
                            />
                            <div className="slide-content">
                                <h3>{slide.title}</h3>
                                <p>{slide.description}</p>
                                {user?.isAuthenticated && (
                                    <button
                                        className="slide-button"
                                        onClick={() => navigate(slide.button.path)}
                                    >
                                        {slide.button.icon}
                                        {slide.button.text}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="slider-nav">
                    <button className="slider-button" onClick={prevSlide}>
                        <FaChevronLeft />
                    </button>
                    <button className="slider-button" onClick={nextSlide}>
                        <FaChevronRight />
                    </button>
                </div>

                <div className="slider-dots">
                    {slides.map((_, index) => (
                        <div
                            key={index}
                            className={`dot ${currentSlide === index ? 'active' : ''}`}
                            onClick={() => setCurrentSlide(index)}
                        />
                    ))}
                </div>
            </section>

            {!user?.isAuthenticated && (
            <section className="how-it-works">
                <h2>How It Works</h2>
                <div className="steps-grid">
                    <div className="step">
                        <div className="step-number">1</div>
                        <h3>Sign In with GitHub</h3>
                        <p>Connect your GitHub account securely</p>
                    </div>
                    <div className="step">
                        <div className="step-number">2</div>
                        <h3>Choose a Service</h3>
                        <p>Select from our analysis tools</p>
                    </div>
                    <div className="step">
                        <div className="step-number">3</div>
                        <h3>Get Insights</h3>
                        <p>View detailed analytics and results</p>
                    </div>
                </div>
            </section>
            )}
        </div>
    );
};

export default FirstPage;