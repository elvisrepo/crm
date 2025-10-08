import { useState } from 'react';
import NameLookup from './NameLookup';
import UserLookup from './UserLookup';
import AttendeesLookup from './AttendeesLookup';
import RelatedToLookup from './RelatedToLookup';
import styles from './LookupTest.module.css';

/**
 * Test component for all lookup components
 * This can be used for manual testing and demonstration
 */
const LookupTest = () => {
  const [nameValue, setNameValue] = useState(null);
  const [userValue, setUserValue] = useState(null);
  const [attendeesValue, setAttendeesValue] = useState([]);
  const [relatedToValue, setRelatedToValue] = useState(null);

  return (
    <div className={styles.testContainer}>
      <h1>Lookup Components Test Page</h1>
      
      <div className={styles.testSection}>
        <h2>1. NameLookup (Contact/Lead)</h2>
        <p className={styles.description}>
          Search for contacts or leads. Switch between entity types.
        </p>
        <NameLookup
          value={nameValue}
          onChange={setNameValue}
        />
        <div className={styles.output}>
          <strong>Selected:</strong> {nameValue ? JSON.stringify(nameValue, null, 2) : 'None'}
        </div>
      </div>

      <div className={styles.testSection}>
        <h2>2. UserLookup (Assigned To)</h2>
        <p className={styles.description}>
          Search for users to assign activities to.
        </p>
        <UserLookup
          value={userValue}
          onChange={setUserValue}
        />
        <div className={styles.output}>
          <strong>Selected:</strong> {userValue ? JSON.stringify(userValue, null, 2) : 'None'}
        </div>
      </div>

      <div className={styles.testSection}>
        <h2>3. AttendeesLookup (Multi-Select)</h2>
        <p className={styles.description}>
          Add multiple users as attendees. Each can be removed individually.
        </p>
        <AttendeesLookup
          value={attendeesValue}
          onChange={setAttendeesValue}
        />
        <div className={styles.output}>
          <strong>Selected ({attendeesValue.length}):</strong> 
          {attendeesValue.length > 0 ? JSON.stringify(attendeesValue, null, 2) : 'None'}
        </div>
      </div>

      <div className={styles.testSection}>
        <h2>4. RelatedToLookup (Account/Opportunity/etc.)</h2>
        <p className={styles.description}>
          Search for related entities. Switch between entity types.
        </p>
        <RelatedToLookup
          value={relatedToValue}
          onChange={setRelatedToValue}
        />
        <div className={styles.output}>
          <strong>Selected:</strong> {relatedToValue ? JSON.stringify(relatedToValue, null, 2) : 'None'}
        </div>
      </div>

      <div className={styles.testSection}>
        <h2>Keyboard Navigation Test</h2>
        <ul className={styles.instructions}>
          <li>Type to search and see results</li>
          <li>Use <kbd>↓</kbd> and <kbd>↑</kbd> arrow keys to navigate results</li>
          <li>Press <kbd>Enter</kbd> to select highlighted item</li>
          <li>Press <kbd>Escape</kbd> or <kbd>Tab</kbd> to close dropdown</li>
          <li>Click the × button to clear selection</li>
        </ul>
      </div>
    </div>
  );
};

export default LookupTest;
