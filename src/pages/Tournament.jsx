import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTournament } from '../context/TournamentContext';
import Container from '../components/Container';
import styles from './Tournament.module.css';

// Calculate player standings from all completed matches
const calculateStandings = (players, matches) => {
  const standings = {};
  
  // Initialize all players with 0 points and 0 matches
  players.forEach(player => {
    standings[player] = { 
      points: 0, 
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0
    };
  });
  
  // Go through all completed matches and accumulate points
  matches.forEach(round => {
    if (round.placeholder) return;
    
    round.matches.forEach(match => {
      if (match.status === 'completed') {
        // Team 1 players get score1 points each
        match.team1.forEach(player => {
          if (standings[player]) {
            standings[player].points += match.score1;
            standings[player].matchesPlayed += 1;
            if (match.score1 > match.score2) standings[player].wins += 1;
            else if (match.score1 < match.score2) standings[player].losses += 1;
            else standings[player].draws += 1;
          }
        });
        
        // Team 2 players get score2 points each
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
  
  // Convert to array and sort by points (descending), then by wins
  return Object.entries(standings)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return a.losses - b.losses;
    });
};

// Generate initial matches for Americano format
// Creates matches for ALL courts simultaneously (4 players per court)
const generateAmericanoMatches = (players, numberOfCourts) => {
  const matches = [];
  const shuffled = [...players].sort(() => Math.random() - 0.5);
  const roundMatches = [];
  const timestamp = Date.now();
  
  // Calculate how many courts we can actually fill (4 players per court)
  const maxCourts = Math.min(numberOfCourts, Math.floor(shuffled.length / 4));
  
  for (let court = 0; court < maxCourts; court++) {
    const startIdx = court * 4;
    roundMatches.push({
      id: `round-1-court-${court + 1}-${timestamp}-${court}`,
      court: court + 1,
      team1: [shuffled[startIdx], shuffled[startIdx + 1]],
      team2: [shuffled[startIdx + 2], shuffled[startIdx + 3]],
      score1: null,
      score2: null,
      status: 'upcoming'
    });
  }
  
  if (roundMatches.length > 0) {
    matches.push({
      round: 1,
      matches: roundMatches
    });
  }
  
  return matches;
};

// Generate initial matches for Mexicano format (same as Americano for first round)
const generateMexicanoMatches = (players, numberOfCourts) => {
  return generateAmericanoMatches(players, numberOfCourts);
};

// Generate new round for Americano (random pairings for ALL courts)
const generateAmericanoRound = (players, numberOfCourts, roundNumber, existingMatches) => {
  const shuffled = [...players].sort(() => Math.random() - 0.5);
  const roundMatches = [];
  const timestamp = Date.now();
  
  // Calculate how many courts we can fill
  const maxCourts = Math.min(numberOfCourts, Math.floor(shuffled.length / 4));
  
  for (let court = 0; court < maxCourts; court++) {
    const startIdx = court * 4;
    roundMatches.push({
      id: `round-${roundNumber}-court-${court + 1}-${timestamp}-${court}`,
      court: court + 1,
      team1: [shuffled[startIdx], shuffled[startIdx + 1]],
      team2: [shuffled[startIdx + 2], shuffled[startIdx + 3]],
      score1: null,
      score2: null,
      status: 'upcoming'
    });
  }
  
  return {
    round: roundNumber,
    matches: roundMatches
  };
};

// Generate new round for Mexicano (standings-based pairings for ALL courts)
// Groups of 4 by ranking: #1-4 on court 1, #5-8 on court 2, etc.
// Within each group: #1 & #4 vs #2 & #3
const generateMexicanoRound = (players, numberOfCourts, roundNumber, existingMatches) => {
  const standings = calculateStandings(players, existingMatches);
  const rankedPlayers = standings.map(s => s.name);
  
  const roundMatches = [];
  const timestamp = Date.now();
  
  // Calculate how many courts we can fill
  const maxCourts = Math.min(numberOfCourts, Math.floor(rankedPlayers.length / 4));
  
  for (let court = 0; court < maxCourts; court++) {
    const startIdx = court * 4;
    // Get the 4 players for this court (ranked within this group)
    const group = rankedPlayers.slice(startIdx, startIdx + 4);
    
    // Mexicano pairing within the group: #1 & #4 vs #2 & #3
    // This keeps matches competitive - top player pairs with 4th, 2nd pairs with 3rd
    const team1 = [group[0], group[3]]; // #1 and #4 of this group
    const team2 = [group[1], group[2]]; // #2 and #3 of this group
    
    roundMatches.push({
      id: `round-${roundNumber}-court-${court + 1}-${timestamp}-${court}`,
      court: court + 1,
      team1,
      team2,
      score1: null,
      score2: null,
      status: 'upcoming'
    });
  }
  
  return {
    round: roundNumber,
    matches: roundMatches
  };
};

// Inline Score Selector Component
const ScoreSelector = ({ match, scoringOption, targetValue, onSave, onCancel }) => {
  const [selectedScore, setSelectedScore] = useState(match.score1);
  
  const handleSelectScore = (score1) => {
    setSelectedScore(score1);
  };

  const handleConfirm = () => {
    if (selectedScore !== null) {
      const score2 = targetValue - selectedScore;
      onSave({ score1: selectedScore, score2, status: 'completed' });
    }
  };

  if (scoringOption === 'points') {
    const pointOptions = [];
    for (let i = targetValue; i >= 0; i--) {
      pointOptions.push(i);
    }

    return (
      <div className={styles.scoreSelector}>
        <div className={styles.scoreSelectorHeader}>
          <span>Select {match.team1.join(' & ')}'s score</span>
          <button onClick={onCancel} className={styles.cancelSelectButton}>✕</button>
        </div>
        
        <div className={styles.scoreGrid}>
          {pointOptions.map((points) => {
            const otherTeamScore = targetValue - points;
            const isWinner = points > otherTeamScore;
            const isTie = points === otherTeamScore;
            
            return (
              <button
                key={points}
                className={`${styles.scoreButton} ${selectedScore === points ? styles.scoreButtonSelected : ''} ${isWinner ? styles.scoreButtonWin : ''} ${isTie ? styles.scoreButtonTie : ''}`}
                onClick={() => handleSelectScore(points)}
              >
                <span className={styles.scoreValue}>{points}</span>
                <span className={styles.scoreOther}>vs {otherTeamScore}</span>
              </button>
            );
          })}
        </div>
        
        {selectedScore !== null && (
          <div className={styles.scorePreview}>
            <div className={styles.previewTeam}>
              <span className={styles.previewTeamName}>{match.team1.join(' & ')}</span>
              <span className={`${styles.previewScore} ${selectedScore > targetValue - selectedScore ? styles.previewWinner : ''}`}>
                {selectedScore}
              </span>
            </div>
            <span className={styles.previewVs}>-</span>
            <div className={styles.previewTeam}>
              <span className={`${styles.previewScore} ${targetValue - selectedScore > selectedScore ? styles.previewWinner : ''}`}>
                {targetValue - selectedScore}
              </span>
              <span className={styles.previewTeamName}>{match.team2.join(' & ')}</span>
            </div>
          </div>
        )}
        
        <button 
          className={styles.confirmButton} 
          onClick={handleConfirm}
          disabled={selectedScore === null}
        >
          Confirm Score
        </button>
      </div>
    );
  }

  // For sets scoring
  const setsOptions = [];
  for (let i = targetValue; i >= 0; i--) {
    setsOptions.push(i);
  }

  return (
    <div className={styles.scoreSelector}>
      <div className={styles.scoreSelectorHeader}>
        <span>Select {match.team1.join(' & ')}'s sets won</span>
        <button onClick={onCancel} className={styles.cancelSelectButton}>✕</button>
      </div>
      
      <div className={styles.scoreGrid}>
        {setsOptions.map((sets) => {
          const otherTeamSets = targetValue - sets;
          const isWinner = sets > otherTeamSets;
          const isTie = sets === otherTeamSets;
          
          return (
            <button
              key={sets}
              className={`${styles.scoreButton} ${selectedScore === sets ? styles.scoreButtonSelected : ''} ${isWinner ? styles.scoreButtonWin : ''} ${isTie ? styles.scoreButtonTie : ''}`}
              onClick={() => handleSelectScore(sets)}
            >
              <span className={styles.scoreValue}>{sets}</span>
              <span className={styles.scoreOther}>vs {otherTeamSets}</span>
            </button>
          );
        })}
      </div>
      
      {selectedScore !== null && (
        <div className={styles.scorePreview}>
          <div className={styles.previewTeam}>
            <span className={styles.previewTeamName}>{match.team1.join(' & ')}</span>
            <span className={`${styles.previewScore} ${selectedScore > targetValue - selectedScore ? styles.previewWinner : ''}`}>
              {selectedScore} {selectedScore === 1 ? 'set' : 'sets'}
            </span>
          </div>
          <span className={styles.previewVs}>-</span>
          <div className={styles.previewTeam}>
            <span className={`${styles.previewScore} ${targetValue - selectedScore > selectedScore ? styles.previewWinner : ''}`}>
              {targetValue - selectedScore} {targetValue - selectedScore === 1 ? 'set' : 'sets'}
            </span>
            <span className={styles.previewTeamName}>{match.team2.join(' & ')}</span>
          </div>
        </div>
      )}
      
      <button 
        className={styles.confirmButton} 
        onClick={handleConfirm}
        disabled={selectedScore === null}
      >
        Confirm Score
      </button>
    </div>
  );
};

// Standings/Leaderboard Component
const Standings = ({ standings, scoringOption, onEditPlayers }) => {
  return (
    <div className={styles.standingsSection}>
      <div className={styles.standingsHeader}>
        <h3>Standings</h3>
        <button onClick={onEditPlayers} className={styles.editPlayersButton}>
          Edit Players
        </button>
      </div>
      <div className={styles.standingsTable}>
        <div className={styles.standingsTableHeader}>
          <span className={styles.standingsRank}>#</span>
          <span className={styles.standingsName}>Player</span>
          <span className={styles.standingsStat}>W</span>
          <span className={styles.standingsStat}>L</span>
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
            <span className={styles.standingsPoints}>{player.points}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Player Editor Modal Component
const PlayerEditor = ({ players, onSave, onClose }) => {
  const [editedPlayers, setEditedPlayers] = useState([...players]);
  const [newPlayerName, setNewPlayerName] = useState('');

  const handleAddPlayer = () => {
    const trimmedName = newPlayerName.trim();
    if (trimmedName && !editedPlayers.includes(trimmedName)) {
      setEditedPlayers([...editedPlayers, trimmedName]);
      setNewPlayerName('');
    }
  };

  const handleRemovePlayer = (playerToRemove) => {
    setEditedPlayers(editedPlayers.filter(p => p !== playerToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddPlayer();
    }
  };

  const handleSave = () => {
    if (editedPlayers.length >= 2) {
      onSave(editedPlayers);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Edit Players</h3>
          <button onClick={onClose} className={styles.closeButton}>✕</button>
        </div>

        <div className={styles.modalContent}>
          <div className={styles.addPlayerSection}>
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter player name"
              className={styles.addPlayerInput}
            />
            <button 
              onClick={handleAddPlayer}
              className={styles.addPlayerButton}
              disabled={!newPlayerName.trim()}
            >
              Add
            </button>
          </div>

          <div className={styles.playerEditorList}>
            {editedPlayers.map((player, index) => (
              <div key={index} className={styles.playerEditorItem}>
                <span className={styles.playerEditorName}>{player}</span>
                <button 
                  onClick={() => handleRemovePlayer(player)}
                  className={styles.removePlayerButton}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {editedPlayers.length < 2 && (
            <p className={styles.playerWarning}>Need at least 2 players</p>
          )}
        </div>

        <div className={styles.modalActions}>
          <button onClick={onClose} className={styles.cancelButton}>Cancel</button>
          <button 
            onClick={handleSave} 
            className={styles.saveButton}
            disabled={editedPlayers.length < 2}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

const Tournament = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTournament, updateTournament } = useTournament();
  const [expandedMatchId, setExpandedMatchId] = useState(null);
  const [showPlayerEditor, setShowPlayerEditor] = useState(false);
  
  const tournament = getTournament(Number(id));
  
  useEffect(() => {
    if (tournament && !tournament.matches) {
      const generatedMatches = tournament.tournamentType === 'mexicano'
        ? generateMexicanoMatches(tournament.players, tournament.numberOfCourts)
        : generateAmericanoMatches(tournament.players, tournament.numberOfCourts);
      
      updateTournament(tournament.id, { matches: generatedMatches });
    }
  }, [tournament, updateTournament]);
  
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
  
  const handleMatchClick = (matchId) => {
    if (expandedMatchId === matchId) {
      setExpandedMatchId(null);
    } else {
      setExpandedMatchId(matchId);
    }
  };

  const handleSaveScore = (roundIndex, matchIndex, scoreData) => {
    const updatedMatches = [...matches];
    updatedMatches[roundIndex].matches[matchIndex] = {
      ...updatedMatches[roundIndex].matches[matchIndex],
      ...scoreData
    };
    
    updateTournament(tournament.id, { matches: updatedMatches });
    setExpandedMatchId(null);
  };

  const handleCancelSelect = () => {
    setExpandedMatchId(null);
  };

  const handleGenerateRound = () => {
    const currentRounds = matches.filter(r => !r.placeholder);
    const nextRoundNumber = currentRounds.length > 0 
      ? Math.max(...currentRounds.map(r => r.round)) + 1 
      : 1;
    
    // Use different generation logic based on tournament type
    const newRound = tournament.tournamentType === 'mexicano'
      ? generateMexicanoRound(tournament.players, tournament.numberOfCourts, nextRoundNumber, matches)
      : generateAmericanoRound(tournament.players, tournament.numberOfCourts, nextRoundNumber, matches);
    
    if (newRound.matches.length > 0) {
      const updatedMatches = [...matches.filter(r => !r.placeholder), newRound];
      updateTournament(tournament.id, { matches: updatedMatches });
    }
  };
  
  // Check if any matches have been played
  const hasPlayedMatches = matches.some(round => 
    !round.placeholder && round.matches.some(m => m.status === 'completed')
  );

  const handleEditPlayers = () => {
    setShowPlayerEditor(true);
  };

  const handleSavePlayers = (newPlayers) => {
    updateTournament(tournament.id, { players: newPlayers });
    setShowPlayerEditor(false);
  };
  
  return (
    <Container>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <h1>{tournament.name}</h1>
          <div className={styles.meta}>
            <span className={styles.badge}>{tournament.tournamentType === 'mexicano' ? 'Mexicano' : 'Americano'}</span>
            <span className={styles.badge}>{tournament.numberOfCourts} {tournament.numberOfCourts === 1 ? 'Court' : 'Courts'}</span>
            <span className={styles.badge}>{tournament.players.length} Players</span>
            <span className={styles.badge}>
              {tournament.scoringOption === 'points' 
                ? `${tournament.targetValue} Points` 
                : `${tournament.targetValue} Sets`}
            </span>
          </div>
        </div>
        
        {/* Show standings if any matches have been played */}
        {hasPlayedMatches && (
          <Standings 
            standings={standings} 
            scoringOption={tournament.scoringOption}
            onEditPlayers={handleEditPlayers}
          />
        )}
        
        {/* Show players list only if no matches played yet */}
        {!hasPlayedMatches && (
          <div className={styles.playersSection}>
            <div className={styles.playersSectionHeader}>
              <h3>Players</h3>
              <button onClick={handleEditPlayers} className={styles.editPlayersButton}>
                Edit
              </button>
            </div>
            <div className={styles.playersList}>
              {tournament.players.map((player, index) => (
                <div key={index} className={styles.playerChip}>
                  {player}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className={styles.matchesSection}>
          <h2>Games</h2>
          
          {matches.length === 0 ? (
            <p className={styles.noMatches}>Not enough players to generate matches. Need at least 4 players.</p>
          ) : (
            matches.filter(r => !r.placeholder).map((round, roundIndex) => (
              <div key={round.round} className={styles.round}>
                <h3 className={styles.roundTitle}>Round {round.round}</h3>
                
                <div className={styles.matchesList}>
                  {round.matches.map((match, matchIndex) => (
                    <div 
                      key={match.id} 
                      className={`${styles.matchCard} ${match.status === 'completed' ? styles.matchCompleted : ''} ${expandedMatchId === match.id ? styles.matchExpanded : ''}`}
                    >
                      <div 
                        className={styles.matchHeader}
                        onClick={() => handleMatchClick(match.id)}
                      >
                        <div className={styles.courtLabel}>
                          Court {match.court}
                          {match.status === 'completed' && <span className={styles.completedBadge}>✓</span>}
                        </div>
                        <div className={styles.matchContent}>
                          <div className={styles.team}>
                            <span className={styles.teamLabel}>Team 1</span>
                            <div className={styles.teamPlayers}>
                              {match.team1.join(' & ')}
                            </div>
                            {match.status === 'completed' && (
                              <div className={`${styles.teamScore} ${match.score1 > match.score2 ? styles.winner : ''}`}>
                                {match.score1}
                              </div>
                            )}
                          </div>
                          <div className={styles.vsSection}>
                            <div className={styles.vs}>VS</div>
                          </div>
                          <div className={styles.team}>
                            <span className={styles.teamLabel}>Team 2</span>
                            <div className={styles.teamPlayers}>
                              {match.team2.join(' & ')}
                            </div>
                            {match.status === 'completed' && (
                              <div className={`${styles.teamScore} ${match.score2 > match.score1 ? styles.winner : ''}`}>
                                {match.score2}
                              </div>
                            )}
                          </div>
                        </div>
                        {match.status !== 'completed' && expandedMatchId !== match.id && (
                          <div className={styles.enterScoreHint}>Tap to enter score</div>
                        )}
                      </div>
                      
                      {expandedMatchId === match.id && match.status !== 'completed' && (
                        <ScoreSelector
                          match={match}
                          scoringOption={tournament.scoringOption}
                          targetValue={tournament.targetValue}
                          onSave={(scoreData) => handleSaveScore(roundIndex, matchIndex, scoreData)}
                          onCancel={handleCancelSelect}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
          
          {tournament.players.length >= 4 && (
            <button 
              className={styles.generateRoundButton}
              onClick={handleGenerateRound}
            >
              + Generate New Round
              {tournament.tournamentType === 'mexicano' && hasPlayedMatches && (
                <span className={styles.generateHint}>(Based on standings)</span>
              )}
            </button>
          )}
        </div>
      </div>

      {showPlayerEditor && (
        <PlayerEditor
          players={tournament.players}
          onSave={handleSavePlayers}
          onClose={() => setShowPlayerEditor(false)}
        />
      )}
    </Container>
  );
};

export default Tournament;
