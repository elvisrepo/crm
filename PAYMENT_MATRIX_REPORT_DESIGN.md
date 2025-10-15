# Payment Matrix Report - Plan & Design Document

## 1. Feature Overview

**Feature Name:** Monthly Payment Matrix Report

**Purpose:** Display a matrix showing actual payments made by each account for each month of a selected year.

**User Story:** As a CRM user, I want to see a monthly payment matrix so that I can quickly visualize which accounts are paying on time and identify payment patterns across all accounts.

---

## 2. Requirements

### Functional Requirements

1. **FR-1:** Display all accounts (regardless of whether they have payments)
2. **FR-2:** Show only completed payments (status = 'COMPLETED')
3. **FR-3:** Display actual payment amounts (not invoice amounts)
4. **FR-4:** Include payments from both Contracts and Orders
5. **FR-5:** Allow user to select year (default to current year)
6. **FR-6:** Show 0 for months with no payments
7. **FR-7:** Sum multiple payments in the same month
8. **FR-8:** Apply visual formatting (paid vs unpaid)

### Non-Functional Requirements

1. **NFR-1:** Report should load within 2 seconds for up to 100 accounts
2. **NFR-2:** Data should be accurate and reflect real-time payment status
3. **NFR-3:** UI should be responsive and work on desktop screens
4. **NFR-4:** Report should be accessible via navigation menu

---

## 3. Data Model & Relationships

### Entities Used

```
Account (all accounts)
  ↓
Payment (filtered by year, status='COMPLETED')
  ↓
  payment_date → Extract month (1-12)
  amount → Sum by account + month
```

### Key Fields

**Payment Model:**
- `id` (PK)
- `account_id` (FK → Account)
- `invoice_id` (FK → Invoice)
- `amount` (Decimal)
- `payment_date` (Date) ← **Key field for grouping**
- `status` (Enum) ← **Filter: COMPLETED only**
- `payment_method`

**Account Model:**
- `id` (PK)
- `name` ← **Display in report**
- `is_active` ← **Filter: active only**

---

## 4. Backend Design
gegt 
### 4.1 API Endpoint

**Endpoint:** `GET /api/reports/payment-matrix/`

**Query Parameters:**
- `year` (required): Integer (e.g., 2025)

**Response Format:**
```json
{
  "year": 2025,
  "accounts": [
    {
      "id": 1,
      "name": "Global Tech",
      "monthly_payments": {
        "1": 100.00,
        "2": 100.00,
        "3": 100.00,
        "4": 100.00,
        "5": 100.00,
        "6": 100.00,
        "7": 100.00,
        "8": 100.00,
        "9": 100.00,
        "10": 100.00,
        "11": 100.00,
        "12": 100.00
      },
      "total_year": 1200.00
    },
    {
      "id": 2,
      "name": "Innovate Corp",
      "monthly_payments": {
        "1": 100.00,
        "2": 100.00,
        "3": 0,
        "4": 100.00,
        "5": 100.00,
        "6": 100.00,
        "7": 100.00,
        "8": 100.00,
        "9": 100.00,
        "10": 100.00,
        "11": 100.00,
        "12": 100.00
      },
      "total_year": 1100.00
    }
  ],
  "monthly_totals": {
    "1": 200.00,
    "2": 200.00,
    "3": 100.00,
    ...
  },
  "grand_total": 2300.00
}
```

### 4.2 Query Logic

**Algorithm:**
```python
1. Get all active accounts
2. For each account:
   a. Query payments where:
      - account_id = account.id
      - YEAR(payment_date) = selected_year
      - status = 'COMPLETED'
   b. Group by MONTH(payment_date)
   c. Sum amounts for each month
   d. Fill missing months with 0
3. Calculate totals:
   - Per account (sum of all 12 months)
   - Per month (sum across all accounts)
   - Grand total (sum of all payments)
4. Return structured JSON
```

