# Requirements Document

## Introduction

This document outlines the requirements for implementing a comprehensive Activity Management system in the CRM. Activities represent Tasks and Events that help users track their daily work, schedule meetings, and maintain a complete timeline of interactions with Accounts, Opportunities, Contacts,Contract, Order, and Invoice and Leads. The system uses a normalized data model approach with explicit foreign keys instead of polymorphic relationships.

The Activity Management system enables users to:
- Create and manage tasks (to-do items) with due dates, priorities, and status tracking
- Schedule events (meetings, calls) with start/end times and locations
- Link activities to business objects (Accounts, Opportunities, Contracts, Orders, Invoices) via the "what" relationship
- Link activities to people (Contacts, Leads) via the "who" relationship
- Create activities with both "what" and "who" relationships, only one, or neither (personal tasks)
- View activities in multiple contexts: personal task lists, calendars, and entity timelines
- Track all interactions and follow-ups in a unified activity timeline

## Requirements

### Requirement 1: Create Task Activities

**User Story:** As a salesperson, I want to create a Task and relate it to both an Account and a Contact, so that the task appears in the timeline for the account and also in my activity history with that specific person.

#### Acceptance Criteria

1. WHEN a user clicks "New Task" THEN the system SHALL display a modal task creation form with fields: subject (required), due_date, assigned_to (required, pre-filled with current user), name (contact/lead lookup), and related_to (account/opportunity/contract/order/invoice lookup).
2. WHEN a user submits a task form with valid data THEN the system SHALL create a new Activity record with type='Task' and return a success response with the created activity details.
3. WHEN a user creates a task THEN the system SHALL allow linking to at most one "what" object (Account OR Opportunity OR Contract OR Order OR Invoice) via the "Related To" field.
4. WHEN a user creates a task THEN the system SHALL allow linking to at most one "who" object (Contact OR Lead) via the "Name" field.
5. WHEN a user creates a task THEN the system SHALL allow creating with both "Related To" and "Name" relationships, only one, or neither (personal task).
6. IF a user attempts to link a task to multiple "what" objects THEN the system SHALL reject the request with a validation error.
7. IF a user attempts to link a task to multiple "who" objects THEN the system SHALL reject the request with a validation error.
8. WHEN a task is created successfully THEN the system SHALL close the modal and refresh the activity timeline.
9. WHEN a user opens the task creation form THEN the system SHALL provide searchable lookup fields for "Name" (contacts/leads) and "Related To" (accounts/opportunities/contracts/orders/invoices).
10. WHEN a user selects a value in a lookup field THEN the system SHALL display it as a removable chip/tag with an X button.

### Requirement 2: Create Event Activities

**User Story:** As an account manager, I want to schedule an Event (a meeting) and link it to the client's Account record, so that anyone viewing the Account can see that a meeting is scheduled.

#### Acceptance Criteria

1. WHEN a user clicks "New Event" THEN the system SHALL display a modal event creation form with fields: subject (required), description, start (date and time), end (date and time), name (contact/lead lookup), related_to (account/opportunity/contract/order/invoice lookup), and attendees (multi-user selection).
2. WHEN a user submits an event form with valid data THEN the system SHALL create a new Activity record with type='Event' and return a success response.
3. WHEN a user creates an event THEN the system SHALL allow linking to at most one "what" object via the "Related To" field and at most one "who" object via the "Name" field, or neither.
4. WHEN a user creates an event THEN the system SHALL require both start date/time and end date/time fields.
5. IF end_time is before start_time THEN the system SHALL reject the request with a validation error.
6. WHEN an event is created successfully THEN the system SHALL close the modal and refresh the activity timeline and calendar view.
7. WHEN a user opens the event creation form THEN the system SHALL provide searchable lookup fields for "Name" (contacts/leads) and "Related To" (accounts/opportunities/contracts/orders/invoices).
8. WHEN a user selects a value in a lookup field THEN the system SHALL display it as a removable chip/tag with an X button.
9. WHEN a user adds attendees THEN the system SHALL display them as removable chips/tags below the attendees field.

### Requirement 3: List and Filter Activities

**User Story:** As a user, I want to see a single, unified list of all my open Tasks and upcoming Events, sorted chronologically, so that I have a clear picture of my workload and schedule for the day.

