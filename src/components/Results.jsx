import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase.js';
import { getCountryCode } from '../utils/countryCodes.js';

const formatDateLabel = (date) =>
  date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

const getDateStr = (date) =>
  date.toISOString().split('T')[0];

const isSameDay = (dateA, dateB) =>
  getDateStr(dateA) === getDateStr(dateB);

export default function Results() {
  const [activeFilter, setActiveFilter] = useState('all');

  const today = useMemo(() => new Date(), []);
  const yesterday = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - 1);
    return d;
  }, [today]);

  const { data: matches, isLoading, error } = useQuery({
    queryKey: ['results-matches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: true });
      if (error) throw new Error(error.message);
      return data;
    }
  });

  const filters = useMemo(() => {
    if (!matches) return [
      { id: 'all', label: 'All Days' },
      { id: getDateStr(yesterday), label: 'Yesterday' },
    ];

    const dateSet = new Set();
    matches.forEach(m => {
      if (m.match_date) dateSet.add(getDateStr(new Date(m.match_date)));
    });

    const dateFilters = Array.from(dateSet)
      .sort()
      .reverse()
      .slice(0, 3);

    return [
      { id: 'all', label: 'All Days' },
      { id: getDateStr(yesterday), label: 'Yesterday' },
      ...dateFilters
        .filter(d => d !== getDateStr(yesterday))
        .slice(0, 2)
        .map(d => ({ id: d, label: formatDateLabel(new Date(d + 'T12:00:00')) }))
    ];
  }, [matches, yesterday]);

  const filteredMatches = useMemo(() => {
    if (!matches) return [];

    if (activeFilter === 'all') {
      return matches.slice(0, 10);
    }

    return matches.filter(m => {
      if (!m.match_date) return false;
      const matchDate = new Date(m.match_date);
      return getDateStr(matchDate) === activeFilter;
    });
  }, [matches, activeFilter]);

  const getMatchStatus = (match) => {
    const hasResult = match.home_score != null && match.away_score != null;

    if (hasResult) {
      return { status: 'FINISHED', time: 'Full Time' };
    }

    if (match.match_date) {
      const matchDate = new Date(match.match_date);
      if (isSameDay(matchDate, today)) {
        return { status: 'LIVE', time: 'Ongoing' };
      }
    }

    return { status: 'UPCOMING', time: 'Upcoming' };
  };

  const completedCount = matches?.filter(m => {
    const s = getMatchStatus(m);
    return s.status === 'FINISHED';
  }).length || 0;

  const liveCount = matches?.filter(m => getMatchStatus(m).status === 'LIVE').length || 0;

  return (
    <div className="max-w-7xl mx-auto px-gutter py-8 min-h-screen">
      {/* Page Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-gutter animate-in fade-in duration-500">
        <div>
          <span className="font-label-sm text-label-sm text-secondary uppercase tracking-[0.2em] mb-2 block">Group Stage</span>
          <h2 className="text-headline-lg font-headline-lg text-on-surface">Match Results</h2>
          <p className="text-on-surface-variant mt-2 max-w-xl">
            Track all tournament outcomes. Final scores are verified by FIFA officials. Predictions are locked for completed and live events.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-surface-container border border-outline-variant rounded-xl p-4 flex flex-col min-w-[140px] shadow-sm">
            <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Completed</span>
            <span className="text-2xl font-bold text-primary mt-1">{completedCount} / {matches?.length || '---'}</span>
          </div>
          <div className="bg-surface-container border border-outline-variant rounded-xl p-4 flex flex-col min-w-[140px] shadow-sm">
            <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Live Matches</span>
            <span className="text-2xl font-bold text-secondary flex items-center gap-2 mt-1">
              <span className="w-2.5 h-2.5 bg-secondary rounded-full live-pulse"></span>
              {liveCount}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-8 overflow-x-auto scroll-hide pb-2 border-b border-outline-variant/30">
        {filters.map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`px-6 py-2 rounded-full font-label-sm text-label-sm transition-all border uppercase tracking-wider whitespace-nowrap ${
              activeFilter === filter.id
                ? 'bg-primary text-on-primary border-primary shadow-sm'
                : 'bg-surface-container-high text-on-surface hover:bg-surface-variant border-outline-variant'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Results Grid */}
      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-xl">
          Error loading matches: {error.message}
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredMatches.map(match => {
          const matchStatus = getMatchStatus(match);
          const isLive = matchStatus.status === 'LIVE';
          return (
          <div 
            key={match.id} 
            className={`rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 border flex flex-col justify-between ${
              isLive
                ? 'bg-surface-container-lowest border-secondary/30 hover:shadow-[0_4px_12px_rgba(188,0,12,0.1)]' 
                : 'bg-surface border-outline-variant group'
            }`}
          >
            {/* Header portion */}
            <div className={`px-4 py-1.5 flex justify-between items-center ${
              isLive ? 'bg-secondary' : 'bg-surface-container-high border-b border-outline-variant'
            }`}>
              <span className={`text-label-sm font-label-sm uppercase flex items-center gap-2 tracking-wider ${
                isLive ? 'text-on-secondary' : 'text-on-surface-variant'
              }`}>
                {isLive ? (
                  <>
                    <span className="w-1.5 h-1.5 bg-on-secondary rounded-full live-pulse"></span>
                    LIVE • {matchStatus.time}
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    {matchStatus.status}
                  </>
                )}
              </span>
              <span className={`text-label-sm font-label-sm uppercase tracking-wider ${
                isLive ? 'text-on-secondary opacity-80' : 'text-on-surface-variant'
              }`}>
                {match.group || 'Group Stage'}
              </span>
            </div>

            {/* Teams portion */}
            <div className="p-gutter flex-grow flex items-center">
              <div className="flex items-center justify-between gap-4 w-full">
                {/* Home Team */}
                <div className="flex flex-col items-center flex-1">
                  <div className="w-16 h-16 rounded-full border border-outline-variant shadow-sm mb-3 overflow-hidden transition-all group-hover:scale-105">
                    <img alt={match.home} className="w-full h-full object-cover" src={`https://flagcdn.com/w160/${getCountryCode(match.home)}.png`} />
                  </div>
                  <span className="font-bold text-lg text-center text-on-surface">{match.home}</span>
                </div>

                {/* Score Column */}
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-3">
                    <span className="text-5xl font-display-lg text-primary">{match.home_score ?? '-'}</span>
                    <span className="text-on-surface-variant font-bold opacity-30">—</span>
                    <span className="text-5xl font-display-lg text-primary">{match.away_score ?? '-'}</span>
                  </div>
                  <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">
                    {matchStatus.time}
                  </span>
                </div>

                {/* Away Team */}
                <div className="flex flex-col items-center flex-1">
                  <div className="w-16 h-16 rounded-full border border-outline-variant shadow-sm mb-3 overflow-hidden transition-all group-hover:scale-105">
                    <img alt={match.away} className="w-full h-full object-cover" src={`https://flagcdn.com/w160/${getCountryCode(match.away)}.png`} />
                  </div>
                  <span className="font-bold text-lg text-center text-on-surface">{match.away}</span>
                </div>
              </div>
            </div>
          </div>
          );
        })}

        {filteredMatches.length === 0 && (
          <div className="col-span-full py-12 text-center text-on-surface-variant font-body-md">
            No se encontraron partidos para este día.
          </div>
        )}
      </div>
      )}

      {/* Section: Public Prediction Insight */}
      <section className="mt-20 border-t border-outline-variant pt-12">
        <h3 className="text-headline-lg font-headline-lg text-on-surface mb-6">Public Consensus Insight</h3>
        <div className="bg-primary text-on-primary rounded-2xl p-gutter overflow-hidden relative shadow-lg">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-gutter">
            <div className="max-w-xl">
              <span className="text-label-sm font-label-sm text-tertiary-fixed uppercase tracking-[0.2em]">Global Trends</span>
              <p className="text-xl font-body-md mt-4 leading-relaxed">
                Currently, 74% of the community correctly predicted France's current lead. Follow the Leaderboard to see who's dominating the Group Stage predictions.
              </p>
            </div>
            <button className="bg-secondary text-on-secondary px-8 py-3 rounded-full font-bold uppercase tracking-wider hover:scale-105 transition-transform active:scale-95 shadow-lg">
              View Leaderboard
            </button>
          </div>
          {/* Abstract Stadium Background Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        </div>
      </section>
    </div>
  );
}
