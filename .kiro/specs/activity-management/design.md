# Activity Management Design Document

## Overview

The Activity Management system provides a comprehensive solution for tracking tasks and events within the CRM. It uses a normalized data model with explicit foreign keys to link activities to business objects ("what" relationships) and people ("who" relationships). The system supports creating, viewing, updating, and deleting activities through both a timeline interface on entity detail pages and a dedicated calendar view for events.

### Key Features
- Unified activity model supporting both Tasks and Events
- Flexible relationship model allowing activities to link to accounts, opportunities, contracts, orders, invoices, contacts, and leads
- Activity timeline view on all related entity detail pages
- Calendar view for visualizing events
- Quick action buttons for creating activities from entity pages
- Optimistic locking for concurrent modification prevention
- Permission-based access control

### Design Principles
- Follow existing CRM patterns for consistency (serializers, views, mixins, API client)
- Use normalized foreign keys instead of polymorphic relationships for better database integrity
- Implement database-level constraints to enforce business rules
- Provide rich nested serialization for frontend display
- Support both modal-based and inline activity creation workflows

## Architecture

### Backend Architecture

The backend follows Django REST Framework patterns established in the existing CRM:

```
backend/activities/
├── models.py          # Activity model (already exists)
├── serializers.py     # Activity serializers (to be created)
├── views.py           # Activity viewsets (to be created)
├── permissions.py     # Activity permissions (to be created)
├── urls.py            # Activity URL routing (to be created)
└── tests.py           # Activity tests (to be created)
```

### Frontend Architecture

The frontend follows React + React Query patterns:

```
frontend/src/
├── api/
│   └── client.js      # Add activity API methods
├── components/
│   ├── ActivityTimeline.jsx       # Timeline component for entity pages
│   ├── NewTaskModal.jsx           # Task creation modal
│   ├── NewEventModal.jsx          # Event creation modal
│   ├── LogCallModal.jsx           # Call logging modal
│   ├── ActivityQuickActions.jsx   # Quick action buttons
│   └── CalendarView.jsx           # Calendar view component
├── pages/
│   └── CalendarPage.jsx           # Calendar page
└── hooks/
    └── useActivities.js           # Custom hooks for activity operations
```

## Components and Interfaces

### Backend Components

#### 1. Activity Model (Existing)

The Activity model already exists with the following structure:

```python
class Activity(models.Model):
    # Type and core fields
    type = CharField(choices=['Task', 'Event'])
    subject = CharField(max_length=255)
    description = TextField(blank=True, null=True)
    
    # Task-specific fields
    status = CharField(choices=[...])
    priority = CharField(choices=[...])
    due_date = DateField(blank=True, null=True)
    
    # Event-specific fields
    start_time = DateTimeField(blank=True, null=True)
    end_time = DateTimeField(blank=True, null=True)
    is_all_day_event = BooleanField(default=False)
    location = CharField(max_length=255, blank=True, null=True)
    
    # Assignment
    assigned_to = ForeignKey(User)
    
    # "What" relationships (business objects)
    account = ForeignKey(Account, null=True, blank=True)
    opportunity = ForeignKey(Opportunity, null=True, blank=True)
    contract = ForeignKey(Contract, null=True, blank=True)
    order = ForeignKey(Order, null=True, blank=True)
    invoice = ForeignKey(Invoice, null=True, blank=True)
    
    # "Who" relationships (people)
    contact = ForeignKey(Contact, null=True, blank=True)
    lead = ForeignKey(Lead, null=True, blank=True)
    
    # Metadata
    version = IntegerField(default=1)
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
```

**Key Features:**
- Database-level constraints ensure only one "what" and one "who" relationship
- Dynamic properties (`what_object`, `who_object`) for easy access
- Indexed foreign keys for query performance
- Optimistic locking support via version field

#### 2. Activity Serializers

**ActivitySerializer** - Main serializer for CRUD operations

```python
class ActivitySerializer(serializers.ModelSerializer):
    # Nested read representations
    assigned_to = UserSerializer(read_only=True)
    account = AccountSummarySerializer(read_only=True)
    opportunity = OpportunitySummarySerializer(read_only=True)
    contract = ContractSummarySerializer(read_only=True)
    order = OrderSummarySerializer(read_only=True)
    invoice = InvoiceSummarySerializer(read_only=True)
    contact = ContactSummarySerializer(read_only=True)
    lead = LeadSummarySerializer(read_only=True)
    
    # Writable ID fields
    assigned_to_id = PrimaryKeyRelatedField(source='assigned_to', write_only=True)
    account_id = PrimaryKeyRelatedField(source='account', write_only=True, allow_null=True)
    # ... similar for other relationships
    
    # Computed fields for UI
    related_to_type = SerializerMethodField()
    related_to_name = SerializerMethodField()
    name_type = SerializerMethodField()
    name_display = SerializerMethodField()
    
    class Meta:
        model = Activity
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
```

