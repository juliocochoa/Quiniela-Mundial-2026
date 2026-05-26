import React, { useState } from 'react';

const MATCH_DATA = [
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

export default function Results() {
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All Days' },
    { id: 'Yesterday', label: 'Yesterday' },
    { id: 'June 24', label: 'June 24' },
    { id: 'June 23', label: 'June 23' },
  ];

  const filteredMatches = activeFilter === 'all' 
    ? MATCH_DATA 
    : MATCH_DATA.filter(m => m.date === activeFilter);

  const completedCount = MATCH_DATA.filter(m => m.status === 'FINISHED').length;
  const liveCount = MATCH_DATA.filter(m => m.status === 'LIVE').length;

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
            <span className="text-2xl font-bold text-primary mt-1">{completedCount} / 64</span>
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
            className={`px-6 py-2 rounded-full font-label-sm text-label-sm transition-all border uppercase tracking-wider ${
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
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredMatches.map(match => (
          <div 
            key={match.id} 
            className={`rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 border flex flex-col justify-between ${
              match.status === 'LIVE' 
                ? 'bg-surface-container-lowest border-secondary/30 hover:shadow-[0_4px_12px_rgba(188,0,12,0.1)]' 
                : 'bg-surface border-outline-variant group'
            }`}
          >
            {/* Header portion */}
            <div className={`px-4 py-1.5 flex justify-between items-center ${
              match.status === 'LIVE' ? 'bg-secondary' : 'bg-surface-container-high border-b border-outline-variant'
            }`}>
              <span className={`text-label-sm font-label-sm uppercase flex items-center gap-2 tracking-wider ${
                match.status === 'LIVE' ? 'text-on-secondary' : 'text-on-surface-variant'
              }`}>
                {match.status === 'LIVE' ? (
                  <>
                    <span className="w-1.5 h-1.5 bg-on-secondary rounded-full live-pulse"></span>
                    LIVE • {match.time}
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    FINISHED
                  </>
                )}
              </span>
              <span className={`text-label-sm font-label-sm uppercase tracking-wider ${
                match.status === 'LIVE' ? 'text-on-secondary opacity-80' : 'text-on-surface-variant'
              }`}>
                {match.group}
              </span>
            </div>

            {/* Teams portion */}
            <div className="p-gutter flex-grow flex items-center">
              <div className="flex items-center justify-between gap-4 w-full">
                {/* Home Team */}
                <div className="flex flex-col items-center flex-1">
                  <div className="w-16 h-16 rounded-full border border-outline-variant shadow-sm mb-3 overflow-hidden transition-all group-hover:scale-105">
                    <img alt={match.homeTeam} className="w-full h-full object-cover" src={match.homeFlag} />
                  </div>
                  <span className="font-bold text-lg text-center text-on-surface">{match.homeTeam}</span>
                </div>

                {/* Score Column */}
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-3">
                    <span className="text-5xl font-display-lg text-primary">{match.homeScore}</span>
                    <span className="text-on-surface-variant font-bold opacity-30">—</span>
                    <span className="text-5xl font-display-lg text-primary">{match.awayScore}</span>
                  </div>
                  <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">
                    {match.status === 'LIVE' ? 'Progress' : 'Full Time'}
                  </span>
                </div>

                {/* Away Team */}
                <div className="flex flex-col items-center flex-1">
                  <div className="w-16 h-16 rounded-full border border-outline-variant shadow-sm mb-3 overflow-hidden transition-all group-hover:scale-105">
                    <img alt={match.awayTeam} className="w-full h-full object-cover" src={match.awayFlag} />
                  </div>
                  <span className="font-bold text-lg text-center text-on-surface">{match.awayTeam}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredMatches.length === 0 && (
          <div className="col-span-full py-12 text-center text-on-surface-variant font-body-md">
            No se encontraron partidos para este día.
          </div>
        )}
      </div>

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
