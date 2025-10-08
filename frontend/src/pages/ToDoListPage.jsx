import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getActivities, updateActivity } from '../api/client';
import NewTaskModal from '../components/NewTaskModal';
import { useCurrentUser } from '../hooks/useCurrentUser';
import styles from './ToDoListPage.module.css';

export default function ToDoListPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  const navigate = useNavigate();

  // Fetch tasks for the current user
  const { data: tasks = [], isLoading, isError, error } = useQuery({
    queryKey: ['activities', 'tasks', selectedFilter],
    queryFn: () => {
      const filters = {
        type: 'Task'
      };

      // Note: Backend already filters by assigned_to for non-admin users
      // Apply filter-specific logic
      if (selectedFilter === 'overdue') {
        // For overdue, we'll filter client-side since backend doesn't support __lt
        // Just fetch all tasks and filter below
      } else if (selectedFilter === 'due-today') {
        const today = new Date().toISOString().split('T')[0];
        filters.due_date = today;
      } else if (selectedFilter === 'starred') {
        // Placeholder for starred functionality - will be filtered client-side
      }

      return getActivities(filters);
    },
    enabled: !!currentUser
  });

  // Mutation for updating task status
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => updateActivity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['activities']);
    }
  });

  const handleTaskComplete = (e, task) => {
    e.stopPropagation(); // Prevent navigation when clicking checkbox
    const newStatus = task.status === 'Completed' ? 'Not Started' : 'Completed';
    updateTaskMutation.mutate({
      id: task.id,
      data: { status: newStatus, version: task.version }
    });
  };

  const handleTaskClick = (taskId) => {
    navigate(`/activities/${taskId}`);
  };

  // Filter tasks based on selected filter
  const filteredTasks = tasks.filter(task => {
    // Exclude completed tasks for most filters
    if (selectedFilter !== 'all' && task.status === 'Completed') {
      return false;
    }

    if (selectedFilter === 'overdue') {
      const today = new Date().toISOString().split('T')[0];
      return task.due_date && task.due_date < today && task.status !== 'Completed';
    } else if (selectedFilter === 'starred') {
      // Placeholder - would need to add starred field to model
      return false;
    }

    return true;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'created_at') {
      return new Date(b.created_at) - new Date(a.created_at);
    } else if (sortBy === 'due_date') {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date) - new Date(b.due_date);
    }
    return 0;
  });

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading tasks...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error.message}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>To-Do List</h1>
        <button onClick={() => setIsModalOpen(true)} className={styles.newButton}>
          New Task
        </button>
      </div>

      <div className={styles.content}>
        {/* Sidebar with filters */}
        <aside className={styles.sidebar}>
          <nav className={styles.filterNav}>
            <button
              className={`${styles.filterButton} ${selectedFilter === 'all' ? styles.active : ''}`}
              onClick={() => setSelectedFilter('all')}
            >
              All
            </button>
            <button
              className={`${styles.filterButton} ${selectedFilter === 'starred' ? styles.active : ''}`}
              onClick={() => setSelectedFilter('starred')}
            >
              Starred
            </button>
            <button
              className={`${styles.filterButton} ${selectedFilter === 'due-today' ? styles.active : ''}`}
              onClick={() => setSelectedFilter('due-today')}
            >
              Due Today
            </button>
            <button
              className={`${styles.filterButton} ${selectedFilter === 'overdue' ? styles.active : ''}`}
              onClick={() => setSelectedFilter('overdue')}
            >
              Overdue
            </button>
          </nav>

          <div className={styles.labelSection}>
            <h3>Labels</h3>
            <button className={styles.newLabelButton}>+ New Label</button>
            <div className={styles.labelSuggestions}>
              <p className={styles.suggestionText}>Suggestions:</p>
              <ul className={styles.suggestionList}>
                <li>Urgent</li>
                <li>Pipeline</li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Main task list */}
        <main className={styles.mainContent}>
          <div className={styles.listHeader}>
            <span className={styles.itemCount}>
              {sortedTasks.length} {sortedTasks.length === 1 ? 'item' : 'items'}
            </span>
            <div className={styles.sortControl}>
              <label htmlFor="sort">Sort by:</label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.sortSelect}
              >
                <option value="created_at">Created Date</option>
                <option value="due_date">Due Date</option>
              </select>
            </div>
          </div>

          {sortedTasks.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No tasks found</p>
              <button onClick={() => setIsModalOpen(true)} className={styles.createFirstTask}>
                Create your first task
              </button>
            </div>
          ) : (
            <ul className={styles.taskList}>
              {sortedTasks.map((task) => (
                <li 
                  key={task.id} 
                  className={styles.taskItem}
                  onClick={(e) => {
                    // Don't navigate if clicking the checkbox
                    if (e.target.type !== 'checkbox') {
                      handleTaskClick(task.id);
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={task.status === 'Completed'}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleTaskComplete(task);
                    }}
                    className={styles.checkbox}
                  />
                  <div className={styles.taskContent}>
                    <h3 className={styles.taskSubject}>{task.subject}</h3>
                    <div className={styles.taskMeta}>
                      {task.related_to_name && (
                        <span className={styles.relatedTo}>
                          {task.related_to_type}: {task.related_to_name}
                        </span>
                      )}
                      {task.due_date && (
                        <span className={styles.dueDate}>
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                      {task.priority && task.priority !== 'Normal' && (
                        <span className={`${styles.priority} ${styles[`priority${task.priority}`]}`}>
                          {task.priority}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>

      <NewTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
}
