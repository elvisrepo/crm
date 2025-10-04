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

- [ ] 2. Implement Activity Views and Permissions
  - Create IsActivityOwnerOrAdmin permission class to verify user is assigned_to or admin
  - Implement ActivityList view with ListCreateAPIView for listing and creating activities
  - Add filtering support for type, status, priority, assigned_to, and all related entities
  - Add date range filtering for start_date and end_date query parameters
  - Implement ActivityDetail view with OptimisticLockingMixin and RetrieveUpdateDestroyAPIView
  - Add perform_create method to default assigned_to to current user if not specified
  - Implement get_queryset to filter activities by assigned_to by default unless user is admin
  - Write integration tests for CRUD operations, filtering, and permissions
  - _Requirements: 1.1, 1.2, 1.6, 1.7, 2.1, 2.2, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.3, 7.4, 8.1, 8.2, 8.3, 8.4, 8.5, 13.7_

- [ ] 3. Configure Activity URL Routing
  - Add activity URL patterns to backend/activities/urls.py
  - Include activity URLs in main backend/crm_project/urls.py
  - Test all endpoints are accessible at /activities/ and /activities/<id>/
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [ ] 4. Add Activity API Client Methods
  - Implement getActivities(filters) in frontend/src/api/client.js with query parameter support
  - Implement getActivity(id) for retrieving single activity
  - Implement createActivity(activityData) for creating new activities
  - Implement updateActivity(id, activityData) for updating activities
  - Implement deleteActivity({ id, version }) for deleting activities with optimistic locking
  - Test all API methods with sample data
  - _Requirements: 1.2, 2.2, 3.1, 3.2, 5.1, 6.2, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [ ] 5. Create Lookup Components for Activity Forms
- [ ] 5.1 Implement ContactLookup Component
  - Create ContactLookup component with searchable dropdown
  - Implement search functionality to filter contacts by name
  - Display selected contact as removable chip/tag with X button
  - Handle null/empty state when no contact is selected
  - _Requirements: 1.1, 1.9, 1.10, 2.1, 2.7, 2.8, 11.4, 11.5_

- [ ] 5.2 Implement RelatedToLookup Component
  - Create RelatedToLookup component supporting multiple entity types (Account, Opportunity, Contract, Order, Invoice)
  - Add entity type selector dropdown
  - Implement searchable dropdown for each entity type
  - Display selected entity as removable chip/tag with X button
  - Handle null/empty state when no entity is selected
  - _Requirements: 1.1, 1.9, 1.10, 2.1, 2.7, 2.8, 11.4, 11.5_

- [ ] 5.3 Implement UserLookup Component
  - Create UserLookup component for assigned_to field
  - Implement searchable dropdown to filter users
  - Display selected user as removable chip/tag with X button
  - Pre-fill with current user by default
  - _Requirements: 1.1, 2.1_

- [ ] 6. Create Activity Modal Components
- [ ] 6.1 Implement NewTaskModal Component
  - Create NewTaskModal component with modal wrapper
  - Add form fields: subject (required), due_date, assigned_to (pre-filled with current user)
  - Integrate ContactLookup for "Name" field
  - Integrate RelatedToLookup for "Related To" field
  - Implement form submission with createActivity API call
  - Add form validation for required fields
  - Handle loading and error states
  - Close modal and refresh activity list on success
  - Support prefilledData prop for quick actions
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.8, 1.9, 1.10_

- [ ] 6.2 Implement NewEventModal Component
  - Create NewEventModal component with modal wrapper
  - Add form fields: subject (required), description, start (date and time), end (date and time)
  - Integrate ContactLookup for "Name" field
  - Integrate RelatedToLookup for "Related To" field
  - Add attendees field with multi-user selection
  - Display attendees as removable chips/tags
  - Implement form submission with createActivity API call
  - Add validation for end_time after start_time
  - Handle loading and error states
  - Close modal and refresh activity list on success
  - Support prefilledData prop for quick actions
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_

