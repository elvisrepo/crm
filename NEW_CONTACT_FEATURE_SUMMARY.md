# New Contact Creation from NameLookup Feature

## Overview
Added the ability to create a new contact directly from the NameLookup component's dropdown. When viewing an account page and creating a task, users can now click "New Contact" in the contact search dropdown to create a contact that's automatically linked to the current account and selected for the task.

## Changes Made

### 1. **Lookup.jsx** - Added "Create New" Option Support
- Added new props:
  - `showCreateNew` (boolean) - Controls whether to show the create new option
  - `createNewLabel` (string) - Customizable label for the create button
  - `onCreateNew` (function) - Callback when create new is clicked
  
- Added UI element at the bottom of the dropdown:
  ```jsx
  <div className={styles.createNewOption}>
    <span className={styles.createNewIcon}>+</span>
    <span className={styles.createNewText}>New Contact</span>
  </div>
  ```

### 2. **Lookup.module.css** - Styled the Create New Option
- Added `.createNewOption` - Container with border-top separator
- Added `.createNewIcon` - Blue circular plus icon
- Added `.createNewText` - Label text styling
- Hover effects for better UX

### 3. **NewContactModal.jsx** - Created Modal Wrapper
- Wraps the existing `NewContactForm` component
- Handles contact creation via React Query mutation
- Accepts `defaultAccountId` prop to pre-fill the account field
- Calls `onContactCreated` callback with the newly created contact
- Automatically invalidates the contacts query cache

### 4. **NewContactForm.jsx** - Added Default Account Support
- Added `defaultAccountId` prop
- Pre-fills the account field when `defaultAccountId` is provided
- Disables the account dropdown when a default account is set
- Initializes form state with the default account ID

### 5. **NameLookup.jsx** - Integrated the Flow
- Added state for modal: `isNewContactModalOpen`
- Added `handleCreateNew()` - Opens the modal
- Added `handleContactCreated()` - Receives the new contact and automatically adds it to the selection
- Passes `showCreateNew={entityType === 'contact'}` to only show for contacts (not leads)
- Passes `defaultAccountId={accountId}` to pre-fill the account in the form
- Renders the `NewContactModal` component

## User Flow

1. **User is on Account Page** (e.g., viewing "Swiss" account)
2. **User clicks "Task" quick action** → NewTaskModal opens
3. **User clicks on "Name" field** → NameLookup dropdown shows contacts from Swiss account
4. **User sees "New Contact" option** at the bottom of the dropdown
5. **User clicks "New Contact"** → NewContactModal opens
6. **Form is pre-filled** with Account = "Swiss" (disabled field)
7. **User fills in contact details** (First Name, Last Name, Email, etc.)
8. **User clicks "Create Contact"** → Contact is created in the database
9. **Contact is automatically selected** in the Name field
10. **User continues** filling out the task form

## Visual Example

```
┌─────────────────────────────────────┐
│  Name                               │
│  ┌───────────────────────────────┐ │
│  │ [Contact ▼] Search contacts...│ │
│  │                               │ │
│  │  👤 rudolf ralfi              │ │
│  │     swiss                     │ │
│  │  👤 lebron james              │ │
│  │     bbc                       │ │
│  │  👤 xhibril cisse             │ │
│  │     swiss                     │ │
│  │ ─────────────────────────────│ │
│  │  ⊕  New Contact               │ ← NEW!
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

## Benefits

1. **Faster Workflow** - No need to navigate away to create a contact
2. **Context Preservation** - Account is automatically set based on current context
3. **Immediate Selection** - Newly created contact is instantly selected
4. **Reduced Errors** - No manual linking required
5. **Better UX** - Seamless inline creation experience

## Technical Details

### Props Flow
```
ActivityQuickActions
  └─> NewTaskModal
      └─> NameLookup (accountId={entity.id})
          ├─> Lookup (showCreateNew, onCreateNew)
          └─> NewContactModal (defaultAccountId={accountId})
              └─> NewContactForm (defaultAccountId)
```

### Data Flow
```
User clicks "New Contact"
  ↓
handleCreateNew() opens modal
  ↓
User fills form (account pre-filled)
  ↓
createContact API call
  ↓
handleContactCreated(newContact)
  ↓
onChange([...value, newContact])
  ↓
Contact appears in Name field
```

## Future Enhancements

1. **New Lead Support** - Add similar functionality for leads
2. **Quick Create** - Minimal form with just name and email
3. **Duplicate Detection** - Warn if similar contact exists
4. **Inline Editing** - Edit contact details from the dropdown
5. **Recent Contacts** - Show recently created contacts first

## Files Modified

- `frontend/src/components/Lookup.jsx`
- `frontend/src/components/Lookup.module.css`
- `frontend/src/components/NameLookup.jsx`
- `frontend/src/components/NewContactForm.jsx`

## Files Created

- `frontend/src/components/NewContactModal.jsx`
