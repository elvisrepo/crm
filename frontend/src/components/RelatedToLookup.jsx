import { useState, useEffect } from 'react';
import Lookup from './Lookup';
import styles from './RelatedToLookup.module.css';

const RelatedToLookup = ({
  value,
  onChange,
  disabled = false,
  defaultEntityType = 'account',
  onError
}) => {
  // Initialize entityType from value if it exists, otherwise use defaultEntityType
  const [entityType, setEntityType] = useState(value?.entityType || defaultEntityType);

  // Update entityType when value changes (e.g., when modal opens with pre-filled data)
  useEffect(() => {
    if (value?.entityType) {
      setEntityType(value.entityType);
    }
  }, [value?.entityType]);

  // Entity type configuration
  const entityConfig = {
    account: {
      endpoint: '/accounts/',
      displayField: (item) => item.name || '',
      placeholder: 'Search accounts...',
      icon: '🏢',
      label: 'Account'
    },
    opportunity: {
      endpoint: '/opportunities/',
      displayField: (item) => item.name || '',
      placeholder: 'Search opportunities...',
      icon: '💼',
      label: 'Opportunity'
    },
    contract: {
      endpoint: '/contracts/',
      displayField: (item) => {
        if (item.account && item.account.name) {
          return `Contract for ${item.account.name}`;
        }
        return `Contract #${item.id}`;
      },
      placeholder: 'Search contracts...',
      icon: '📄',
      label: 'Contract'
    },
    order: {
      endpoint: '/orders/',
      displayField: (item) => {
        if (item.account && item.account.name) {
          return `Order for ${item.account.name}`;
        }
        return `Order #${item.id}`;
      },
      placeholder: 'Search orders...',
      icon: '📦',
      label: 'Order'
    },
    invoice: {
      endpoint: '/invoices/',
      displayField: (item) => item.invoice_number || `Invoice #${item.id}`,
      placeholder: 'Search invoices...',
      icon: '🧾',
      label: 'Invoice'
    }
  };

  const currentConfig = entityConfig[entityType];

  // Reset selection when entity type changes
  const handleEntityTypeChange = (e) => {
    const newType = e.target.value;
    setEntityType(newType);
    onChange(null); // Clear selection when switching types
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
    <div className={styles.relatedToLookupWrapper}>
      <div className={styles.entityTypeSelector}>
        <label htmlFor="relatedEntityType" className={styles.selectorLabel}>
          Related To:
        </label>
        <select
          id="relatedEntityType"
          value={entityType}
          onChange={handleEntityTypeChange}
          disabled={disabled}
          className={styles.entityTypeDropdown}
        >
          <option value="account">Account</option>
          <option value="opportunity">Opportunity</option>
          <option value="contract">Contract</option>
          <option value="order">Order</option>
          <option value="invoice">Invoice</option>
        </select>
      </div>

      <div className={styles.lookupContainer}>
        <Lookup
          apiEndpoint={currentConfig.endpoint}
          displayField={currentConfig.displayField}
          placeholder={currentConfig.placeholder}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          onError={onError}
        />
      </div>

      {value && (
        <div className={styles.entityTypeIndicator}>
          <span className={styles.entityIcon}>
            {currentConfig.icon}
          </span>
          <span className={styles.entityLabel}>
            {currentConfig.label}
          </span>
        </div>
      )}
    </div>
  );
};

export default RelatedToLookup;
