# Implementation Plan

- [x] 1. Create Activity Serializers
  - Implement ActivitySerializer with nested representations for all related entities (account, opportunity, contract, order, invoice, contact, lead, assigned_to)
  - Add writable ID fields for foreign key relationships (account_id, opportunity_id, etc.)
  - Implement computed fields: related_to_type, related_to_name, name_type, name_display for simplified UI rendering
  - Add validation to ensure only one "what" and one "who" relationship is set
  - Implement version increment logic in update method for optimistic locking
  - Create ActivityTimelineSerializer for lightweight timeline display
  - Write unit tests for serializer validation and nested serialization
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9, 12.10, 12.11, 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.8_

- [x] 2. Implement Activity Views and Permissions
  - Create IsActivityOwnerOrAdmin permission class to verify user is assigned_to or admin
  - Implement ActivityList view with ListCreateAPIView for listing and creating activities
  - Add filtering support for type, status, priority, assigned_to, and all related entities
  - Add date range filtering for start_date and end_date query parameters
  - Implement ActivityDetail view with OptimisticLockingMixin and RetrieveUpdateDestroyAPIView
  - Add perform_create method to default assigned_to to current user if not specified
  - Implement get_queryset to filter activities by assigned_to by default unless user is admin
  - Write integration tests for CRUD operations, filtering, and permissions
  - _Requirements: 1.1, 1.2, 1.6, 1.7, 2.1, 2.2, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.3, 7.4, 8.1, 8.2, 8.3, 8.4, 8.5, 13.7_

- [x] 3. Configure Activity URL Routing
  - Add activity URL patterns to backend/activities/urls.py
  - Include activity URLs in main backend/crm_project/urls.py
  - Test all endpoints are accessible at /activities/ and /activities/<id>/
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [x] 4. Add Activity API Client Methods
  - Implement getActivities(filters) in frontend/src/api/client.js with query parameter support
  - Implement getActivity(id) for retrieving single activity
  - Implement createActivity(activityData) for creating new activities
  - Implement updateActivity(id, activityData) for updating activities
  - Implement deleteActivity({ id, version }) for deleting activities with optimistic locking
  - Test all API methods with sample data
  - _Requirements: 1.2, 2.2, 3.1, 3.2, 5.1, 6.2, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [x] 5. Add Backend Search Functionality for Lookups
- [x] 5.1 Add Search to Contacts API
  - Add SearchFilter to ContactList view in backend/contacts/views.py
  - Configure search_fields for first_name, last_name, email
  - Test search endpoint: /contacts/?search=john
  - Verify search returns filtered results
  - _Requirements: 1.9, 2.7, 11.4_

- [x] 5.2 Add Search to Accounts API
  - Add SearchFilter to AccountList view in backend/accounts/views.py
  - Configure search_fields for name, website
  - Test search endpoint: /accounts/?search=acme
  - Verify search returns filtered results
  - _Requirements: 1.9, 2.7, 11.4_

