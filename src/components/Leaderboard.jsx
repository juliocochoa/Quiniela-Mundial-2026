import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase.js';

export default function Leaderboard({ user }) {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: pastMatches } = useQuery({
    queryKey: ['past-matches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .lt('match_date', new Date().toISOString())
        .not('home_score', 'is', null)
        .not('away_score', 'is', null);
      if (error) throw new Error(error.message);
      return data;
    }
  });

  const { data: allPicks } = useQuery({
    queryKey: ['all-picks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('picks')
        .select('*');
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

  const leaderboard = useMemo(() => {
    if (!pastMatches || !allPicks || !profiles) return [];

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

    const profileMap = {};
    profiles.forEach(p => { profileMap[p.id] = p; });

    const rows = Object.entries(userStats)
      .map(([userId, stats]) => {
        const profile = profileMap[userId];
        return {
          userId,
          name: profile?.name || 'Unknown',
          email: profile?.email || '',
          points: stats.points,
          correctResults: stats.correctResults,
          correctScores: stats.correctScores,
        };
      })
      .sort((a, b) => b.points - a.points || b.correctScores - a.correctScores)
      .map((row, i) => ({ ...row, rank: i + 1 }));

    return rows;
  }, [pastMatches, allPicks, profiles]);

  const myEntry = useMemo(() => {
    if (!user || !leaderboard.length) return null;
    return leaderboard.find(e => e.userId === user.id);
  }, [user, leaderboard]);

  const filteredUsers = useMemo(() => {
    if (searchTerm.trim() === '') return leaderboard;
    return leaderboard.filter(u =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [leaderboard, searchTerm]);

  const top3 = useMemo(() => leaderboard.slice(0, 3), [leaderboard]);

  return (
    <div className="pt-8 pb-32 px-4 md:px-gutter max-w-container-max mx-auto min-h-screen">
      {/* Hero Summary Section */}
      <section className="mb-stack-lg animate-in fade-in duration-500">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-end">
          <div className="md:col-span-8">
            <span className="text-label-sm font-label-sm text-secondary uppercase tracking-widest block mb-2">Global Standings</span>
            <h2 className="text-headline-lg md:text-5xl font-display-lg text-on-background mb-4">The Leaderboard</h2>
            <p className="text-body-md text-on-surface-variant max-w-2xl">
              Track your progress against thousands of fans worldwide. Accuracy, consistency, and a deep understanding of the beautiful game will take you to the top.
            </p>
          </div>
          <div className="md:col-span-4 flex flex-col gap-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow transition-shadow">
              <div>
                <p className="text-label-sm font-label-sm text-on-surface-variant">Your Rank</p>
                <p className="text-headline-lg font-headline-lg text-primary">#{myEntry?.rank || '---'}</p>
              </div>
              {myEntry && (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-label-sm font-label-sm text-on-surface-variant">{myEntry.points} pts</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-secondary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-secondary-container">trending_up</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Podium / Top 3 Visual */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-stack-lg">
        {/* Rank 2 */}
        <div className="order-2 md:order-1 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col items-center text-center relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-surface-container-low rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>
          <div className="mb-4 relative">
            <div className="w-20 h-20 rounded-full border-4 border-slate-300 overflow-hidden shadow-sm bg-surface-container-highest flex items-center justify-center">
              <span className="material-symbols-outlined text-[32px] text-on-surface-variant">person</span>
            </div>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-400 text-white font-label-sm text-[10px] px-3 py-0.5 rounded-full">2ND</span>
          </div>
          <h3 className="text-headline-lg font-headline-lg text-lg mb-1">{top3[1]?.name || '---'}</h3>
          <p className="text-label-sm font-label-sm text-on-surface-variant">{top3[1]?.points || 0} Points</p>
        </div>

        {/* Rank 1 (Featured) */}
        <div className="order-1 md:order-2 bg-primary-container border-2 border-tertiary-fixed rounded-xl p-8 flex flex-col items-center text-center relative overflow-hidden group hover:shadow-xl transition-all duration-300 md:-mt-4">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
          <div className="mb-6 relative">
            <div className="w-24 h-24 rounded-full border-4 border-tertiary-fixed overflow-hidden shadow-2xl bg-surface-container-highest flex items-center justify-center">
              <span className="material-symbols-outlined text-[40px] text-tertiary">emoji_events</span>
            </div>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-[10px] px-4 py-1 rounded-full shadow-lg">1ST</span>
          </div>
          <h3 className="text-headline-lg font-headline-lg text-on-primary mb-1">{top3[0]?.name || '---'}</h3>
          <p className="text-label-sm font-label-sm text-on-primary-container uppercase tracking-widest">{top3[0]?.points || 0} Points • {top3[0]?.correctScores || 0} Perfect Scores</p>
        </div>

        {/* Rank 3 */}
        <div className="order-3 md:order-3 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col items-center text-center relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-surface-container-low rounded-tr-full -ml-10 -mb-10 transition-transform group-hover:scale-110"></div>
          <div className="mb-4 relative">
            <div className="w-20 h-20 rounded-full border-4 border-orange-400/50 overflow-hidden shadow-sm bg-surface-container-highest flex items-center justify-center">
              <span className="material-symbols-outlined text-[32px] text-on-surface-variant">person</span>
            </div>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-500 text-white font-label-sm text-[10px] px-3 py-0.5 rounded-full">3RD</span>
          </div>
          <h3 className="text-headline-lg font-headline-lg text-lg mb-1">{top3[2]?.name || '---'}</h3>
          <p className="text-label-sm font-label-sm text-on-surface-variant">{top3[2]?.points || 0} Points</p>
        </div>
      </section>

      {/* Main Data Table Section */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">

        {/* Search header bar */}
        <div className="p-4 border-b border-outline-variant bg-surface-container-low flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-headline-md text-lg text-on-surface select-none">Global Standings</h3>

          <div className="relative max-w-md w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input
              type="text"
              placeholder="Buscar participante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-2 pl-10 pr-4 text-sm text-on-surface outline-none transition-all placeholder:text-outline/70"
            />
          </div>
        </div>

        <div className="overflow-x-auto leaderboard-table-scroll">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary text-on-primary">
                <th className="py-4 px-6 font-label-sm text-label-sm uppercase tracking-wider sticky left-0 bg-primary z-10">Rank</th>
                <th className="py-4 px-6 font-label-sm text-label-sm uppercase tracking-wider">User</th>
                <th className="py-4 px-6 font-label-sm text-label-sm uppercase tracking-wider text-center">Correct Results</th>
                <th className="py-4 px-6 font-label-sm text-label-sm uppercase tracking-wider text-center">Correct Scores</th>
                <th className="py-4 px-6 font-label-sm text-label-sm uppercase tracking-wider text-right">Total Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filteredUsers.map((row) => {
                const isMe = row.userId === user?.id;
                return (
                  <tr
                    key={row.userId}
                    className={`transition-colors duration-150 ${isMe ? 'bg-secondary-container/5 border-y-2 border-secondary' : 'hover:bg-surface-container-low/50'
                      }`}
                  >
                    <td className={`py-4 px-6 font-label-sm text-label-sm sticky left-0 z-10 ${isMe ? 'bg-white text-secondary font-bold' : 'bg-inherit'
                      }`}>
                      {row.rank}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {isMe ? (
                          <div className="w-8 h-8 rounded-full bg-secondary-container flex-shrink-0 flex items-center justify-center">
                            <span className="text-[10px] text-on-secondary font-bold">ME</span>
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-surface-container-highest flex-shrink-0"></div>
                        )}
                        <div>
                          <span className={`font-bold ${isMe ? 'text-primary' : 'text-on-surface'}`}>
                            {row.name}
                          </span>
                          {isMe && <span className="block text-[10px] uppercase font-label-sm text-secondary">That's you!</span>}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center font-label-sm text-label-sm">
                      {row.correctResults}
                    </td>
                    <td className="py-4 px-6 text-center font-label-sm text-label-sm">
                      {row.correctScores}
                    </td>
                    <td className={`py-4 px-6 text-right font-bold ${isMe ? 'text-secondary' : 'text-primary'}`}>
                      {row.points}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination / Load More */}
        <div className="p-6 border-t border-outline-variant flex justify-center">
          <button className="bg-primary text-on-primary font-label-sm text-label-sm px-8 py-3 rounded-xl hover:opacity-90 transition-all active:scale-95 shadow-sm">
            VIEW ALL RANKINGS
          </button>
        </div>
      </section>
    </div>
  );
}
