import React, { useState } from 'react';

const INITIAL_LEADERBOARD = [
  { rank: 4, name: 'Elena Rodriguez', correctResults: 45, correctScores: 8, points: 852, isMe: false, bgClass: 'bg-surface-container-lowest' },
  { rank: 5, name: 'Marcus Chen', correctResults: 42, correctScores: 11, points: 848, isMe: false, bgClass: 'bg-surface-container-low/30' },
  { rank: 1248, name: 'Alex Rivers', correctResults: 28, correctScores: 4, points: 512, isMe: true, bgClass: 'bg-secondary-container/5 border-y-2 border-secondary' },
  { rank: 1249, name: 'John Doe', correctResults: 27, correctScores: 5, points: 510, isMe: false, bgClass: 'bg-surface-container-lowest' }
];

export default function Leaderboard({ user }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredUsers = searchTerm.trim() === ''
    ? INITIAL_LEADERBOARD
    : INITIAL_LEADERBOARD.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // User rank from stats or default
  const myRank = user?.rank || 1248;
  const myPoints = user?.points || 512;

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
                <p className="text-headline-lg font-headline-lg text-primary">#{myRank}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-secondary-container">trending_up</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Podium / Top 3 Visual (Bento Grid Style) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-stack-lg">
        {/* Rank 2 */}
        <div className="order-2 md:order-1 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col items-center text-center relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-surface-container-low rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>
          <div className="mb-4 relative">
            <div className="w-20 h-20 rounded-full border-4 border-slate-300 overflow-hidden shadow-sm">
              <img 
                alt="Rank 2 Avatar" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBENv5vKUaaXHW-uP57ZGtbKE880boMLszPYA8sS2i67ar4iL6Zl7u5J-il6qdatUccGYhmetioW5mfqXS4mguRIw9FS-T9dvDPAYQluY1nEXSUcNqihH-sn7DWAcl14q3idq9LPOBh2wIs59I42EmBL_8VOZN2lbCykgfzWH-7PKrTC1zaOBd4sI0L0qqcD2YsXOzJGbzbPJ8OTQWuvG2rWVP1YO_C13IeSO3tTjLaNlUXxQU9cu1lwEmWcAf_UwRqx8-NWDv-3zzN"
              />
            </div>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-400 text-white font-label-sm text-[10px] px-3 py-0.5 rounded-full">2ND</span>
          </div>
          <h3 className="text-headline-lg font-headline-lg text-lg mb-1">Lucas M.</h3>
          <p className="text-label-sm font-label-sm text-on-surface-variant">892 Points</p>
        </div>

        {/* Rank 1 (Featured) */}
        <div className="order-1 md:order-2 bg-primary-container border-2 border-tertiary-fixed rounded-xl p-8 flex flex-col items-center text-center relative overflow-hidden group hover:shadow-xl transition-all duration-300 md:-mt-4">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
          <div className="mb-6 relative">
            <div className="w-24 h-24 rounded-full border-4 border-tertiary-fixed overflow-hidden shadow-2xl">
              <img 
                alt="Rank 1 Avatar" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9XpmoNgjFLvJTTbel-c3EzqsMJ8T2Cez40Gftjsrc4p26DZZhykMNi9i37NMI1EOTfyfjQbko_hPpulyauOib0tWsY72dOSezCO8TUosqq6eGW3I_kyszZ9kKeXRdZcmyYlquZPJP8nRCVOTjYzgHswSCARZONG0s2N-GhKdxbY88fjS3nJ_fiXCBgjSN4cL-Ip-jaur3KoK1JZfVnpRgZvAkD2dUEhbXOGnlwaYO_7vjGjFKMsOnbHNJC0lA0Nh1vF7Y763dGgRD"
              />
            </div>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-[10px] px-4 py-1 rounded-full shadow-lg">1ST</span>
          </div>
          <h3 className="text-headline-lg font-headline-lg text-on-primary mb-1">Sarah Palmer</h3>
          <p className="text-label-sm font-label-sm text-on-primary-container uppercase tracking-widest">945 Points • 12 Perfect Scores</p>
        </div>

        {/* Rank 3 */}
        <div className="order-3 md:order-3 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col items-center text-center relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-surface-container-low rounded-tr-full -ml-10 -mb-10 transition-transform group-hover:scale-110"></div>
          <div className="mb-4 relative">
            <div className="w-20 h-20 rounded-full border-4 border-orange-400/50 overflow-hidden shadow-sm">
              <img 
                alt="Rank 3 Avatar" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjKKoYW_fGhkgeqlAjuZppScj89jeWkz-WBvlAquuwbmfh5w2N_8SzQQmrDQ8jAvFaJzOACsNrOTCRiMAMfGg0PrLrOr-Dd8Pma97RUatYcQWMir4c34_Vu_Rj5aRyYQNYv4jQFz-PLFkg2sqZH6IBacI5JQ7_MUV3CU88Nq6iyofy6QoTUf6KPkubCCQLfUzMaIb4NerfsnO6avtRSSwuXXnHxomL8KPuTKlY5OzvKeNZ8RZ9CPH51Ct8m_ACIk0drc0_bMlymPc3"
              />
            </div>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-500 text-white font-label-sm text-[10px] px-3 py-0.5 rounded-full">3RD</span>
          </div>
          <h3 className="text-headline-lg font-headline-lg text-lg mb-1">Kenji Sato</h3>
          <p className="text-label-sm font-label-sm text-on-surface-variant">874 Points</p>
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
                const isMe = row.isMe;
                return (
                  <tr 
                    key={row.rank} 
                    className={`hover:bg-surface-container-low/50 transition-colors duration-150 ${row.bgClass}`}
                  >
                    <td className={`py-4 px-6 font-label-sm text-label-sm sticky left-0 z-10 ${
                      isMe ? 'bg-white text-secondary font-bold' : 'bg-inherit'
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
                            {isMe ? user?.name || row.name : row.name}
                          </span>
                          {isMe && <span className="block text-[10px] uppercase font-label-sm text-secondary">That's you!</span>}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center font-label-sm text-label-sm">
                      {isMe ? user?.correctResults || row.correctResults : row.correctResults}
                    </td>
                    <td className="py-4 px-6 text-center font-label-sm text-label-sm">
                      {isMe ? user?.correctScores || row.correctScores : row.correctScores}
                    </td>
                    <td className={`py-4 px-6 text-right font-bold ${isMe ? 'text-secondary' : 'text-primary'}`}>
                      {isMe ? myPoints : row.points}
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
