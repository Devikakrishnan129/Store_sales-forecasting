# core/apps.py

from django.apps import AppConfig
import os
import joblib
import pandas as pd

class PredictionApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'
    
    # Global variables to hold the loaded model and data
    model = None
    training_columns = None
    store_info_df = None

    def ready(self):
        print("Loading ML model and data...")
        output_dir = os.path.join(os.path.dirname(__file__), "ml_models")

        try:
            model_path = os.path.join(output_dir, "model.pkl")
            PredictionApiConfig.model = joblib.load(model_path)
            print(f"Model loaded from {model_path}")

            columns_path = os.path.join(output_dir, "training_columns.pkl")
            PredictionApiConfig.training_columns = joblib.load(columns_path)
            print(f"Training columns loaded from {columns_path}")

            store_info_path = os.path.join(output_dir, "store_info.csv")
            PredictionApiConfig.store_info_df = pd.read_csv(store_info_path)
            print(f"Store information loaded from {store_info_path}")

        except FileNotFoundError as e:
            print(f"Error: {e}. Ensure the '{output_dir}' directory contains model.pkl, training_columns.pkl, and store_info.csv.")
            print("Please ensure your model files are correctly placed.")
            raise
        except Exception as e:
            print(f"An unexpected error occurred during model loading: {e}")
            raise