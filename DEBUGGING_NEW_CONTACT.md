# Debugging New Contact Feature

## Steps to Debug

### 1. Open Browser Console
Press F12 or right-click → Inspect → Console tab

### 2. Try Creating a Contact

When you click "New Contact" and fill the form, you should see these console logs:

```
Form data being submitted: {
  first_name: "Test",
  last_name: "User",
  title: "Mr",
  email: "test@example.com",
  phone: "",
  account_id: 5,
  reports_to: null,
  description: ""
}

Submitting contact data: {
  first_name: "Test",
  last_name: "User",
  title: "Mr",
  email: "test@example.com",
  phone: "",
  account_id: 5,
  reports_to: null,
  description: ""
}
```

### 3. Check for Errors

If you see an error, it will be logged as:
```
Error creating contact: [error details]
```

### 4. Check Network Tab

1. Open DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Try creating a contact
4. Look for a POST request to `/contacts/`
5. Click on it to see:
   - Request payload
   - Response status
   - Response body

## Common Issues

### Issue 1: Modal Closes Immediately

**Symptom:** Modal closes right after clicking "Create Contact"

**Possible Causes:**
1. Form validation failing silently
2. Event bubbling causing overlay click
3. Missing `e.stopPropagation()` somewhere

**Debug:**
- Check if you see the console logs
- Check if there's a network request
- Add `console.log('Modal opened')` in NewContactModal

### Issue 2: No Network Request

**Symptom:** No POST request appears in Network tab

**Possible Causes:**
1. Form validation preventing submission
2. React Query mutation not firing
3. API client issue

**Debug:**
- Check if "Form data being submitted" appears in console
- Check if "Submitting contact data" appears in console
- Try filling ALL required fields (first_name, last_name, title, account)

### Issue 3: 400 Bad Request

**Symptom:** Network request shows 400 error

**Possible Causes:**
1. Missing required fields
2. Invalid data format
3. Backend validation failing

**Debug:**
- Check the response body in Network tab
- Verify account_id is a number, not a string
- Check if all required fields are present

### Issue 4: 401 Unauthorized

**Symptom:** Network request shows 401 error

**Possible Causes:**
1. Not logged in
2. Token expired
3. CORS issue

**Debug:**
- Check if you're logged in
- Try refreshing the page
- Check if other API calls work

### Issue 5: Contact Created But Not Selected

**Symptom:** Contact is created in database but doesn't appear in Name field

**Possible Causes:**
1. `onContactCreated` callback not firing
2. `onChange` not being called
3. State not updating

**Debug:**
- Check if "Contact created successfully" appears in console
- Add `console.log('onContactCreated called with:', newContact)` in NameLookup
- Check if the contact appears in the database

## Manual Testing Steps

### Test 1: Basic Creation
1. Go to Account page (e.g., `/accounts/5`)
2. Click "Task" button
3. Click on "Name" field
4. Click "New Contact" at bottom of dropdown
5. Fill in:
   - First Name: "Debug"
   - Last Name: "Test"
   - Title: "Mr"
   - Email: "debug@test.com"
   - (Account should be pre-filled and disabled)
6. Click "Create Contact"
7. Watch console for logs
8. Watch Network tab for request

**Expected:**
- Console shows form data
- Network shows POST /contacts/ with 201 status
- Modal closes
- "Debug Test" appears in Name field

### Test 2: Check Database
After creating a contact, check if it's in the database:

```sql
SELECT * FROM contacts ORDER BY id DESC LIMIT 1;
```

Should show your newly created contact.

### Test 3: Check React Query Cache
In console, type:
```javascript
window.__REACT_QUERY_DEVTOOLS__
```

Or install React Query DevTools to see if the cache is updating.

## Quick Fixes

### Fix 1: If Modal Closes Too Fast
Add this to NewContactModal handleSubmit:
```javascript
const handleSubmit = async (contactData) => {
  setError(null);
  console.log('handleSubmit called');
  
  const dataToSubmit = {
    ...contactData,
    account_id: contactData.account_id || defaultAccountId
  };
  
  console.log('About to mutate:', dataToSubmit);
  await createContactMutation.mutateAsync(dataToSubmit);
};
```

### Fix 2: If Account Not Pre-filled
Check in NameLookup:
```javascript
console.log('NameLookup accountId:', accountId);
```

And in NewContactModal:
```javascript
console.log('NewContactModal defaultAccountId:', defaultAccountId);
```

And in NewContactForm:
```javascript
console.log('NewContactForm defaultAccountId:', defaultAccountId);
console.log('Form initial state:', formData);
```

### Fix 3: If Contact Not Auto-Selected
Add to NameLookup handleContactCreated:
```javascript
const handleContactCreated = (newContact) => {
  console.log('handleContactCreated called with:', newContact);
  console.log('Current value:', value);
  
  const updatedValue = [...value, { ...newContact, entityType: 'contact' }];
  console.log('New value:', updatedValue);
  
  onChange(updatedValue);
  setIsNewContactModalOpen(false);
};
```

## Verification Checklist

After implementing fixes, verify:

- [ ] Console shows "Form data being submitted"
- [ ] Console shows "Submitting contact data"
- [ ] Network tab shows POST /contacts/
- [ ] Response status is 201 Created
- [ ] Console shows "Contact created successfully"
- [ ] Console shows "handleContactCreated called with"
- [ ] Modal closes after creation
- [ ] Contact appears in Name field
- [ ] Contact is in database
- [ ] No console errors

## Still Not Working?

If it's still not working, please provide:

1. **Console logs** - Copy all console output
2. **Network request** - Copy the request payload and response
3. **Error messages** - Any red errors in console
4. **Screenshots** - Show the modal and any error messages
5. **Backend logs** - Check Django console for errors

## Alternative: Simpler Approach

If the modal approach is too complex, we can try a simpler inline approach:

1. Show a mini-form directly in the dropdown
2. Just ask for First Name and Last Name
3. Auto-fill everything else
4. Create contact with minimal data

Let me know if you want me to implement this simpler version!
