import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface PreferencesFormData {
  travelPreferences: string;
  interests: string;
  accessibilityNeed: string;
  ambiencePreference: string;
  activityPreferences: string;
  ageGroup: string;
}

export default function PreferencesDisplay() {
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState<PreferencesFormData | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('userPreferences');
    if (stored) setPrefs(JSON.parse(stored));
  }, []);

  if (!prefs) {
    return (
      <div className="p-4">
        <p>No preferences set yet.</p>
        <button
          onClick={() => navigate('/preferences')}
          className="mt-2 text-blue-500"
        >
          Set Preferences
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Your Preferences</h1>
      <ul className="space-y-2">
        <li><strong>Travel Preferences:</strong> {prefs.travelPreferences}</li>
        <li><strong>Interests:</strong> {prefs.interests}</li>
        <li><strong>Accessibility Need:</strong> {prefs.accessibilityNeed}</li>
        <li><strong>Ambience:</strong> {prefs.ambiencePreference}</li>
        <li><strong>Activity Preferences:</strong> {prefs.activityPreferences}</li>
        <li><strong>Age Group:</strong> {prefs.ageGroup}</li>
      </ul>
      <button
        onClick={() => navigate('/preferences')}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Update Preferences
      </button>
    </div>
  );
}
