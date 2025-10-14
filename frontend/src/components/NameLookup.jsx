import { useState } from 'react';
import Lookup from './Lookup';
import NewContactModal from './NewContactModal';
import styles from './NameLookup.module.css';

const NameLookup = ({
  value = [],
  onChange,
  disabled = false,
  defaultEntityType = 'contact',
  accountId = null,
  onError
}) => {
  const [entityType, setEntityType] = useState(defaultEntityType);
  const [currentSelection, setCurrentSelection] = useState(null);
  const [isNewContactModalOpen, setIsNewContactModalOpen] = useState(false);

  // Reset selection when entity type changes
  const handleEntityTypeChange = (e) => {
    const newType = e.target.value;
    setEntityType(newType);
    onChange([]); // Clear all selections when switching types
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

  // Get additional filters for the lookup
  const getAdditionalFilters = () => {
    const filters = {};
    // If we have an accountId prop and we're searching contacts, filter by account
    if (accountId && entityType === 'contact') {
      filters.account_id = accountId;
    }
    return filters;
  };

  // Get placeholder text
  const getPlaceholder = () => {
    return entityType === 'contact' ? 'Search contacts...' : 'Search leads...';
  };

  // Handle adding a new contact/lead
  const handleSelect = (selectedItem) => {
    if (!selectedItem) return;

    // Check if item is already in the list
    const isAlreadyAdded = value.some(item => item.id === selectedItem.id);

    if (!isAlreadyAdded) {
      onChange([...value, { ...selectedItem, entityType }]);
    }

    // Reset the lookup
    setCurrentSelection(null);
  };

  // Handle opening the new contact modal
  const handleCreateNew = () => {
    setIsNewContactModalOpen(true);
  };

  // Handle when a new contact is created
  const handleContactCreated = (newContact) => {
    // Automatically add the newly created contact to the selection
    const updatedValue = [...value, { ...newContact, entityType: 'contact' }];
    onChange(updatedValue);
    setIsNewContactModalOpen(false);
  };

  // Handle removing a contact/lead
  const handleRemove = (itemId) => {
    onChange(value.filter(item => item.id !== itemId));
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
          value={currentSelection}
          onChange={handleSelect}
          disabled={disabled}
          onError={onError}
          additionalFilters={getAdditionalFilters()}
          excludeIds={value.map(item => item.id)}
          showCreateNew={entityType === 'contact'}
          createNewLabel="New Contact"
          onCreateNew={handleCreateNew}
        />
      </div>

      {/* New Contact Modal */}
      <NewContactModal
        isOpen={isNewContactModalOpen}
        onClose={() => setIsNewContactModalOpen(false)}
        onContactCreated={handleContactCreated}
        defaultAccountId={accountId}
      />

      {value.length > 0 && (
        <div className={styles.selectedList}>
          <div className={styles.selectedLabel}>
            Selected ({value.length}):
          </div>
          <div className={styles.selectedChips}>
            {value.map((item) => (
              <div key={item.id} className={styles.selectedChip}>
                <span className={styles.chipIcon}>
                  {item.entityType === 'contact' ? '👤' : '🎯'}
                </span>
                <span className={styles.chipName}>
                  {getDisplayField(item)}
                </span>
                {!disabled && (
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => handleRemove(item.id)}
                    aria-label={`Remove ${getDisplayField(item)}`}
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

export default NameLookup;
