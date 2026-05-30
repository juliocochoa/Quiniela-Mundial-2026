import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase.js';
import { getCountryCode } from '../utils/countryCodes.js';

const formatDateLabel = (date) =>
  date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

const getDateStr = (date) =>
  date.toISOString().split('T')[0];

const MOCK_USERS = [
  { id: 1, name: 'Julio Cortázar', email: 'julio@elcirculo.com', rank: 1, points: 742, active: true },
  { id: 2, name: 'Gabriela Mistral', email: 'gabriela@elcirculo.com', rank: 2, points: 710, active: true },
  { id: 3, name: 'Jorge Luis Borges', email: 'borges@elcirculo.com', rank: 3, points: 698, active: true },
  { id: 4, name: 'Isabel Allende', email: 'isabel@elcirculo.com', rank: 4, points: 655, active: true },
  { id: 5, name: 'Mario Vargas Llosa', email: 'mario@elcirculo.com', rank: 5, points: 642, active: false }
];

export default function Admin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('matches');
  const [activeFilter, setActiveFilter] = useState('all');
  const [users, setUsers] = useState(MOCK_USERS);
  const [editOverrides, setEditOverrides] = useState({});
  const [systemLogs, setSystemLogs] = useState([
    { time: '19:42:01', msg: 'System initialized. Listening on port 3000.' },
    { time: '19:42:15', msg: 'Supabase client loaded successfully.' },
    { time: '19:43:55', msg: 'Admin authentication approved. Terminal active.' }
  ]);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const { data: dbMatches, isLoading } = useQuery({
    queryKey: ['admin-matches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: true });
      if (error) throw new Error(error.message);
      return data;
    }
  });

  const today = useMemo(() => new Date(), []);
  const yesterday = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - 1);
    return d;
  }, [today]);

  const matches = useMemo(() => {
    if (!dbMatches) return [];
    return dbMatches.map(m => {
      const override = editOverrides[m.id] || {};
      const matchDate = m.match_date ? new Date(m.match_date) : null;
      return {
        id: m.id,
        group: m.group || 'Group Stage',
        homeTeam: m.home,
        awayTeam: m.away,
        homeScore: override.homeScore ?? m.home_score ?? 0,
        awayScore: override.awayScore ?? m.away_score ?? 0,
        status: override.status ?? m.status ?? (m.home_score != null ? 'FINISHED' : 'SCHEDULED'),
        time: override.time ?? m.time ?? '',
        date: matchDate ? formatDateLabel(matchDate) : 'TBD',
        match_date: m.match_date,
      };
    });
  }, [dbMatches, editOverrides]);

  const filters = useMemo(() => {
    if (!dbMatches) return [
      { id: 'all', label: 'All Days' },
      { id: getDateStr(yesterday), label: 'Yesterday' },
    ];

    const dateSet = new Set();
    dbMatches.forEach(m => {
      if (m.match_date) dateSet.add(getDateStr(new Date(m.match_date)));
    });

    const dateFilters = Array.from(dateSet).sort().reverse().slice(0, 3);

    return [
      { id: 'all', label: 'All Days' },
      { id: getDateStr(yesterday), label: 'Yesterday' },
      ...dateFilters
        .filter(d => d !== getDateStr(yesterday))
        .slice(0, 2)
        .map(d => ({ id: d, label: formatDateLabel(new Date(d + 'T12:00:00')) }))
    ];
  }, [dbMatches, yesterday]);

  const filteredMatches = useMemo(() => {
    if (activeFilter === 'all') return matches;
    return matches.filter(m => {
      if (!m.match_date) return false;
      return getDateStr(new Date(m.match_date)) === activeFilter;
    });
  }, [matches, activeFilter]);

  // Stats
  const [systemStats, setSystemStats] = useState({
    cpu: 24,
    ram: 4.8,
    dbStatus: 'ONLINE',
    responseTime: 38
  });

  // Update system stats periodically for retro feeling
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStats(prev => ({
        cpu: Math.max(12, Math.min(95, prev.cpu + Math.floor(Math.random() * 11) - 5)),
        ram: Math.max(4.2, Math.min(7.9, parseFloat((prev.ram + (Math.random() * 0.4) - 0.2).toFixed(2)))),
        dbStatus: 'ONLINE',
        responseTime: Math.max(20, Math.min(150, prev.responseTime + Math.floor(Math.random() * 15) - 7))
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const addLog = (msg) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    setSystemLogs(prev => [{ time: timeStr, msg }, ...prev]);
  };

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Handle Score Input
  const handleScoreChange = (matchId, side, val) => {
    const cleanVal = val === '' ? 0 : parseInt(val, 10);
    if (isNaN(cleanVal) || cleanVal < 0) return;
    const key = side === 'home' ? 'homeScore' : 'awayScore';
    setEditOverrides(prev => ({
      ...prev,
      [matchId]: { ...prev[matchId], [key]: cleanVal }
    }));
  };

  // Handle Match Info (Time / Status / Date)
  const handleMatchPropChange = (matchId, prop, val) => {
    setEditOverrides(prev => ({
      ...prev,
      [matchId]: { ...prev[matchId], [prop]: val }
    }));
  };

  // Save specific match to Supabase
  const handleSaveMatch = async (match) => {
    const override = editOverrides[match.id] || {};
    const updates = {};
    if (override.homeScore !== undefined) updates.home_score = override.homeScore;
    if (override.awayScore !== undefined) updates.away_score = override.awayScore;
    if (override.status !== undefined) updates.status = override.status;
    if (override.time !== undefined) updates.time = override.time;

    const { error } = await supabase
      .from('matches')
      .update(updates)
      .eq('id', match.id);

    if (error) {
      addLog(`[MATCH_UPDATE_ERROR] ${error.message}`);
      triggerToast(`Error: ${error.message}`);
      return;
    }

    queryClient.invalidateQueries({ queryKey: ['admin-matches'] });
    setEditOverrides(prev => {
      const next = { ...prev };
      delete next[match.id];
      return next;
    });
    addLog(`[MATCH_UPDATE] ${match.homeTeam} ${match.homeScore} - ${match.awayScore} ${match.awayTeam} (Status: ${match.status})`);
    triggerToast(`Partido ${match.homeTeam} vs ${match.awayTeam} guardado.`);
  };

  // Toggle User Status
  const handleToggleUser = (userId, userName) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, active: !u.active } : u));
    const u = users.find(u => u.id === userId);
    const action = u.active ? 'DESACTIVADO' : 'ACTIVADO';
    addLog(`[USER_MGMT] Usuario ${userName} ${action}`);
    triggerToast(`Estado de ${userName} modificado.`);
  };

  // Reboot System
  const handleReboot = () => {
    if (window.confirm("¿Seguro que deseas REINICIAR el sistema?")) {
      queryClient.invalidateQueries({ queryKey: ['admin-matches'] });
      setEditOverrides({});
      setUsers(MOCK_USERS);
      addLog('[SYS_RESET] Estado local restablecido.');
      triggerToast('Cache local reiniciado.');
    }
  };

  const completedCount = matches.filter(m => m.status === 'FINISHED').length;
  const liveCount = matches.filter(m => m.status === 'LIVE').length;

  return (
    <div className="admin-terminal-root grid-bg min-h-screen relative overflow-hidden select-none">
      {/* Visual Overlays */}
      <div className="crt-overlay"></div>
      <div className="scanline"></div>

      {/* Toast */}
      {showToast && (
        <div className="fixed top-20 right-6 bg-secondary text-white border border-[#7389ca] px-6 py-4 rounded shadow-2xl z-50 flex items-center gap-3 animate-pulse">
          <span className="material-symbols-outlined text-green-400">terminal</span>
          <span className="font-mono text-xs">{toastMsg}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="bg-[#000c2e] text-[#7389ca] font-label uppercase tracking-widest text-label-sm h-screen w-64 fixed left-0 top-0 border-r border-[#7389ca]/30 flex flex-col overflow-y-auto z-50">
        <div className="p-6 border-b border-[#7389ca]/30">
          <h1 className="font-headline text-white text-xl font-bold tracking-tight">ADMIN TERMINAL</h1>
          <p className="text-[10px] opacity-60 font-mono">v1.0.26-beta</p>
        </div>
        <nav className="flex-grow py-4">
          <ul className="space-y-1">
            <li className="px-4">
              <button
                onClick={() => setActiveTab('system')}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${activeTab === 'system'
                  ? 'bg-primary-container/40 text-white border-l-2 border-white'
                  : 'text-[#7389ca] hover:bg-primary-container/20'
                  }`}
              >
                <span className="material-symbols-outlined">dns</span>
                <span className="text-xs">System</span>
              </button>
            </li>
            <li className="px-4">
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${activeTab === 'users'
                  ? 'bg-primary-container/40 text-white border-l-2 border-white'
                  : 'text-[#7389ca] hover:bg-primary-container/20'
                  }`}
              >
                <span className="material-symbols-outlined">group</span>
                <span className="text-xs">Users</span>
              </button>
            </li>
            <li className="px-4">
              <button
                onClick={() => setActiveTab('predictions')}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${activeTab === 'predictions'
                  ? 'bg-primary-container/40 text-white border-l-2 border-white'
                  : 'text-[#7389ca] hover:bg-primary-container/20'
                  }`}
              >
                <span className="material-symbols-outlined">query_stats</span>
                <span className="text-xs">Predictions</span>
              </button>
            </li>
            <li className="px-4">
              <button
                onClick={() => setActiveTab('matches')}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${activeTab === 'matches'
                  ? 'bg-secondary text-white font-bold border-l-4 border-white shadow-[0_0_15px_rgba(188,0,12,0.4)]'
                  : 'text-[#7389ca] hover:bg-primary-container/20'
                  }`}
              >
                <span className="material-symbols-outlined">sports_soccer</span>
                <span className="text-xs">Matches</span>
              </button>
            </li>
            <li className="px-4">
              <button
                onClick={() => setActiveTab('logs')}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${activeTab === 'logs'
                  ? 'bg-primary-container/40 text-white border-l-2 border-white'
                  : 'text-[#7389ca] hover:bg-primary-container/20'
                  }`}
              >
                <span className="material-symbols-outlined">terminal</span>
                <span className="text-xs">Logs</span>
              </button>
            </li>
          </ul>
        </nav>
        <div className="p-4 border-t border-[#7389ca]/30">
          <button
            onClick={handleReboot}
            className="w-full py-3 bg-secondary text-white font-bold tracking-tighter hover:brightness-110 transition-all border border-white/20 text-xs"
          >
            REBOOT SYSTEM
          </button>
        </div>
        <div className="p-6 space-y-2">
          <a
            onClick={(e) => { e.preventDefault(); navigate('/results'); }}
            className="flex items-center gap-2 text-[10px] text-[#7389ca] hover:text-white cursor-pointer"
            href="#"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Web
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-64 p-8 min-h-screen pb-20">

        {/* MATCHES TAB */}
        {activeTab === 'matches' && (
          <div className="animate-in fade-in duration-300">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-8">
              <div>
                <span className="font-mono text-xs text-secondary uppercase tracking-[0.3em] mb-2 block glow-text">GRP_STAGE_OPERATIONS</span>
                <h2 className="text-4xl font-headline font-black text-white tracking-tighter uppercase">Match Results Terminal</h2>
                <p className="text-[#7389ca] mt-2 max-w-xl text-xs font-mono">
                  [SYS_MSG]: Database management mode active. Changing match values will update stats globally.
                </p>
              </div>
              <div className="flex gap-4">
                <div className="terminal-border bg-primary-container/20 p-4 flex flex-col min-w-[160px]">
                  <span className="text-[10px] font-mono text-[#7389ca] uppercase tracking-wider">Completed</span>
                  <span className="text-2xl font-bold text-white mt-1 font-headline">{completedCount} / {matches.length}</span>
                </div>
                <div className="terminal-border bg-primary-container/20 p-4 flex flex-col min-w-[160px]">
                  <span className="text-[10px] font-mono text-[#7389ca] uppercase tracking-wider">Live Matches</span>
                  <span className="text-2xl font-bold text-secondary flex items-center gap-2 mt-1 font-headline">
                    <span className="w-2.5 h-2.5 bg-secondary rounded-full live-pulse shadow-[0_0_8px_#bc000c]"></span>
                    {liveCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-10 overflow-x-auto pb-2">
              {filters.map(f => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-6 py-2 font-mono text-xs uppercase tracking-widest transition-all whitespace-nowrap ${activeFilter === f.id ? 'terminal-tab-active' : 'terminal-tab hover:bg-primary-container/40'
                    }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Loading */}
            {isLoading ? (
              <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              /* Grid */
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredMatches.map(match => (
                  <div
                    key={match.id}
                    className={`terminal-border bg-primary-container/10 overflow-hidden relative group transition-all duration-300 ${match.status === 'LIVE' ? 'shadow-[0_0_15px_rgba(115,137,202,0.2)]' : ''
                      }`}
                  >
                    {/* Card Header */}
                    <div className={`px-4 py-1.5 flex justify-between items-center ${match.status === 'LIVE' ? 'bg-secondary' : 'bg-[#7389ca]/20 border-b border-[#7389ca]/30'
                      }`}>
                      <span className="text-[10px] font-mono text-white uppercase flex items-center gap-2 tracking-widest">
                        {match.status === 'LIVE' ? (
                          <>
                            <span className="w-1.5 h-1.5 bg-white rounded-full live-pulse"></span>
                            LIVE
                          </>
                        ) : match.status === 'FINISHED' ? (
                          'FINISHED'
                        ) : (
                          'UPCOMING'
                        )}
                      </span>
                      <span className="text-[10px] font-mono text-white/80 uppercase tracking-widest">{match.group}</span>
                    </div>

                    {/* Card Content */}
                    <div className="p-6">
                      <div className="flex items-center justify-between gap-4">
                        {/* Home Team */}
                        <div className="flex flex-col items-center flex-1">
                          <div className="w-14 h-10 border border-[#7389ca]/50 mb-3 overflow-hidden">
                            <img alt={match.homeTeam} className="w-full h-full object-cover" src={`https://flagcdn.com/w160/${getCountryCode(match.homeTeam)}.png`} />
                          </div>
                          <span className="font-bold text-xs uppercase tracking-widest text-white truncate max-w-[80px]">{match.homeTeam}</span>
                        </div>

                        {/* Inputs & Score */}
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              value={match.homeScore}
                              onChange={(e) => handleScoreChange(match.id, 'home', e.target.value)}
                              className="w-12 h-12 text-center text-xl font-bold bg-[#000c2e] border border-[#7389ca] text-white focus:ring-1 focus:ring-secondary rounded"
                            />
                            <span className="text-[#7389ca] font-light text-xl">:</span>
                            <input
                              type="number"
                              min="0"
                              value={match.awayScore}
                              onChange={(e) => handleScoreChange(match.id, 'away', e.target.value)}
                              className="w-12 h-12 text-center text-xl font-bold bg-[#000c2e] border border-[#7389ca] text-white focus:ring-1 focus:ring-secondary rounded"
                            />
                          </div>

                          {/* Time modifier (if Live) */}
                          {match.status === 'LIVE' ? (
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] font-mono text-[#7389ca]">TIME:</span>
                              <input
                                type="text"
                                value={match.time}
                                onChange={(e) => handleMatchPropChange(match.id, 'time', e.target.value)}
                                className="w-14 h-5 px-1 py-0 text-[10px] text-center font-mono bg-[#000c2e] border border-[#7389ca]/50 text-secondary"
                              />
                            </div>
                          ) : (
                            <span className="text-[9px] font-mono text-[#7389ca] uppercase tracking-widest">{match.status}</span>
                          )}
                        </div>

                        {/* Away Team */}
                        <div className="flex flex-col items-center flex-1">
                          <div className="w-14 h-10 border border-[#7389ca]/50 mb-3 overflow-hidden">
                            <img alt={match.awayTeam} className="w-full h-full object-cover" src={`https://flagcdn.com/w160/${getCountryCode(match.awayTeam)}.png`} />
                          </div>
                          <span className="font-bold text-xs uppercase tracking-widest text-white truncate max-w-[80px]">{match.awayTeam}</span>
                        </div>
                      </div>

                      {/* Status modifier dropdown */}
                      <div className="mt-5 flex gap-2 items-center justify-between border-t border-[#7389ca]/20 pt-4">
                        <select
                          value={match.status}
                          onChange={(e) => handleMatchPropChange(match.id, 'status', e.target.value)}
                          className="bg-[#000c2e] text-[#7389ca] border border-[#7389ca]/50 rounded text-[10px] font-mono p-1 flex-grow mr-2"
                        >
                          <option value="SCHEDULED">SCHEDULED</option>
                          <option value="LIVE">LIVE</option>
                          <option value="FINISHED">FINISHED</option>
                        </select>
                        <button
                          onClick={() => handleSaveMatch(match)}
                          className="px-3 py-1 bg-secondary text-white text-[10px] font-mono uppercase font-bold tracking-widest hover:bg-red-700 transition-colors"
                        >
                          COMMIT
                        </button>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="bg-[#000c2e] px-4 py-1 text-[9px] flex justify-between border-t border-[#7389ca]/30 font-mono text-[#7389ca]">
                      <span>EVT_ID: {match.id && match.id}-{match.group.slice(-1)}</span>
                      <span>{match.date.toUpperCase()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && filteredMatches.length === 0 && (
              <div className="text-center py-20 text-[#7389ca] font-mono text-sm border border-dashed border-[#7389ca]/30 mt-6">
                [SYS_WARNING]: No matches found for this date node.
              </div>
            )}
          </div>
        )}

        {/* SYSTEM STATS TAB */}
        {activeTab === 'system' && (
          <div className="animate-in fade-in duration-300 space-y-8">
            <div>
              <span className="font-mono text-xs text-secondary uppercase tracking-[0.3em] mb-2 block glow-text">SYS_TELEMETRY</span>
              <h2 className="text-4xl font-headline font-black text-white tracking-tighter uppercase">System Telemetry</h2>
              <p className="text-[#7389ca] mt-2 max-w-xl text-xs font-mono">
                [Telemetry stream online]. Tracking active CPU load, system RAM limits, database status, and Supabase service response time.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {/* CPU */}
              <div className="terminal-border bg-primary-container/20 p-6 flex flex-col justify-between h-40">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-mono text-[#7389ca] uppercase">CPU Load</span>
                  <span className="material-symbols-outlined text-[#7389ca]">monitoring</span>
                </div>
                <div>
                  <span className="text-4xl font-bold text-white font-headline">{systemStats.cpu}%</span>
                  <div className="w-full bg-[#000c2e] h-2 border border-[#7389ca]/30 mt-2">
                    <div className="bg-secondary h-full" style={{ width: `${systemStats.cpu}%` }}></div>
                  </div>
                </div>
              </div>

              {/* RAM */}
              <div className="terminal-border bg-primary-container/20 p-6 flex flex-col justify-between h-40">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-mono text-[#7389ca] uppercase">RAM Allocation</span>
                  <span className="material-symbols-outlined text-[#7389ca]">memory</span>
                </div>
                <div>
                  <span className="text-4xl font-bold text-white font-headline">{systemStats.ram} GB</span>
                  <div className="w-full bg-[#000c2e] h-2 border border-[#7389ca]/30 mt-2">
                    <div className="bg-secondary h-full" style={{ width: `${(systemStats.ram / 8) * 100}%` }}></div>
                  </div>
                </div>
              </div>

              {/* DB Status */}
              <div className="terminal-border bg-primary-container/20 p-6 flex flex-col justify-between h-40">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-mono text-[#7389ca] uppercase">Supabase Sync</span>
                  <span className="material-symbols-outlined text-[#7389ca]">database</span>
                </div>
                <div>
                  <span className="text-4xl font-bold text-green-400 font-headline flex items-center gap-2">
                    <span className="w-4 h-4 bg-green-400 rounded-full animate-ping absolute"></span>
                    <span className="w-4 h-4 bg-green-400 rounded-full"></span>
                    {systemStats.dbStatus}
                  </span>
                  <p className="text-[10px] text-[#7389ca] font-mono mt-2">CONNECTED TO SERVER : US-EAST</p>
                </div>
              </div>

              {/* Response Time */}
              <div className="terminal-border bg-primary-container/20 p-6 flex flex-col justify-between h-40">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-mono text-[#7389ca] uppercase">Ping Latency</span>
                  <span className="material-symbols-outlined text-[#7389ca]">speed</span>
                </div>
                <div>
                  <span className="text-4xl font-bold text-white font-headline">{systemStats.responseTime} ms</span>
                  <p className="text-[10px] text-[#7389ca] font-mono mt-2">GATEWAY: api.supabase.co</p>
                </div>
              </div>
            </div>

            <section className="terminal-border bg-primary-container/10 p-6">
              <h3 className="text-lg font-headline font-bold text-white uppercase mb-4">Diagnostic Log Output</h3>
              <div className="font-mono text-xs text-[#7389ca] space-y-2 h-48 overflow-y-auto bg-[#000c2e] p-4 border border-[#7389ca]/30">
                <p className="text-green-400">&gt; npm run diagnostics --verbose</p>
                <p>&gt; Hostname: PM-MAIN-DOCK-X08</p>
                <p>&gt; Kernels initialized: OK</p>
                <p>&gt; PostgreSQL pool size: 20 active connections</p>
                <p>&gt; SSL transport layer: TLS_AES_256_GCM_SHA384 (Verified)</p>
                <p>&gt; Cache eviction policy: LRU. Buffer hits: 98.4%</p>
                <p>&gt; Server clock drift: -0.002s (synchronized NTP pool)</p>
                <p className="text-green-400">&gt; Diagnostics completed. All systems operational.</p>
              </div>
            </section>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="animate-in fade-in duration-300 space-y-8">
            <div>
              <span className="font-mono text-xs text-secondary uppercase tracking-[0.3em] mb-2 block glow-text">USR_MANAGEMENT</span>
              <h2 className="text-4xl font-headline font-black text-white tracking-tighter uppercase">User Directories</h2>
              <p className="text-[#7389ca] mt-2 max-w-xl text-xs font-mono">
                [Player profiles active]. Search, verify, or disable users participating in Quiniela-Mundial-2026.
              </p>
            </div>

            <div className="terminal-border bg-primary-container/10 overflow-hidden">
              <table className="w-full text-left font-mono text-xs text-[#7389ca]">
                <thead className="bg-primary-container/40 border-b border-[#7389ca]/30 text-white font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Rank</th>
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Points</th>
                    <th className="p-4 text-center">Security Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#7389ca]/20 bg-[#000c2e]">
                  {users.map(usr => (
                    <tr key={usr.id} className="hover:bg-primary-container/10">
                      <td className="p-4 font-bold text-white">#{usr.rank}</td>
                      <td className="p-4 font-semibold text-white">{usr.name}</td>
                      <td className="p-4">{usr.email}</td>
                      <td className="p-4 text-secondary font-bold">{usr.points} PTS</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 text-[9px] font-bold ${usr.active ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'
                          }`}>
                          {usr.active ? 'VERIFIED' : 'SUSPENDED'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleToggleUser(usr.id, usr.name)}
                          className={`px-3 py-1 font-mono text-[9px] uppercase font-bold tracking-tighter ${usr.active ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                        >
                          {usr.active ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PREDICTIONS TAB */}
        {activeTab === 'predictions' && (
          <div className="animate-in fade-in duration-300 space-y-8">
            <div>
              <span className="font-mono text-xs text-secondary uppercase tracking-[0.3em] mb-2 block glow-text">PRD_GLOBAL_ANALYSIS</span>
              <h2 className="text-4xl font-headline font-black text-white tracking-tighter uppercase">Consensus & Predictions</h2>
              <p className="text-[#7389ca] mt-2 max-w-xl text-xs font-mono">
                [Telemetry logs]. Analyzing predictions data structures. 1,240 active ballots uploaded.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Card 1 */}
              <div className="terminal-border bg-primary-container/20 p-6 space-y-4">
                <h3 className="font-headline font-bold text-white uppercase text-sm border-b border-[#7389ca]/30 pb-2">Global Predictions Distribution</h3>
                <div className="space-y-3 font-mono text-xs text-[#7389ca]">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>France Winner Predictions</span>
                      <span className="text-white">74%</span>
                    </div>
                    <div className="w-full bg-[#000c2e] h-4 border border-[#7389ca]/30">
                      <div className="bg-secondary h-full" style={{ width: '74%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Brazil Winner Predictions</span>
                      <span className="text-white">68%</span>
                    </div>
                    <div className="w-full bg-[#000c2e] h-4 border border-[#7389ca]/30">
                      <div className="bg-secondary h-full" style={{ width: '68%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Spain/Germany Draw Predictions</span>
                      <span className="text-white">52%</span>
                    </div>
                    <div className="w-full bg-[#000c2e] h-4 border border-[#7389ca]/30">
                      <div className="bg-secondary h-full" style={{ width: '52%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="terminal-border bg-primary-container/20 p-6 space-y-4">
                <h3 className="font-headline font-bold text-white uppercase text-sm border-b border-[#7389ca]/30 pb-2">Risk Telemetry</h3>
                <div className="font-mono text-xs text-[#7389ca] space-y-2">
                  <div className="flex justify-between">
                    <span>Active ballots scanned:</span>
                    <span className="text-white font-bold">12,480</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average confidence rating:</span>
                    <span className="text-white font-bold">8.4 / 10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ballot completion rate:</span>
                    <span className="text-white font-bold">98.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deviations detected:</span>
                    <span className="text-red-400 font-bold">0 [ALL_CLEAR]</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LOGS TAB */}
        {activeTab === 'logs' && (
          <div className="animate-in fade-in duration-300 space-y-8">
            <div>
              <span className="font-mono text-xs text-secondary uppercase tracking-[0.3em] mb-2 block glow-text">SYS_LOG_READER</span>
              <h2 className="text-4xl font-headline font-black text-white tracking-tighter uppercase">Audit Logs</h2>
              <p className="text-[#7389ca] mt-2 max-w-xl text-xs font-mono">
                [Raw logs terminal]. Event telemetry for actions taken in this session.
              </p>
            </div>

            <div className="terminal-border bg-primary-container/10 p-6">
              <div className="flex justify-between items-center border-b border-[#7389ca]/30 pb-3 mb-4">
                <span className="font-mono text-xs text-white">LOG STREAM LIST</span>
                <button
                  onClick={() => setSystemLogs([])}
                  className="px-3 py-1 border border-secondary text-secondary hover:bg-secondary hover:text-white transition-colors font-mono text-[9px] font-bold uppercase tracking-wider"
                >
                  Clear Logs
                </button>
              </div>
              <div className="font-mono text-xs text-[#7389ca] space-y-2 h-[400px] overflow-y-auto bg-[#000c2e] p-4 border border-[#7389ca]/30">
                {systemLogs.map((log, idx) => (
                  <p key={idx}>
                    <span className="text-white opacity-40">[{log.time}]</span>{' '}
                    <span className={log.msg.includes('[MATCH_UPDATE]') ? 'text-green-400' : log.msg.includes('[SYS_RESET]') ? 'text-secondary font-bold' : ''}>
                      {log.msg}
                    </span>
                  </p>
                ))}
                {systemLogs.length === 0 && (
                  <p className="text-center opacity-40">[Log stream empty]</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#000c2e] text-[#ffe16d] font-label text-[10px] uppercase fixed bottom-0 w-full z-40 border-t border-[#7389ca]/30 flex justify-between items-center px-8 py-2 max-w-full">
        <div className="font-label font-bold text-white tracking-widest">PITCH MASTER TERMINAL</div>
        <div className="text-white opacity-40 font-mono">© 2026 PM_ADMIN. ALL_SYSTEMS_GO.</div>
        <div className="flex gap-6">
          <span className="text-white opacity-60">Status: OK</span>
          <span className="text-white opacity-60">Ping: 34ms</span>
          <span className="text-secondary font-bold select-none cursor-pointer hover:underline" onClick={handleReboot}>REBOOT</span>
        </div>
      </footer>
    </div>
  );
}
