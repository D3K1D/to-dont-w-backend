from rest_framework import serializers
from .models import Task, Category, User

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'color']

class TaskSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        allow_null=True,
        required=False
    )
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Task
        # Add 'reminders' to this list
        fields = [
            'id', 'title', 'notes', 'date', 'start_time', 'end_time',
            'completed', 'priority', 'recurrence', 'reminders', 'category', 'owner'
        ]

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.category:
            representation['category'] = CategorySerializer(instance.category).data
        return representation
