import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import BottomNavbar from './components/BottomNavbar';
import Login from './components/Login';
import Picks from './components/Picks';
import Results from './components/Results';
import Leaderboard from './components/Leaderboard';

const USER_SESSION_KEY = 'quiniela_user_session';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(USER_SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Log in
  const handleLogin = (email) => {
    const userData = {
      name: 'Alex Rivers',
      email: email,
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACGDivDxEUJntlbinl0hq778O7VOKNXKb6QC7n5e4CqlmSCLylo2lW_Tux00fcPh1jXSVmzgC-ariqDkgucdtWZ9lQmgvo5O0FrwyJL8QE49-sFoGC5juVwL_q7cFiqN9X7zAkyJu08C6eV8QvCiiH0c_MCHQUwUCMiGOoWQ624ESNFhtNKAXfn0L4HrVFKsGZ2BsswLEpYJQLfWxIa-damCJZ8Ro7WDcj_HvMj6LJjc3ZGwCaRFQUNSnlpS5c_q87yh_2Cp39od_u',
      rank: 1248,
      points: 512,
      correctResults: 28,
      correctScores: 4
    };
    setUser(userData);
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(userData));
    navigate('/picks');
  };

  // Log out
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(USER_SESSION_KEY);
    navigate('/login');
  };

  // Update Stats when saving predictions
  const handleUpdateStats = (completedCount) => {
    if (!user) return;
    
    // Dynamically update points/progress slightly to show responsiveness
    const newPoints = 512 + (completedCount * 10);
    const newCorrectResults = 28 + completedCount;

    const updatedUser = {
      ...user,
      points: newPoints,
      correctResults: newCorrectResults
    };
    
    setUser(updatedUser);
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(updatedUser));
  };

  // Redirect unauthenticated users
  useEffect(() => {
    if (!user && location.pathname !== '/login') {
      navigate('/login');
    } else if (user && (location.pathname === '/login' || location.pathname === '/')) {
      navigate('/picks');
    }
  }, [user, location.pathname, navigate]);

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col">
      {user && <Navbar user={user} onLogout={handleLogout} />}
      
      <main className="flex-grow">
        <Routes>
          <Route 
            path="/login" 
            element={<Login onLogin={handleLogin} />} 
          />
          <Route 
            path="/picks" 
            element={user ? <Picks user={user} onUpdateStats={handleUpdateStats} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/results" 
            element={user ? <Results /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/leaderboard" 
            element={user ? <Leaderboard user={user} /> : <Navigate to="/login" />} 
          />
          {/* Fallback routing */}
          <Route 
            path="*" 
            element={<Navigate to={user ? "/picks" : "/login"} replace />} 
          />
        </Routes>
      </main>

      {user && <BottomNavbar />}
    </div>
  );
}
