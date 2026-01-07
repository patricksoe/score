import { useLocation, useNavigate } from 'react-router-dom';
import styles from './Navigation.module.css';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';

  const handleBack = () => {
    navigate('/');
  };

  return (
    <nav className={styles.nav}>
      {!isHomePage && (
        <button onClick={handleBack} className={styles.backButton}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
      )}
      <h1>score</h1>
    </nav>
  );
};

export default Navigation;

