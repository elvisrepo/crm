import { useState } from 'react';
import Lookup from './Lookup';
import styles from './AttendeesLookup.module.css';

const AttendeesLookup = ({
  value = [],
  onChange,
  disabled = false,
  onError
}) => {
  const [currentSelection, setCurrentSelection] = useState(null);

  // Format display text for users
  const getDisplayField = (user) => {
    if (!user) return '';
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    const email = user.email || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName ? `${fullName} (${email})` : email;
  };

  // Handle adding a new attendee
  const handleSelect = (selectedUser) => {
    if (!selectedUser) return;

    // Check if user is already in the list
    const isAlreadyAdded = value.some(attendee => attendee.id === selectedUser.id);
    
    if (!isAlreadyAdded) {
      onChange([...value, selectedUser]);
    }
    
    // Reset the lookup
    setCurrentSelection(null);
  };

  // Handle removing an attendee
  const handleRemove = (userId) => {
    onChange(value.filter(attendee => attendee.id !== userId));
  };

  return (
    <div className={styles.attendeesLookupWrapper}>
      <Lookup
        apiEndpoint="/users/"
        displayField={getDisplayField}
        placeholder="Search people..."
        value={currentSelection}
        onChange={handleSelect}
        disabled={disabled}
        onError={onError}
        additionalFilters={{ _load_all: 'true' }}
        excludeIds={value.map(attendee => attendee.id)}
      />
      
      {value.length > 0 && (
        <div className={styles.attendeesList}>
          <div className={styles.attendeesLabel}>
            Attendees ({value.length}):
          </div>
          <div className={styles.attendeesChips}>
            {value.map((attendee) => (
              <div key={attendee.id} className={styles.attendeeChip}>
                <span className={styles.attendeeIcon}>👤</span>
                <span className={styles.attendeeName}>
                  {getDisplayField(attendee)}
                </span>
                {!disabled && (
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => handleRemove(attendee.id)}
                    aria-label={`Remove ${getDisplayField(attendee)}`}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendeesLookup;