- [x] 5.3 Add Search to Users API
  - Add SearchFilter to User list view (or create if doesn't exist)
  - Configure search_fields for username, email, first_name, last_name
  - Test search endpoint: /users/?search=john
  - Verify search returns filtered results
  - _Requirements: 1.1, 2.1_

- [x] 5.4 Add Search to Opportunities API
  - Add SearchFilter to OpportunityList view
  - Configure search_fields for name
  - Test search endpoint: /opportunities/?search=deal
  - Verify search returns filtered results
  - _Requirements: 1.9, 2.7_

- [x] 5.5 Add Search to Contracts API
  - Add SearchFilter to ContractList view
  - Configure search_fields for relevant fields
  - Test search endpoint: /contracts/?search=term
  - Verify search returns filtered results
  - _Requirements: 1.9, 2.7_

- [x] 5.6 Add Search to Orders API
  - Add SearchFilter to OrderList view
  - Configure search_fields for relevant fields
  - Test search endpoint: /orders/?search=order
  - Verify search returns filtered results
  - _Requirements: 1.9, 2.7_

- [x] 5.7 Add Search to Invoices API
  - Add SearchFilter to InvoiceList view
  - Configure search_fields for invoice_number
  - Test search endpoint: /invoices/?search=inv
  - Verify search returns filtered results
  - _Requirements: 1.9, 2.7_

- [x] 5.8 Add Search to Leads API
  - Add SearchFilter to LeadList view
  - Configure search_fields for first_name, last_name, company, email
  - Test search endpoint: /leads/?search=smith
  - Verify search returns filtered results
  - _Requirements: 1.9, 2.7_

- [x] 6. Create Generic Lookup Component
- [x] 6.1 Implement Base Lookup Component
  - Create Lookup component in frontend/src/components/Lookup.jsx
  - Add props: apiEndpoint, searchParam, displayField, placeholder, value, onChange, disabled
  - Implement search input with debouncing (300ms)
  - Fetch results from API based on search term
  - Display results in dropdown list
  - Handle loading and error states
  - Display "No results found" when search returns empty
  - Display "Start typing to search..." when no search term
  - _Requirements: 1.9, 1.10, 2.7, 2.8, 11.4, 11.5_

- [x] 6.2 Implement Selection and Display Logic
  - Handle item selection from dropdown
  - Display selected item as chip/tag with X button
  - Implement remove/clear functionality
  - Close dropdown on selection
  - Handle null/empty state when no selection
  - Support displayField as string or function for flexible formatting
  - _Requirements: 1.10, 2.8, 11.5_

- [x] 6.3 Add Keyboard Navigation
  - Implement arrow key navigation in dropdown
  - Implement Enter key to select highlighted item
  - Implement Escape key to close dropdown
  - Implement Tab key to close dropdown
  - Add visual highlight for keyboard-focused item
  - _Requirements: 1.9, 2.7_

- [x] 6.4 Style Lookup Component
  - Create styles matching existing CRM design
  - Style search input field
  - Style dropdown results list
  - Style selected chip/tag
  - Add hover and focus states
  - Ensure responsive design
  - _Requirements: 1.10, 2.8_

- [x] 7. Create Specialized Lookup Components
- [x] 7.1 Implement NameLookup Component (Who Field)
  - Create NameLookup component with entity type selector (Contacts/Leads)
  - Add dropdown for entity types: Contacts, Leads (defaults to Contacts)
  - Render generic Lookup based on selected entity type
  - Map to /contacts/ or /leads/ API endpoints
  - Set displayField to format: "firstName lastName" for contacts, "firstName lastName - company" for leads
  - Display selected entity as chip with entity type icon
  - Handle entity type switching (clear selection on type change)
  - Support defaultEntityType prop to pre-select Contacts or Leads
  - Support defaultValue prop to pre-fill selected contact/lead
  - User can always change entity type and selection
  - _Requirements: 1.1, 1.9, 1.10, 2.1, 2.7, 2.8, 11.4, 11.5_

- [x] 7.2 Create UserLookup Component (Assigned To Field)
  - Create UserLookup wrapper component
  - Use generic Lookup with apiEndpoint="/users/"
  - Set displayField to format: "username (email)"
  - Set placeholder to "Search users..."
  - Support defaultValue prop to pre-fill with current user
  - Display selected user as chip with user icon
  - Export as reusable component
  - _Requirements: 1.1, 2.1_

- [x] 7.3 Create AttendeesLookup Component (Multi-Select Users)
  - Create AttendeesLookup component for multi-user selection
  - Use generic Lookup with apiEndpoint="/users/"
  - Support multiple selections (array of users)
  - Display selected users as multiple chips with X buttons
  - Set placeholder to "Search people..."
  - Allow adding/removing attendees
  - Export as reusable component
  - _Requirements: 2.9_

- [x] 7.4 Implement RelatedToLookup Component
  - Create RelatedToLookup component with entity type selector
  - Add dropdown for entity types: Account, Opportunity, Contract, Order, Invoice
  - Render generic Lookup based on selected entity type
  - Map entity types to their API endpoints and display formats
  - Display selected entity as chip with entity type icon and name
  - Handle entity type switching (clear selection on type change)
  - Support defaultEntityType prop to pre-select entity type
  - Support defaultValue prop to pre-fill selected entity
  - Support null/empty state when no entity selected
  - User can always change entity type and selection (never locked)
  - _Requirements: 1.1, 1.9, 1.10, 2.1, 2.7, 2.8, 11.4, 11.5_

- [x] 7.5 Test All Lookup Components
  - Test ContactLookup with search and selection
  - Test UserLookup with search and selection
  - Test LeadLookup with search and selection
  - Test RelatedToLookup with entity type switching
  - Test keyboard navigation in all lookups
  - Test error handling and edge cases
  - _Requirements: 1.9, 1.10, 2.7, 2.8, 11.4, 11.5_

- [x] 8. Create Activity Modal Components
- [x] 8.1 Implement NewTaskModal Component
  - Create NewTaskModal component with modal wrapper
  - Add form fields: subject (required), due_date, status, priority, comments
  - Integrate UserLookup for "Assigned To" field (defaults to current user)
  - Integrate NameLookup for "Name" field (who - Contact/Lead)
  - Integrate RelatedToLookup for "Related To" field (what - Account/Opportunity/etc.)
  - Support defaultValues prop to pre-fill fields from quick actions
  - Implement form submission with createActivity API call (type='Task')
  - Add form validation for required fields
  - Handle loading and error states
  - Close modal and refresh activity list on success
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.8, 1.9, 1.10_

- [x] 8.2 Implement NewEventModal Component
  - Create NewEventModal component with modal wrapper
  - Add form fields: subject (required), description, start (date and time), end (date and time), location
  - Integrate UserLookup for "Assigned To" field (defaults to current user)
  - Integrate NameLookup for "Name" field (who - Contact/Lead)
  - Integrate RelatedToLookup for "Related To" field (what - Account/Opportunity/etc.)
  - Integrate AttendeesLookup for multi-user attendee selection
  - Display attendees as removable chips/tags
  - Support defaultValues prop to pre-fill fields from quick actions or calendar clicks
  - Implement form submission with createActivity API call (type='Event')
  - Add validation for end_time after start_time
  - Handle loading and error states
  - Close modal and refresh activity list/calendar on success
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_

- [x] 8.3 Implement LogCallModal Component
  - Create LogCallModal component with modal wrapper
  - Add form fields: subject (pre-filled with "Call"), comments (description)
  - Integrate UserLookup for "Assigned To" field (defaults to current user)
  - Integrate NameLookup for "Name" field (who - Contact/Lead)
  - Integrate RelatedToLookup for "Related To" field (what - Account/Opportunity/etc.)
  - Add tip text: "Tip: Type Control + period to insert quick text."
  - Set type='Task' and status='Completed' automatically (hidden from user)
  - Support defaultValues prop to pre-fill fields from quick actions
  - Implement form submission with createActivity API call
  - Handle loading and error states
  - Close modal and refresh activity timeline on success
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

- [x] 9. Implement ActivityQuickActions Component
  - Create ActivityQuickActions component with icon buttons for Email, Task, Event, Call
  - Add tooltips to each button indicating action type
  - Implement click handlers to open respective modals
  - Pass defaultValues to modals based on current entity context
  - For "what" objects (Account, Opportunity, etc.): pre-fill RelatedTo with entity type and current entity
  - For "who" objects (Contact, Lead): pre-fill Name with entity type and current entity
  - Support all entity types: account, contact, lead, opportunity, contract, order, invoice
  - Example: From Account page, pre-fill RelatedTo with {entityType: 'account', id: 3, name: 'Swiss'}
  - Example: From Contact page, pre-fill Name with {entityType: 'contact', id: 5, name: 'John Doe'}
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [x] 10. Implement ActivityTimeline Component
- [x] 10.1 Create ActivityTimeline Base Component
  - Create ActivityTimeline component accepting entityType and entityId props
  - Fetch activities using useQuery with entity-specific filters
  - Implement grouping logic to separate "Upcoming & Overdue" from past activities
  - Group past activities by month (e.g., "October 2025")
  - Display "No more past activities to load" when no past activities exist
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

- [x] 10.2 Add Activity Filters and Actions
  - Implement filter buttons for activity types (email, task, event, call)
  - Add "Refresh" button to reload activities
  - Add "Expand All" button to expand all activity groups
  - Implement filter state management
  - Apply filters to activity query
  - _Requirements: 3.7, 4.10, 4.11_

- [x] 10.3 Implement Activity Display Items
  - Create ActivityItem component for individual activity display
  - Show type icon (task/event) based on activity type
  - Display subject, description snippet, and due date/start time
  - Add circular action menu for each activity
  - Implement click handler to view full activity details
  - _Requirements: 4.8, 4.9, 4.12_

- [x] 10.4 Add View More Functionality
  - Implement pagination for activity timeline
  - Add "View More" button when more activities exist
  - Load additional activities on button click
  - Update activity list with newly loaded activities
  - _Requirements: 4.13_

- [x] 11. Integrate ActivityTimeline into Entity Pages
  - Add ActivityTimeline component to Account detail page
  - Add ActivityTimeline component to Opportunity detail page
  - Add ActivityTimeline component to Contact detail page
  - Add ActivityTimeline component to Lead detail page
  - Add ActivityTimeline component to Contract detail page
  - Add ActivityTimeline component to Order detail page
  - Add ActivityTimeline component to Invoice detail page
  - Add ActivityQuickActions component to each entity page
  - Test activity creation and timeline refresh on each page
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ] 12. Implement To-Do List Page
- [ ] 12.1 Create ToDoListPage Component
  - Create ToDoListPage component with route configuration at /activities/tasks
  - Add To-Do List to navigation menu
  - Implement task list state management
  - Add "New Task" button
  - _Requirements: 3.1, 3.7_

