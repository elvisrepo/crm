# User Lookup Fix - Summary

## Issues Fixed

1. **Current user not being set correctly** - The assigned user field wasn't showing the logged-in user (elvis.dev2@gmail.com)
2. **UserLookup missing dropdown functionality** - Unlike contacts search, users weren't showing in a dropdown when clicking the field

## Root Cause

The `user` object from `useAuth()` was a decoded JWT token with limited fields (id, username, email from token), not the full user object from the API. This caused:
- UserLookup couldn't display the user properly
- The user object structure didn't match what the API returns

## Changes Made

### 1. Created `useCurrentUser` Hook
**File:** `frontend/src/hooks/useCurrentUser.js` (NEW)

This hook fetches the full current user object from the `/users/me/` API endpoint, providing all user fields needed by UserLookup.

```javascript
export const useCurrentUser = () => {
  const { user: authUser } = useAuth();
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await api.get('/users/me/');
      return response.data;
    },
    enabled: !!authUser,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
```

### 2. Updated UserLookup Component
**File:** `frontend/src/components/UserLookup.jsx`

Added `additionalFilters` with `_load_all: 'true'` to trigger initial loading of all users (like NameLookup does for contacts).

```javascript
const additionalFilters = { _load_all: 'true' };
```

### 3. Updated Backend Users View
**File:** `backend/users/views.py`

Added `get_queryset()` method to handle the `_load_all` parameter:

```python
def get_queryset(self):
    queryset = User.objects.all()
    # Support loading all users for dropdown (limit to reasonable number)
    load_all = self.request.query_params.get('_load_all')
    if load_all:
        return queryset.order_by('email')[:100]  # Limit to first 100 users
    return queryset
```

### 4. Updated All Pages Using ActivityQuickActions

Updated the following pages to use `useCurrentUser()` instead of the basic auth user:

- `frontend/src/pages/AccountPage.jsx`
- `frontend/src/pages/ContactPage.jsx`
- `frontend/src/pages/LeadPage.jsx`
- `frontend/src/pages/OrderPage.jsx`
- `frontend/src/pages/OpportunityPage.jsx`
- `frontend/src/pages/ContractPage.jsx`
- `frontend/src/pages/InvoiceDetailPage.jsx`

**Changes in each file:**
1. Added import: `import { useCurrentUser } from '../hooks/useCurrentUser';`
2. Added hook call: `const { data: currentUser } = useCurrentUser();`
3. Changed prop: `currentUser={user}` → `currentUser={currentUser}`

## User Experience Now

### Before:
- Assigned To field showed generic "User" text
- No dropdown when clicking the field
- Had to type to search for users

### After:
1. **Assigned To field** pre-fills with current logged-in user (elvis.dev2@gmail.com)
2. **Clicking on Assigned To** shows dropdown with all users immediately (up to 100 users)
3. **Can search/filter** users by typing (searches email, first_name, last_name)
4. **Same behavior** as the contacts dropdown - consistent UX

## Technical Details

### Data Flow:
1. User logs in → JWT token stored with basic info (id, username, email)
2. Page loads → `useCurrentUser()` fetches full user object from `/users/me/`
3. Modal opens → `currentUser` passed as prop with all fields
4. UserLookup renders → Shows full user info (username + email)
5. User clicks field → Dropdown shows all users (via `_load_all` parameter)
6. User types → Searches users by email/name

### API Endpoints Used:
- `GET /users/me/` - Get current user's full details
- `GET /users/?_load_all=true` - Get all users for dropdown (limited to 100)
- `GET /users/?search=<term>` - Search users by email/first_name/last_name

## Testing Checklist

- [x] Backend supports `_load_all` parameter
- [x] UserLookup passes `_load_all` filter
- [x] `useCurrentUser` hook created
- [x] All 7 pages updated to use `useCurrentUser`
- [ ] Test: Open New Task modal - should show current user in Assigned To
- [ ] Test: Click Assigned To field - should show dropdown with all users
- [ ] Test: Type in Assigned To - should filter users
- [ ] Test: Select different user - should update assigned_to field
- [ ] Test: Create task - should save with correct assigned_to_id

## Files Modified

### Frontend (9 files):
1. `frontend/src/hooks/useCurrentUser.js` (NEW)
2. `frontend/src/components/UserLookup.jsx`
3. `frontend/src/pages/AccountPage.jsx`
4. `frontend/src/pages/ContactPage.jsx`
5. `frontend/src/pages/LeadPage.jsx`
6. `frontend/src/pages/OrderPage.jsx`
7. `frontend/src/pages/OpportunityPage.jsx`
8. `frontend/src/pages/ContractPage.jsx`
9. `frontend/src/pages/InvoiceDetailPage.jsx`

### Backend (1 file):
1. `backend/users/views.py`

## Notes

- The `_load_all` parameter limits results to 100 users for performance
- The current user data is cached for 5 minutes to reduce API calls
- The search functionality uses Django's SearchFilter on email, first_name, last_name fields
- All modals (NewTaskModal, NewEventModal, LogCallModal) automatically benefit from this fix
