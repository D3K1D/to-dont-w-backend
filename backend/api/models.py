from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=7)

    class Meta:
        unique_together = ('owner', 'name')

    def __str__(self):
        return self.name

class Task(models.Model):
    class Priority(models.TextChoices):
        HIGH = 'High', 'High'
        MEDIUM = 'Medium', 'Medium'
        LOW = 'Low', 'Low'
        NONE = '', ''

    title = models.CharField(max_length=200)
    notes = models.TextField(null=True, blank=True)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    completed = models.BooleanField(default=False)
    
    priority = models.CharField(
        max_length=6,
        choices=Priority.choices,
        default=Priority.NONE,
        blank=True
    )
    
    recurrence = models.CharField(max_length=50, blank=True, help_text="Comma-separated days, e.g., Mon,Tue,Wed")
    reminders = models.CharField(max_length=100, blank=True)
    
    category = models.ForeignKey('Category', on_delete=models.SET_NULL, null=True, blank=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.title} for {self.owner.username}"