#### Acceptance Criteria

1. WHEN a user requests their task list THEN the system SHALL return all activities where type='Task', assigned_to=current_user, and status!='Completed', ordered by due_date ascending.
2. WHEN a user requests their event calendar THEN the system SHALL return all activities where type='Event' and assigned_to=current_user, ordered by start_time ascending.
3. WHEN a user requests activities with date range filters THEN the system SHALL support query parameters: start_date and end_date for filtering events.
4. WHEN a user requests activities THEN the system SHALL support filtering by: type, status, priority, assigned_to.
5. WHEN a user requests activities THEN the system SHALL support filtering by related entities: account_id, opportunity_id, contract_id, order_id, invoice_id, contact_id, lead_id.
6. WHEN a user views an activity list THEN the system SHALL include related entity information (account name, contact name, etc.) in the response.
7. WHEN a user views activities THEN the system SHALL support filtering by time period: "All time", "All activities", "All types" via dropdown filters.

### Requirement 4: View Activity Timeline on Related Entities

**User Story:** As a user, I want to view all activities related to a specific Account, Opportunity, Contract, Order, Invoice, Contact, or Lead on their detail page, so that I can see the complete history of interactions.

#### Acceptance Criteria

1. WHEN a user views an Account detail page THEN the system SHALL display all activities where account=this_account, ordered by due_date/start_time descending.
2. WHEN a user views an Opportunity detail page THEN the system SHALL display all activities where opportunity=this_opportunity, ordered by due_date/start_time descending.
3. WHEN a user views a Contract detail page THEN the system SHALL display all activities where contract=this_contract, ordered by due_date/start_time descending.
4. WHEN a user views an Order detail page THEN the system SHALL display all activities where order=this_order, ordered by due_date/start_time descending.
5. WHEN a user views an Invoice detail page THEN the system SHALL display all activities where invoice=this_invoice, ordered by due_date/start_time descending.
6. WHEN a user views a Contact detail page THEN the system SHALL display all activities where contact=this_contact, ordered by due_date/start_time descending.
7. WHEN a user views a Lead detail page THEN the system SHALL display all activities where lead=this_lead, ordered by due_date/start_time descending.
8. WHEN displaying an activity timeline THEN the system SHALL show activities grouped by "Upcoming & Overdue" and past activities by month (e.g., "October 2025").
9. WHEN displaying an activity in the timeline THEN the system SHALL show: type icon (task/event), subject, description snippet, due date/time, and a circular action menu.
10. WHEN displaying an activity timeline THEN the system SHALL provide filter buttons at the top for different activity types (email, task, event, call, etc.).
11. WHEN displaying an activity timeline THEN the system SHALL provide "Refresh" and "Expand All" actions.
12. WHEN no past activities exist THEN the system SHALL display "No more past activities to load."
13. WHEN there are more activities THEN the system SHALL provide a "View More" button to load additional activities.

### Requirement 5: Update Activity Details

**User Story:** As a user, I want to update an activity's details (such as changing status from "In Progress" to "Completed" or rescheduling an event), so that my activity records stay current.

#### Acceptance Criteria

1. WHEN a user submits an update to an activity THEN the system SHALL validate that the user has permission to modify the activity.
2. WHEN a user updates an activity THEN the system SHALL support optimistic locking using the version field.
3. IF the version in the update request does not match the current version THEN the system SHALL reject the update with a conflict error.
4. WHEN an activity is successfully updated THEN the system SHALL increment the version field by 1.
5. WHEN a user updates task-specific fields (due_date, status, priority) THEN the system SHALL only allow these updates if type='Task'.
6. WHEN a user updates event-specific fields (start_time, end_time, location, is_all_day_event) THEN the system SHALL only allow these updates if type='Event'.
7. WHEN a user changes the "what" or "who" relationships THEN the system SHALL enforce the constraint that only one "what" and one "who" can be set.

### Requirement 6: Quick Activity Actions from Entity Pages

**User Story:** As a user viewing an Account or Contact detail page, I want quick access buttons to create activities related to that entity, so that I can efficiently log interactions without navigating away.

#### Acceptance Criteria