- [ ] 6.3 Implement LogCallModal Component
  - Create LogCallModal component with modal wrapper
  - Add form fields: subject (pre-filled with "Call"), comments (description)
  - Integrate ContactLookup for "Name" field
  - Integrate RelatedToLookup for "Related To" field
  - Add tip text: "Tip: Type Control + period to insert quick text."
  - Set type='Task' and status='Completed' automatically
  - Implement form submission with createActivity API call
  - Handle loading and error states
  - Close modal and refresh activity list on success
  - Support prefilledData prop for quick actions
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

- [ ] 7. Implement ActivityQuickActions Component
  - Create ActivityQuickActions component with icon buttons for Email, Task, Event, Call
  - Add tooltips to each button indicating action type
  - Implement click handlers to open respective modals
  - Pass prefilledData with current entity ID to modals
  - Support different entity types (account, contact, opportunity, etc.)
  - Map entity type to correct foreign key field (account_id, contact_id, etc.)
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [ ] 8. Implement ActivityTimeline Component
- [ ] 8.1 Create ActivityTimeline Base Component
  - Create ActivityTimeline component accepting entityType and entityId props
  - Fetch activities using useQuery with entity-specific filters
  - Implement grouping logic to separate "Upcoming & Overdue" from past activities
  - Group past activities by month (e.g., "October 2025")
  - Display "No more past activities to load" when no past activities exist
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

- [ ] 8.2 Add Activity Filters and Actions
  - Implement filter buttons for activity types (email, task, event, call)
  - Add "Refresh" button to reload activities
  - Add "Expand All" button to expand all activity groups
  - Implement filter state management
  - Apply filters to activity query
  - _Requirements: 3.7, 4.10, 4.11_

- [ ] 8.3 Implement Activity Display Items
  - Create ActivityItem component for individual activity display
  - Show type icon (task/event) based on activity type
  - Display subject, description snippet, and due date/start time
  - Add circular action menu for each activity
  - Implement click handler to view full activity details
  - _Requirements: 4.8, 4.9, 4.12_

- [ ] 8.4 Add View More Functionality
  - Implement pagination for activity timeline
  - Add "View More" button when more activities exist
  - Load additional activities on button click
  - Update activity list with newly loaded activities
  - _Requirements: 4.13_

- [ ] 9. Integrate ActivityTimeline into Entity Pages
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

- [ ] 10. Implement Calendar View
- [ ] 10.1 Create CalendarPage Component
  - Create CalendarPage component with route configuration
  - Add calendar page to navigation menu
  - Implement weekly calendar state management
  - Add "New Event" button in header
  - _Requirements: 10.1, 10.5_

- [ ] 10.2 Implement CalendarHeader Component
  - Create CalendarHeader with date range display (e.g., "September 28, 2025–October 4, 2025")
  - Add previous/next arrow buttons for week navigation
  - Add "Today" button to jump to current week
  - Add view toggle buttons (day/week/month)
  - Implement navigation handlers
  - _Requirements: 10.2, 10.6, 10.7, 10.10_

- [ ] 10.3 Implement WeekView Component
  - Create WeekView component with weekly grid layout
  - Display days of week as column headers
  - Display hourly time slots from early morning to late evening
  - Render events as colored blocks positioned at their start_time
  - Display event subject and related entity name on event blocks
  - Implement click handler to open event details
  - _Requirements: 10.1, 10.3, 10.4, 10.12_

- [ ] 10.4 Implement MiniCalendar Component
  - Create MiniCalendar component showing current month
  - Highlight selected week in mini calendar
  - Implement date click handler to navigate to that week
  - Display "My Calendars" and "Other Calendars" sections
  - Add calendar visibility toggles
  - _Requirements: 10.8, 10.9, 10.11_

- [ ] 10.5 Integrate Event Creation from Calendar
  - Connect "New Event" button to NewEventModal
  - Pre-fill start_time and end_time based on clicked time slot
  - Refresh calendar view after event creation
  - Test event creation and display workflow
  - _Requirements: 10.5_

