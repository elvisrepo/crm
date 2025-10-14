# Implementation Plan

- [x] 1. Enhance OpportunityForm component to support pre-filled account
  - Add `defaultAccountId` prop to OpportunityForm component
  - Update form state initialization to use `defaultAccountId` when provided
  - Modify account dropdown to be disabled when `defaultAccountId` is not null
  - Ensure form submission works correctly with pre-filled account
  - _Requirements: 2.1, 2.2, 2.3, 5.1, 5.3, 5.4_

- [x] 2. Add modal state and queries to AccountPage
  - Import `createOpportunity` and `getAccounts` from API client
  - Add `isNewOpportunityModalOpen` state to AccountPage component
  - Add accounts query with conditional fetching (enabled when modal is open)
  - _Requirements: 1.1, 5.2_

- [x] 3. Implement createOpportunityMutation in AccountPage
  - Create mutation using `useMutation` hook with `createOpportunity` API function
  - Configure mutation to pre-fill `account_id` with current account ID
  - Implement `onSuccess` handler to invalidate queries and close modal
  - Implement `onError` handler to log errors
  - _Requirements: 3.2, 3.3, 4.1, 4.2, 4.3_

- [x] 4. Convert "New Opportunity" Link to button with modal trigger
  - Change "New Opportunity" from Link component to button element
  - Add onClick handler to open modal (`setIsNewOpportunityModalOpen(true)`)
  - Maintain existing styling with `styles.primaryButton` class
  - _Requirements: 1.1_

- [x] 5. Add Modal with OpportunityForm to AccountPage JSX
  - Add Modal component at the end of AccountPage return statement
  - Configure Modal with `isOpen` and `onClose` props
  - Add OpportunityForm inside Modal with all required props
  - Pass `defaultAccountId` as `parseInt(id)` to OpportunityForm
  - Pass mutation handlers and state to OpportunityForm
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 3.1, 3.4, 3.5, 5.1, 5.2_

- [ ] 6. Verify data refresh and UI updates
  - Test that new opportunity appears in Related Opportunities list after creation
  - Verify that query invalidation triggers automatic data refetch
  - Confirm modal closes automatically on successful creation
  - Check that opportunity is clickable and navigates to detail page
  - _Requirements: 4.1, 4.2, 4.3, 4.4_
