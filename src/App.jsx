import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './supabase';
import Navbar from './components/Navbar';
import BottomNavbar from './components/BottomNavbar';
import Login from './components/Login';
import Picks from './components/Picks';
import Results from './components/Results';
import Leaderboard from './components/Leaderboard';
import Admin from './components/Admin';

const INITIAL_MATCHES = [
  {
    id: 'm1',
    status: 'LIVE',
    time: "78'",
    group: 'Group E',
    homeTeam: 'France',
    homeFlag: 'https://flagcdn.com/w160/fr.png',
    homeScore: 2,
    awayScore: 1,
    awayTeam: 'Japan',
    awayFlag: 'https://flagcdn.com/w160/jp.png',
    date: 'June 24',
    type: 'live'
  },
  {
    id: 'm2',
    status: 'FINISHED',
    group: 'Group B',
    homeTeam: 'Brazil',
    homeFlag: 'https://flagcdn.com/w160/br.png',
    homeScore: 3,
    awayScore: 0,
    awayTeam: 'S. Korea',
    awayFlag: 'https://flagcdn.com/w160/kr.png',
    date: 'Yesterday',
    type: 'finished'
  },
  {
    id: 'm3',
    status: 'FINISHED',
    group: 'Group B',
    homeTeam: 'Spain',
    homeFlag: 'https://flagcdn.com/w160/es.png',
    homeScore: 1,
    awayScore: 1,
    awayTeam: 'Germany',
    awayFlag: 'https://flagcdn.com/w160/de.png',
    date: 'Yesterday',
    type: 'finished'
  },
  {
    id: 'm4',
    status: 'FINISHED',
    group: 'Group C',
    homeTeam: 'Argentina',
    homeFlag: 'https://flagcdn.com/w160/ar.png',
    homeScore: 2,
    awayScore: 0,
    awayTeam: 'Mexico',
    awayFlag: 'https://flagcdn.com/w160/mx.png',
    date: 'June 23',
    type: 'finished'
  },
  {
    id: 'm5',
    status: 'FINISHED',
    group: 'Group D',
    homeTeam: 'USA',
    homeFlag: 'https://flagcdn.com/w160/us.png',
    homeScore: 0,
    awayScore: 1,
    awayTeam: 'England',
    awayFlag: 'https://flagcdn.com/w160/gb-eng.png',
    date: 'June 23',
    type: 'finished'
  },
  {
    id: 'm6',
    status: 'LIVE',
    time: "34'",
    group: 'Group F',
    homeTeam: 'Portugal',
    homeFlag: 'https://flagcdn.com/w160/pt.png',
    homeScore: 0,
    awayScore: 0,
    awayTeam: 'Ghana',
    awayFlag: 'https://flagcdn.com/w160/gh.png',
    date: 'June 24',
    type: 'live'
  }
];

export default function App() {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Initialize matches in localStorage if not present
    if (!localStorage.getItem('quiniela_matches_data')) {
      localStorage.setItem('quiniela_matches_data', JSON.stringify(INITIAL_MATCHES));
    }
  }, []);

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

  const handleSession = async (session) => {
    if (session) {
      let role = null;
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, avatar, name')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        role = profile.role;
      }

      setUser({
        id: session.user.id,
        name: profile?.name || session.user.user_metadata?.full_name || session.user.email.split('@')[0],
        email: session.user.email,
        avatar: profile?.avatar,
        role,
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

  const handleUpdateProfile = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
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
      {user && <Navbar user={user} onLogout={handleLogout} onUpdateProfile={handleUpdateProfile} />}

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
          <Route
            path="/admin"
            element={user ? <Admin /> : <Navigate to="/login" />}
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
