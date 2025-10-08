import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from './Modal';
import UserLookup from './UserLookup';
import NameLookup from './NameLookup';
import RelatedToLookup from './RelatedToLookup';
import { createActivity } from '../api/client';
import styles from './NewTaskModal.module.css';

const NewTaskModal = ({ isOpen, onClose, defaultValues = {}, currentUser = null }) => {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    subject: '',
    due_date: '',
    status: 'Not Started',
    priority: 'Normal',
    comments: '',
    assigned_to: null,
    name: [],
    relatedTo: null
  });

  const [errors, setErrors] = useState({});

  // Initialize form with default values
  useEffect(() => {
    if (isOpen) {
      setFormData({
        subject: defaultValues.subject || '',
        due_date: defaultValues.due_date || '',
        status: defaultValues.status || 'Not Started',
        priority: defaultValues.priority || 'Normal',
        comments: defaultValues.comments || '',
        assigned_to: defaultValues.assigned_to || currentUser || null,
        name: defaultValues.name || [],
        relatedTo: defaultValues.relatedTo || null
      });
      setErrors({});
    }
    // Only re-run when modal opens or when currentUser.id changes (not the whole object)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentUser?.id]);

  const createMutation = useMutation({
    mutationFn: createActivity,
    onSuccess: () => {
      queryClient.invalidateQueries(['activities']);
      onClose();
    },
    onError: (error) => {
      console.error('Failed to create task:', error);
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
    const activityData = {
      type: 'Task',
      subject: formData.subject,
      due_date: formData.due_date || null,
      status: formData.status,
      priority: formData.priority,
      comments: formData.comments || null,
      assigned_to_id: formData.assigned_to?.id || null
    };

    // Add "who" relationship (contacts or leads) - send all selected as arrays
    if (formData.name.length > 0) {
      const contacts = formData.name.filter(item => item.entityType === 'contact');
      const leads = formData.name.filter(item => item.entityType === 'lead');
      
      if (contacts.length > 0) {
        activityData.contacts_ids = contacts.map(c => c.id);
      }
      if (leads.length > 0) {
        activityData.leads_ids = leads.map(l => l.id);
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
        <h2>New Task</h2>

        {createMutation.isError && (
          <div className={styles.errorMessage}>
            {createMutation.error?.message || 'Failed to create task'}
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
            accountId={
              formData.relatedTo?.entityType === 'account' 
                ? formData.relatedTo?.id 
                : formData.relatedTo?.entityType === 'opportunity' && formData.relatedTo?.account?.id
                  ? formData.relatedTo.account.id
                  : null
            }
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

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="due_date">Due Date</label>
            <input
              id="due_date"
              name="due_date"
              type="date"
              value={formData.due_date}
              onChange={handleChange}
              disabled={createMutation.isPending}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={createMutation.isPending}
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Waiting on someone else">Waiting on someone else</option>
              <option value="Deferred">Deferred</option>
            </select>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            disabled={createMutation.isPending}
          >
            <option value="High">High</option>
            <option value="Normal">Normal</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="comments">Comments</label>
          <textarea
            id="comments"
            name="comments"
            value={formData.comments}
            onChange={handleChange}
            rows="4"
            disabled={createMutation.isPending}
          />
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
            {createMutation.isPending ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default NewTaskModal;
