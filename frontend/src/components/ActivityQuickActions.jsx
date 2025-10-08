import { useState } from 'react';
import NewTaskModal from './NewTaskModal';
import NewEventModal from './NewEventModal';
import LogCallModal from './LogCallModal';
import styles from './ActivityQuickActions.module.css';

/**
 * ActivityQuickActions Component
 * 
 * Displays quick action buttons for creating activities (Email, Task, Event, Call)
 * Pre-fills modal forms based on the current entity context
 * 
 * @param {Object} props
 * @param {Object} props.entity - Current entity object (account, contact, lead, etc.)
 * @param {string} props.entityType - Type of entity ('account', 'contact', 'lead', 'opportunity', 'contract', 'order', 'invoice')
 * @param {Object} props.currentUser - Current logged-in user object
 */
const ActivityQuickActions = ({ entity, entityType, currentUser }) => {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);

  // Determine if entity is a "who" (contact/lead) or "what" (account/opportunity/etc.)
  const isWhoEntity = entityType === 'contact' || entityType === 'lead';
  const isWhatEntity = ['account', 'opportunity', 'contract', 'order', 'invoice'].includes(entityType);

  // Prepare default values based on entity type
  const getDefaultValues = () => {
    const defaults = {};

    if (isWhoEntity) {
      // For "who" entities (Contact, Lead), pre-fill the Name field
      // NameLookup expects an array
      defaults.name = [{
        ...entity,
        entityType
      }];
    } else if (isWhatEntity) {
      // For "what" entities (Account, Opportunity, etc.), pre-fill the Related To field
      defaults.relatedTo = {
        ...entity,
        entityType
      };
    }

    return defaults;
  };

  const defaultValues = getDefaultValues();

  const handleEmailClick = () => {
    // Email functionality to be implemented
    console.log('Email action clicked for', entityType, entity);
    // TODO: Implement email modal or redirect to email client
  };

  return (
    <div className={styles.quickActionsContainer}>
      <div className={styles.quickActionsLabel}>Quick Actions:</div>
      <div className={styles.quickActionsButtons}>
        <button
          className={`${styles.actionButton} ${styles.emailButton}`}
          onClick={handleEmailClick}
          title="Send Email"
        >
          <span className={styles.icon}>✉️</span>
          <span className={styles.label}>Email</span>
        </button>

        <button
          className={`${styles.actionButton} ${styles.taskButton}`}
          onClick={() => setIsTaskModalOpen(true)}
          title="Create Task"
        >
          <span className={styles.icon}>✓</span>
          <span className={styles.label}>Task</span>
        </button>

        <button
          className={`${styles.actionButton} ${styles.eventButton}`}
          onClick={() => setIsEventModalOpen(true)}
          title="Create Event"
        >
          <span className={styles.icon}>📅</span>
          <span className={styles.label}>Event</span>
        </button>

        <button
          className={`${styles.actionButton} ${styles.callButton}`}
          onClick={() => setIsCallModalOpen(true)}
          title="Log Call"
        >
          <span className={styles.icon}>📞</span>
          <span className={styles.label}>Call</span>
        </button>
      </div>

      {/* Modals */}
      <NewTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        defaultValues={defaultValues}
        currentUser={currentUser}
      />

      <NewEventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        defaultValues={defaultValues}
        currentUser={currentUser}
      />

      <LogCallModal
        isOpen={isCallModalOpen}
        onClose={() => setIsCallModalOpen(false)}
        defaultValues={defaultValues}
        currentUser={currentUser}
      />
    </div>
  );
};

export default ActivityQuickActions;