- [ ] 12.2 Implement Task List Sidebar Filters
  - Create sidebar with filter options: All, Starred, Due Today, Overdue
  - Implement filter state management
  - Apply filters to task query (type='Task', status filters)
  - Add "New Label" functionality for task categorization
  - Display label suggestions (e.g., "Urgent or Pipeline")
  - _Requirements: 3.1, 3.4, 3.7_

- [ ] 12.3 Implement Task List View
  - Display tasks in list format with checkboxes
  - Show task subject, related entity, and due date
  - Implement task sorting (by created date, due date, etc.)
  - Add "5 items - Sort by: Created Date" display
  - Implement click handler to navigate to TaskDetailPage
  - Add checkbox for quick task completion
  - _Requirements: 3.1, 3.4, 3.6_

- [ ] 12.4 Integrate Task Creation from To-Do List
  - Connect "New Task" button to NewTaskModal
  - Refresh task list after task creation
  - Test task creation and display workflow
  - _Requirements: 1.1, 1.2, 1.8_

- [ ] 13. Implement Calendar View
- [ ] 13.1 Create CalendarPage Component
  - Create CalendarPage component with route configuration at /calendar
  - Add calendar page to navigation menu
  - Implement weekly calendar state management
  - Add "New Event" button in header
  - _Requirements: 10.1, 10.5_

