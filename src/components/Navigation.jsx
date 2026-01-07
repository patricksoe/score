import { useLocation, useNavigate } from 'react-router-dom';
import styles from './Navigation.module.css';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <nav className={styles.nav}>
      {!isHomePage && (
        <button onClick={handleBack} className={styles.backButton}>
          &lt;
        </button>
      )}
      <h1>score</h1>
    </nav>
  );
};

export default Navigation;