**Django ORM Approach:**
```python
from django.db.models import Sum, Q
from django.db.models.functions import ExtractMonth

# Step 1: Get all active accounts
accounts = Account.objects.filter(is_active=True).order_by('name')

# Step 2: Get payments grouped by account and month
payments_by_account_month = Payment.objects.filter(
    payment_date__year=year,
    status='COMPLETED'
).values('account_id').annotate(
    month=ExtractMonth('payment_date'),
    total=Sum('amount')
)

# Step 3: Build matrix structure
# (Details in implementation)
```

### 4.3 File Structure

**New Files:**
- `backend/reports/` (new app)
  - `__init__.py`
  - `views.py` ← PaymentMatrixView
  - `serializers.py` ← PaymentMatrixSerializer (optional)
  - `urls.py`
  - `apps.py`

**Modified Files:**
- `backend/crm_project/urls.py` ← Add reports URLs
- `backend/crm_project/settings.py` ← Add 'reports' to INSTALLED_APPS

---

## 5. Frontend Design

### 5.1 Page Structure

**Component:** `PaymentReportPage.jsx`

**Layout:**
```
┌─────────────────────────────────────────────┐
│  Payment Matrix Report                      │
│  ┌──────────────┐                          │
│  │ Year: [2025▼]│  [Export CSV]            │
│  └──────────────┘                          │
├─────────────────────────────────────────────┤
│  Company    │ Jan │ Feb │ Mar │ ... │ Dec │ Total │
├─────────────┼─────┼─────┼─────┼─────┼─────┼───────┤
│ Global Tech │ 100 │ 100 │ 100 │ ... │ 100 │ 1200  │
│ Innovate    │ 100 │ 100 │  0  │ ... │ 100 │ 1100  │
│ Acme Ltd    │  0  │ 100 │ 100 │ ... │  0  │  200  │
├─────────────┼─────┼─────┼─────┼─────┼─────┼───────┤
│ Total       │ 200 │ 300 │ 200 │ ... │ 200 │ 2500  │
└─────────────────────────────────────────────────┘
```

### 5.2 Visual Design

**Color Coding:**
- **Green background:** Payment made (amount > 0)
- **Red/Gray background:** No payment (amount = 0)
- **Bold text:** Total row and column

**Styling:**
```css
.paid {
  background-color: #d4edda; /* Light green */
  color: #155724;
}

.unpaid {
  background-color: #f8d7da; /* Light red */
  color: #721c24;
}

.totalRow {
  font-weight: bold;
  background-color: #e9ecef;
}

.totalColumn {
  font-weight: bold;
  border-left: 2px solid #dee2e6;
}
```

### 5.3 Component Structure

**Files:**
```
frontend/src/
├── pages/
│   └── PaymentReportPage.jsx ← Main component
├── components/
│   ├── PaymentMatrix.jsx ← Table component
│   └── YearSelector.jsx ← Year dropdown
├── api/
│   └── client.js ← Add getPaymentMatrix()
└── styles/
    └── PaymentReportPage.module.css
```

### 5.4 State Management

**State Variables:**
```javascript
const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
const [reportData, setReportData] = useState(null);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);
```

### 5.5 User Interactions

1. **Year Selection:**
   - Dropdown with years (2020-2030)
   - On change → Fetch new data

2. **Cell Click (Optional):**
   - Click on cell → Show payment details modal
   - Display: Invoice numbers, payment dates, amounts

3. **Export (Optional):**
   - Button to export as CSV
   - Include all data with proper formatting

---

## 6. Implementation Phases

### Phase 1: Backend API (Priority: High)
**Tasks:**
1. Create `reports` Django app
2. Implement `PaymentMatrixView`
3. Write query logic with Django ORM
4. Add URL routing
5. Test with sample data
6. Write unit tests

**Estimated Time:** 4-6 hours

