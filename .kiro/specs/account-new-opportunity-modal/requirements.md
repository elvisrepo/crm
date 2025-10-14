# Requirements Document

## Introduction

This feature adds inline opportunity creation functionality to the Account detail page. Users will be able to create new opportunities directly from an account's page through a modal dialog, with the account field automatically pre-filled with the current account. This mirrors the existing "New Contact" functionality and streamlines the workflow for sales users who are viewing an account and want to quickly create an associated opportunity.

## Requirements

### Requirement 1: Modal-Based Opportunity Creation

**User Story:** As a sales user viewing an account detail page, I want to click a "New Opportunity" button that opens a modal form, so that I can quickly create an opportunity without navigating away from the account page.

#### Acceptance Criteria

1. WHEN the user clicks the "New Opportunity" button in the AccountPage header THEN a modal dialog SHALL open displaying the opportunity creation form
2. WHEN the modal is open THEN the underlying account page content SHALL remain visible but not interactive
3. WHEN the user clicks outside the modal or presses the cancel button THEN the modal SHALL close without creating an opportunity
4. WHEN the user successfully creates an opportunity THEN the modal SHALL close automatically

### Requirement 2: Account Pre-Population

**User Story:** As a sales user creating an opportunity from an account page, I want the account field to be automatically filled with the current account, so that I don't have to manually select it from a dropdown.

#### Acceptance Criteria

1. WHEN the opportunity creation modal opens from an account page THEN the account field SHALL be pre-filled with the current account's ID
2. WHEN the account field is pre-filled THEN it SHALL be disabled to prevent the user from changing it
3. WHEN the form is submitted THEN the opportunity SHALL be associated with the pre-filled account

### Requirement 3: Form Validation and Submission

**User Story:** As a sales user creating an opportunity, I want the form to validate my input and provide clear feedback, so that I can successfully create valid opportunities.

#### Acceptance Criteria

1. WHEN the user submits the form with required fields empty THEN the form SHALL display validation errors
2. WHEN the user submits a valid form THEN the system SHALL call the createOpportunity API with the form data
3. WHEN the API call succeeds THEN the system SHALL invalidate relevant queries to refresh the data
4. WHEN the API call fails THEN the form SHALL display the error message to the user
5. WHEN the form is submitting THEN the submit button SHALL be disabled and show a loading state

### Requirement 4: Data Refresh After Creation

**User Story:** As a sales user who just created an opportunity from an account page, I want to see the new opportunity appear in the related opportunities list immediately, so that I can confirm it was created successfully.

#### Acceptance Criteria

1. WHEN an opportunity is successfully created THEN the system SHALL invalidate the opportunities query cache
2. WHEN an opportunity is successfully created THEN the system SHALL invalidate the current account query cache
3. WHEN the caches are invalidated THEN the account page SHALL automatically refetch and display the updated data
4. WHEN the new opportunity appears in the list THEN it SHALL be clickable and navigate to the opportunity detail page

### Requirement 5: Reuse Existing Components

**User Story:** As a developer, I want to reuse the existing OpportunityForm component, so that the UI and behavior are consistent across the application.

#### Acceptance Criteria

1. WHEN implementing the modal THEN the system SHALL use the existing OpportunityForm component
2. WHEN implementing the modal THEN the system SHALL use the existing Modal component
3. WHEN the OpportunityForm is used in create mode THEN it SHALL display "New Opportunity" as the title
4. WHEN the OpportunityForm receives a pre-filled account_id THEN it SHALL disable the account dropdown