- [ ] 13.2 Implement CalendarHeader Component
  - Create CalendarHeader with date range display (e.g., "October 5, 2025–October 11, 2025")
  - Add previous/next arrow buttons for week navigation
  - Add "Today" button to jump to current week
  - Add view toggle buttons (list/calendar views)
  - Implement navigation handlers
  - _Requirements: 10.2, 10.6, 10.7, 10.10_

- [ ] 13.3 Implement WeekView Component
  - Create WeekView component with weekly grid layout
  - Display days of week as column headers (SUN 5, MON 6, etc.)
  - Display hourly time slots with GMT offset (e.g., "GMT+2")
  - Render events as colored blocks positioned at their start_time
  - Display event subject and time range on event blocks
  - Implement click handler to navigate to EventDetailPage
  - _Requirements: 10.1, 10.3, 10.4, 10.12_

- [ ] 13.4 Implement MiniCalendar Component
  - Create MiniCalendar component showing current month
  - Highlight selected week/date in mini calendar
  - Implement date click handler to navigate to that week
  - Display "My Calendars" section with "My Events" toggle
  - Display "Other Calendars" section
  - Add calendar visibility toggles with checkboxes
  - _Requirements: 10.8, 10.9, 10.11_

- [ ] 13.5 Integrate Event Creation from Calendar
  - Connect "New Event" button to NewEventModal
  - Pre-fill start_time and end_time based on clicked time slot
  - Refresh calendar view after event creation
  - Test event creation and display workflow
  - _Requirements: 10.5_

