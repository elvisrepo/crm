# New Contact Creation Flow - Visual Diagram

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      AccountPage.jsx                            │
│                    (accountId = 5)                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              ActivityQuickActions.jsx                           │
│              entity={account}, entityType="account"             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NewTaskModal.jsx                             │
│              defaultValues={{ relatedTo: account }}             │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              NameLookup Component                         │ │
│  │              accountId={5}                                │ │
│  │                                                           │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │           Lookup Component                          │ │ │
│  │  │  showCreateNew={true}                               │ │ │
│  │  │  onCreateNew={handleCreateNew}                      │ │ │
│  │  │                                                     │ │ │
│  │  │  [Search contacts...]                               │ │ │
│  │  │  ┌─────────────────────────────────────────────┐   │ │ │
│  │  │  │ 👤 John Doe                                 │   │ │ │
│  │  │  │ 👤 Jane Smith                               │   │ │ │
│  │  │  │ ─────────────────────────────────────────── │   │ │ │
│  │  │  │ ⊕  New Contact                              │◄──┼─┼─┼─ Click!
│  │  │  └─────────────────────────────────────────────┘   │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  │                                                           │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │        NewContactModal Component                    │ │ │
│  │  │        isOpen={true}                                │ │ │
│  │  │        defaultAccountId={5}                         │ │ │
│  │  │        onContactCreated={handleContactCreated}      │ │ │
│  │  │                                                     │ │ │
│  │  │  ┌───────────────────────────────────────────────┐ │ │ │
│  │  │  │     NewContactForm                            │ │ │ │
│  │  │  │                                               │ │ │ │
│  │  │  │  First Name: [_____________]                  │ │ │ │
│  │  │  │  Last Name:  [_____________]                  │ │ │ │
│  │  │  │  Email:      [_____________]                  │ │ │ │
│  │  │  │  Account:    [Swiss ▼] (disabled)            │ │ │ │
│  │  │  │                                               │ │ │ │
│  │  │  │  [Cancel]  [Create Contact]                   │ │ │ │
│  │  │  └───────────────────────────────────────────────┘ │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Sequence Diagram

```
User          NameLookup      Lookup      NewContactModal    API         Database
 │                │             │               │             │              │
 │  Click Name    │             │               │             │              │
 │  field         │             │               │             │              │
 ├───────────────>│             │               │             │              │
 │                │  Show       │               │             │              │
 │                │  dropdown   │               │             │              │
 │                ├────────────>│               │             │              │
 │                │             │  Fetch        │             │              │
 │                │             │  contacts     │             │              │
 │                │             ├──────────────────────────────────────────>│
 │                │             │               │             │              │
 │                │             │  Display      │             │              │
 │                │             │  results +    │             │              │
 │                │             │  "New Contact"│             │              │
 │                │             │               │             │              │
 │  Click "New    │             │               │             │              │
 │  Contact"      │             │               │             │              │
 ├────────────────┼────────────>│               │             │              │
 │                │             │  onCreateNew()│             │              │
 │                │             ├──────────────>│             │              │
 │                │             │               │             │              │
 │                │  handleCreateNew()          │             │              │
 │                │<────────────┼───────────────┤             │              │
 │                │             │               │             │              │
 │                │  Open modal │               │             │              │
 │                ├────────────────────────────>│             │              │
 │                │             │               │             │              │
 │                │             │               │  Render     │              │
 │                │             │               │  form with  │              │
 │                │             │               │  account=5  │              │
 │                │             │               │             │              │
 │  Fill form     │             │               │             │              │
 │  & submit      │             │               │             │              │
 ├────────────────┼─────────────┼──────────────>│             │              │
 │                │             │               │  POST       │              │
 │                │             │               │  /contacts/ │              │
 │                │             │               ├────────────>│              │
 │                │             │               │             │  INSERT      │
 │                │             │               │             ├─────────────>│
 │                │             │               │             │              │
 │                │             │               │             │  New contact │
 │                │             │               │             │  (id=42)     │
 │                │             │               │             │<─────────────┤
 │                │             │               │  Response   │              │
 │                │             │               │  {id:42,... }              │
 │                │             │               │<────────────┤              │
 │                │             │               │             │              │
 │                │  onContactCreated(contact)  │             │              │
 │                │<────────────┼───────────────┤             │              │
 │                │             │               │             │              │
 │                │  Add to     │               │             │              │
 │                │  selection  │               │             │              │
 │                │  array      │               │             │              │
 │                │             │               │             │              │
 │  See new       │             │               │             │              │
 │  contact       │             │               │             │              │
 │  selected      │             │               │             │              │
 │<───────────────┤             │               │             │              │
 │                │             │               │             │              │
```

