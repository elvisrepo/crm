from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum
from django.db.models.functions import ExtractMonth
from decimal import Decimal
from .models import Payment
from .serializers import PaymentSerializer
from common.mixins import OptimisticLockingMixin
from accounts.models import Account

class PaymentList(generics.ListCreateAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Users should only see payments related to accounts they own.
        """
        return Payment.objects.filter(account__owner=self.request.user)

class PaymentDetail(OptimisticLockingMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Users should only see payments related to accounts they own.
        """
        return Payment.objects.filter(account__owner=self.request.user)


class PaymentMatrixView(APIView):
    """
    API view to generate a payment matrix report showing payments by account and month.
    
    Returns a matrix of all accounts with their monthly payment totals for a given year.
    Only includes completed payments.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get year parameter (required)
        year = request.query_params.get('year')
        
        # Validate year parameter
        if not year:
            return Response(
                {'error': 'Year parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            year = int(year)
            if year < 2000 or year > 2100:
                raise ValueError()
        except (ValueError, TypeError):
            return Response(
                {'error': 'Invalid year. Must be between 2000 and 2100'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get all active accounts
        accounts = Account.objects.filter(is_active=True).order_by('name')
        
        # Get all completed and pending payments for the year, grouped by account and month
        # Exclude only FAILED payments
        payments_data = Payment.objects.filter(
            payment_date__year=year
        ).exclude(
            status='FAILED'
        ).values('account_id').annotate(
            month=ExtractMonth('payment_date'),
            total=Sum('amount')
        )
        
        # Build a lookup dictionary: {account_id: {month: total}}
        payment_lookup = {}
        for payment in payments_data:
            account_id = payment['account_id']
            month = payment['month']
            total = payment['total']
            
            if account_id not in payment_lookup:
                payment_lookup[account_id] = {}
            payment_lookup[account_id][month] = float(total)
        
        # Build the response data
        accounts_data = []
        monthly_totals = {month: 0 for month in range(1, 13)}
        grand_total = Decimal('0.00')
        
        for account in accounts:
            # Get payments for this account (or empty dict if none)
            account_payments = payment_lookup.get(account.id, {})
            
            # Build monthly_payments dict with all 12 months
            monthly_payments = {}
            account_total = Decimal('0.00')
            
            for month in range(1, 13):
                amount = Decimal(str(account_payments.get(month, 0)))
                monthly_payments[str(month)] = float(amount)
                account_total += amount
                monthly_totals[month] += float(amount)
            
            grand_total += account_total
            
            accounts_data.append({
                'id': account.id,
                'name': account.name,
                'monthly_payments': monthly_payments,
                'total_year': float(account_total)
            })
        
        # Convert monthly_totals keys to strings for JSON
        monthly_totals_str = {str(k): v for k, v in monthly_totals.items()}
        
        return Response({
            'year': year,
            'accounts': accounts_data,
            'monthly_totals': monthly_totals_str,
            'grand_total': float(grand_total)
        })
