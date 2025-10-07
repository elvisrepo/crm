from django.contrib import admin
from .models import Activity


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = (
        'subject',
        'type',
        'assigned_to',
        'due_date',
        'status',
        'priority',
        'created_at'
    )
    list_filter = ('type', 'status', 'priority', 'assigned_to')
    search_fields = ('subject', 'description', 'assigned_to__email')
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)

    fieldsets = (
        (None, {
            'fields': ('type', 'subject', 'description', 'assigned_to')
        }),
        ('Task Specific', {
            'classes': ('collapse',),
            'fields': ('status', 'priority', 'due_date')
        }),
        ('Event Specific', {
            'classes': ('collapse',),
            'fields': ('start_time', 'end_time', 'location', 'is_all_day_event', 'attendees')
        }),
        ('Related To', {
            'classes': ('collapse',),
            'fields': ('account', 'opportunity', 'contract', 'order', 'invoice', 'contact', 'lead')
        }),
        ('System Info', {
            'fields': ('version', 'created_at', 'updated_at')
        }),
    )

    readonly_fields = ('created_at', 'updated_at')
