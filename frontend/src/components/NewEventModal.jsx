import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from './Modal';
import UserLookup from './UserLookup';
import NameLookup from './NameLookup';
import RelatedToLookup from './RelatedToLookup';
import AttendeesLookup from './AttendeesLookup';
import { createActivity } from '../api/client';
import styles from './NewEventModal.module.css';

const NewEventModal = ({ isOpen, onClose, defaultValues = {}, currentUser = null }) => {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    location: '',
    assigned_to: null,
    name: null,
    relatedTo: null,
    attendees: []
  });

  const [errors, setErrors] = useState({});

  // Initialize form with default values
  useEffect(() => {
    if (isOpen) {
      setFormData({
        subject: defaultValues.subject || '',
        description: defaultValues.description || '',
        start_date: defaultValues.start_date || '',
        start_time: defaultValues.start_time || '',
        end_date: defaultValues.end_date || '',
        end_time: defaultValues.end_time || '',
        location: defaultValues.location || '',
        assigned_to: defaultValues.assigned_to || currentUser,
        name: defaultValues.name || null,
        relatedTo: defaultValues.relatedTo || null,
        attendees: defaultValues.attendees || []
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
      console.error('Failed to create event:', error);
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
    
    // Validate end time is after start time
    if (formData.start_date && formData.start_time && formData.end_date && formData.end_time) {
      const startDateTime = new Date(`${formData.start_date}T${formData.start_time}`);
      const endDateTime = new Date(`${formData.end_date}T${formData.end_time}`);
      
      if (endDateTime <= startDateTime) {
        newErrors.end_time = 'End time must be after start time';
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Prepare activity data
    const activityData = {
      type: 'Event',
      subject: formData.subject,
      description: formData.description || null,
      location: formData.location || null,
      assigned_to_id: formData.assigned_to?.id || null
    };

    // Combine date and time for start_time and end_time
    if (formData.start_date && formData.start_time) {
      activityData.start_time = `${formData.start_date}T${formData.start_time}`;
    }
    if (formData.end_date && formData.end_time) {
      activityData.end_time = `${formData.end_date}T${formData.end_time}`;
    }

    // Add attendees
    if (formData.attendees.length > 0) {
      activityData.attendees = formData.attendees.map(a => a.id);
    }

    // Add "who" relationship (contact or lead)
    if (formData.name) {
      if (formData.name.entityType === 'contact') {
        activityData.contact_id = formData.name.id;
      } else if (formData.name.entityType === 'lead') {
        activityData.lead_id = formData.name.id;
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
        <h2>New Event</h2>

        {createMutation.isError && (
          <div className={styles.errorMessage}>
            {createMutation.error?.message || 'Failed to create event'}
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
            <label htmlFor="start_date">Start Date</label>
            <input
              id="start_date"
              name="start_date"
              type="date"
              value={formData.start_date}
              onChange={handleChange}
              disabled={createMutation.isPending}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="start_time">Start Time</label>
            <input
              id="start_time"
              name="start_time"
              type="time"
              value={formData.start_time}
              onChange={handleChange}
              disabled={createMutation.isPending}
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="end_date">End Date</label>
            <input
              id="end_date"
              name="end_date"
              type="date"
              value={formData.end_date}
              onChange={handleChange}
              className={errors.end_time ? styles.inputError : ''}
              disabled={createMutation.isPending}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="end_time">End Time</label>
            <input
              id="end_time"
              name="end_time"
              type="time"
              value={formData.end_time}
              onChange={handleChange}
              className={errors.end_time ? styles.inputError : ''}
              disabled={createMutation.isPending}
            />
            {errors.end_time && (
              <span className={styles.fieldError}>{errors.end_time}</span>
            )}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="location">Location</label>
          <input
            id="location"
            name="location"
            type="text"
            value={formData.location}
            onChange={handleChange}
            disabled={createMutation.isPending}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="attendees">Attendees</label>
          <AttendeesLookup
            value={formData.attendees}
            onChange={(attendees) => setFormData(prev => ({ ...prev, attendees }))}
            disabled={createMutation.isPending}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
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
            {createMutation.isPending ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default NewEventModal;
