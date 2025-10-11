# Activities System - Complete Flow Analysis & Revision Plan

## System Overview

The Activities system manages **Tasks** and **Events** in the CRM, with relationships to business entities ("What") and people ("Who").

---

## Current Architecture

### Backend (Django)

#### 1. **Model Structure** (`backend/activities/models.py`)

**Activity Model** - Single polymorphic model for both Tasks and Events

**Common Fields:**
- `type`: 'Task' or 'Event'
- `subject`: Title/description
- `description`: Detailed notes
- `assigned_to`: User responsible (FK)

**Task-Specific Fields:**
- `status`: Not Started, In Progress, Completed, Waiting, Deferred
- `priority`: High, Normal, Low
- `due_date`: Date field

**Event-Specific Fields:**
- `start_time`: DateTime
- `end_time`: DateTime
- `is_all_day_event`: Boolean
- `location`: String
- `attendees`: M2M to Users

**Relationships:**

**"What" (Business Objects) - Single FK (mutually exclusive):**
- `account`, `opportunity`, `contract`, `order`, `invoice`
- Constraint: Only ONE can be set

**"Who" (People) - Hybrid approach:**
- **Legacy Single FK:** `contact`, `lead` (kept for backward compatibility)
- **New M2M:** `contacts`, `leads` (allows multiple)
- Constraint: Can't mix contact/lead types

**Metadata:**
- `version`: Optimistic locking
- `created_at`, `updated_at`: Timestamps

#### 2. **Serializer** (`backend/activities/serializers.py`)

**ActivitySerializer:**
- **Read fields**: Nested objects (UserSummary, AccountSummary, etc.)
- **Write fields**: ID fields with `_id` suffix (e.g., `account_id`, `contacts_ids`)
- **Computed fields**: `related_to_type`, `related_to_name`, `name_type`, `name_display`

**Validation:**
- Ensures only one "what" relationship
- Prevents mixing contacts and leads
- Validates event end_time > start_time
- Handles version increment for optimistic locking

#### 3. **Views** (`backend/activities/views.py`)

**ActivityList (GET/POST):**
- Filters by `assigned_to` (current user) unless admin
- Supports filtering by type, status, priority, all relationships
- Date range filtering via `start_date`, `end_date`
- Defaults `assigned_to` to current user on create

**ActivityDetail (GET/PATCH/DELETE):**
- Optimistic locking via version check
- Permission: Only assigned user or admin

**ActivityFilter:**
- Supports exact match on type, status, priority, assigned_to
- Supports filtering by all FK relationships
- Custom M2M filters for contacts/leads

---

### Frontend (React)

#### 1. **Activity Creation Modals**

**NewTaskModal** (`frontend/src/components/NewTaskModal.jsx`)
- Fields: subject*, assigned_to, name (contacts/leads), relatedTo, due_date, status, priority, comments
- Creates Task with status (default: Not Started)
- Sends: `type: 'Task'`, `contacts_ids`, `leads_ids`, `{entity}_id`

**NewEventModal** (`frontend/src/components/NewEventModal.jsx`)
- Fields: subject*, assigned_to, name, relatedTo, start_date/time, end_date/time, location, attendees, description
- Creates Event
- Combines date + time into ISO datetime
- Sends: `type: 'Event'`, `attendees_ids`, `contacts_ids`, `leads_ids`, `{entity}_id`

**LogCallModal** (`frontend/src/components/LogCallModal.jsx`)
- Simplified form for logging completed calls
- Fields: subject*, assigned_to, name, relatedTo, comments
- Creates Task with `status: 'Completed'`
- Use case: Quick logging of past phone calls

#### 2. **Lookup Components**

**UserLookup** - Single user selection
- Used for: `assigned_to`
- Endpoint: `/users/`
- Display: "FirstName LastName (email)"

**NameLookup** - Multiple contacts OR leads
- Used for: "Who" relationship
- Toggle between Contact/Lead
- Supports multiple selections (chips)
- Filters contacts by accountId if provided
- Sends: `contacts_ids` or `leads_ids` arrays

**RelatedToLookup** - Single business entity
- Used for: "What" relationship
- Toggle between: Account, Opportunity, Contract, Order, Invoice
- Single selection
- Sends: `{entity}_id`

**AttendeesLookup** - Multiple users
- Used for: Event attendees
- Multiple selections (chips)
- Sends: `attendees_ids` array

#### 3. **Activity Display**

**ActivityTimeline** (`frontend/src/components/ActivityTimeline.jsx`)
- Displays activities for a specific entity
- Groups: "Upcoming & Overdue" + Past by month
- Filters: All, Tasks, Events
- Expandable sections
- Shows: subject, type, date, status, priority

**ToDoListPage** (`frontend/src/pages/ToDoListPage.jsx`)
- Lists tasks for current user
- Sidebar filters: All, Starred, Due Today, Overdue
- Sorting: Created Date, Due Date
- Checkbox for quick completion
- Click to navigate to TaskDetailPage