- [ ] 14. Implement Task Detail Page
- [ ] 14.1 Create TaskDetailPage Component
  - Create TaskDetailPage component with route configuration at /activities/tasks/:id
  - Fetch task data using getActivity(id) API call
  - Display task header with subject and type icon
  - Add action buttons: Mark Complete, Edit Comments, Change Date, Create Follow-Up Task
  - Implement tabs: Details, Related
  - _Requirements: 3.1, 5.1_

- [ ] 14.2 Implement Task Details Tab
  - Create Task Information section with fields: Assigned To, Subject, Due Date, Comments
  - Display "Name" (contact/lead) and "Related To" (account/opportunity/etc.) fields
  - Create Additional Information section with Status and Priority
  - Create System Information section with Created By and Last Modified By
  - Add inline edit functionality for each field (pencil icon)
  - _Requirements: 5.1, 5.5, 5.6_

- [ ] 14.3 Implement Task Related Tab
  - Display related records (contacts, accounts, opportunities, etc.)
  - Show relationships in a structured format
  - Add links to related entity detail pages
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [ ] 14.4 Implement Task Quick Actions
  - Implement "Mark Complete" button to update status to 'Completed'
  - Implement "Edit Comments" to open inline editor
  - Implement "Change Date" to open date picker
  - Implement "Create Follow-Up Task" to open NewTaskModal with pre-filled data
  - Refresh task data after each action
  - _Requirements: 5.1, 5.4_

- [ ] 15. Implement Event Detail Page
- [ ] 15.1 Create EventDetailPage Component
  - Create EventDetailPage component with route configuration at /activities/events/:id
  - Fetch event data using getActivity(id) API call
  - Display event header with subject and type icon
  - Add action buttons: New Opportunity, Edit, Delete
  - Implement tabs: Meeting Digest, Details, Related
  - _Requirements: 3.2, 5.1_

- [ ] 15.2 Implement Event Details Tab
  - Display Location, Start, and End fields at the top
  - Display Subject and Description fields
  - Display Start and End times with inline edit (pencil icon)
  - Display Attendees with acceptance status (Accepted or Maybe, Declined, No Response counts)
  - Create Related Records section showing Name and Related To
  - Create Additional Information section with Location, Show Time As, All Day Event, Private
  - Create System Information section with Created By and Last Modified By
  - Add inline edit functionality for each field
  - _Requirements: 5.1, 5.6_

- [ ] 15.3 Implement Event Meeting Digest Tab
  - Create Meeting Digest view (placeholder for future enhancement)
  - Display meeting summary and notes
  - _Requirements: 10.1_

- [ ] 15.4 Implement Event Related Tab
  - Display related records (contacts, accounts, opportunities, etc.)
  - Show relationships in a structured format
  - Add links to related entity detail pages
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [ ] 15.5 Implement Event Quick Actions
  - Implement "Edit" button to open EditEventModal
  - Implement "Delete" button with confirmation dialog
  - Implement "New Opportunity" button to create opportunity from event
  - Refresh event data after each action
  - _Requirements: 5.1, 7.1, 7.2_

- [ ] 16. Implement Activity Update Functionality
  - Add edit button/action to activity items in timeline
  - Create EditActivityModal component (reuse form components from create modals)
  - Implement inline editing on TaskDetailPage and EventDetailPage
  - Implement updateActivity API call with version field
  - Handle optimistic locking conflicts (409 response)
  - Display conflict error modal with refresh option
  - Refresh activity timeline and detail pages after successful update
  - Test update workflow with concurrent modifications
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [ ] 17. Implement Activity Delete Functionality
  - Add delete button to TaskDetailPage and EventDetailPage
  - Add delete action to activity items in timeline
  - Implement confirmation dialog before deletion
  - Call deleteActivity API with version field
  - Handle optimistic locking conflicts
  - Redirect to appropriate page after deletion from detail page
  - Refresh activity timeline after deletion from timeline
  - Test delete workflow
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.3_

- [ ] 18. Add Comprehensive Error Handling
  - Implement toast notification system for success/error messages
  - Add inline field validation errors in forms
  - Handle network errors with retry option
  - Display conflict errors with refresh and retry options
  - Handle permission errors (redirect to login or show access denied)
  - Add loading states to all buttons and forms
  - Test all error scenarios
  - _Requirements: 1.6, 1.7, 1.8, 2.5, 2.6, 2.7, 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 6.4, 7.5, 9.7, 13.7_

