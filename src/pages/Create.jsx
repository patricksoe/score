import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTournament } from '../context/TournamentContext';
import Container from '../components/Container';
import styles from './Create.module.css';

const Create = () => {
  const navigate = useNavigate();
  const { addTournament } = useTournament();
  
  const [tournamentName, setTournamentName] = useState('');
  const [players, setPlayers] = useState(['', '']);
  const [scoringOption, setScoringOption] = useState('points');
  const [targetValue, setTargetValue] = useState(21);

  const handleAddPlayer = () => {
    setPlayers([...players, '']);
  };

  const handleRemovePlayer = (index) => {
    if (players.length > 2) {
      setPlayers(players.filter((_, i) => i !== index));
    }
  };

  const handlePlayerChange = (index, value) => {
    const newPlayers = [...players];
    newPlayers[index] = value;
    setPlayers(newPlayers);
  };

  const handleScoringChange = (value) => {
    setScoringOption(value);
    // Reset target value based on scoring option
    setTargetValue(value === 'points' ? 21 : 3);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Filter out empty player names
    const validPlayers = players.filter(player => player.trim() !== '');
    
    if (!tournamentName.trim()) {
      alert('Please enter a tournament name');
      return;
    }
    
    if (validPlayers.length < 2) {
      alert('Please add at least 2 players');
      return;
    }

    // Create tournament object
    const tournamentData = { 
      name: tournamentName, 
      players: validPlayers, 
      scoringOption,
      targetValue,
      scores: validPlayers.reduce((acc, player) => {
        acc[player] = 0;
        return acc;
      }, {}),
    };

    // Save tournament to global state
    const savedTournament = addTournament(tournamentData);
    
    console.log('Tournament created:', savedTournament);
    
    // Navigate back to home page
    navigate('/');
  };

  return (
    <Container>
      <div className={styles.formWrapper}>
        <h2>Create New Tournament</h2>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="tournamentName">Tournament Name</label>
            <input
              type="text"
              id="tournamentName"
              value={tournamentName}
              onChange={(e) => setTournamentName(e.target.value)}
              placeholder="Enter tournament name"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Players</label>
            <div className={styles.playersContainer}>
              {players.map((player, index) => (
                <div key={index} className={styles.playerRow}>
                  <input
                    type="text"
                    value={player}
                    onChange={(e) => handlePlayerChange(index, e.target.value)}
                    placeholder={`Player ${index + 1}`}
                    className={styles.input}
                  />
                  {players.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePlayer(index)}
                      className={styles.removeButton}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <button
              type="button"
              onClick={handleAddPlayer}
              className={styles.addButton}
            >
              + Add Player
            </button>
          </div>

          <div className={styles.formGroup}>
            <label>Scoring Option</label>
            <div className={styles.scoringOptions}>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="scoring"
                  value="points"
                  checked={scoringOption === 'points'}
                  onChange={(e) => handleScoringChange(e.target.value)}
                />
                <span>Points</span>
              </label>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="scoring"
                  value="sets"
                  checked={scoringOption === 'sets'}
                  onChange={(e) => handleScoringChange(e.target.value)}
                />
                <span>Sets</span>
              </label>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="targetValue">
              {scoringOption === 'points' ? 'Points to Win' : 'Sets to Win'}
            </label>
            <select
              id="targetValue"
              value={targetValue}
              onChange={(e) => setTargetValue(Number(e.target.value))}
              className={styles.select}
            >
              {scoringOption === 'points' ? (
                // Options from 1 to 21
                Array.from({ length: 21 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Point' : 'Points'}
                  </option>
                ))
              ) : (
                // Options from 1 to 6
                Array.from({ length: 6 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Set' : 'Sets'}
                  </option>
                ))
              )}
            </select>
          </div>

          <button type="submit" className={styles.submitButton}>
            Create Tournament
          </button>
        </form>
      </div>
    </Container>
  );
};

export default Create;

