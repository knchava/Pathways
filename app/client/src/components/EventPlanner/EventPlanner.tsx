import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

interface Event {
  type: "attraction" | "restaurant";
  eventId: number;
  id: number;
  categories: string;
  startTime: string;
  endTime: string;
  name: string;
}

export default function EventPlanner() {
  const { id: itineraryId } = useParams<{ id: string }>();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<"attraction" | "restaurant">(
    "attraction"
  );
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");

  useEffect(() => {
    fetchEvents();
  }, [itineraryId]);

  const fetchEvents = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/itineraries/${itineraryId}/events`
      );
      if (!response.ok) throw new Error("Failed to fetch events");
      const data = await response.json();
      setEvents(data.events);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async (type: "attraction" | "restaurant") => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/${type}-categories`
      );
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data.categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleTypeChange = (type: "attraction" | "restaurant") => {
    setSelectedType(type);
    setSelectedCategory("");
    fetchCategories(type);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !startTime || !endTime) return;

    try {
      const endpoint =
        selectedType === "attraction"
          ? "attraction-events"
          : "restaurant-events";
      const response = await fetch(`http://localhost:3001/api/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [selectedType === "attraction" ? "attractionId" : "businessId"]: 1, // You'll need to get this from your selection
          categories: selectedCategory,
          itineraryId,
          startTime,
          endTime,
        }),
      });

      if (!response.ok) throw new Error("Failed to create event");

      // Refresh events list
      fetchEvents();

      // Reset form
      setSelectedCategory("");
      setStartTime("");
      setEndTime("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  if (loading) return <p>Loading events...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Plan Your Events</h2>

      <div className="mb-4">
        <button
          className={`mr-2 px-4 py-2 ${
            selectedType === "attraction"
              ? "bg-blue-500 text-white"
              : "bg-gray-200"
          }`}
          onClick={() => handleTypeChange("attraction")}
        >
          Attractions
        </button>
        <button
          className={`px-4 py-2 ${
            selectedType === "restaurant"
              ? "bg-blue-500 text-white"
              : "bg-gray-200"
          }`}
          onClick={() => handleTypeChange("restaurant")}
        >
          Restaurants
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2">Start Time</label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-2">End Time</label>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Add Event
        </button>
      </form>

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Your Events</h3>
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.eventId} className="p-4 border rounded">
              <h4 className="font-bold">{event.name}</h4>
              <p>Type: {event.type}</p>
              <p>Category: {event.categories}</p>
              <p>
                Time: {new Date(event.startTime).toLocaleString()} -{" "}
                {new Date(event.endTime).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
