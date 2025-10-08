import Lookup from './Lookup';
import styles from './UserLookup.module.css';

const UserLookup = ({
  value,
  onChange,
  disabled = false,
  defaultValue = null,
  onError
}) => {
  // Format display text for users
  const getDisplayField = (user) => {
    if (!user) return '';
    const username = user.username || '';
    const email = user.email || '';
    return email ? `${username} (${email})` : username;
  };

  return (
    <div className={styles.userLookupWrapper}>
      <Lookup
        apiEndpoint="/users/"
        displayField={getDisplayField}
        placeholder="Search users..."
        value={value}
        onChange={onChange}
        disabled={disabled}
        onError={onError}
      />
      {value && (
        <div className={styles.userIndicator}>
          <span className={styles.userIcon}>👤</span>
          <span className={styles.userLabel}>User</span>
        </div>
      )}
    </div>
  );
};

export default UserLookup;
