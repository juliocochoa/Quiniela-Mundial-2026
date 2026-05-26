import React, { useState, useEffect } from 'react';

const INITIAL_PREDICTIONS = {
  // USA vs Australia
  'usa_aus_home': '',
  'usa_aus_away': '',
  // Mexico vs Canada
  'mex_can_home': '2',
  'mex_can_away': '1',
};

const SAVED_PREDICTIONS_KEY = 'quiniela_picks_2026';

export default function Picks({ user, onUpdateStats }) {
  const [predictions, setPredictions] = useState(() => {
    const saved = localStorage.getItem(SAVED_PREDICTIONS_KEY);
    return saved ? JSON.parse(saved) : INITIAL_PREDICTIONS;
  });

  const [savedMatches, setSavedMatches] = useState({
    'mex_can': true, // Mexico vs Canada is pre-saved in the mock
  });

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

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
  const handleSaveAll = () => {
    localStorage.setItem(SAVED_PREDICTIONS_KEY, JSON.stringify(predictions));
    
    // Mark matches as saved if both scores are filled
    const newSaved = { ...savedMatches };
    
    // Check USA vs Aus
    if (predictions['usa_aus_home'] !== '' && predictions['usa_aus_away'] !== '') {
      newSaved['usa_aus'] = true;
    }
    // Check Mex vs Can
    if (predictions['mex_can_home'] !== '' && predictions['mex_can_away'] !== '') {
      newSaved['mex_can'] = true;
    }
    
    setSavedMatches(newSaved);

    // Calculate number of completed picks
    let completedCount = 0;
    if (predictions['usa_aus_home'] !== '' && predictions['usa_aus_away'] !== '') completedCount++;
    if (predictions['mex_can_home'] !== '' && predictions['mex_can_away'] !== '') completedCount++;

    // Trigger state updates up to parent to update points/stats if appropriate
    if (onUpdateStats) {
      onUpdateStats(completedCount);
    }

    setToastMessage('¡Tus pronósticos han sido guardados con éxito!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Calculations
  const savedCount = Object.keys(savedMatches).filter(k => savedMatches[k]).length;
  // Let's assume total group matches is 32. Remaining picks:
  const totalPicks = 32;
  const remainingPicks = Math.max(0, totalPicks - savedCount);
  const completionPercent = Math.round((savedCount / 3) * 100); // 3 total matches shown in component mock (including the locked one)

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
          
          {/* Group A Section */}
          <section>
            <div className="flex items-center gap-4 mb-stack-sm">
              <span className="text-label-sm font-label-sm bg-primary text-on-primary px-3 py-1 rounded">GROUP A</span>
              <div className="h-px bg-outline-variant flex-grow"></div>
              <span className="text-label-sm font-label-sm text-on-surface-variant">JUNE 11, 2026</span>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              
              {/* Match Card 1: USA vs Australia */}
              <div 
                className={`bg-surface-container-lowest border p-gutter rounded-xl transition-all duration-300 ${
                  savedMatches['usa_aus'] 
                    ? 'border-primary shadow-sm' 
                    : 'border-outline-variant hover:shadow-[0_4px_20px_-2px_rgba(0,12,46,0.1)]'
                }`}
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  {/* Team 1 */}
                  <div className="flex flex-1 items-center gap-4 w-full md:w-auto">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-outline-variant flex-shrink-0">
                      <img 
                        alt="USA Flag" 
                        className="w-full h-full object-cover" 
                        src="https://flagcdn.com/w160/us.png"
                      />
                    </div>
                    <span className="text-headline-md font-headline-md text-on-surface">USA</span>
                  </div>
                  
                  {/* Input Section */}
                  <div 
                    className={`flex items-center gap-4 bg-surface-container-low p-2 rounded-xl border transition-all ${
                      predictions['usa_aus_home'] !== '' || predictions['usa_aus_away'] !== '' 
                        ? 'border-secondary ring-2 ring-secondary/10' 
                        : 'border-outline-variant'
                    }`}
                  >
                    <input 
                      type="number"
                      min="0"
                      placeholder="0"
                      value={predictions['usa_aus_home']}
                      onChange={(e) => handleScoreChange('usa_aus', 'home', e.target.value)}
                      className="w-14 h-14 text-center text-headline-md font-headline-md bg-white border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg transition-all"
                    />
                    <span className="text-on-surface-variant font-bold text-headline-md">VS</span>
                    <input 
                      type="number"
                      min="0"
                      placeholder="0"
                      value={predictions['usa_aus_away']}
                      onChange={(e) => handleScoreChange('usa_aus', 'away', e.target.value)}
                      className="w-14 h-14 text-center text-headline-md font-headline-md bg-white border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg transition-all"
                    />
                  </div>
                  
                  {/* Team 2 */}
                  <div className="flex flex-1 items-center justify-end gap-4 w-full md:w-auto">
                    <span className="text-headline-md font-headline-md text-on-surface">Australia</span>
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-outline-variant flex-shrink-0">
                      <img 
                        alt="Australia Flag" 
                        className="w-full h-full object-cover" 
                        src="https://flagcdn.com/w160/au.png"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-label-sm text-on-surface-variant">schedule</span>
                    <span className="text-label-sm font-label-sm text-on-surface-variant">18:00 LOCAL</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-label-sm text-on-surface-variant">location_on</span>
                    <span className="text-label-sm font-label-sm text-on-surface-variant">Azteca Stadium</span>
                  </div>
                </div>

                {savedMatches['usa_aus'] && (
                  <div className="mt-3 flex justify-center">
                    <span className="bg-secondary text-on-secondary px-3 py-0.5 rounded-full text-label-sm font-label-sm animate-in fade-in zoom-in-95 duration-200">SAVED</span>
                  </div>
                )}
              </div>

              {/* Match Card 2: Mexico vs Canada */}
              <div 
                className={`bg-surface-container-lowest border p-gutter rounded-xl transition-all duration-300 ${
                  savedMatches['mex_can'] 
                    ? 'border-primary shadow-sm' 
                    : 'border-outline-variant hover:shadow-[0_4px_20px_-2px_rgba(0,12,46,0.1)]'
                }`}
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  {/* Team 1 */}
                  <div className="flex flex-1 items-center gap-4 w-full md:w-auto">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-outline-variant flex-shrink-0">
                      <img 
                        alt="Mexico Flag" 
                        className="w-full h-full object-cover" 
                        src="https://flagcdn.com/w160/mx.png"
                      />
                    </div>
                    <span className="text-headline-md font-headline-md text-on-surface">Mexico</span>
                  </div>
                  
                  {/* Input Section */}
                  <div 
                    className={`flex items-center gap-4 bg-surface-container-low p-2 rounded-xl border transition-all ${
                      savedMatches['mex_can'] ? 'border-primary ring-2 ring-primary/10' : 'border-outline-variant'
                    }`}
                  >
                    <input 
                      type="number"
                      min="0"
                      placeholder="2"
                      value={predictions['mex_can_home']}
                      onChange={(e) => handleScoreChange('mex_can', 'home', e.target.value)}
                      className="w-14 h-14 text-center text-headline-md font-headline-md bg-white border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg transition-all"
                    />
                    <span className="text-on-surface-variant font-bold text-headline-md">VS</span>
                    <input 
                      type="number"
                      min="0"
                      placeholder="1"
                      value={predictions['mex_can_away']}
                      onChange={(e) => handleScoreChange('mex_can', 'away', e.target.value)}
                      className="w-14 h-14 text-center text-headline-md font-headline-md bg-white border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg transition-all"
                    />
                  </div>
                  
                  {/* Team 2 */}
                  <div className="flex flex-1 items-center justify-end gap-4 w-full md:w-auto">
                    <span className="text-headline-md font-headline-md text-on-surface">Canada</span>
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-outline-variant flex-shrink-0">
                      <img 
                        alt="Canada Flag" 
                        className="w-full h-full object-cover" 
                        src="https://flagcdn.com/w160/ca.png"
                      />
                    </div>
                  </div>
                </div>

                {savedMatches['mex_can'] && (
                  <div className="mt-4 flex justify-center">
                    <span className="bg-secondary text-on-secondary px-3 py-0.5 rounded-full text-label-sm font-label-sm">SAVED</span>
                  </div>
                )}
              </div>

            </div>
          </section>

          {/* Group B Section (Locked matches) */}
          <section>
            <div className="flex items-center gap-4 mb-stack-sm">
              <span className="text-label-sm font-label-sm bg-primary text-on-primary px-3 py-1 rounded">GROUP B</span>
              <div className="h-px bg-outline-variant flex-grow"></div>
              <span className="text-label-sm font-label-sm text-on-surface-variant">JUNE 12, 2026</span>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              
              {/* Match Card 3: France vs Argentina (LOCKED) */}
              <div className="bg-surface-container-low border border-outline-variant p-gutter rounded-xl opacity-80 cursor-not-allowed grayscale">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex flex-1 items-center gap-4 w-full md:w-auto">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-outline-variant flex-shrink-0">
                      <img alt="France Flag" className="w-full h-full object-cover" src="https://flagcdn.com/w160/fr.png" />
                    </div>
                    <span className="text-headline-md font-headline-md text-on-surface">France</span>
                  </div>
                  <div className="flex items-center gap-4 p-2 rounded-xl">
                    <span className="material-symbols-outlined text-headline-lg text-outline">lock</span>
                  </div>
                  <div className="flex flex-1 items-center justify-end gap-4 w-full md:w-auto">
                    <span className="text-headline-md font-headline-md text-on-surface">Argentina</span>
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-outline-variant flex-shrink-0">
                      <img alt="Argentina Flag" className="w-full h-full object-cover" src="https://flagcdn.com/w160/ar.png" />
                    </div>
                  </div>
                </div>
                <p className="text-center text-label-sm font-label-sm text-on-surface-variant mt-2 uppercase tracking-wide">Predictions Locked</p>
              </div>

            </div>
          </section>

        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-gutter">
          {/* User Progress Card */}
          <div className="bg-primary text-on-primary p-6 rounded-xl shadow-lg relative overflow-hidden border border-primary-fixed/20">
            <div className="relative z-10">
              <h3 className="text-headline-md font-headline-md mb-4 text-on-primary">Your Ranking</h3>
              <div className="flex items-end gap-2 mb-6">
                <span className="text-display-lg font-headline-lg leading-none text-tertiary-fixed">
                  #{user?.rank || 1248}
                </span>
                <span className="text-body-md opacity-80 pb-2">of 1,240 users</span>
              </div>
              <div className="space-y-4">
                <div className="w-full bg-on-primary/20 h-2 rounded-full">
                  <div 
                    className="bg-tertiary-fixed h-full rounded-full shadow-[0_0_8px_rgba(233,196,0,0.5)] transition-all duration-500" 
                    style={{ width: `${Math.max(10, completionPercent)}%` }}
                  ></div>
                </div>
                <p className="text-label-sm font-label-sm opacity-80 uppercase tracking-widest text-white">
                  Picks Completed: {savedCount} / 3 ({completionPercent}%)
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
