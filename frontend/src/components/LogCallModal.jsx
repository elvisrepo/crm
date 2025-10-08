import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from './Modal';
import UserLookup from './UserLookup';
import NameLookup from './NameLookup';
import RelatedToLookup from './RelatedToLookup';
import { createActivity } from '../api/client';
import styles from './LogCallModal.module.css';

const LogCallModal = ({ isOpen, onClose, defaultValues = {}, currentUser = null }) => {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    subject: 'Call',
    comments: '',
    assigned_to: null,
    name: [],
    relatedTo: null
  });

  const [errors, setErrors] = useState({});

  // Initialize form with default values
  useEffect(() => {
    if (isOpen) {
      console.log('LogCallModal - currentUser:', currentUser);
      setFormData({
        subject: defaultValues.subject || 'Call',
        comments: defaultValues.comments || '',
        assigned_to: defaultValues.assigned_to || currentUser || null,
        name: defaultValues.name || [],
        relatedTo: defaultValues.relatedTo || null
      });
      setErrors({});
    }
  }, [isOpen, defaultValues, currentUser]);

  const createMutation = useMutation({
    mutationFn: createActivity,
    onSuccess: () => {
      queryClient.invalidateQueries(['activities']);
      onClose();
    },
    onError: (error) => {
      console.error('Failed to log call:', error);
      if (error.response?.data) {
        setErrors(error.response.data);
      }
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    const newErrors = {};
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Prepare activity data
    // Log Call is a Task with status 'Completed'
    const activityData = {
      type: 'Task',
      subject: formData.subject,
      comments: formData.comments || null,
      status: 'Completed', // Automatically set to completed
      assigned_to_id: formData.assigned_to?.id || null
    };

    // Add "who" relationship (contact or lead) - use first selected if multiple
    if (formData.name.length > 0) {
      const firstContact = formData.name[0];
      if (firstContact.entityType === 'contact') {
        activityData.contact_id = firstContact.id;
      } else if (firstContact.entityType === 'lead') {
        activityData.lead_id = firstContact.id;
      }
    }

    // Add "what" relationship (account, opportunity, etc.)
    if (formData.relatedTo) {
      const entityType = formData.relatedTo.entityType;
      activityData[`${entityType}_id`] = formData.relatedTo.id;
    }

    createMutation.mutate(activityData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>Log a Call</h2>

        {createMutation.isError && (
          <div className={styles.errorMessage}>
            {createMutation.error?.message || 'Failed to log call'}
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="subject">
            Subject <span className={styles.required}>*</span>
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            value={formData.subject}
            onChange={handleChange}
            className={errors.subject ? styles.inputError : ''}
            disabled={createMutation.isPending}
          />
          {errors.subject && (
            <span className={styles.fieldError}>{errors.subject}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="assigned_to">Assigned To</label>
          <UserLookup
            value={formData.assigned_to}
            onChange={(user) => setFormData(prev => ({ ...prev, assigned_to: user }))}
            disabled={createMutation.isPending}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="name">Name</label>
          <NameLookup
            value={formData.name}
            onChange={(name) => setFormData(prev => ({ ...prev, name }))}
            disabled={createMutation.isPending}
            accountId={formData.relatedTo?.entityType === 'account' ? formData.relatedTo?.id : null}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="relatedTo">Related To</label>
          <RelatedToLookup
            value={formData.relatedTo}
            onChange={(relatedTo) => setFormData(prev => ({ ...prev, relatedTo }))}
            disabled={createMutation.isPending}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="comments">Comments</label>
          <textarea
            id="comments"
            name="comments"
            value={formData.comments}
            onChange={handleChange}
            rows="6"
            placeholder="Enter call notes..."
            disabled={createMutation.isPending}
          />
          <div className={styles.tip}>
            <span className={styles.tipIcon}>💡</span>
            <span className={styles.tipText}>
              Tip: Type Control + period to insert quick text.
            </span>
          </div>
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            onClick={onClose}
            className={`${styles.button} ${styles.cancelButton}`}
            disabled={createMutation.isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`${styles.button} ${styles.submitButton}`}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'Logging...' : 'Log Call'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default LogCallModal;
