import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface PreferencesFormData {
  travelPreferences: string;
  interests: string;
  accessibilityNeed: string;
  ambiencePreference: string;
  activityPreferences: string;
  ageGroup: string;
}

const STORAGE_KEY = "userPreferences";

const UserPreferences: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<PreferencesFormData>({
    travelPreferences: "",
    interests: "",
    accessibilityNeed: "",
    ambiencePreference: "",
    activityPreferences: "",
    ageGroup: "",
  });
  const [loading, setLoading] = useState(false);

  // Load existing preferences from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setFormData(JSON.parse(stored));
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error("User ID not found in localStorage.");
      }
      const response = await fetch(
        "http://localhost:3001/api/save-preferences",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, ...formData }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to save preferences");
      }
      console.log("Preferences saved successfully.");
      localStorage.setItem("userPreferences", JSON.stringify(formData));
      navigate("/preferences/view");
    } catch (error) {
      console.error("Error saving preferences:", error);
      alert("Failed to save preferences. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-6">
      <div className="w-full max-w-2xl bg-white shadow p-8 rounded">
        <h1 className="text-3xl font-bold text-center mb-6">
          Set Your Preferences
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="travelPreferences"
            placeholder="Travel Preferences (e.g., beach, mountains)"
            className="w-full p-2 border rounded"
            value={formData.travelPreferences}
            onChange={handleChange}
            required
          />
          <input
            name="interests"
            placeholder="Interests (e.g., hiking, museums)"
            className="w-full p-2 border rounded"
            value={formData.interests}
            onChange={handleChange}
            required
          />
          <select
            name="accessibilityNeed"
            className="w-full p-2 border rounded"
            value={formData.accessibilityNeed}
            onChange={handleChange}
            required
          >
            <option value="">Select Accessibility Need</option>
            <option value="None">None</option>
            <option value="Wheelchair Access">Wheelchair Access</option>
            <option value="Visual Assistance">Visual Assistance</option>
          </select>
          <select
            name="ambiencePreference"
            className="w-full p-2 border rounded"
            value={formData.ambiencePreference}
            onChange={handleChange}
            required
          >
            <option value="">Select Ambience Preference</option>
            <option value="Calm">Calm</option>
            <option value="Lively">Lively</option>
            <option value="Quiet">Quiet</option>
            <option value="Crowded">Crowded</option>
          </select>
          <input
            name="activityPreferences"
            placeholder="Activity Preferences (e.g., adventure, culture)"
            className="w-full p-2 border rounded"
            value={formData.activityPreferences}
            onChange={handleChange}
            required
          />
          <select
            name="ageGroup"
            className="w-full p-2 border rounded"
            value={formData.ageGroup}
            onChange={handleChange}
            required
          >
            <option value="">Select Age Group</option>
            <option value="Teen">Teen</option>
            <option value="Young Adult">Young Adult</option>
            <option value="Adult">Adult</option>
            <option value="Senior">Senior</option>
          </select>

          <button
            type="submit"
            className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Preferences"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserPreferences;
