import { createContext, useContext, useState, useEffect } from 'react';

const TournamentContext = createContext();

const STORAGE_KEY = 'padel_tournaments';

export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
};

export const TournamentProvider = ({ children }) => {
  // Initialize from session storage
  const [tournaments, setTournaments] = useState(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  // Sync to session storage whenever tournaments change
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tournaments));
  }, [tournaments]);

  const addTournament = (tournament) => {
    const newTournament = {
      ...tournament,
      id: Date.now(), // Simple ID generation
      createdAt: new Date().toISOString(),
    };
    setTournaments((prev) => [...prev, newTournament]);
    return newTournament;
  };

  const deleteTournament = (id) => {
    setTournaments((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTournament = (id, updates) => {
    setTournaments((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const getTournament = (id) => {
    return tournaments.find((t) => t.id === id);
  };

  const clearAllTournaments = () => {
    setTournaments([]);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return (
    <TournamentContext.Provider
      value={{
        tournaments,
        addTournament,
        deleteTournament,
        updateTournament,
        getTournament,
        clearAllTournaments,
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
};