**ActivityTimelineSerializer** - Lightweight serializer for timeline views

```python
class ActivityTimelineSerializer(serializers.ModelSerializer):
    # Minimal nested data for timeline display
    assigned_to_name = SerializerMethodField()
    related_to_display = SerializerMethodField()
    name_display = SerializerMethodField()
    type_icon = SerializerMethodField()
    
    class Meta:
        model = Activity
        fields = [
            'id', 'type', 'subject', 'description', 'status', 'priority',
            'due_date', 'start_time', 'end_time', 'assigned_to_name',
            'related_to_display', 'name_display', 'type_icon', 'created_at'
        ]
```

#### 3. Activity Views

**ActivityViewSet** - Main viewset for activity CRUD

```python
class ActivityViewSet(viewsets.ModelViewSet):
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated, IsActivityOwnerOrAdmin]
    
    def get_queryset(self):
        # Filter by assigned_to by default
        # Support filtering by related entities
        # Support date range filtering
        pass
    
    def perform_create(self, serializer):
        # Default assigned_to to current user if not specified
        pass
```

**ActivityList** - List and create activities

```python
class ActivityList(generics.ListCreateAPIView):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = [
        'type', 'status', 'priority', 'assigned_to',
        'account', 'opportunity', 'contract', 'order', 'invoice',
        'contact', 'lead'
    ]
```

**ActivityDetail** - Retrieve, update, delete activities

```python
class ActivityDetail(OptimisticLockingMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated, IsActivityOwnerOrAdmin]
```

#### 4. Activity Permissions

```python
class IsActivityOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Allow if user is assigned_to or is admin
        return obj.assigned_to == request.user or request.user.is_staff
```

#### 5. URL Configuration

```python
urlpatterns = [
    path('activities/', ActivityList.as_view(), name='activity-list'),
    path('activities/<int:pk>/', ActivityDetail.as_view(), name='activity-detail'),
]
```

### Frontend Components

#### 1. Activity API Client Methods

Add to `frontend/src/api/client.js`:

```javascript
// Activity API methods
export async function getActivities(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/activities/?${params}`);
    return response.data;
}

export async function getActivity(id) {
    const response = await api.get(`/activities/${id}/`);
    return response.data;
}

export async function createActivity(activityData) {
    const response = await api.post('/activities/', activityData);
    return response.data;
}

export async function updateActivity(id, activityData) {
    const response = await api.patch(`/activities/${id}/`, activityData);
    return response.data;
}

