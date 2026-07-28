# backend/py_service/app.py

from flask import Flask, request, jsonify
import joblib
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # allows Node to call this service

# Load model and any preprocessors
model = joblib.load("../model/student_performance_model_final.joblib")

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        features = [
            data.get("study_hours_per_day", 0),
            data.get("extracurricular_hours_per_day", 0),
            data.get("sleep_hours_per_day", 0),
            data.get("social_hours_per_day", 0),
            data.get("physical_activity_hours_per_day", 0),
            {"Low": 0, "Moderate": 1, "High": 2}.get(data.get("stress_level", "Moderate"), 1),
            data.get("attendance", 0)
        ]

        features_array = np.array(features).reshape(1, -1)
        predicted_gpa = float(model.predict(features_array)[0])

        return jsonify({"predicted_gpa": predicted_gpa})

    except Exception as e:
        import traceback
        print("❌ Prediction error:", e)
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
