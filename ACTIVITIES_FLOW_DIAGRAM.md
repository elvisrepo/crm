# Activities System - Visual Flow Diagrams

## 1. Data Model Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                      Activity Model                          │
│  (Polymorphic: Task or Event)                               │
├─────────────────────────────────────────────────────────────┤
│ Common Fields:                                               │
│  • type: 'Task' | 'Event'                                   │
│  • subject: string                                           │
│  • description: text                                         │
│  • assigned_to: FK → User                                   │
│  • version: int (optimistic locking)                        │
│                                                              │
│ Task-Specific:                                              │
│  • status: enum                                             │
│  • priority: enum                                           │
│  • due_date: date                                           │
│                                                              │
│ Event-Specific:                                             │
│  • start_time: datetime                                     │
│  • end_time: datetime                                       │
│  • location: string                                         │
│  • attendees: M2M → User                                    │
└─────────────────────────────────────────────────────────────┘
                    │
                    │ Relationships
                    ▼
    ┌───────────────────────────────────────────┐
    │  "What" - Business Objects (ONE only)     │
    ├───────────────────────────────────────────┤
    │  • account: FK → Account                  │
    │  • opportunity: FK → Opportunity          │
    │  • contract: FK → Contract                │
    │  • order: FK → Order                      │
    │  • invoice: FK → Invoice                  │
    │                                            │
    │  ⚠️  Constraint: Only ONE can be set      │
    └───────────────────────────────────────────┘

    ┌───────────────────────────────────────────┐
    │  "Who" - People (Hybrid)                  │
    ├───────────────────────────────────────────┤
    │  Legacy Single:                            │
    │  • contact: FK → Contact                  │
    │  • lead: FK → Lead                        │
    │                                            │
    │  New Multiple:                             │
    │  • contacts: M2M → Contact                │
    │  • leads: M2M → Lead                      │
    │                                            │
    │  ⚠️  Constraint: Can't mix types          │
    └───────────────────────────────────────────┘
```

## 2. Component Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                     Application                              │
└─────────────────────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┬──────────────┐
        │                       │              │
        ▼                       ▼              ▼
┌──────────────┐      ┌──────────────┐  ┌──────────────┐
│ Entity Pages │      │ ToDoListPage │  │ TaskDetail   │
│ (Account,    │      │              │  │ Page         │
│  Contact,    │      │ - Filters    │  │              │
│  Opportunity)│      │ - Sort       │  │ - View       │
│              │      │ - Checkboxes │  │ - Edit       │
│ Contains:    │      │ - Click Nav  │  │ - Delete     │
│ ActivityTime │      └──────────────┘  └──────────────┘
│ line         │
└──────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────┐
│              Activity Creation Modals                     │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ NewTask     │  │ NewEvent    │  │ LogCall     │     │
│  │ Modal       │  │ Modal       │  │ Modal       │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│         │                │                │              │
│         └────────────────┴────────────────┘              │
│                          │                               │
│                          ▼                               │
│         ┌────────────────────────────────┐              │
│         │     Lookup Components          │              │
│         ├────────────────────────────────┤              │
│         │ • UserLookup (assigned_to)     │              │
│         │ • NameLookup (contacts/leads)  │              │
│         │ • RelatedToLookup (entities)   │              │
│         │ • AttendeesLookup (users)      │              │
│         └────────────────────────────────┘              │
│                          │                               │
│                          ▼                               │
│         ┌────────────────────────────────┐              │
│         │     Base Lookup Component      │              │
│         │  (Shared search/select logic)  │              │
│         └────────────────────────────────┘              │
└──────────────────────────────────────────────────────────┘
```

## 3. Data Flow - Creating a Task

