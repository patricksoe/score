import Container from '../components/Container';
import Button from '../components/button';
import { useNavigate } from 'react-router-dom';
import { useTournament } from '../context/TournamentContext';
import styles from './Home.module.css';

const Home = () => {
  const navigate = useNavigate();
  const { tournaments, clearAllTournaments } = useTournament();

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all tournaments? This cannot be undone.')) {
      clearAllTournaments();
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
            <div key={tournament.id} className={styles.tournamentCard}>
              <h3>{tournament.name}</h3>
              <p className={styles.details}>
                <span>{tournament.players.length} players</span>
                <span>•</span>
                <span>{tournament.scoringOption === 'points' ? 'Points' : 'Sets'}: {tournament.targetValue}</span>
              </p>
              <div className={styles.players}>
                {tournament.players.join(', ')}
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
};

export default Home;