- [ ] 19. Write Backend Tests
- [ ] 19.1 Write Activity Model Tests
  - Test model validation (required fields, choices)
  - Test database constraints (only one "what", only one "who")
  - Test dynamic properties (what_object, who_object)
  - Test model string representation
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.8_

- [ ] 19.2 Write Activity Serializer Tests
  - Test nested serialization of related entities
  - Test writable ID fields for foreign keys
  - Test computed fields (related_to_type, related_to_name, etc.)
  - Test validation errors for multiple "what" or "who" relationships
  - Test version increment on update
  - _Requirements: 1.3, 1.4, 1.5, 1.6, 1.7, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9, 12.10, 12.11_

- [ ] 19.3 Write Activity View Tests
  - Test activity list endpoint with filtering
  - Test activity creation with default assigned_to
  - Test activity retrieval
  - Test activity update with optimistic locking
  - Test activity deletion with optimistic locking
  - Test permission enforcement (owner vs non-owner)
  - Test date range filtering
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [ ] 20. Write Frontend Tests
- [ ] 20.1 Write Component Unit Tests
  - Test NewTaskModal rendering and form submission
  - Test NewEventModal rendering and form submission
  - Test LogCallModal rendering and form submission
  - Test ContactLookup search and selection
  - Test RelatedToLookup search and selection
  - Test ActivityQuickActions button clicks
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 6.1, 6.2, 6.3, 11.1, 11.2_

- [ ] 20.2 Write ActivityTimeline Tests
  - Test activity grouping by time period
  - Test filter application
  - Test "View More" pagination
  - Test activity item rendering
  - Test refresh functionality
  - _Requirements: 3.1, 3.2, 3.7, 4.1, 4.8, 4.9, 4.10, 4.11, 4.13_

- [ ] 20.3 Write To-Do List Tests
  - Test task list rendering with filters
  - Test sidebar filter application
  - Test task sorting
  - Test task completion checkbox
  - Test navigation to TaskDetailPage
  - _Requirements: 3.1, 3.4, 3.7_

- [ ] 20.4 Write Calendar View Tests
  - Test weekly calendar rendering
  - Test event positioning on calendar grid
  - Test week navigation (previous/next/today)
  - Test mini calendar date selection
  - Test event creation from calendar
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9_

- [ ] 20.5 Write Task Detail Page Tests
  - Test TaskDetailPage rendering
  - Test task data display
  - Test inline editing functionality
  - Test quick action buttons (Mark Complete, Edit Comments, Change Date)
  - Test navigation between tabs
  - _Requirements: 5.1, 5.4, 5.5, 5.6_

- [ ] 20.6 Write Event Detail Page Tests
  - Test EventDetailPage rendering
  - Test event data display
  - Test inline editing functionality
  - Test action buttons (Edit, Delete, New Opportunity)
  - Test navigation between tabs
  - _Requirements: 5.1, 10.1_

- [ ] 20.7 Write Lookup Component Tests
  - Test generic Lookup component search functionality
  - Test debouncing behavior
  - Test keyboard navigation
  - Test selection and clearing
  - Test ContactLookup, UserLookup, LeadLookup wrappers
  - Test RelatedToLookup entity type switching
  - _Requirements: 1.9, 1.10, 2.7, 2.8, 11.4, 11.5_

- [ ] 21. Performance Optimization
  - Add select_related('assigned_to') to activity queries
  - Add prefetch_related for related entities in list views
  - Implement pagination for activity list endpoint
  - Add React Query caching configuration for activities
  - Implement debouncing for lookup search inputs
  - Test query performance with large datasets
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 22. Polish and Final Integration
  - Add loading skeletons for activity timeline
  - Add animations for modal open/close
  - Add transitions for activity list updates
  - Implement optimistic updates for activity creation
  - Add comprehensive error messages for all validation errors
  - Test complete workflow from entity page to activity creation to timeline display
  - Test calendar workflow from event creation to calendar display
  - Verify all requirements are met
  - _Requirements: All_