**TaskDetailPage** (`frontend/src/pages/TaskDetailPage.jsx`)
- View/edit single task
- Change status inline
- Delete task
- Shows metadata (created, updated, created_by)

---

## Data Flow

### Creating a Task

```
1. User opens NewTaskModal
2. User fills form:
   - Subject: "Follow up with client"
   - Assigned To: John Doe (UserLookup)
   - Name: Jane Smith (Contact) (NameLookup)
   - Related To: Acme Corp (Account) (RelatedToLookup)
   - Due Date: 2025-10-15
   - Priority: High
   - Status: Not Started

3. Frontend prepares payload:
   {
     type: 'Task',
     subject: 'Follow up with client',
     assigned_to_id: 5,
     contacts_ids: [12],
     account_id: 3,
     due_date: '2025-10-15',
     priority: 'High',
     status: 'Not Started'
   }

4. POST /activities/
5. Backend validates:
   - Only one "what" (account_id) ✓
   - No mixing contacts/leads ✓
   - Converts IDs to objects
6. Backend saves Activity
7. Backend returns full object with nested data
8. Frontend invalidates queries, closes modal
```

### Creating an Event

```
1. User opens NewEventModal
2. User fills form:
   - Subject: "Client Meeting"
   - Start: 2025-10-15 @ 14:00
   - End: 2025-10-15 @ 15:00
   - Location: "Conference Room A"
   - Attendees: [John, Sarah] (AttendeesLookup)
   - Name: [Jane Smith (Contact)] (NameLookup)
   - Related To: Acme Corp (Account)

3. Frontend prepares payload:
   {
     type: 'Event',
     subject: 'Client Meeting',
     start_time: '2025-10-15T14:00',
     end_time: '2025-10-15T15:00',
     location: 'Conference Room A',
     assigned_to_id: 5,
     attendees_ids: [5, 8],
     contacts_ids: [12],
     account_id: 3
   }

4. POST /activities/
5. Backend validates end_time > start_time
6. Backend saves Activity with M2M relationships
7. Returns full object
```

---

## Issues & Inconsistencies

### 1. **Backend Field Naming Inconsistency**
- **Issue**: Model has `description` field, but NewTaskModal uses `comments`
- **Impact**: Task comments not being saved
- **Fix**: Standardize on `description` OR add `comments` field to model

### 2. **Serializer Missing Fields**
- **Issue**: `comments` field not in ActivitySerializer
- **Impact**: Can't send/receive comments
- **Fix**: Add to serializer fields list

### 3. **ActivityTimeline Filtering**
- **Issue**: Uses `contacts` filter for M2M, but backend expects singular `contact` for FK
- **Impact**: Timeline may not show all activities for a contact
- **Status**: Actually correct - backend has custom filter_contacts method

### 4. **Missing "comments" vs "description" Clarity**
- **Issue**: Tasks use "comments", Events use "description"
- **Impact**: Confusing UX, data loss
- **Fix**: Decide on single field OR clarify usage

### 5. **TaskDetailPage Missing Fields**
- **Issue**: Shows `comments` but model has `description`
- **Impact**: Won't display task notes
- **Fix**: Update to use correct field

### 6. **Attendees Field Mismatch**
- **Issue**: NewEventModal sends `attendees` but serializer expects `attendees_ids`
- **Impact**: Attendees not being saved
- **Fix**: Already correct in code - sends `attendees_ids`

### 7. **No Edit Functionality**
- **Issue**: Can't edit tasks/events after creation
- **Impact**: Poor UX
- **Fix**: Add edit modals or inline editing

### 8. **ActivityTimeline Not Clickable**
- **Issue**: Activities in timeline can't be clicked to view details
- **Impact**: Can't navigate to full activity view
- **Fix**: Add click handlers to navigate to TaskDetailPage

### 9. **No Calendar View for Events**
- **Issue**: Events only shown in timeline list
- **Impact**: Hard to visualize schedule
- **Fix**: Add calendar component (future enhancement)

### 10. **Starred/Labels Not Implemented**
- **Issue**: ToDoListPage has "Starred" filter but no backend support
- **Impact**: Filter doesn't work
- **Fix**: Add `is_starred` field to model OR remove filter

---

## Revision Plan (Priority Order)

### Phase 1: Critical Fixes (Do First)

#### 1.1 Fix comments/description Field Inconsistency
**Backend:**
```python
# Option A: Add comments field to model
comments = models.TextField(blank=True, null=True, help_text="Comments/notes for tasks.")

# Option B: Use description for both
# Update all frontend references from 'comments' to 'description'
```

**Frontend:**
- Update NewTaskModal: `comments` → `description`
- Update LogCallModal: `comments` → `description`
- Update TaskDetailPage: `comments` → `description`

