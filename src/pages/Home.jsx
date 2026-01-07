import { useState, useRef } from 'react';
import Container from '../components/Container';
import Button from '../components/button';
import { useNavigate } from 'react-router-dom';
import { useTournament } from '../context/TournamentContext';
import styles from './Home.module.css';

// Swipeable Card Component
const SwipeableCard = ({ children, onDelete }) => {
  const [offset, setOffset] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const cardRef = useRef(null);

  const SWIPE_THRESHOLD = 80; // pixels to reveal delete button
  const DELETE_WIDTH = 80; // width of delete button

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    currentX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;
    
    // Only allow swiping right (positive diff) or closing (if revealed)
    if (isRevealed) {
      // If revealed, allow swiping left to close
      const newOffset = Math.max(0, Math.min(DELETE_WIDTH, DELETE_WIDTH + diff));
      setOffset(newOffset);
    } else {
      // If not revealed, only allow swiping right
      const newOffset = Math.max(0, Math.min(DELETE_WIDTH, diff));
      setOffset(newOffset);
    }
  };

  const handleTouchEnd = () => {
    if (offset > SWIPE_THRESHOLD / 2) {
      // Reveal delete button
      setOffset(DELETE_WIDTH);
      setIsRevealed(true);
    } else {
      // Hide delete button
      setOffset(0);
      setIsRevealed(false);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete();
  };

  const handleClose = () => {
    setOffset(0);
    setIsRevealed(false);
  };

  return (
    <div className={styles.swipeContainer}>
      <div className={styles.deleteButtonWrapper}>
        <button 
          className={styles.deleteButton}
          onClick={handleDelete}
        >
          Delete
        </button>
      </div>
      <div
        ref={cardRef}
        className={styles.swipeableContent}
        style={{ transform: `translateX(${offset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={isRevealed ? handleClose : undefined}
      >
        {children}
      </div>
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const { tournaments, clearAllTournaments, deleteTournament } = useTournament();

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all tournaments? This cannot be undone.')) {
      clearAllTournaments();
    }
  };

  const handleDeleteTournament = (id, name) => {
    if (window.confirm(`Delete "${name}"?`)) {
      deleteTournament(id);
    }
  };

  return (
    <Container>
      <Button text="New Tournament" onClick={() => navigate('/create')} />
      
      {tournaments.length > 0 && (
        <div className={styles.tournamentList}>
          <div className={styles.header}>
            <h2>Tournaments</h2>
            <button onClick={handleClearAll} className={styles.clearButton}>
              Clear All
            </button>
          </div>
          {tournaments.map((tournament) => (
            <SwipeableCard 
              key={tournament.id}
              onDelete={() => handleDeleteTournament(tournament.id, tournament.name)}
            >
              <div 
                className={styles.tournamentCard}
                onClick={() => navigate(`/tournament/${tournament.id}`)}
              >
                <h3>{tournament.name}</h3>
                <p className={styles.details}>
                  <span>{tournament.tournamentType === 'mexicano' ? 'Mexicano' : 'Americano'}</span>
                  <span>•</span>
                  <span>{tournament.players.length} players</span>
                  <span>•</span>
                  <span>{tournament.scoringOption === 'points' ? 'Points' : 'Sets'}: {tournament.targetValue}</span>
                </p>
                <div className={styles.players}>
                  {tournament.players.join(', ')}
                </div>
              </div>
            </SwipeableCard>
          ))}
        </div>
      )}
    </Container>
  );
};

export default Home;