### Phase 2: Frontend UI (Priority: High)
**Tasks:**
1. Create `PaymentReportPage.jsx`
2. Implement table rendering
3. Add year selector
4. Fetch data from API
5. Apply conditional styling
6. Add loading/error states
7. Add to navigation menu

**Estimated Time:** 4-6 hours

### Phase 3: Enhancements (Priority: Medium)
**Tasks:**
1. Add export to CSV functionality
2. Add cell click for payment details
3. Add account filtering
4. Add pagination for large datasets
5. Add print-friendly view

**Estimated Time:** 3-4 hours

---

## 7. Technical Specifications

### 7.1 Backend

**View Class:**
```python
class PaymentMatrixView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        year = request.query_params.get('year')
        # Validation
        # Query logic
        # Build response
        return Response(data)
```

**Permissions:**
- Authenticated users only
- No special role required (all users can view)

### 7.2 Frontend

**API Call:**
```javascript
export async function getPaymentMatrix(year) {
    const response = await api.get(`/reports/payment-matrix/?year=${year}`);
    return response.data;
}
```

**React Query:**
```javascript
const { data, isLoading, error } = useQuery({
    queryKey: ['paymentMatrix', selectedYear],
    queryFn: () => getPaymentMatrix(selectedYear)
});
```

---

## 8. Edge Cases & Validation

### Backend Validation
1. **Invalid year:** Return 400 error if year < 2000 or year > 2100
2. **No payments:** Return empty monthly_payments object (all zeros)
3. **No accounts:** Return empty accounts array
4. **Partial payments:** Sum all payments in the month

### Frontend Handling
1. **Loading state:** Show skeleton/spinner
2. **Error state:** Show error message with retry button
3. **Empty data:** Show "No data available for this year"
4. **Large datasets:** Consider pagination or virtual scrolling

---

## 9. Testing Strategy

### Backend Tests
```python
class PaymentMatrixViewTests(TestCase):
    def test_get_matrix_with_payments(self):
        # Create test data
        # Call API
        # Assert response structure
        
    def test_get_matrix_no_payments(self):
        # Test with no payments
        
    def test_get_matrix_multiple_payments_same_month(self):
        # Test summing logic
        
    def test_invalid_year(self):
        # Test validation
```

### Frontend Tests
- Component renders correctly
- Year selector works
- Data displays in table
- Conditional styling applies
- Loading/error states work

---

## 10. Success Criteria

✅ **Definition of Done:**
1. API returns correct payment data grouped by account and month
2. Frontend displays matrix table with all accounts
3. Visual formatting (green/red) works correctly
4. Year selector changes data
5. Totals row and column calculate correctly
6. Page loads within 2 seconds
7. Works on desktop browsers (Chrome, Firefox, Safari)
8. Code is tested and documented

---

## 11. Future Enhancements

**Phase 4 (Future):**
1. Add quarter view (Q1, Q2, Q3, Q4)
2. Add comparison view (2024 vs 2025)
3. Add charts/graphs
4. Add email report scheduling
5. Add drill-down to invoice details
6. Add filters (account type, payment method)
7. Add search functionality

---

## 12. Dependencies

**Backend:**
- Django REST Framework (already installed)
- Python 3.x
- PostgreSQL/MySQL

**Frontend:**
- React
- React Query (already used)
- CSS Modules

**No new dependencies required!**

---

## 13. Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Large dataset (1000+ accounts) | Slow loading | Add pagination, caching |
| Complex query performance | Timeout | Optimize query, add indexes |
| Missing payment data | Incorrect totals | Validate data integrity |
| Browser compatibility | UI breaks | Test on multiple browsers |

---

## 14. Next Steps

**Ready to implement?**

1. ✅ Review and approve this design
2. ✅ Confirm any changes needed
3. → Start Phase 1: Backend API implementation
4. → Start Phase 2: Frontend UI implementation
5. → Testing and refinement

**Shall I proceed with implementation?** 🚀
