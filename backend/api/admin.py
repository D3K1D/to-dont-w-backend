from django.contrib import admin
from .models import Task, Category

# Added to admin panel to visualize the account syncing information being saved to the database
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'date', 'owner', 'category', 'priority', 'reminders')
    list_filter = ('owner', 'date', 'category')
    search_fields = ('title', 'notes')

class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'color', 'owner')
    list_filter = ('owner',)
    search_fields = ('name',)

admin.site.register(Task, TaskAdmin)
admin.site.register(Category, CategoryAdmin)