- [ ] 11. Implement Activity Update Functionality
  - Add edit button/action to activity items in timeline
  - Create EditActivityModal component (reuse form components from create modals)
  - Implement updateActivity API call with version field
  - Handle optimistic locking conflicts (409 response)
  - Display conflict error modal with refresh option
  - Refresh activity timeline after successful update
  - Test update workflow with concurrent modifications
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [ ] 12. Implement Activity Delete Functionality
  - Add delete button/action to activity items in timeline
  - Implement confirmation dialog before deletion
  - Call deleteActivity API with version field
  - Handle optimistic locking conflicts
  - Refresh activity timeline after successful deletion
  - Test delete workflow
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 13. Add Comprehensive Error Handling
  - Implement toast notification system for success/error messages
  - Add inline field validation errors in forms
  - Handle network errors with retry option
  - Display conflict errors with refresh and retry options
  - Handle permission errors (redirect to login or show access denied)
  - Add loading states to all buttons and forms
  - Test all error scenarios
  - _Requirements: 1.6, 1.7, 1.8, 2.5, 2.6, 2.7, 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 6.4, 7.5, 9.7, 13.7_

- [ ] 14. Write Backend Tests
- [ ] 14.1 Write Activity Model Tests
  - Test model validation (required fields, choices)
  - Test database constraints (only one "what", only one "who")
  - Test dynamic properties (what_object, who_object)
  - Test model string representation
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.8_

- [ ] 14.2 Write Activity Serializer Tests
  - Test nested serialization of related entities
  - Test writable ID fields for foreign keys
  - Test computed fields (related_to_type, related_to_name, etc.)
  - Test validation errors for multiple "what" or "who" relationships
  - Test version increment on update
  - _Requirements: 1.3, 1.4, 1.5, 1.6, 1.7, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9, 12.10, 12.11_

- [ ] 14.3 Write Activity View Tests
  - Test activity list endpoint with filtering
  - Test activity creation with default assigned_to
  - Test activity retrieval
  - Test activity update with optimistic locking
  - Test activity deletion with optimistic locking
  - Test permission enforcement (owner vs non-owner)
  - Test date range filtering
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [ ] 15. Write Frontend Tests
- [ ] 15.1 Write Component Unit Tests
  - Test NewTaskModal rendering and form submission
  - Test NewEventModal rendering and form submission
  - Test LogCallModal rendering and form submission
  - Test ContactLookup search and selection
  - Test RelatedToLookup search and selection
  - Test ActivityQuickActions button clicks
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 6.1, 6.2, 6.3, 11.1, 11.2_

- [ ] 15.2 Write ActivityTimeline Tests
  - Test activity grouping by time period
  - Test filter application
  - Test "View More" pagination
  - Test activity item rendering
  - Test refresh functionality
  - _Requirements: 3.1, 3.2, 3.7, 4.1, 4.8, 4.9, 4.10, 4.11, 4.13_

- [ ] 15.3 Write Calendar View Tests
  - Test weekly calendar rendering
  - Test event positioning on calendar grid
  - Test week navigation (previous/next/today)
  - Test mini calendar date selection
  - Test event creation from calendar
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9_

- [ ] 16. Performance Optimization
  - Add select_related('assigned_to') to activity queries
  - Add prefetch_related for related entities in list views
  - Implement pagination for activity list endpoint
  - Add React Query caching configuration for activities
  - Implement debouncing for lookup search inputs
  - Test query performance with large datasets
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 17. Polish and Final Integration
  - Add loading skeletons for activity timeline
  - Add animations for modal open/close
  - Add transitions for activity list updates
  - Implement optimistic updates for activity creation
  - Add comprehensive error messages for all validation errors
  - Test complete workflow from entity page to activity creation to timeline display
  - Test calendar workflow from event creation to calendar display
  - Verify all requirements are met
  - _Requirements: All_
