import styles from './Header.module.css';
import logoUrl from '../assets/AutoPilot Logo.svg';
import homeIconUrl from '../assets/home-icon.svg';

function Header({ onNavigateHome }) {
  return (
    <header className={styles.header}>
      <img src={logoUrl} alt="AutoPilot Logo" className={styles.logo} />
      <button onClick={onNavigateHome} className={styles.homeButton}>
        <img src={homeIconUrl} alt="Home" className={styles.homeIcon} />
      </button>
    </header>
  );
}

export default Header;
