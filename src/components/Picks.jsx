import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase.js';

const SAVED_PREDICTIONS_KEY = 'quiniela_picks_2026';

import { getCountryCode } from '../utils/countryCodes.js';

const getTimeRemaining = (matchDateStr, now) => {
  if (!matchDateStr) return '';
  const matchDate = new Date(matchDateStr);
  const diffMs = matchDate - now;

  if (diffMs <= 0) {
    return 'Cerrado';
  }

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffDays > 0) {
    return `Cierra en ${diffDays}d ${diffHours}h`;
  }
  if (diffHours > 0) {
    return `Cierra en ${diffHours}h ${diffMinutes}m`;
  }
  return `Cierra en ${diffMinutes}m`;
};

export default function Picks({ user, onUpdateStats }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const [predictions, setPredictions] = useState(() => {
    const saved = localStorage.getItem(SAVED_PREDICTIONS_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  const queryClient = useQueryClient();

  const { data: apiPicks } = useQuery({
    queryKey: ['picks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('picks')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!user?.id
  });

  useEffect(() => {
    if (apiPicks && apiPicks.length > 0) {
      setPredictions(prev => {
        const newPredictions = { ...prev };
        apiPicks.forEach(pick => {
          newPredictions[`${pick.match_id}_home`] = pick.home_score;
          newPredictions[`${pick.match_id}_away`] = pick.away_score;
        });
        return newPredictions;
      });

      setSavedMatches(prev => {
        const newSaved = { ...prev };
        apiPicks.forEach(pick => {
          newSaved[pick.match_id] = true;
        });
        return newSaved;
      });
    }
  }, [apiPicks]);

  const [savedMatches, setSavedMatches] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Fetch matches from Supabase
  const { data: matches, isLoading, error } = useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: true });
      
      if (error) throw new Error(error.message);
      return data;
    }
  });

  // Leaderboard data for rank
  const { data: pastMatches } = useQuery({
    queryKey: ['past-matches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .not('home_score', 'is', null)
        .not('away_score', 'is', null);
      if (error) throw new Error(error.message);
      return data;
    }
  });

  const { data: allPicks } = useQuery({
    queryKey: ['all-picks'],
    queryFn: async () => {
      const { data, error } = await supabase.from('picks').select('*');
      if (error) throw new Error(error.message);
      return data;
    }
  });

  const { data: profiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw new Error(error.message);
      return data;
    }
  });

  const userRank = useMemo(() => {
    if (!pastMatches || !allPicks || !profiles) return null;

    const matchMap = {};
    pastMatches.forEach(m => { matchMap[m.id] = m; });

    const userStats = {};
    allPicks.forEach(pick => {
      const match = matchMap[pick.match_id];
      if (!match) return;

      const aHome = match.home_score;
      const aAway = match.away_score;
      const uHome = pick.home_score;
      const uAway = pick.away_score;

      const isExact = uHome === aHome && uAway === aAway;
      const actualResult = aHome > aAway ? 'HOME' : aAway > aHome ? 'AWAY' : 'DRAW';
      const userResult = uHome > uAway ? 'HOME' : uAway > uHome ? 'AWAY' : 'DRAW';
      const isCorrect = actualResult === userResult;

      if (!userStats[pick.user_id]) {
        userStats[pick.user_id] = { points: 0, correctResults: 0, correctScores: 0 };
      }

      if (isExact) {
        userStats[pick.user_id].points += 2;
        userStats[pick.user_id].correctScores += 1;
        userStats[pick.user_id].correctResults += 1;
      } else if (isCorrect) {
        userStats[pick.user_id].points += 1;
        userStats[pick.user_id].correctResults += 1;
      }
    });

    const ranked = Object.entries(userStats)
      .sort((a, b) => b[1].points - a[1].points || b[1].correctScores - a[1].correctScores);

    const userIdx = ranked.findIndex(([uid]) => uid === user?.id);

    return {
      rank: userIdx >= 0 ? userIdx + 1 : null,
      total: ranked.length,
    };
  }, [pastMatches, allPicks, profiles, user?.id]);

  // Group matches by group
  const groupedMatches = matches?.reduce((acc, match) => {
    const group = match.group || 'Unknown';
    if (!acc[group]) acc[group] = [];
    acc[group].push(match);
    return acc;
  }, {}) || {};

  // Handle score change
  const handleScoreChange = (matchId, side, value) => {
    // Only allow positive integers or empty string
    if (value !== '' && (!/^\d+$/.test(value) || parseInt(value, 10) < 0)) {
      return;
    }
    
    const key = `${matchId}_${side}`;
    setPredictions(prev => ({
      ...prev,
      [key]: value
    }));

    // If typing, remove saved status for that match until they click save
    if (savedMatches[matchId]) {
      setSavedMatches(prev => ({
        ...prev,
        [matchId]: false
      }));
    }
  };

  // Save all picks
  const handleSaveAll = async () => {
    const newPicksToSave = [];
    
    if (matches) {
      matches.forEach(match => {
        const matchId = match.id || `${match.home}_${match.away}`;
        const homeScore = predictions[`${matchId}_home`];
        const awayScore = predictions[`${matchId}_away`];
        
        const alreadyInApi = apiPicks?.find(p => p.match_id === matchId);
        
        if (!alreadyInApi && homeScore !== '' && homeScore !== undefined && awayScore !== '' && awayScore !== undefined) {
          newPicksToSave.push({
            user_id: user.id,
            match_id: matchId,
            home_score: parseInt(homeScore, 10),
            away_score: parseInt(awayScore, 10)
          });
        }
      });
    }

    if (newPicksToSave.length === 0) {
      setToastMessage('No hay pronósticos nuevos para guardar.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    const { error } = await supabase.from('picks').insert(newPicksToSave);

    if (error) {
      console.error('Error saving picks:', error);
      setToastMessage('Hubo un error guardando tus pronósticos.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    queryClient.invalidateQueries({ queryKey: ['picks', user?.id] });
    
    if (onUpdateStats) {
      const totalSaved = (apiPicks?.length || 0) + newPicksToSave.length;
      onUpdateStats(totalSaved);
    }

    setToastMessage('¡Tus pronósticos han sido guardados con éxito!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Calculations
  const savedCount = Object.keys(savedMatches).filter(k => savedMatches[k]).length;
  const totalPicks = matches ? matches.length : 0;
  const remainingPicks = Math.max(0, totalPicks - savedCount);
  const completionPercent = totalPicks > 0 ? Math.round((savedCount / totalPicks) * 100) : 0;

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter pt-stack-md md:pt-stack-lg min-h-screen pb-32">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 right-6 bg-primary text-on-primary border border-outline-variant px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <span className="material-symbols-outlined text-green-500 font-bold">check_circle</span>
          <span className="font-body-md font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="mb-stack-md flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-headline-md md:text-headline-lg font-headline-lg text-on-background mb-2">My Picks</h1>
          <p className="text-body-md text-on-surface-variant">Submit your predictions for the upcoming Group Stage matches.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-primary text-on-primary px-4 py-1.5 rounded-full text-label-sm font-label-sm uppercase tracking-wide">
            {remainingPicks} PICKS REMAINING
          </span>
        </div>
      </div>

      {/* Dashboard Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Main Content Area: Match List */}
        <div className="lg:col-span-8 space-y-stack-lg">
          {isLoading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 text-red-700 p-4 rounded-xl">
              Error loading matches: {error.message}
            </div>
          ) : (
            Object.entries(groupedMatches).sort().map(([group, groupMatches]) => (
              <section key={group}>
                <div className="flex items-center gap-4 mb-stack-sm">
                  <span className="text-label-sm font-label-sm bg-primary text-on-primary px-3 py-1 rounded uppercase">GROUP {group}</span>
                  <div className="h-px bg-outline-variant flex-grow"></div>
                  <span className="text-label-sm font-label-sm text-on-surface-variant">
                    {groupMatches[0]?.match_date ? new Date(groupMatches[0].match_date).toLocaleDateString() : 'TBD'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {groupMatches.map((match) => {
                    const matchId = match.id || `${match.home}_${match.away}`;
                    const isSaved = savedMatches[matchId];
                    const isSavedInApi = apiPicks?.some(p => p.match_id === matchId);
                    return (
                      <div 
                        key={matchId}
                        className={`bg-surface-container-lowest border p-gutter rounded-xl transition-all duration-300 ${
                          isSaved 
                            ? 'border-primary shadow-sm' 
                            : 'border-outline-variant hover:shadow-[0_4px_20px_-2px_rgba(0,12,46,0.1)]'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                          <div className="flex flex-1 items-center gap-4 w-full md:w-auto">
                            <div className="w-12 h-12 flex-shrink-0 shadow-sm rounded-full overflow-hidden border border-outline-variant/30">
                              <img src={`https://flagcdn.com/${getCountryCode(match.home)}.svg`} alt={`${match.home} flag`} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-headline-md font-headline-md text-on-surface">{match.home}</span>
                          </div>
                          
                          <div 
                            className={`flex items-center gap-4 bg-surface-container-low p-2 rounded-xl border transition-all ${
                              predictions[`${matchId}_home`] !== '' && predictions[`${matchId}_home`] !== undefined || 
                              predictions[`${matchId}_away`] !== '' && predictions[`${matchId}_away`] !== undefined
                                ? 'border-secondary ring-2 ring-secondary/10' 
                                : 'border-outline-variant'
                            }`}
                          >
                            <input 
                              type="number"
                              min="0"
                              placeholder="0"
                              disabled={isSavedInApi}
                              value={predictions[`${matchId}_home`] !== undefined ? predictions[`${matchId}_home`] : ''}
                              onChange={(e) => handleScoreChange(matchId, 'home', e.target.value)}
                              className={`w-14 h-14 text-center text-headline-md font-headline-md bg-white border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg transition-all ${isSavedInApi ? 'opacity-50 cursor-not-allowed bg-surface-container-low' : ''}`}
                            />
                            <span className="text-on-surface-variant font-bold text-headline-md">VS</span>
                            <input 
                              type="number"
                              min="0"
                              placeholder="0"
                              disabled={isSavedInApi}
                              value={predictions[`${matchId}_away`] !== undefined ? predictions[`${matchId}_away`] : ''}
                              onChange={(e) => handleScoreChange(matchId, 'away', e.target.value)}
                              className={`w-14 h-14 text-center text-headline-md font-headline-md bg-white border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg transition-all ${isSavedInApi ? 'opacity-50 cursor-not-allowed bg-surface-container-low' : ''}`}
                            />
                          </div>
                          
                          <div className="flex flex-1 items-center justify-end gap-4 w-full md:w-auto">
                            <span className="text-headline-md font-headline-md text-on-surface">{match.away}</span>
                            <div className="w-12 h-12 flex-shrink-0 shadow-sm rounded-full overflow-hidden border border-outline-variant/30">
                              <img src={`https://flagcdn.com/${getCountryCode(match.away)}.svg`} alt={`${match.away} flag`} className="w-full h-full object-cover" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex flex-col items-center justify-center gap-1">
                          <div className="flex justify-center gap-6">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-label-sm text-on-surface-variant">schedule</span>
                              <span className="text-label-sm font-label-sm text-on-surface-variant">
                                {match.match_date ? new Date(match.match_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                              </span>
                            </div>
                          </div>
                          {match.match_date && (
                            <span className={`text-xs font-bold tracking-widest uppercase ${new Date(match.match_date) - now <= 0 ? 'text-red-500' : 'text-orange-500 animate-pulse'}`}>
                              {getTimeRemaining(match.match_date, now)}
                            </span>
                          )}
                        </div>

                        {isSaved && (
                          <div className="mt-3 flex justify-center">
                            <span className="bg-secondary text-on-secondary px-3 py-0.5 rounded-full text-label-sm font-label-sm animate-in fade-in zoom-in-95 duration-200">SAVED</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-gutter">
          {/* User Progress Card */}
          <div className="bg-primary text-on-primary p-6 rounded-xl shadow-lg relative overflow-hidden border border-primary-fixed/20">
            <div className="relative z-10">
              <h3 className="text-headline-md font-headline-md mb-4 text-on-primary">Your Ranking</h3>
              <div className="flex items-end gap-2 mb-6">
                <span className="text-display-lg font-headline-lg leading-none text-tertiary-fixed">
                  #{userRank?.rank ?? '---'}
                </span>
                <span className="text-body-md opacity-80 pb-2">of {userRank?.total ?? '---'} users</span>
              </div>
              <div className="space-y-4">
                <div className="w-full bg-on-primary/20 h-2 rounded-full">
                  <div 
                    className="bg-tertiary-fixed h-full rounded-full shadow-[0_0_8px_rgba(233,196,0,0.5)] transition-all duration-500" 
                    style={{ width: `${Math.max(0, completionPercent)}%` }}
                  ></div>
                </div>
                <p className="text-label-sm font-label-sm opacity-80 uppercase tracking-widest text-white">
                  Picks Completed: {savedCount} / {totalPicks} ({completionPercent}%)
                </p>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <span className="material-symbols-outlined text-[120px] text-tertiary-fixed">military_tech</span>
            </div>
          </div>

          {/* Legend */}
          <div className="bg-surface-container-high border border-outline-variant p-6 rounded-xl">
            <h4 className="text-label-sm font-label-sm text-on-surface-variant mb-4 uppercase tracking-wider">Status Legend</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-secondary animate-pulse"></div>
                <span className="text-body-md text-on-surface font-medium">Live</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-body-md text-on-surface font-medium">Upcoming</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-outline"></div>
                <span className="text-body-md text-on-surface font-medium">Finished</span>
              </div>
            </div>
          </div>

          {/* Ad/Promo Area */}
          <div className="aspect-square bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden group shadow-sm">
            <img 
              alt="Futuristic Stadium at Night" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-ts_zo1x5pDJIvX3UcYYpxhHPXlaUo2HSgao3wr8RmIb_l-kOT0sEHhSYna8vh3FzW4bovsVdT986ZDWuXSJM-mawcZAvkfUIE46gzqyCwa1VcuXeVk5IYhKqqfUWRiUpWk-D6KXfp2Vp-0LN0DLC_8HBqV0U2zyF6R6uq6eBc7yRoo0apgYcS5LDaQ_qVcEZY0p6oj3iI3rv4LaNugzYdKDI547g6tLg48yu-e0n55yXFToU6khTKVVzijS2rxhsFVPT8HIfrZVL"
            />
          </div>
        </div>
      </div>

      {/* FAB: Save Picks */}
      <button 
        onClick={handleSaveAll}
        className="fixed bottom-24 md:bottom-8 right-6 bg-secondary text-on-secondary px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all z-40 border border-secondary hover:bg-red-700"
      >
        <span className="material-symbols-outlined">save</span>
        <span className="text-body-md font-bold uppercase tracking-tight">Save All Picks</span>
      </button>
    </div>
  );
}