```
┌──────────┐
│  User    │
│  Action  │
└────┬─────┘
     │ 1. Clicks "New Task"
     ▼
┌─────────────────┐
│ NewTaskModal    │
│ Opens           │
└────┬────────────┘
     │ 2. User fills form
     │    - Subject: "Follow up"
     │    - Assigned To: John (UserLookup)
     │    - Name: Jane (NameLookup → Contact)
     │    - Related To: Acme (RelatedToLookup → Account)
     │    - Due Date: 2025-10-15
     │    - Priority: High
     ▼
┌─────────────────────────────────────────┐
│ Frontend Payload Preparation            │
├─────────────────────────────────────────┤
│ {                                        │
│   type: 'Task',                         │
│   subject: 'Follow up',                 │
│   assigned_to_id: 5,                    │
│   contacts_ids: [12],                   │
│   account_id: 3,                        │
│   due_date: '2025-10-15',               │
│   priority: 'High',                     │
│   status: 'Not Started'                 │
│ }                                        │
└────┬────────────────────────────────────┘
     │ 3. POST /activities/
     ▼
┌─────────────────────────────────────────┐
│ Backend: ActivitySerializer             │
│ Validation                               │
├─────────────────────────────────────────┤
│ ✓ Only one "what" (account_id)         │
│ ✓ No mixing contacts/leads             │
│ ✓ Convert IDs to objects                │
│   - assigned_to_id → User object       │
│   - contacts_ids → Contact objects     │
│   - account_id → Account object        │
└────┬────────────────────────────────────┘
     │ 4. Save to database
     ▼
┌─────────────────────────────────────────┐
│ Database: Activity Table                │
├─────────────────────────────────────────┤
│ INSERT INTO activities (                │
│   type, subject, assigned_to_id,        │
│   account_id, due_date, priority,       │
│   status, version, created_at           │
│ )                                        │
│                                          │
│ INSERT INTO activity_contacts (M2M)     │
└────┬────────────────────────────────────┘
     │ 5. Return response
     ▼
┌─────────────────────────────────────────┐
│ Backend: Serialized Response            │
├─────────────────────────────────────────┤
│ {                                        │
│   id: 42,                               │
│   type: 'Task',                         │
│   subject: 'Follow up',                 │
│   assigned_to: {                        │
│     id: 5,                              │
│     first_name: 'John',                 │
│     last_name: 'Doe'                    │
│   },                                     │
│   contacts: [{                          │
│     id: 12,                             │
│     first_name: 'Jane',                 │
│     last_name: 'Smith'                  │
│   }],                                    │
│   account: {                            │
│     id: 3,                              │
│     name: 'Acme Corp'                   │
│   },                                     │
│   related_to_type: 'account',           │
│   related_to_name: 'Acme Corp',         │
│   version: 1,                           │
│   created_at: '2025-10-08T...'          │
│ }                                        │
└────┬────────────────────────────────────┘
     │ 6. Update UI
     ▼
┌─────────────────────────────────────────┐
│ Frontend: React Query                   │
├─────────────────────────────────────────┤
│ • Invalidate ['activities'] cache       │
│ • Close modal                           │
│ • Refresh ToDoListPage                  │
│ • Refresh ActivityTimeline              │
└─────────────────────────────────────────┘
```

## 4. Lookup Component Flow

```
┌─────────────────────────────────────────────────────────┐
│                    NameLookup                            │
│  (Selects Contacts OR Leads - Multiple)                 │
└─────────────────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌──────────────┐        ┌──────────────┐
│ Entity Type  │        │ Base Lookup  │
│ Selector     │        │ Component    │
│              │        │              │
│ [Contact ▼] │───────▶│ Search: ___  │
│ [ Lead   ] │        │              │
└──────────────┘        │ Results:     │
                        │ □ Jane Smith │
                        │ □ John Doe   │
                        └──────────────┘
                                │
                                │ On Select
                                ▼
                        ┌──────────────┐
                        │ Selected     │
                        │ Chips        │
                        │              │
                        │ [👤 Jane ×] │
                        │ [👤 John ×] │
                        └──────────────┘
                                │
                                │ On Submit
                                ▼
                        ┌──────────────┐
                        │ Payload      │
                        │              │
                        │ contacts_ids:│
                        │  [12, 15]    │
                        └──────────────┘
```

```
┌─────────────────────────────────────────────────────────┐
│                 RelatedToLookup                          │
│  (Selects ONE Business Entity)                          │
└─────────────────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌──────────────┐        ┌──────────────┐
│ Entity Type  │        │ Base Lookup  │
│ Selector     │        │ Component    │
│              │        │              │
│ [Account  ▼]│───────▶│ Search: ___  │
│ [Opportunity]│        │              │
│ [Contract  ]│        │ Results:     │
│ [Order     ]│        │ ○ Acme Corp  │
│ [Invoice   ]│        │ ○ Beta Inc   │
└──────────────┘        └──────────────┘
                                │
                                │ On Select
                                ▼
                        ┌──────────────┐
                        │ Selected     │
                        │              │
                        │ 🏢 Account   │
                        │ Acme Corp    │
                        └──────────────┘
                                │
                                │ On Submit
                                ▼
                        ┌──────────────┐
                        │ Payload      │
                        │              │
                        │ account_id: 3│
                        └──────────────┘
```

## 5. Activity Display Flow

