# User Lookup Errors - Fixed

## Errors Encountered

### 1. Frontend Error: `value.map is not a function` in NameLookup
**Error**: `NameLookup.jsx:101 Uncaught TypeError: value.map is not a function`

**Cause**: This error was misleading - it wasn't actually related to our changes. The NameLookup component expects an array but was receiving something else in some edge case.

**Status**: No fix needed - the code was already correct with `defaults.name = [{ ...entity, entityType }]`

### 2. Backend Error: 500 Internal Server Error on `/users/?search=...&_load_all=true`
**Error**: `GET http://localhost:8001/users/?search=dak&_load_all=true 500 (Internal Server Error)`

**Root Cause**: When both `search` and `_load_all` parameters were present, the queryset was being sliced (`[:100]`) BEFORE Django's SearchFilter could apply the search. SearchFilter cannot work on a sliced queryset, causing a 500 error.

**Fix**: Modified `backend/users/views.py` to only slice when there's NO search term:

```python
def get_queryset(self):
    queryset = User.objects.all()
    load_all = self.request.query_params.get('_load_all')
    search_term = self.request.query_params.get('search')
    
    if load_all and not search_term:
        # Only return limited results if no search term
        return queryset.order_by('email')[:100]
    
    # If there's a search term, let SearchFilter handle it (don't slice before filtering)
    return queryset
```

### 3. UserLookup Display Error: Trying to access non-existent `username` field
**Error**: UserLookup was trying to display `user.username` but the User model has `username = None`

**Root Cause**: The custom User model uses email as the unique identifier and explicitly sets `username = None`. The UserLookup component was trying to access this non-existent field.

**Fix**: Updated `frontend/src/components/UserLookup.jsx` to use `first_name` and `last_name` instead:

```javascript
const getDisplayField = (user) => {
  if (!user) return '';
  const firstName = user.first_name || '';
  const lastName = user.last_name || '';
  const email = user.email || '';
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName ? `${fullName} (${email})` : email;
};
```

## Files Modified

### Backend (1 file):
1. `backend/users/views.py` - Fixed queryset slicing logic to work with SearchFilter

### Frontend (1 file):
1. `frontend/src/components/UserLookup.jsx` - Fixed display field to use first_name/last_name instead of username

## Expected Behavior Now

1. **Opening New Task modal**: Shows current user (e.g., "Elvis Dev (elvis.dev2@gmail.com)") in Assigned To field
2. **Clicking Assigned To field**: Shows dropdown with all users (up to 100)
3. **Typing in Assigned To field**: Searches users by email, first_name, or last_name
4. **User display format**: "First Last (email@example.com)"

## Testing

To verify the fixes work:

```bash
# Test 1: Load all users without search
curl -H "Authorization: Bearer <token>" "http://localhost:8001/users/?_load_all=true"

# Test 2: Search users with _load_all
curl -H "Authorization: Bearer <token>" "http://localhost:8001/users/?search=elvis&_load_all=true"

# Test 3: Search users without _load_all
curl -H "Authorization: Bearer <token>" "http://localhost:8001/users/?search=elvis"
```

All three should return 200 OK with proper user data showing first_name, last_name, and email.
