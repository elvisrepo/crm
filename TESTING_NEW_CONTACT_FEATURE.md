# Testing the New Contact Feature

## Prerequisites
- Backend server running on `http://localhost:8001`
- Frontend development server running
- At least one account in the database (e.g., "Swiss")
- User logged in

## Test Scenarios

### Scenario 1: Create Contact from Account Page Task

**Steps:**
1. Navigate to an Account detail page (e.g., `/accounts/5`)
2. Click the "Task" button in Quick Actions
3. The NewTaskModal opens
4. Click on the "Name" field
5. The dropdown shows existing contacts from that account
6. Scroll to the bottom and click "New Contact"
7. The NewContactModal opens
8. Verify the "Account" field is pre-filled with "Swiss" and disabled
9. Fill in the form:
   - First Name: "Rudolf"
   - Last Name: "Ralfi"
   - Title: "Mr"
   - Email: "rudolf@swiss.com"
   - Phone: "+41 123 456 789"
10. Click "Create Contact"
11. Verify the modal closes
12. Verify "Rudolf Ralfi" appears in the Name field as a selected chip
13. Complete the task form and save
14. Verify the task is created with Rudolf Ralfi as the contact

**Expected Results:**
- ✅ "New Contact" option appears at bottom of dropdown
- ✅ Modal opens when clicked
- ✅ Account field is pre-filled and disabled
- ✅ Contact is created successfully
- ✅ Contact is automatically selected in the Name field
- ✅ Task can be saved with the new contact

### Scenario 2: Multiple Contacts Selection

**Steps:**
1. Open Task modal from Account page
2. Click Name field
3. Select an existing contact (e.g., "John Doe")
4. Click Name field again
5. Click "New Contact"
6. Create a new contact "Jane Smith"
7. Verify both contacts appear in the selected list

**Expected Results:**
- ✅ Both contacts show as chips below the search field
- ✅ Each chip has a remove button (×)
- ✅ Counter shows "Selected (2):"

### Scenario 3: New Contact Not Available for Leads

**Steps:**
1. Open Task modal from Account page
2. Click Name field
3. Switch the dropdown from "Contact" to "Lead"
4. Click on the search field
5. Verify "New Contact" option does NOT appear

**Expected Results:**
- ✅ "New Contact" option only shows for Contact type
- ✅ Not available when Lead type is selected

### Scenario 4: Contact Appears in Subsequent Searches

**Steps:**
1. Create a new contact "Test User" via the New Contact modal
2. Close the task modal
3. Open a new task modal
4. Click Name field
5. Type "test" in the search
6. Verify "Test User" appears in the search results

**Expected Results:**
- ✅ Newly created contact is immediately available in searches
- ✅ Contact is associated with the correct account

### Scenario 5: Validation Errors

**Steps:**
1. Open New Contact modal
2. Leave First Name empty
3. Try to submit
4. Verify validation error appears
5. Fill in First Name
6. Leave Last Name empty
7. Try to submit
8. Verify validation error appears

**Expected Results:**
- ✅ Form validation prevents submission
- ✅ Required fields are enforced
- ✅ Error messages are clear

### Scenario 6: Cancel Contact Creation

**Steps:**
1. Open New Contact modal
2. Fill in some fields
3. Click "Cancel"
4. Verify modal closes
5. Verify no contact was created
6. Verify Name field is still empty

**Expected Results:**
- ✅ Modal closes without saving
- ✅ No API call is made
- ✅ Form state is reset

### Scenario 7: Network Error Handling

**Steps:**
1. Stop the backend server
2. Open New Contact modal
3. Fill in the form
4. Click "Create Contact"
5. Verify error message appears
6. Restart backend server
7. Try again
8. Verify contact is created successfully

**Expected Results:**
- ✅ Error message is displayed
- ✅ Modal stays open on error
- ✅ User can retry after fixing the issue

## Visual Verification Checklist

### Dropdown Appearance
- [ ] "New Contact" option has a blue circular + icon
- [ ] Option has a top border separator
- [ ] Hover effect changes background color
- [ ] Text is blue and bold

