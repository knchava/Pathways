// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/navbar/Navbar";
import Signup from "./components/Signup/Signup";
import UserPreferences from "./components/UserPreferences/UserPreferences";
import PreferencesDisplay from "./components/UserPreferences/PreferencesDisplay";
import Homepage from "./components/HomePage/HomePage";
import ItineraryPage from "./components/IternaryPage/IternaryPage";
import PlanStep from "./components/IternaryPage/Plan";
import Timeline from "./components/Timeline/Timeline";
import RecommendationsPage from "./components/Recommendation/RecommendationPage";
import { ItinerariesProvider } from "./context/ItinerariesContext";

// Standalone wrapper so <SearchPage> gets its required prop
import SearchPage from "./components/HotelSearch/SearchPage";
const SearchPageWrapper: React.FC = () => (
  <SearchPage onSelectHotel={() => { /* noop */ }} />
);

const Settings: React.FC = () => (
  <div className="p-4">
    <h1 className="text-2xl font-bold">Settings</h1>
    <p>Settings page content goes here.</p>
  </div>
);

const Help: React.FC = () => (
  <div className="p-4">
    <h1 className="text-2xl font-bold">Help</h1>
    <p>Help page content goes here.</p>
  </div>
);

export default function App() {
  return (
    <ItinerariesProvider>
      <Router>
        <Navbar />
        <main className="flex-1 p-4">
          <Routes>
            <Route path="/" element={<Signup />} />
            <Route path="/preferences" element={<UserPreferences />} />
            <Route path="/preferences/view" element={<PreferencesDisplay />} />
            <Route path="/home" element={<Homepage />} />
            <Route path="/search" element={<SearchPageWrapper />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<Help />} />
            <Route path="/itineraries/:id" element={<ItineraryPage />} />
            <Route path="/itineraries/:id/plan" element={<PlanStep />} />
            <Route path="/itineraries/:id/visualize" element={<Timeline />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
          </Routes>
        </main>
      </Router>
    </ItinerariesProvider>
  );
}