```
┌─────────────────────────────────────────────────────────┐
│                   Entity Detail Page                     │
│                   (e.g., AccountPage)                    │
└─────────────────────────────────────────────────────────┘
                    │
                    │ Renders
                    ▼
┌─────────────────────────────────────────────────────────┐
│                  ActivityTimeline                        │
│  Props: entityType='account', entityId=3                │
└─────────────────────────────────────────────────────────┘
                    │
                    │ 1. Fetch activities
                    ▼
┌─────────────────────────────────────────────────────────┐
│  GET /activities/?account=3                             │
└─────────────────────────────────────────────────────────┘
                    │
                    │ 2. Group by time
                    ▼
┌─────────────────────────────────────────────────────────┐
│  Upcoming & Overdue                                     │
│  ┌────────────────────────────────────────────┐        │
│  │ ✓ Follow up call - Due: Oct 15             │        │
│  │ 📅 Client meeting - Oct 20 @ 2:00 PM       │        │
│  └────────────────────────────────────────────┘        │
│                                                          │
│  October 2025                                           │
│  ┌────────────────────────────────────────────┐        │
│  │ ✓ Initial contact - Completed              │        │
│  │ 📅 Discovery call - Oct 5 @ 10:00 AM       │        │
│  └────────────────────────────────────────────┘        │
│                                                          │
│  September 2025                                         │
│  ┌────────────────────────────────────────────┐        │
│  │ ✓ Proposal sent - Completed                │        │
│  └────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────┘
                    │
                    │ 3. Click activity
                    ▼
┌─────────────────────────────────────────────────────────┐
│              Navigate to TaskDetailPage                 │
│              /activities/42                             │
└─────────────────────────────────────────────────────────┘
```

## 6. ToDoListPage Flow

```
┌─────────────────────────────────────────────────────────┐
│                    ToDoListPage                          │
│                 /activities/tasks                        │
└─────────────────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌──────────────┐        ┌──────────────────────┐
│ Sidebar      │        │ Main Content         │
│ Filters      │        │                      │
│              │        │ 8 items - Sort by:   │
│ [All      ]  │        │ [Created Date ▼]     │
│ [ Starred ]  │        │                      │
│ [ Due Today ]│        │ ☐ Follow up call     │
│ [ Overdue ]  │        │   Account: Acme Corp │
│              │        │   Due: Oct 15        │
│ Labels       │        │                      │
│ + New Label  │        │ ☐ Send proposal      │
│              │        │   Opportunity: Deal  │
│ Suggestions: │        │   Due: Oct 20        │
│ • Urgent     │        │                      │
│ • Pipeline   │        │ ☑ Initial contact    │
└──────────────┘        │   Contact: Jane      │
                        │   Completed          │
                        └──────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
            ┌──────────────┐        ┌──────────────┐
            │ Click        │        │ Click        │
            │ Checkbox     │        │ Task Row     │
            │              │        │              │
            │ Toggle       │        │ Navigate to  │
            │ Complete     │        │ TaskDetail   │
            └──────────────┘        └──────────────┘
```

## 7. Critical Issue: comments vs description

```
❌ CURRENT STATE (BROKEN):

Frontend (NewTaskModal):
┌─────────────────────┐
│ Form Field:         │
│ "Comments"          │
│ name="comments"     │
└─────────────────────┘
         │
         │ Sends: { comments: "..." }
         ▼
Backend (ActivitySerializer):
┌─────────────────────┐
│ ❌ No 'comments'    │
│    field defined    │
│                     │
│ ✓ Has 'description' │
│   field             │
└─────────────────────┘
         │
         │ Result: Data lost!
         ▼
Database (Activity Model):
┌─────────────────────┐
│ description: NULL   │
│ (comments ignored)  │
└─────────────────────┘

✅ FIXED STATE:

Frontend (NewTaskModal):
┌─────────────────────┐
│ Form Field:         │
│ "Description"       │
│ name="description"  │
└─────────────────────┘
         │
         │ Sends: { description: "..." }
         ▼
Backend (ActivitySerializer):
┌─────────────────────┐
│ ✓ 'description'     │
│   field defined     │
└─────────────────────┘
         │
         │ Saves correctly
         ▼
Database (Activity Model):
┌─────────────────────┐
│ description: "..."  │
└─────────────────────┘
```

## 8. Recommended Fix Order

```
Priority 1: Data Integrity
┌─────────────────────────────────────┐
│ 1. Fix comments → description       │
│    • Update NewTaskModal            │
│    • Update LogCallModal            │
│    • Update TaskDetailPage          │
│    • Test end-to-end                │
└─────────────────────────────────────┘
         │
         ▼
Priority 2: Core UX
┌─────────────────────────────────────┐
│ 2. Add Edit Functionality           │
│    • Edit mode for modals           │
│    • Edit button on detail pages    │
│    • Test optimistic locking        │
└─────────────────────────────────────┘
         │
         ▼
Priority 3: Navigation
┌─────────────────────────────────────┐
│ 3. Make Timeline Clickable          │
│    • Add click handlers             │
│    • Navigate to detail pages       │
│    • Unified ActivityDetailPage     │
└─────────────────────────────────────┘
         │
         ▼
Priority 4: Features
┌─────────────────────────────────────┐
│ 4. Add Enhancements                 │
│    • Starred/favorites              │
│    • Labels/tags                    │
│    • Search                         │
│    • Calendar view                  │
└─────────────────────────────────────┘
```
