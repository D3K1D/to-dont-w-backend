# api/views.py

from rest_framework import viewsets
from .models import Task, Category
from .serializers import TaskSerializer, CategorySerializer
from rest_framework.permissions import IsAuthenticated

# This viewset handles all the create, read, update, delete (CRUD) operations for Tasks
class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Users can only see their own tasks
        return Task.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        # When a task is created, assign the current user as the owner
        serializer.save(owner=self.request.user)

# This viewset handles all CRUD operations for Categories
class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Users can only see their own categories
        return Category.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        # When a category is created, assign the current user as the owner
        serializer.save(owner=self.request.user)