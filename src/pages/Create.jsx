import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTournament } from '../context/TournamentContext';
import Container from '../components/Container';
import styles from './Create.module.css';

const Create = () => {
  const navigate = useNavigate();
  const { addTournament } = useTournament();
  
  const [tournamentName, setTournamentName] = useState('');
  const [tournamentType, setTournamentType] = useState('americano');
  const [numberOfCourts, setNumberOfCourts] = useState(1);
  const [players, setPlayers] = useState(['', '']);
  const [scoringOption, setScoringOption] = useState('points');
  const [targetValue, setTargetValue] = useState(21);
  const [errors, setErrors] = useState({
    tournamentName: '',
    players: ''
  });

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

  const handleTournamentNameChange = (value) => {
    setTournamentName(value);
    // Clear error when user starts typing
    if (errors.tournamentName && value.trim()) {
      setErrors({ ...errors, tournamentName: '' });
    }
  };

  const handlePlayerChangeWithValidation = (index, value) => {
    handlePlayerChange(index, value);
    // Clear players error when valid players count is reached
    const validPlayers = players.filter(p => p.trim() !== '');
    if (errors.players && validPlayers.length >= 2) {
      setErrors({ ...errors, players: '' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Clear previous errors
    const newErrors = {
      tournamentName: '',
      players: ''
    };
    
    // Filter out empty player names
    const validPlayers = players.filter(player => player.trim() !== '');
    
    // Validate tournament name
    if (!tournamentName.trim()) {
      newErrors.tournamentName = 'Please enter a tournament name';
    }
    
    // Validate players
    if (validPlayers.length < 2) {
      newErrors.players = 'Please add at least 2 players';
    }
    
    // If there are errors, set them and return
    if (newErrors.tournamentName || newErrors.players) {
      setErrors(newErrors);
      return;
    }

    // Create tournament object
    const tournamentData = { 
      name: tournamentName,
      tournamentType,
      numberOfCourts,
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
    
    // Navigate to tournament detail page
    navigate(`/tournament/${savedTournament.id}`);
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
              onChange={(e) => handleTournamentNameChange(e.target.value)}
              placeholder="Enter tournament name"
              className={`${styles.input} ${errors.tournamentName ? styles.inputError : ''}`}
            />
            {errors.tournamentName && (
              <span className={styles.errorMessage}>{errors.tournamentName}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Tournament Type</label>
            <div className={styles.scoringOptions}>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="tournamentType"
                  value="americano"
                  checked={tournamentType === 'americano'}
                  onChange={(e) => setTournamentType(e.target.value)}
                />
                <span>Americano</span>
              </label>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="tournamentType"
                  value="mexicano"
                  checked={tournamentType === 'mexicano'}
                  onChange={(e) => setTournamentType(e.target.value)}
                />
                <span>Mexicano</span>
              </label>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="numberOfCourts">Number of Courts</label>
            <select
              id="numberOfCourts"
              value={numberOfCourts}
              onChange={(e) => setNumberOfCourts(Number(e.target.value))}
              className={styles.select}
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Court' : 'Courts'}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Players</label>
            <div className={styles.playersContainer}>
              {players.map((player, index) => (
                <div key={index} className={styles.playerRow}>
                  <input
                    type="text"
                    value={player}
                    onChange={(e) => handlePlayerChangeWithValidation(index, e.target.value)}
                    placeholder={`Player ${index + 1}`}
                    className={`${styles.input} ${errors.players ? styles.inputError : ''}`}
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
            {errors.players && (
              <span className={styles.errorMessage}>{errors.players}</span>
            )}
            
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