1. WHEN a user views an Account detail page THEN the system SHALL display quick action buttons in the activity section for: Email, Task, Event, Call, and other activity types.
2. WHEN a user clicks the Email quick action button THEN the system SHALL open an email composition modal with the "Related To" field pre-filled with the current account.
3. WHEN a user clicks the Task quick action button THEN the system SHALL open the task creation modal with the "Related To" field pre-filled with the current account.
4. WHEN a user clicks the Event quick action button THEN the system SHALL open the event creation modal with the "Related To" field pre-filled with the current account.
5. WHEN a user clicks the Call quick action button THEN the system SHALL open the call log modal with the "Related To" field pre-filled with the current account.
6. WHEN a user views a Contact detail page THEN the system SHALL display the same quick action buttons with the "Name" field pre-filled with the current contact.
7. WHEN quick action buttons are displayed THEN the system SHALL show them as icon buttons with tooltips indicating the action type.

### Requirement 7: Delete Activities

**User Story:** As a user, I want to delete an activity that was created by mistake or is no longer relevant, so that my activity lists remain clean and accurate.

#### Acceptance Criteria

1. WHEN a user requests to delete an activity THEN the system SHALL validate that the user has permission to delete the activity.
2. WHEN a user deletes an activity THEN the system SHALL permanently remove the activity record from the database.
3. WHEN an activity is deleted THEN the system SHALL return a success response with no content.
4. IF a user attempts to delete a non-existent activity THEN the system SHALL return a 404 Not Found error.

### Requirement 8: Activity Permissions and Ownership

**User Story:** As a system administrator, I want to ensure that users can only view and modify activities they are assigned to or own, so that activity data remains secure and private.

#### Acceptance Criteria

1. WHEN a user requests to view an activity THEN the system SHALL verify that the user is either the assigned_to user or has appropriate permissions.
2. WHEN a user requests to update an activity THEN the system SHALL verify that the user is either the assigned_to user or has appropriate permissions.
3. WHEN a user requests to delete an activity THEN the system SHALL verify that the user is either the assigned_to user or has appropriate permissions.
4. WHEN a user lists activities THEN the system SHALL by default filter to show only activities assigned to the current user unless the user has admin permissions.
5. IF a user attempts to access an activity they don't have permission for THEN the system SHALL return a 403 Forbidden error.

### Requirement 9: Activity API Endpoints

**User Story:** As a frontend developer, I want well-defined REST API endpoints for activity management, so that I can build a responsive user interface.

#### Acceptance Criteria

1. WHEN the API is deployed THEN the system SHALL provide a POST /api/activities endpoint for creating activities.
2. WHEN the API is deployed THEN the system SHALL provide a GET /api/activities endpoint for listing activities with filtering and pagination.
3. WHEN the API is deployed THEN the system SHALL provide a GET /api/activities/{id} endpoint for retrieving a single activity.
4. WHEN the API is deployed THEN the system SHALL provide a PUT /api/activities/{id} endpoint for updating an activity.
5. WHEN the API is deployed THEN the system SHALL provide a PATCH /api/activities/{id} endpoint for partial updates.
6. WHEN the API is deployed THEN the system SHALL provide a DELETE /api/activities/{id} endpoint for deleting an activity.
7. WHEN any endpoint returns an error THEN the system SHALL provide clear error messages with appropriate HTTP status codes.

### Requirement 13: Activity Data Validation

**User Story:** As a system, I want to validate all activity data to ensure data integrity and consistency, so that the database remains in a valid state.

#### Acceptance Criteria

1. WHEN creating or updating an activity THEN the system SHALL require the subject field to be non-empty.
2. WHEN creating or updating an activity THEN the system SHALL require the type field to be either 'Task' or 'Event'.
3. WHEN creating or updating an activity THEN the system SHALL require the assigned_to field to reference a valid user.
4. WHEN creating or updating a task THEN the system SHALL validate that status is one of: 'Not Started', 'In Progress', 'Completed', 'Waiting on someone else', 'Deferred'.
5. WHEN creating or updating a task THEN the system SHALL validate that priority is one of: 'High', 'Normal', 'Low'.
6. WHEN creating or updating an activity with relationships THEN the system SHALL validate that referenced entities (account, opportunity, contract, order, invoice, contact, lead) exist.
7. IF any validation fails THEN the system SHALL return a 400 Bad Request error with detailed validation messages.
8. WHEN creating or updating an event THEN the system SHALL validate that end_time is after start_time.

