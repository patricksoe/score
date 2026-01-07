import { useParams, useNavigate } from 'react-router-dom';
import { useTournament } from '../context/TournamentContext';
import Container from '../components/Container';
import styles from './TournamentSummary.module.css';

// Calculate player standings from all completed matches
const calculateStandings = (players, matches) => {
  const standings = {};
  
  players.forEach(player => {
    standings[player] = { 
      points: 0, 
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0
    };
  });
  
  matches.forEach(round => {
    if (round.placeholder) return;
    
    round.matches.forEach(match => {
      if (match.status === 'completed') {
        match.team1.forEach(player => {
          if (standings[player]) {
            standings[player].points += match.score1;
            standings[player].matchesPlayed += 1;
            if (match.score1 > match.score2) standings[player].wins += 1;
            else if (match.score1 < match.score2) standings[player].losses += 1;
            else standings[player].draws += 1;
          }
        });
        
        match.team2.forEach(player => {
          if (standings[player]) {
            standings[player].points += match.score2;
            standings[player].matchesPlayed += 1;
            if (match.score2 > match.score1) standings[player].wins += 1;
            else if (match.score2 < match.score1) standings[player].losses += 1;
            else standings[player].draws += 1;
          }
        });
      }
    });
  });
  
  return Object.entries(standings)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return a.losses - b.losses;
    });
};

const TournamentSummary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTournament } = useTournament();
  
  const tournament = getTournament(Number(id));
  
  if (!tournament) {
    return (
      <Container>
        <div className={styles.notFound}>
          <h2>Tournament Not Found</h2>
          <p>The tournament you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/')} className={styles.backButton}>
            Back to Home
          </button>
        </div>
      </Container>
    );
  }
  
  const matches = tournament.matches || [];
  const standings = calculateStandings(tournament.players, matches);
  
  // Calculate tournament stats
  const totalMatches = matches.reduce((acc, round) => 
    acc + (round.placeholder ? 0 : round.matches.filter(m => m.status === 'completed').length), 0
  );
  const totalRounds = matches.filter(r => !r.placeholder).length;
  
  // Get top 3 players
  const winner = standings[0];
  const runnerUp = standings[1];
  const thirdPlace = standings[2];
  
  return (
    <Container>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <span className={styles.completedBadge}>Tournament Complete</span>
          <h1>{tournament.name}</h1>
          <div className={styles.meta}>
            <span>{tournament.tournamentType === 'mexicano' ? 'Mexicano' : 'Americano'}</span>
            <span>•</span>
            <span>{totalRounds} Rounds</span>
            <span>•</span>
            <span>{totalMatches} Matches</span>
          </div>
        </div>

        {/* Podium */}
        <div className={styles.podium}>
          <div className={styles.podiumPlace}>
            {runnerUp && (
              <>
                <div className={styles.podiumName}>{runnerUp.name}</div>
                <div className={styles.podiumPoints}>{runnerUp.points} pts</div>
                <div className={`${styles.podiumBlock} ${styles.second}`}>
                  <span className={styles.podiumMedal}>🥈</span>
                  <span className={styles.podiumPosition}>2nd</span>
                </div>
              </>
            )}
          </div>
          
          <div className={styles.podiumPlace}>
            {winner && (
              <>
                <div className={styles.podiumName}>{winner.name}</div>
                <div className={styles.podiumPoints}>{winner.points} pts</div>
                <div className={`${styles.podiumBlock} ${styles.first}`}>
                  <span className={styles.podiumMedal}>🥇</span>
                  <span className={styles.podiumPosition}>1st</span>
                </div>
              </>
            )}
          </div>
          
          <div className={styles.podiumPlace}>
            {thirdPlace && (
              <>
                <div className={styles.podiumName}>{thirdPlace.name}</div>
                <div className={styles.podiumPoints}>{thirdPlace.points} pts</div>
                <div className={`${styles.podiumBlock} ${styles.third}`}>
                  <span className={styles.podiumMedal}>🥉</span>
                  <span className={styles.podiumPosition}>3rd</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Full Standings */}
        <div className={styles.standingsSection}>
          <h2>Final Standings</h2>
          <div className={styles.standingsTable}>
            <div className={styles.standingsHeader}>
              <span className={styles.standingsRank}>#</span>
              <span className={styles.standingsName}>Player</span>
              <span className={styles.standingsStat}>W</span>
              <span className={styles.standingsStat}>L</span>
              <span className={styles.standingsStat}>P</span>
              <span className={styles.standingsPoints}>Pts</span>
            </div>
            {standings.map((player, index) => (
              <div 
                key={player.name} 
                className={`${styles.standingsRow} ${index < 3 ? styles.standingsTop3 : ''}`}
              >
                <span className={styles.standingsRank}>
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                  {index > 2 && (index + 1)}
                </span>
                <span className={styles.standingsName}>{player.name}</span>
                <span className={styles.standingsStat}>{player.wins}</span>
                <span className={styles.standingsStat}>{player.losses}</span>
                <span className={styles.standingsStat}>{player.matchesPlayed}</span>
                <span className={styles.standingsPoints}>{player.points}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button 
            onClick={() => navigate(`/tournament/${tournament.id}`)}
            className={styles.secondaryButton}
          >
            View Matches
          </button>
          <button 
            onClick={() => navigate('/')}
            className={styles.primaryButton}
          >
            Back to Home
          </button>
        </div>
      </div>
    </Container>
  );
};

export default TournamentSummary;

