# Activity Integration Guide

## Overview
This guide shows how to integrate ActivityQuickActions and ActivityTimeline components into entity detail pages.

## Completed Integrations
- ✅ AccountPage
- ✅ ContactPage

## Integration Pattern

### 1. Import Required Components

```jsx
import ActivityQuickActions from '../components/ActivityQuickActions';
import ActivityTimeline from '../components/ActivityTimeline';
import { useAuth } from '../auth/useAuth';
```

### 2. Get Current User

```jsx
const { user } = useAuth();
```

### 3. Add Activity Section to JSX

Add this section before the closing `</div>` of the main container:

```jsx
{/* Activity Management Section */}
<div className={styles.activitySection}>
    <h2>Activities</h2>
    <ActivityQuickActions
        entity={entityObject}
        entityType="entityType"
        currentUser={user}
    />
    <ActivityTimeline
        entityType="entityType"
        entityId={parseInt(id)}
    />
</div>
```

### 4. Add CSS Styles

Add to the page's CSS module:

```css
/* Activity Section */
.activitySection {
    margin-top: 3rem;
}

.activitySection h2 {
    font-size: 1.75rem;
    color: #333;
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #007bff;
}
```

## Entity Type Mapping

| Page | Entity Type | Entity Object | ID Source |
|------|-------------|---------------|-----------|
| AccountPage | `"account"` | `account` | `id` from useParams |
| ContactPage | `"contact"` | `contact` | `id` from useParams |
| LeadPage | `"lead"` | `lead` | `id` from useParams |
| OpportunityPage | `"opportunity"` | `opportunity` | `id` from useParams |
| ContractPage | `"contract"` | `contract` | `id` from useParams |
| OrderPage | `"order"` | `order` | `id` from useParams |
| InvoiceDetailPage | `"invoice"` | `invoice` | `id` from useParams |

## Remaining Pages to Integrate

### LeadPage.jsx
```jsx
// Add imports
import ActivityQuickActions from '../components/ActivityQuickActions';
import ActivityTimeline from '../components/ActivityTimeline';
import { useAuth } from '../auth/useAuth';

// In component
const { user } = useAuth();

// Before closing </div>
<div className={styles.activitySection}>
    <h2>Activities</h2>
    <ActivityQuickActions
        entity={lead}
        entityType="lead"
        currentUser={user}
    />
    <ActivityTimeline
        entityType="lead"
        entityId={parseInt(id)}
    />
</div>
```

### OpportunityPage.jsx
```jsx
// Add imports
import ActivityQuickActions from '../components/ActivityQuickActions';
import ActivityTimeline from '../components/ActivityTimeline';
import { useAuth } from '../auth/useAuth';

// In component
const { user } = useAuth();

// Before closing </div>
<div className={styles.activitySection}>
    <h2>Activities</h2>
    <ActivityQuickActions
        entity={opportunity}
        entityType="opportunity"
        currentUser={user}
    />
    <ActivityTimeline
        entityType="opportunity"
        entityId={parseInt(id)}
    />
</div>
```

### ContractPage.jsx
```jsx
// Add imports
import ActivityQuickActions from '../components/ActivityQuickActions';
import ActivityTimeline from '../components/ActivityTimeline';
import { useAuth } from '../auth/useAuth';

// In component
const { user } = useAuth();

// Before closing </div>
<div className={styles.activitySection}>
    <h2>Activities</h2>
    <ActivityQuickActions
        entity={contract}
        entityType="contract"
        currentUser={user}
    />
    <ActivityTimeline
        entityType="contract"
        entityId={parseInt(id)}
    />
</div>
```

### OrderPage.jsx
```jsx
// Add imports
import ActivityQuickActions from '../components/ActivityQuickActions';
import ActivityTimeline from '../components/ActivityTimeline';
import { useAuth } from '../auth/useAuth';

// In component
const { user } = useAuth();

// Before closing </div>
<div className={styles.activitySection}>
    <h2>Activities</h2>
    <ActivityQuickActions
        entity={order}
        entityType="order"
        currentUser={user}
    />
    <ActivityTimeline
        entityType="order"
        entityId={parseInt(id)}
    />
</div>
```

### InvoiceDetailPage.jsx
```jsx
// Add imports
import ActivityQuickActions from '../components/ActivityQuickActions';
import ActivityTimeline from '../components/ActivityTimeline';
import { useAuth } from '../auth/useAuth';

// In component
const { user } = useAuth();

// Before closing </div>
<div className={styles.activitySection}>
    <h2>Activities</h2>
    <ActivityQuickActions
        entity={invoice}
        entityType="invoice"
        currentUser={user}
    />
    <ActivityTimeline
        entityType="invoice"
        entityId={parseInt(id)}
    />
</div>
```

## Testing Checklist

After integration, verify:
- [ ] Quick action buttons appear
- [ ] Clicking Task/Event/Call opens respective modal
- [ ] Modal pre-fills with entity data
- [ ] Activity timeline loads activities
- [ ] Filter buttons work (All, Tasks, Events)
- [ ] Refresh button reloads activities
- [ ] Activities are grouped correctly
- [ ] Creating activity updates timeline

## Notes

- The `currentUser` prop is used to pre-fill the "Assigned To" field in modals
- The `entity` prop provides context for pre-filling "Name" or "Related To" fields
- Entity type determines whether the entity is a "who" (contact/lead) or "what" (account/opportunity/etc.)
- ActivityTimeline automatically filters activities by entity type and ID
