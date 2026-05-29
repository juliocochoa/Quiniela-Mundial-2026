import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './supabase';
import Navbar from './components/Navbar';
import BottomNavbar from './components/BottomNavbar';
import Login from './components/Login';
import Picks from './components/Picks';
import Results from './components/Results';
import Leaderboard from './components/Leaderboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 1. Obtener la sesión actual al cargar
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    // 2. Escuchar cambios de autenticación (ej: cuando vuelve del Magic Link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      handleSession(session);
      // Redirigir al leaderboard solo cuando acaba de iniciar sesión por el link
      if (event === 'SIGNED_IN' && session) {
        navigate('/leaderboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSession = (session) => {
    if (session) {
      // Usamos el usuario real de Supabase, 
      // pero seguimos mockeando los puntos hasta que tengamos la base de datos lista
      setUser({
        id: session.user.id,
        name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
        email: session.user.email,
        avatar: session.user.user_metadata?.avatar_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuACGDivDxEUJntlbinl0hq778O7VOKNXKb6QC7n5e4CqlmSCLylo2lW_Tux00fcPh1jXSVmzgC-ariqDkgucdtWZ9lQmgvo5O0FrwyJL8QE49-sFoGC5juVwL_q7cFiqN9X7zAkyJu08C6eV8QvCiiH0c_MCHQUwUCMiGOoWQ624ESNFhtNKAXfn0L4HrVFKsGZ2BsswLEpYJQLfWxIa-damCJZ8Ro7WDcj_HvMj6LJjc3ZGwCaRFQUNSnlpS5c_q87yh_2Cp39od_u',
        rank: 1248,
        points: 512,
        correctResults: 28,
        correctScores: 4
      });
    } else {
      setUser(null);
    }
    setIsAuthLoading(false);
  };

  // Log out
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Update Stats when saving predictions (Mock update for UI testing)
  const handleUpdateStats = (completedCount) => {
    if (!user) return;
    
    const newPoints = user.points + (completedCount * 10);
    const newCorrectResults = user.correctResults + completedCount;

    setUser({
      ...user,
      points: newPoints,
      correctResults: newCorrectResults
    });
  };

  // Redirigir según autenticación
  useEffect(() => {
    if (isAuthLoading) return; // Evitar redirecciones mientras carga la sesión

    if (!user && location.pathname !== '/login') {
      navigate('/login');
    } else if (user && (location.pathname === '/login' || location.pathname === '/')) {
      navigate('/picks'); // Ruta por defecto si está logueado y va al root
    }
  }, [user, isAuthLoading, location.pathname, navigate]);

  if (isAuthLoading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-primary text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>sync</span>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col">
      {user && <Navbar user={user} onLogout={handleLogout} />}
      
      <main className="flex-grow">
        <Routes>
          <Route 
            path="/login" 
            element={<Login />} 
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
