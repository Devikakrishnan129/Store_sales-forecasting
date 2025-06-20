# prediction_api/urls.py

from django.urls import path
from .views import SalesPredictionView

urlpatterns = [
    path('predict_sales/', SalesPredictionView.as_view(), name='predict_sales'),
]