## State Flow

### Initial State
```javascript
// NameLookup state
{
  entityType: 'contact',
  currentSelection: null,
  isNewContactModalOpen: false,
  value: []  // No contacts selected yet
}
```

### After Clicking "New Contact"
```javascript
// NameLookup state
{
  entityType: 'contact',
  currentSelection: null,
  isNewContactModalOpen: true,  // ← Modal opens
  value: []
}
```

### After Creating Contact
```javascript
// API Response
{
  id: 42,
  first_name: "Rudolf",
  last_name: "Ralfi",
  email: "rudolf@swiss.com",
  account_id: 5,
  account: { id: 5, name: "Swiss" }
}

// NameLookup state
{
  entityType: 'contact',
  currentSelection: null,
  isNewContactModalOpen: false,  // ← Modal closes
  value: [
    {
      id: 42,
      first_name: "Rudolf",
      last_name: "Ralfi",
      email: "rudolf@swiss.com",
      account_id: 5,
      account: { id: 5, name: "Swiss" },
      entityType: 'contact'  // ← Added by NameLookup
    }
  ]
}
```

## Props Cascade

```
AccountPage
  accountId: 5
    ↓
ActivityQuickActions
  entity: { id: 5, name: "Swiss", ... }
  entityType: "account"
    ↓
NewTaskModal
  defaultValues: {
    relatedTo: { id: 5, name: "Swiss", entityType: "account" }
  }
    ↓
NameLookup
  accountId: 5  ← Extracted from relatedTo
  value: []
  onChange: (contacts) => setFormData({...formData, name: contacts})
    ↓
Lookup
  apiEndpoint: "/contacts/"
  additionalFilters: { account_id: 5 }
  showCreateNew: true
  createNewLabel: "New Contact"
  onCreateNew: () => setIsNewContactModalOpen(true)
    ↓
NewContactModal
  isOpen: true
  defaultAccountId: 5
  onContactCreated: (contact) => {
    onChange([...value, { ...contact, entityType: 'contact' }])
  }
    ↓
NewContactForm
  defaultAccountId: 5
  onSubmit: (data) => createContact({ ...data, account_id: 5 })
```

## API Call Details

### Search Contacts (Initial)
```http
GET /contacts/?account_id=5
Authorization: Bearer <token>

Response:
[
  { id: 10, first_name: "John", last_name: "Doe", account_id: 5 },
  { id: 15, first_name: "Jane", last_name: "Smith", account_id: 5 }
]
```

### Create New Contact
```http
POST /contacts/
Authorization: Bearer <token>
Content-Type: application/json

{
  "first_name": "Rudolf",
  "last_name": "Ralfi",
  "title": "Mr",
  "email": "rudolf@swiss.com",
  "phone": "+41 123 456 789",
  "account_id": 5,
  "reports_to": null,
  "description": ""
}

Response:
{
  "id": 42,
  "first_name": "Rudolf",
  "last_name": "Ralfi",
  "title": "Mr",
  "email": "rudolf@swiss.com",
  "phone": "+41 123 456 789",
  "account_id": 5,
  "account": {
    "id": 5,
    "name": "Swiss"
  },
  "reports_to": null,
  "description": "",
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

## Key Features

1. **Context Awareness** - Account ID flows from page → modal → form
2. **Automatic Selection** - New contact immediately added to task
3. **Cache Invalidation** - React Query refreshes contact list
4. **Disabled Field** - Account dropdown locked when pre-filled
5. **Seamless UX** - No page navigation required
