# Lookup Components Documentation

## Overview
A set of reusable lookup/autocomplete components for searching and selecting related entities in the CRM application.

## Components

### 1. Lookup (Base Component)
**File:** `src/components/Lookup.jsx`

Generic lookup component that provides the foundation for all specialized lookups.

**Props:**
- `apiEndpoint` - API endpoint to fetch results from
- `searchParam` - Query parameter name for search (default: 'search')
- `displayField` - Field name or function to format display text
- `placeholder` - Input placeholder text
- `value` - Currently selected item
- `onChange` - Callback when selection changes
- `disabled` - Disable the component
- `onError` - Error callback

**Features:**
- 300ms debounced search
- Loading and error states
- Keyboard navigation (Arrow keys, Enter, Escape, Tab)
- Click outside to close
- Selected item displayed as removable chip

---

### 2. NameLookup (Who Field)
**File:** `src/components/NameLookup.jsx`

Lookup for contacts and leads with entity type switching.

**Props:**
- `value` - Selected contact/lead
- `onChange` - Callback when selection changes
- `disabled` - Disable the component
- `defaultEntityType` - Initial entity type ('contact' or 'lead')
- `onError` - Error callback

**Features:**
- Switch between Contacts and Leads
- Formats display: "First Last" for contacts, "First Last - Company" for leads
- Includes entity type in returned value
- Shows entity type indicator with icon

**Usage:**
```jsx
<NameLookup
  value={nameValue}
  onChange={setNameValue}
  defaultEntityType="contact"
/>
```

---

### 3. UserLookup (Assigned To Field)
**File:** `src/components/UserLookup.jsx`

Lookup for selecting users.

**Props:**
- `value` - Selected user
- `onChange` - Callback when selection changes
- `disabled` - Disable the component
- `defaultValue` - Pre-fill with default user
- `onError` - Error callback

**Features:**
- Searches users by username, email, first_name, last_name
- Formats display: "username (email)"
- Shows user icon indicator

**Usage:**
```jsx
<UserLookup
  value={userValue}
  onChange={setUserValue}
/>
```

---

### 4. AttendeesLookup (Multi-Select Users)
**File:** `src/components/AttendeesLookup.jsx`

Multi-select lookup for adding multiple users as attendees.

**Props:**
- `value` - Array of selected users
- `onChange` - Callback when selection changes (receives array)
- `disabled` - Disable the component
- `onError` - Error callback

**Features:**
- Add multiple users
- Each attendee displayed as removable chip
- Prevents duplicate selections
- Shows attendee count

**Usage:**
```jsx
<AttendeesLookup
  value={attendeesValue}
  onChange={setAttendeesValue}
/>
```

---

### 5. RelatedToLookup (What Field)
**File:** `src/components/RelatedToLookup.jsx`

Lookup for related entities (Account, Opportunity, Contract, Order, Invoice).

**Props:**
- `value` - Selected entity
- `onChange` - Callback when selection changes
- `disabled` - Disable the component
- `defaultEntityType` - Initial entity type (default: 'account')
- `onError` - Error callback

**Features:**
- Switch between 5 entity types
- Custom display formatting per entity type
- Includes entity type in returned value
- Shows entity type indicator with icon

**Entity Types:**
- Account (🏢) - Shows account name
- Opportunity (💼) - Shows opportunity name
- Contract (📄) - Shows "Contract for [Account]"
- Order (📦) - Shows "Order for [Account]"
- Invoice (🧾) - Shows invoice number

**Usage:**
```jsx
<RelatedToLookup
  value={relatedToValue}
  onChange={setRelatedToValue}
  defaultEntityType="account"
/>
```

---

## Testing

A test page is available at `src/components/LookupTest.jsx` that demonstrates all lookup components with live output.

To use the test page, import and render it in your app:

```jsx
import LookupTest from './components/LookupTest';

// In your router or app
<Route path="/lookup-test" element={<LookupTest />} />
```

## Keyboard Navigation

All lookup components support:
- **↓ / ↑** - Navigate through results
- **Enter** - Select highlighted item
- **Escape / Tab** - Close dropdown
- **Type** - Search with 300ms debounce

## Styling

All components use CSS modules for scoped styling and follow the existing CRM design patterns:
- Consistent color scheme (#007bff primary)
- Hover and focus states
- Responsive design
- Accessible keyboard navigation

## Backend Requirements

All lookup components require the corresponding backend endpoints to support the `?search=<term>` query parameter (implemented in Task 5).