**Decision**: Use `description` for both Tasks and Events (simpler, already exists)

#### 1.2 Update Serializer
```python
# Add to ActivitySerializer.Meta.fields
'description',  # Ensure it's included
```

#### 1.3 Fix TaskDetailPage Display
```jsx
// Change from:
{task.comments && ...}
// To:
{task.description && ...}
```

### Phase 2: UX Improvements

#### 2.1 Add Edit Functionality
- Create EditTaskModal (reuse NewTaskModal with edit mode)
- Create EditEventModal (reuse NewEventModal with edit mode)
- Add "Edit" button to TaskDetailPage
- Add edit action to ActivityTimeline items

#### 2.2 Make ActivityTimeline Clickable
```jsx
// Add to ActivityItem:
<div onClick={() => navigate(`/activities/${activity.id}`)}>
```

#### 2.3 Add Event Detail Page
- Create EventDetailPage (similar to TaskDetailPage)
- Add route `/activities/:id` (already exists)
- Update to handle both Task and Event types

### Phase 3: Feature Enhancements

#### 3.1 Implement Starred/Favorites
**Backend:**
```python
# Add to Activity model:
is_starred = models.BooleanField(default=False)
```
**Frontend:**
- Add star toggle to TaskDetailPage
- Enable "Starred" filter in ToDoListPage

#### 3.2 Implement Labels/Tags
**Backend:**
```python
# New model:
class ActivityLabel(models.Model):
    name = models.CharField(max_length=50)
    color = models.CharField(max_length=7)  # Hex color
    
# Add to Activity:
labels = models.ManyToManyField(ActivityLabel, blank=True)
```
**Frontend:**
- Label management UI
- Filter by labels

#### 3.3 Add Bulk Actions
- Bulk complete tasks
- Bulk delete
- Bulk assign

#### 3.4 Add Activity Search
- Global search across all activities
- Filter by date range, status, priority

### Phase 4: Advanced Features

#### 4.1 Calendar View for Events
- Add calendar component (e.g., FullCalendar)
- Month/week/day views
- Drag-and-drop rescheduling

#### 4.2 Recurring Events/Tasks
- Add recurrence rules
- Generate instances

#### 4.3 Activity Reminders
- Email/notification system
- Configurable reminder times

#### 4.4 Activity Templates
- Save common activities as templates
- Quick create from template

---

## Recommended Revision Order

### Step 1: Fix Critical Data Issues (1-2 hours)
1. Decide on comments vs description
2. Update backend model if needed
3. Update all frontend components
4. Test create/edit/display flow
5. Run migrations if model changed

### Step 2: Add Edit Functionality (2-3 hours)
1. Add edit mode to NewTaskModal
2. Add edit mode to NewEventModal
3. Add Edit button to TaskDetailPage
4. Test update flow with optimistic locking

### Step 3: Improve Navigation (1 hour)
1. Make ActivityTimeline items clickable
2. Create unified ActivityDetailPage (handles Task/Event)
3. Update routes

### Step 4: Polish UX (2-3 hours)
1. Add loading states
2. Add error handling
3. Add confirmation dialogs
4. Improve mobile responsiveness

### Step 5: Add Features (as needed)
1. Starred/favorites
2. Labels/tags
3. Search
4. Calendar view

---

## Testing Checklist

### Backend Tests
- [ ] Create Task with all relationship types
- [ ] Create Event with attendees
- [ ] Validate "what" constraint (only one)
- [ ] Validate "who" constraint (no mixing)
- [ ] Test optimistic locking
- [ ] Test filtering by all fields
- [ ] Test M2M relationships (contacts, leads, attendees)

### Frontend Tests
- [ ] Create Task via NewTaskModal
- [ ] Create Event via NewEventModal
- [ ] Log Call via LogCallModal
- [ ] View Task in ToDoListPage
- [ ] View Task in TaskDetailPage
- [ ] Complete task via checkbox
- [ ] Filter tasks (All, Due Today, Overdue)
- [ ] Sort tasks (Created Date, Due Date)
- [ ] View activities in ActivityTimeline
- [ ] Filter timeline (All, Tasks, Events)
- [ ] Navigate from timeline to detail

### Integration Tests
- [ ] Create activity from Account page
- [ ] Create activity from Contact page
- [ ] Create activity from Opportunity page
- [ ] View activities on entity detail pages
- [ ] Verify relationships display correctly

---

## Summary

**Current State**: Functional but has inconsistencies and missing features

**Critical Issues**:
1. comments/description field mismatch
2. No edit functionality
3. Limited navigation

**Recommended Approach**:
1. Fix data field issues first (prevents data loss)
2. Add edit functionality (core UX)
3. Improve navigation (usability)
4. Add features incrementally (value-add)

**Estimated Total Time**: 8-12 hours for Phases 1-2, additional time for advanced features
