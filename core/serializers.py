# prediction_api/serializers.py

from rest_framework import serializers

class SalesPredictionSerializer(serializers.Serializer):
    """
    Serializer for validating input data for sales prediction.
    """
    store_id = serializers.IntegerField(
        min_value=1,
        help_text="Enter Store ID (e.g., 1, 10, 1115)"
    )
    date = serializers.DateField(
        format="%Y-%m-%d",
        help_text="Enter Date (YYYY-MM-DD, e.g., 2015-08-01)"
    )
    promo = serializers.BooleanField(
        help_text="Is there a promotion on this day? (false for No, true for Yes)"
    )
    state_holiday = serializers.ChoiceField(
        choices=[('0', 'None'), ('a', 'Public'), ('b', 'Easter'), ('c', 'Christmas')],
        help_text="Is it a State Holiday? (0 for None, a for Public, b for Easter, c for Christmas)"
    )
    school_holiday = serializers.BooleanField(
        help_text="Is it a School Holiday? (false for No, true for Yes)"
    )

    def validate_store_id(self, value):
        from .apps import PredictionApiConfig
        if PredictionApiConfig.store_info_df is not None:
            if value not in PredictionApiConfig.store_info_df['Store'].unique():
                raise serializers.ValidationError(f"Store ID {value} not found in store data.")
        return value