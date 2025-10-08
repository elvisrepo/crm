import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getActivities } from '../api/client';
import styles from './ActivityTimeline.module.css';

/**
 * ActivityTimeline Component
 * 
 * Displays activities for a specific entity in a timeline format
 * Groups activities into "Upcoming & Overdue" and past activities by month
 * 
 * @param {Object} props
 * @param {string} props.entityType - Type of entity ('account', 'contact', 'lead', etc.)
 * @param {number} props.entityId - ID of the entity
 */
const ActivityTimeline = ({ entityType, entityId }) => {
  const [page, setPage] = useState(1);
  const [allActivities, setAllActivities] = useState([]);
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'Task', 'Event'
  const [expandedSections, setExpandedSections] = useState({});

  // Build filter object based on entity type
  const getFilters = () => {
    const filters = {};

    // Map entity type to the correct filter parameter (without _id suffix for Django)
    const entityFilterMap = {
      account: 'account',
      contact: 'contacts',  // Use many-to-many field for filtering
      lead: 'leads',        // Use many-to-many field for filtering
      opportunity: 'opportunity',
      contract: 'contract',
      order: 'order',
      invoice: 'invoice'
    };

    const filterKey = entityFilterMap[entityType];
    if (filterKey) {
      filters[filterKey] = entityId;
    }

    // Add type filter if not 'all'
    if (typeFilter !== 'all') {
      filters.type = typeFilter;
    }

    return filters;
  };

  const { data: activities = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['activities', entityType, entityId, page, typeFilter],
    queryFn: () => getActivities(getFilters()),
    enabled: !!entityType && !!entityId
  });

  const handleRefresh = () => {
    refetch();
  };

  const handleExpandAll = () => {
    const allExpanded = {};
    pastMonths.forEach(month => {
      allExpanded[month] = true;
    });
    setExpandedSections(allExpanded);
  };

  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Group activities by time period
  const groupActivities = (activities) => {
    const now = new Date();
    const upcoming = [];
    const past = {};

    activities.forEach(activity => {
      const activityDate = activity.due_date
        ? new Date(activity.due_date)
        : activity.start_time
          ? new Date(activity.start_time)
          : null;

      if (!activityDate) {
        // No date, put in past
        const monthKey = 'No Date';
        if (!past[monthKey]) past[monthKey] = [];
        past[monthKey].push(activity);
        return;
      }

      // Check if upcoming or overdue
      if (activityDate >= now || (activity.status !== 'Completed' && activityDate < now)) {
        upcoming.push(activity);
      } else {
        // Past activity - group by month
        const monthKey = activityDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long'
        });
        if (!past[monthKey]) past[monthKey] = [];
        past[monthKey].push(activity);
      }
    });

    // Sort upcoming by date (earliest first)
    upcoming.sort((a, b) => {
      const dateA = a.due_date || a.start_time;
      const dateB = b.due_date || b.start_time;
      return new Date(dateA) - new Date(dateB);
    });

    // Sort past activities within each month (most recent first)
    Object.keys(past).forEach(monthKey => {
      past[monthKey].sort((a, b) => {
        const dateA = a.due_date || a.start_time || a.created_at;
        const dateB = b.due_date || b.start_time || b.created_at;
        return new Date(dateB) - new Date(dateA);
      });
    });

    return { upcoming, past };
  };

  const { upcoming, past } = groupActivities(activities);
  const pastMonths = Object.keys(past).sort((a, b) => {
    if (a === 'No Date') return 1;
    if (b === 'No Date') return -1;
    return new Date(b) - new Date(a);
  });

  if (isLoading) {
    return (
      <div className={styles.timeline}>
        <div className={styles.loading}>Loading activities...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.timeline}>
        <div className={styles.error}>
          Error loading activities: {error?.message || 'Unknown error'}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className={styles.timeline}>
        <div className={styles.empty}>
          No activities found. Create your first activity using the quick actions above.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.timeline}>
      {/* Filters and Actions Bar */}
      <div className={styles.filtersBar}>
        <div className={styles.filterButtons}>
          <button
            className={`${styles.filterButton} ${typeFilter === 'all' ? styles.active : ''}`}
            onClick={() => setTypeFilter('all')}
          >
            All
          </button>
          <button
            className={`${styles.filterButton} ${typeFilter === 'Task' ? styles.active : ''}`}
            onClick={() => setTypeFilter('Task')}
          >
            ✓ Tasks
          </button>
          <button
            className={`${styles.filterButton} ${typeFilter === 'Event' ? styles.active : ''}`}
            onClick={() => setTypeFilter('Event')}
          >
            📅 Events
          </button>
        </div>
        <div className={styles.actionButtons}>
          <button
            className={styles.actionBtn}
            onClick={handleExpandAll}
            title="Expand all sections"
          >
            Expand All
          </button>
          <button
            className={styles.actionBtn}
            onClick={handleRefresh}
            title="Refresh activities"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Upcoming & Overdue Section */}
      {upcoming.length > 0 && (
        <div className={styles.timelineSection}>
          <h3 className={styles.sectionHeader}>Upcoming & Overdue</h3>
          <div className={styles.activitiesList}>
            {upcoming.map(activity => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      )}

      {/* Past Activities by Month */}
      {pastMonths.map(monthKey => {
        const isExpanded = expandedSections[monthKey] !== false; // Default to expanded
        return (
          <div key={monthKey} className={styles.timelineSection}>
            <h3
              className={styles.sectionHeader}
              onClick={() => toggleSection(monthKey)}
              style={{ cursor: 'pointer' }}
            >
              <span className={styles.expandIcon}>
                {isExpanded ? '▼' : '▶'}
              </span>
              {monthKey}
            </h3>
            {isExpanded && (
              <div className={styles.activitiesList}>
                {past[monthKey].map(activity => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* No Past Activities Message */}
      {pastMonths.length === 0 && upcoming.length > 0 && (
        <div className={styles.noPastActivities}>
          No more past activities to load
        </div>
      )}

      {/* View More Button */}
      {activities.length >= 20 && (
        <div className={styles.viewMoreContainer}>
          <button
            className={styles.viewMoreButton}
            onClick={() => setPage(prev => prev + 1)}
          >
            View More Activities
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * ActivityItem Component
 * Displays a single activity in the timeline
 */
const ActivityItem = ({ activity }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'Task':
        return '✓';
      case 'Event':
        return '📅';
      default:
        return '•';
    }
  };

  const getActivityDate = () => {
    if (activity.due_date) {
      return new Date(activity.due_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
    if (activity.start_time) {
      return new Date(activity.start_time).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    }
    return 'No date';
  };

  const isOverdue = () => {
    if (activity.status === 'Completed') return false;
    const dueDate = activity.due_date || activity.start_time;
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className={`${styles.activityItem} ${isOverdue() ? styles.overdue : ''}`}>
      <div className={styles.activityIcon}>
        <span className={styles.icon}>{getActivityIcon(activity.type)}</span>
      </div>
      <div className={styles.activityContent}>
        <div className={styles.activityHeader}>
          <span className={styles.activitySubject}>{activity.subject}</span>
          <span className={styles.activityType}>{activity.type}</span>
        </div>
        <div className={styles.activityMeta}>
          <span className={styles.activityDate}>{getActivityDate()}</span>
          {activity.status && (
            <span className={styles.activityStatus}>{activity.status}</span>
          )}
          {activity.priority && activity.priority !== 'Normal' && (
            <span className={`${styles.activityPriority} ${styles[activity.priority.toLowerCase()]}`}>
              {activity.priority}
            </span>
          )}
        </div>
        {activity.description && (
          <div className={styles.activityDescription}>
            {activity.description.substring(0, 100)}
            {activity.description.length > 100 && '...'}
          </div>
        )}
        {activity.comments && (
          <div className={styles.activityDescription}>
            {activity.comments.substring(0, 100)}
            {activity.comments.length > 100 && '...'}
          </div>
        )}
      </div>
      <div className={styles.activityActions}>
        <button className={styles.actionButton} title="View details">
          ⋮
        </button>
      </div>
    </div>
  );
};

export default ActivityTimeline;
