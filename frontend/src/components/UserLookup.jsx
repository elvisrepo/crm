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
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    const email = user.email || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName ? `${fullName} (${email})` : email;
  };

  // Add a filter to trigger initial load of all users (like NameLookup does)
  const additionalFilters = { _load_all: 'true' };

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
        additionalFilters={additionalFilters}
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