### Modal Appearance
- [ ] Modal has overlay that dims the background
- [ ] Modal is centered on screen
- [ ] Close button (×) is visible in top-right
- [ ] Form fields are properly aligned
- [ ] Account dropdown is visually disabled (grayed out)

### Selected Contacts Display
- [ ] Chips have rounded corners
- [ ] Contact icon (👤) appears before name
- [ ] Remove button (×) is visible on hover
- [ ] Multiple chips wrap properly

## API Verification

### Check Network Tab
1. Open browser DevTools → Network tab
2. Create a new contact
3. Verify the following requests:

**POST /contacts/**
```json
Request:
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

Response (201 Created):
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
  "updated_at": "2025-01-15T10:30:00Z",
  "version": 1
}
```

## Database Verification

### Check Database Directly
```sql
-- Verify contact was created
SELECT * FROM contacts WHERE id = 42;

-- Verify account association
SELECT c.*, a.name as account_name 
FROM contacts c 
JOIN accounts a ON c.account_id = a.id 
WHERE c.id = 42;

-- Verify task association
SELECT t.*, c.first_name, c.last_name 
FROM tasks t 
JOIN task_contacts tc ON t.id = tc.task_id 
JOIN contacts c ON tc.contact_id = c.id 
WHERE c.id = 42;
```

## Performance Testing

### Load Time
- [ ] Modal opens within 200ms
- [ ] Contact creation completes within 1 second
- [ ] Search results update within 500ms after creation

### Memory Leaks
- [ ] Open and close modal 10 times
- [ ] Check browser memory usage doesn't increase significantly
- [ ] Verify no console errors

## Accessibility Testing

### Keyboard Navigation
- [ ] Tab through form fields
- [ ] Press Enter to submit
- [ ] Press Escape to close modal
- [ ] Arrow keys work in dropdowns

### Screen Reader
- [ ] Form labels are announced
- [ ] Error messages are announced
- [ ] Success feedback is provided
- [ ] Button purposes are clear

## Edge Cases

### Empty Account
**Steps:**
1. Navigate to an account with no contacts
2. Open task modal
3. Click Name field
4. Verify "New Contact" option appears even with no results

**Expected:** ✅ Option is always visible for contacts

### Duplicate Names
**Steps:**
1. Create contact "John Doe"
2. Try to create another "John Doe"
3. Verify both can be created (no duplicate prevention yet)

**Expected:** ✅ Both contacts are created (future enhancement: duplicate detection)

### Special Characters
**Steps:**
1. Create contact with name "François Müller"
2. Create contact with email "test+tag@example.com"
3. Verify both are handled correctly

**Expected:** ✅ Special characters are preserved

### Long Names
**Steps:**
1. Create contact with very long first/last name (50+ characters)
2. Verify display in chip
3. Verify text truncation with ellipsis

**Expected:** ✅ Long names are truncated gracefully

## Regression Testing

### Existing Functionality
- [ ] Regular contact search still works
- [ ] Lead search still works
- [ ] Contact selection still works
- [ ] Contact removal still works
- [ ] Task creation still works
- [ ] Other modals (Event, Call) still work

## Browser Compatibility

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## Mobile Responsiveness

Test on:
- [ ] Mobile phone (< 768px)
- [ ] Tablet (768px - 1024px)
- [ ] Desktop (> 1024px)

## Common Issues & Solutions

### Issue: "New Contact" doesn't appear
**Solution:** Check that `entityType === 'contact'` (not 'lead')

### Issue: Account field is not pre-filled
**Solution:** Verify `accountId` prop is passed from parent component

### Issue: Contact not automatically selected
**Solution:** Check `onContactCreated` callback is wired correctly

### Issue: Modal doesn't close after creation
**Solution:** Verify mutation `onSuccess` calls `onClose()`

### Issue: Contact doesn't appear in search
**Solution:** Check React Query cache invalidation is working

## Success Criteria

All tests pass when:
- ✅ New Contact option appears in dropdown
- ✅ Modal opens and closes correctly
- ✅ Form validation works
- ✅ Contact is created in database
- ✅ Contact is automatically selected
- ✅ Account is pre-filled and locked
- ✅ No console errors
- ✅ No network errors
- ✅ UI is responsive
- ✅ Accessibility standards met