export async function deleteActivity({ id, version }) {
    const response = await api.delete(`/activities/${id}/`, {
        data: { version }
    });
    return response.data;
}
```

#### 2. ActivityTimeline Component

Displays activities on entity detail pages:

```jsx
function ActivityTimeline({ entityType, entityId }) {
    const { data: activities, isLoading } = useQuery({
        queryKey: ['activities', entityType, entityId],
        queryFn: () => getActivities({ [entityType]: entityId })
    });
    
    // Group activities by "Upcoming & Overdue" and past months
    const groupedActivities = groupActivitiesByTime(activities);
    
    return (
        <div className={styles.timeline}>
            <ActivityFilters />
            <ActivityQuickActions entityType={entityType} entityId={entityId} />
            {groupedActivities.map(group => (
                <ActivityGroup key={group.label} group={group} />
            ))}
        </div>
    );
}
```

#### 3. NewTaskModal Component

Modal for creating tasks:

```jsx
function NewTaskModal({ isOpen, onClose, prefilledData = {} }) {
    const [formData, setFormData] = useState({
        subject: '',
        due_date: '',
        assigned_to_id: currentUser.id,
        contact_id: prefilledData.contact_id || null,
        account_id: prefilledData.account_id || null,
        ...prefilledData
    });
    
    const createMutation = useMutation({
        mutationFn: createActivity,
        onSuccess: () => {
            queryClient.invalidateQueries(['activities']);
            onClose();
        }
    });
    
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <input name="subject" required />
                <input type="date" name="due_date" />
                <UserLookup name="assigned_to_id" />
                <ContactLookup name="contact_id" />
                <RelatedToLookup name="related_to" />
                <button type="submit">Save</button>
            </form>
        </Modal>
    );
}
```

#### 4. NewEventModal Component

Modal for creating events:

```jsx
function NewEventModal({ isOpen, onClose, prefilledData = {} }) {
    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        start_time: '',
        end_time: '',
        contact_id: prefilledData.contact_id || null,
        account_id: prefilledData.account_id || null,
        attendees: [],
        ...prefilledData
    });
    
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <input name="subject" required />
                <textarea name="description" />
                <DateTimePicker name="start_time" />
                <DateTimePicker name="end_time" />
                <ContactLookup name="contact_id" />
                <RelatedToLookup name="related_to" />
                <UserMultiSelect name="attendees" />
                <button type="submit">Save</button>
            </form>
        </Modal>
    );
}
```

#### 5. LogCallModal Component

Modal for logging completed calls:

```jsx
function LogCallModal({ isOpen, onClose, prefilledData = {} }) {
    const [formData, setFormData] = useState({
        type: 'Task',
        subject: 'Call',
        description: '',
        status: 'Completed',
        contact_id: prefilledData.contact_id || null,
        account_id: prefilledData.account_id || null,
        ...prefilledData
    });
    
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <input name="subject" value="Call" readOnly />
                <textarea 
                    name="description" 
                    placeholder="Tip: Type Control + period to insert quick text."
                />
                <ContactLookup name="contact_id" />
                <RelatedToLookup name="related_to" />
                <button type="submit">Save</button>
            </form>
        </Modal>
    );
}
```

#### 6. CalendarView Component

Weekly calendar view for events:

```jsx
function CalendarView() {
    const [currentWeek, setCurrentWeek] = useState(new Date());
    
    const { data: events } = useQuery({
        queryKey: ['activities', 'events', currentWeek],
        queryFn: () => getActivities({
            type: 'Event',
            start_date: getWeekStart(currentWeek),
            end_date: getWeekEnd(currentWeek)
        })
    });
    
    return (
        <div className={styles.calendar}>
            <CalendarHeader 
                currentWeek={currentWeek}
                onPrevious={() => setCurrentWeek(addWeeks(currentWeek, -1))}
                onNext={() => setCurrentWeek(addWeeks(currentWeek, 1))}
                onToday={() => setCurrentWeek(new Date())}
            />
            <div className={styles.calendarGrid}>
                <WeekView events={events} />
            </div>
            <MiniCalendar 
                selectedWeek={currentWeek}
                onSelectDate={(date) => setCurrentWeek(date)}
            />
        </div>
    );
}
```

#### 7. ActivityQuickActions Component

Quick action buttons for entity pages:

```jsx
function ActivityQuickActions({ entityType, entityId }) {
    const [activeModal, setActiveModal] = useState(null);
    
    const prefilledData = {
        [`${entityType}_id`]: entityId
    };
    
    return (
        <>
            <div className={styles.quickActions}>
                <button onClick={() => setActiveModal('email')}>
                    <EmailIcon /> Email
                </button>
                <button onClick={() => setActiveModal('task')}>
                    <TaskIcon /> Task
                </button>
                <button onClick={() => setActiveModal('event')}>
                    <EventIcon /> Event
                </button>
                <button onClick={() => setActiveModal('call')}>
                    <CallIcon /> Call
                </button>
            </div>
            
            <NewTaskModal 
                isOpen={activeModal === 'task'}
                onClose={() => setActiveModal(null)}
                prefilledData={prefilledData}
            />
            <NewEventModal 
                isOpen={activeModal === 'event'}
                onClose={() => setActiveModal(null)}
                prefilledData={prefilledData}
            />
            <LogCallModal 
                isOpen={activeModal === 'call'}
                onClose={() => setActiveModal(null)}
                prefilledData={prefilledData}
            />
        </>
    );
}
```

## Data Models

### Activity Data Model

The Activity model uses a normalized approach with explicit foreign keys:

**Fields:**
- `id`: Primary key
- `type`: 'Task' or 'Event'
- `subject`: Activity title (required)
- `description`: Detailed description
- `status`: Task status (Task only)
- `priority`: Task priority (Task only)
- `due_date`: Task due date (Task only)
- `start_time`: Event start (Event only)
- `end_time`: Event end (Event only)
- `is_all_day_event`: All-day flag (Event only)
- `location`: Event location (Event only)
- `assigned_to`: User assignment (required)
- `account`, `opportunity`, `contract`, `order`, `invoice`: "What" relationships
- `contact`, `lead`: "Who" relationships
- `version`: Optimistic locking version
- `created_at`, `updated_at`: Timestamps

**Constraints:**
- At most one "what" relationship can be set (database constraint)
- At most one "who" relationship can be set (database constraint)
- `end_time` must be after `start_time` for events (application validation)

**Indexes:**
- `(assigned_to, due_date)` - For task lists
- Individual indexes on all foreign keys - For timeline queries

### API Request/Response Formats

**Create Task Request:**
```json
{
  "type": "Task",
  "subject": "Follow up with client",
  "due_date": "2025-10-15",
  "assigned_to_id": 1,
  "contact_id": 5,
  "account_id": 3,
  "priority": "High",
  "status": "Not Started"
}
```

**Create Event Request:**
```json
{
  "type": "Event",
  "subject": "Client meeting",
  "description": "Discuss project requirements",
  "start_time": "2025-10-03T11:00:00Z",
  "end_time": "2025-10-03T12:00:00Z",
  "location": "Conference Room A",
  "contact_id": 5,
  "account_id": 3,
  "assigned_to_id": 1
}
```

**Activity Response:**
```json
{
  "id": 1,
  "type": "Task",
  "subject": "Follow up with client",
  "description": null,
  "status": "Not Started",
  "priority": "High",
  "due_date": "2025-10-15",
  "start_time": null,
  "end_time": null,
  "is_all_day_event": false,
  "location": null,
  "assigned_to": {
    "id": 1,
    "username": "hen.larks",
    "email": "hen.larks@example.com"
  },
  "account": {
    "id": 3,
    "name": "swiss"
  },
  "contact": {
    "id": 5,
    "first_name": "John",
    "last_name": "Doe"
  },
  "related_to_type": "account",
  "related_to_name": "swiss",
  "name_type": "contact",
  "name_display": "John Doe",
  "version": 1,
  "created_at": "2025-10-03T10:32:00Z",
  "updated_at": "2025-10-03T10:32:00Z"
}
```

## Error Handling

### Backend Error Handling

**Validation Errors (400 Bad Request):**
- Missing required fields (subject, assigned_to)
- Invalid type value
- Invalid status/priority values
- Multiple "what" or "who" relationships
- End time before start time
- Invalid foreign key references

**Permission Errors (403 Forbidden):**
- User attempting to access activity they don't own

**Conflict Errors (409 Conflict):**
- Version mismatch during update/delete (optimistic locking)

**Not Found Errors (404 Not Found):**
- Activity ID doesn't exist

### Frontend Error Handling

**Network Errors:**
- Display toast notification with retry option
- Maintain form data for retry

**Validation Errors:**
- Display inline field errors
- Highlight invalid fields

**Conflict Errors:**
- Show modal explaining the conflict
- Offer to refresh and retry

**Permission Errors:**
- Redirect to login if unauthenticated
- Show "Access Denied" message if unauthorized

## Testing Strategy

### Backend Testing

**Unit Tests:**
- Model validation tests
- Serializer tests (nested serialization, computed fields)
- Permission tests
- Constraint enforcement tests

**Integration Tests:**
- API endpoint tests (CRUD operations)
- Filtering and pagination tests
- Optimistic locking tests
- Permission integration tests

**Test Coverage Goals:**
- 90%+ code coverage
- All business rules tested
- All error conditions tested

### Frontend Testing

**Component Tests:**
- Modal rendering and form submission
- Timeline grouping and display
- Calendar event rendering
- Quick action button behavior

**Integration Tests:**
- Activity creation flow
- Activity update flow
- Timeline refresh after creation
- Calendar navigation

**E2E Tests:**
- Complete task creation workflow
- Complete event creation workflow
- Activity timeline on entity pages
- Calendar view and event creation

### Test Data

**Fixtures:**
- Users with different permission levels
- Accounts, contacts, opportunities
- Sample tasks and events
- Activities with various relationship combinations

## Implementation Notes

### Phase 1: Backend Foundation
1. Create serializers with nested representations
2. Implement views with filtering support
3. Add permissions
4. Configure URL routing
5. Write comprehensive tests

### Phase 2: Frontend Core
1. Add API client methods
2. Create modal components (Task, Event, Call)
3. Implement lookup components (Contact, RelatedTo)
4. Add activity timeline component
5. Integrate with existing entity pages

### Phase 3: Calendar View
1. Create calendar page and routing
2. Implement weekly calendar grid
3. Add mini calendar sidebar
4. Implement event rendering
5. Add navigation controls

### Phase 4: Polish
1. Add loading states and error handling
2. Implement optimistic updates
3. Add animations and transitions
4. Optimize query performance
5. Add comprehensive error messages

### Migration Considerations

The Activity model already exists with migrations applied. No schema changes are needed.

### Performance Considerations

**Database:**
- Use `select_related()` for assigned_to
- Use `prefetch_related()` for related entities in list views
- Leverage existing indexes on foreign keys

**Frontend:**
- Implement pagination for activity lists
- Use React Query caching for timeline data
- Lazy load calendar events by week
- Debounce search inputs in lookup fields

### Security Considerations

**Backend:**
- Enforce permission checks on all endpoints
- Validate all foreign key references
- Sanitize user input
- Use optimistic locking to prevent race conditions

**Frontend:**
- Validate form inputs before submission
- Sanitize displayed content (XSS prevention)
- Handle authentication errors gracefully
- Don't expose sensitive data in error messages