### Requirement 10: Calendar View for Events

**User Story:** As a user, I want to view all my events in a calendar interface, so that I can visualize my schedule and see when meetings are planned.

#### Acceptance Criteria

1. WHEN a user navigates to the Calendar view THEN the system SHALL display a weekly calendar grid showing days and time slots.
2. WHEN the calendar loads THEN the system SHALL display the current week by default with the date range shown at the top (e.g., "September 28, 2025–October 4, 2025").
3. WHEN events exist in the calendar THEN the system SHALL display them as colored blocks positioned at their start_time with the subject and related entity name visible.
4. WHEN a user clicks on a calendar event THEN the system SHALL open the event details in a modal or side panel.
5. WHEN a user clicks "New Event" button THEN the system SHALL open the event creation modal.
6. WHEN a user navigates between weeks THEN the system SHALL provide previous/next arrow buttons to change the displayed week.
7. WHEN a user wants to jump to a specific date THEN the system SHALL provide a "Today" button to return to the current week.
8. WHEN a user views the calendar THEN the system SHALL display a mini month calendar on the right side showing the current month with the selected week highlighted.
9. WHEN a user clicks a date in the mini calendar THEN the system SHALL navigate to the week containing that date.
10. WHEN a user views the calendar THEN the system SHALL provide view options (day/week/month views) via buttons in the toolbar.
11. WHEN a user views the calendar THEN the system SHALL display "My Calendars" and "Other Calendars" sections in the sidebar with toggleable calendar visibility.
12. WHEN the calendar displays time slots THEN the system SHALL show hourly divisions from early morning to late evening (e.g., 04:00 to 14:00+).

### Requirement 11: Log a Call Activity

**User Story:** As a salesperson, I want to quickly log a completed phone call with a contact and link it to their account, so that I can track all communication history.

#### Acceptance Criteria

1. WHEN a user clicks "Log a Call" THEN the system SHALL display a modal form with fields: subject (pre-filled with "Call"), comments (description), name (contact/lead lookup), and related_to (account/opportunity/contract/order/invoice lookup).
2. WHEN a user submits a call log form THEN the system SHALL create a new Activity record with type='Task', status='Completed', and the current timestamp.
3. WHEN a call is logged successfully THEN the system SHALL close the modal and add the call to the activity timeline.
4. WHEN a user opens the call log form THEN the system SHALL provide searchable lookup fields for "Name" and "Related To".
5. WHEN a user selects a value in a lookup field THEN the system SHALL display it as a removable chip/tag with an X button.
6. WHEN a user types in the comments field THEN the system SHALL display a tip: "Tip: Type Control + period to insert quick text."

### Requirement 12: Activity Serialization and Response Format

**User Story:** As a frontend developer, I want consistent and complete JSON responses from the activity API, so that I can easily display activity information in the UI.

#### Acceptance Criteria

1. WHEN an activity is returned in an API response THEN the system SHALL include all activity fields: id, type, subject, description, status, priority, due_date, start_time, end_time, is_all_day_event, location, assigned_to_id, version, created_at, updated_at.
2. WHEN an activity is returned in an API response THEN the system SHALL include nested representations of related entities with at minimum: id and name/display_name.
3. WHEN an activity with an account relationship is returned THEN the system SHALL include account details: id, name.
4. WHEN an activity with an opportunity relationship is returned THEN the system SHALL include opportunity details: id, name.
5. WHEN an activity with a contract relationship is returned THEN the system SHALL include contract details: id, status, start_date, end_date.
6. WHEN an activity with an order relationship is returned THEN the system SHALL include order details: id, order_date, status.
7. WHEN an activity with an invoice relationship is returned THEN the system SHALL include invoice details: id, invoice_number, status.
8. WHEN an activity with a contact relationship is returned THEN the system SHALL include contact details: id, first_name, last_name.
9. WHEN an activity with a lead relationship is returned THEN the system SHALL include lead details: id, first_name, last_name, company.
10. WHEN an activity is returned THEN the system SHALL include assigned_to user details: id, username, email.
11. WHEN an activity is returned THEN the system SHALL provide a computed field indicating the related entity type and display name for easy UI rendering.
