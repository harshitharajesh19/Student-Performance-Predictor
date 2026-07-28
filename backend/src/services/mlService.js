// backend/src/services/mlService.js

import axios from "axios";

export const mlService = {
  predict: async (features) => {
    try {
      const response = await axios.post("http://localhost:5001/predict", features);
      return response.data.predicted_gpa;
    } catch (error) {
      console.error("ML Service Error:", error.message);
      throw new Error("Failed to get prediction from ML service");
    }
  },
};
