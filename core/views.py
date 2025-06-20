# prediction_api/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import pandas as pd
from datetime import datetime

from .serializers import SalesPredictionSerializer
from .apps import PredictionApiConfig # Import the AppConfig where models are loaded

class SalesPredictionView(APIView):
    """
    API endpoint for predicting sales based on input features.
    """
    def post(self, request, format=None):
        serializer = SalesPredictionSerializer(data=request.data)

        if serializer.is_valid():
            model = PredictionApiConfig.model
            store_info_df = PredictionApiConfig.store_info_df
            training_columns = PredictionApiConfig.training_columns

            if model is None or store_info_df is None or training_columns is None:
                return Response(
                    {"error": "ML model or data not loaded. Please check server logs."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            data = serializer.validated_data
            store_id = data['store_id']
            prediction_date_obj = pd.to_datetime(data['date'])
            promo = 1 if data['promo'] else 0 # Convert boolean to 0/1
            state_holiday_input = data['state_holiday']
            school_holiday = 1 if data['school_holiday'] else 0 # Convert boolean to 0/1

            # Determine 'Open' status (closed on Sundays or State Holidays)
            day_of_week = prediction_date_obj.weekday() # Monday is 0, Sunday is 6
            is_open = 1
            if day_of_week == 6 or state_holiday_input in ['a', 'b', 'c']:
                is_open = 0
                return Response(
                    {"predicted_sales": 0.0, "message": f"Store is CLOSED on {prediction_date_obj.strftime('%Y-%m-%d')} (Sunday or State Holiday). No sales predicted."},
                    status=status.HTTP_200_OK
                )
            input_data = pd.DataFrame({
                'Store': [store_id],
                'DayOfWeek': [day_of_week],
                'Promo': [promo],
                'StateHoliday': [1 if state_holiday_input in ['a', 'b', 'c'] else 0],
                'SchoolHoliday': [school_holiday],
                'Year': [prediction_date_obj.year],
                'Month': [prediction_date_obj.month],
                'Day': [prediction_date_obj.day],
                'WeekOfYear': [prediction_date_obj.isocalendar().week],
                'DayOfYear': [prediction_date_obj.dayofyear]
            })

            try:
                store_static_info = store_info_df[store_info_df['Store'] == store_id].iloc[0]
            except IndexError:
                return Response(
                    {"error": f"Store ID {store_id} not found in store data."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            input_data['CompetitionDistance'] = store_static_info['CompetitionDistance']
            input_data['CompetitionOpenSinceMonth'] = store_static_info['CompetitionOpenSinceMonth']
            input_data['CompetitionOpenSinceYear'] = store_static_info['CompetitionOpenSinceYear']
            input_data['Promo2'] = store_static_info['Promo2']
            input_data['Promo2SinceWeek'] = store_static_info['Promo2SinceWeek']
            input_data['Promo2SinceYear'] = store_static_info['Promo2SinceYear']

            # Handle PromoInterval
            month_map = {'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
                         'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12}
            promo_interval_val = store_static_info['PromoInterval']
            for month_name in month_map.keys():
                # Ensure promo_interval_val is treated as string for 'in' operator
                input_data[f'PromoInterval_{month_name}'] = 1 if month_name in str(promo_interval_val) else 0

            # One-hot encode StoreType and Assortment
            for col in ['StoreType', 'Assortment']:
                for category in store_info_df[col].unique():
                    input_data[f'{col}_{category}'] = 0
                input_data[f'{col}_{store_static_info[col]}'] = 1

            # Align with training columns
            # Create a DataFrame with all training columns, initialized to 0
            processed_input = pd.DataFrame(0, index=[0], columns=training_columns)
            # Fill in values from the current input_data where columns match
            for col in input_data.columns:
                if col in training_columns:
                    processed_input[col] = input_data[col].values[0] # .values[0] to get scalar from Series

            # Make prediction
            try:
                predicted_sales = model.predict(processed_input)[0]
                # Ensure sales are not negative
                predicted_sales = max(0, predicted_sales)
                return Response(
                    {"predicted_sales": round(predicted_sales, 2)},
                    status=status.HTTP_200_OK
                )
            except Exception as e:
                return Response(
                    {"error": f"Error during prediction: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)