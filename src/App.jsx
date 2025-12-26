import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar.jsx';
import FirstPage from './components/First page/FirstPage.jsx';
import { UserProvider } from './context/UserContext';
import Analyzer from './components/Analyzer/Analyzer.jsx';
import Comparison from './components/Comparision/Comparison.jsx';
import Find from './components/Find/Find.jsx';
import Profile from './components/Profile/Profile.jsx';
import Home from './components/Pull Request/Home.jsx';
import Footer from "./components/Footer/Footer.jsx";
import CommitInsights from "./components/CommitInsights/CommitInsights.jsx"; // Import CommitInsights
import ProtectedRoute from "./components/Protected Route/ProtectedRoute.jsx"; // Import ProtectedRoute
import Heatmap from "./components/Heatmap/Heatmap.jsx";
import PrivacyPolicy from './components/Terms & Policy/PrivacyPolicy.jsx';
import TermsOfService from './components/Terms & Policy/TermsOfService.jsx';
import './App.css';
import AnalyzeDashboard from "./components/AnalyzeDashboard/AnalyzeDashboard.jsx";
import CommitComparison from "./components/CommitComparison/CommitComparison.jsx";


const App = () => {
    return (
        <UserProvider>
            <Router>
                <Navbar />
                <div className="container">
                    <Routes>
                        {/* Public Route */}
                        <Route path="/" element={<FirstPage />} />
                        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                        <Route path="/terms-of-service" element={<TermsOfService />} />

                        {/* Protected Routes */}
                        <Route element={<ProtectedRoute />}>
                            <Route path="/Home" element={<Home />} />
                            <Route path="/Analyzer" element={<Analyzer />} />
                            <Route path="/CommitInsights" element={<CommitInsights />} />
                            <Route path="/Find" element={<Find />} />
                            <Route path="/Comparison" element={<Comparison />} />
                            <Route path="/UserProfile" element={<Profile />} />
                            <Route path="/Heatmap" element={<Heatmap />} />
                            {/*<Route path="/commit-comparison" element={<CommitComparison />} />*/}
                            {/*<Route path="/commit-analyzer" element={<AnalyzeDashboard defaultUser="Bhadanitirth" />} />*/}
                        </Route>

                        <Route path="/*" element={<FirstPage />} />
                    </Routes>
                </div>
                <Footer />
            </Router>
        </UserProvider>
    );
};

export default App;
