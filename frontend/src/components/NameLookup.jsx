import { useState, useEffect } from 'react';
import Lookup from './Lookup';
import styles from './NameLookup.module.css';

const NameLookup = ({
  value,
  onChange,
  disabled = false,
  defaultEntityType = 'contact',
  onError
}) => {
  const [entityType, setEntityType] = useState(defaultEntityType);

  // Reset selection when entity type changes
  const handleEntityTypeChange = (e) => {
    const newType = e.target.value;
    setEntityType(newType);
    onChange(null); // Clear selection when switching types
  };

  // Format display text based on entity type
  const getDisplayField = (item) => {
    if (entityType === 'contact') {
      return `${item.first_name} ${item.last_name}`;
    } else if (entityType === 'lead') {
      return `${item.first_name} ${item.last_name}${item.company ? ` - ${item.company}` : ''}`;
    }
    return '';
  };

  // Get API endpoint based on entity type
  const getApiEndpoint = () => {
    return entityType === 'contact' ? '/contacts/' : '/leads/';
  };

  // Get placeholder text
  const getPlaceholder = () => {
    return entityType === 'contact' ? 'Search contacts...' : 'Search leads...';
  };

  // Handle selection with entity type metadata
  const handleChange = (selectedItem) => {
    if (selectedItem) {
      onChange({
        ...selectedItem,
        entityType
      });
    } else {
      onChange(null);
    }
  };

  return (
    <div className={styles.nameLookupWrapper}>
      <div className={styles.entityTypeSelector}>
        <label htmlFor="entityType" className={styles.selectorLabel}>
          Type:
        </label>
        <select
          id="entityType"
          value={entityType}
          onChange={handleEntityTypeChange}
          disabled={disabled}
          className={styles.entityTypeDropdown}
        >
          <option value="contact">Contact</option>
          <option value="lead">Lead</option>
        </select>
      </div>
      
      <div className={styles.lookupContainer}>
        <Lookup
          apiEndpoint={getApiEndpoint()}
          displayField={getDisplayField}
          placeholder={getPlaceholder()}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          onError={onError}
        />
      </div>

      {value && (
        <div className={styles.entityTypeIndicator}>
          <span className={styles.entityIcon}>
            {entityType === 'contact' ? '👤' : '🎯'}
          </span>
          <span className={styles.entityLabel}>
            {entityType === 'contact' ? 'Contact' : 'Lead'}
          </span>
        </div>
      )}
    </div>
  );
};

export default NameLookup;
