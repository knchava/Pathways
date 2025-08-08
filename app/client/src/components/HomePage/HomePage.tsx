// src/pages/Homepage.tsx
import React, { useState, useContext, useEffect } from "react";
import ItineraryModal from "./Itinerary";
import { useNavigate } from "react-router-dom";
import {
  ItinerariesContext,
  Itinerary,
} from "../../context/ItinerariesContext";

interface ItineraryEvent {
  eventId: number;
  id: number;
  type: "attraction" | "restaurant" | string;
  name: string;
  categories: string;
  date: string;
  startTime: string;  // e.g. "5:00 AM"
  endTime: string;    // e.g. "7:00 AM"
}

const Homepage: React.FC = () => {
  const navigate = useNavigate();
  const { list: itineraries, setList: setItineraries } =
    useContext(ItinerariesContext);

  const [showModal, setShowModal] = useState(false);
  const [editingItinerary, setEditingItinerary] = useState<Itinerary | null>(
    null
  );

  // events‐modal state
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [currentEvents, setCurrentEvents] = useState<ItineraryEvent[]>([]);
  const [eventsTitle, setEventsTitle] = useState("");

  // load itineraries on mount
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    fetch(`http://localhost:3001/api/itineraries?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.itineraries) setItineraries(data.itineraries);
      })
      .catch(console.error);
  }, [setItineraries]);

  // create or update itinerary
  const handleSaveItinerary = (data: Itinerary) => {
    if (editingItinerary) {
      setItineraries((prev) =>
        prev.map((it) => (it.id === editingItinerary.id ? data : it))
      );
    } else {
      setItineraries((prev) => [...prev, data]);
    }
    setEditingItinerary(null);
    setShowModal(false);
  };

  // delete itinerary
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this itinerary?"))
      return;
    try {
      const res = await fetch(
        `http://localhost:3001/api/itineraries/${id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error();
      setItineraries((prev) => prev.filter((it) => it.id !== id));
    } catch (e) {
      console.error(e);
      alert("Error deleting itinerary.");
    }
  };

  // open "create / update" modal
  const handleUpdateClick = (it: Itinerary) => {
    setEditingItinerary(it);
    setShowModal(true);
  };

  // fetch & show events in pop-up
  const handleViewEvents = async (it: Itinerary) => {
    try {
      const res = await fetch(
        `http://localhost:3001/api/itineraries/${it.id}/events`
      );
      if (!res.ok) throw new Error();
      const data = await res.json();

      const evts: ItineraryEvent[] = (data.events || []).map((raw: any) => {
        // extract date
        const dateStr =
          (raw.event_date || raw.Event_date || "").slice(0, 10) ||
          new Date(raw.start_time || raw.Start_time).toISOString().slice(0,10);

        // parse times
        const to12 = (iso: string) =>
          new Date(iso).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });

        return {
          eventId: raw.eventId ?? raw.event_id,
          id: raw.id ?? raw.place_id,
          type: raw.type,
          name: raw.name,
          categories: raw.categories,
          date: dateStr,
          startTime: to12(raw.start_time ?? raw.Start_time),
          endTime:   to12(raw.end_time   ?? raw.End_time),
        };
      });

      setCurrentEvents(evts);
      setEventsTitle(`${it.destination} (${it.startDate} → ${it.endDate})`);
      setShowEventsModal(true);
    } catch (e) {
      console.error(e);
      alert("Failed to load events.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* ==== Create Itinerary Panel ==== */}
      <div className="flex justify-center mb-10">
        <div className="p-8 bg-white shadow rounded text-center">
          <h1 className="text-3xl font-bold mb-4">Add an Itinerary</h1>
          <p className="text-gray-600 mb-6">
            Start planning your personalized trip now!
          </p>
          <button
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => {
              setEditingItinerary(null);
              setShowModal(true);
            }}
          >
            Create Itinerary
          </button>
        </div>
      </div>

      {/* ==== List of Itineraries ==== */}
      {itineraries.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Your Itineraries</h2>
          <div className="grid gap-4">
            {itineraries.map((it) => (
              <div
                key={it.id}
                className="bg-white p-4 rounded shadow flex justify-between items-center hover:shadow-md transition cursor-pointer"
                onClick={() => navigate(`/itineraries/${it.id}`)}
              >
                <div>
                  <p>
                    <strong>Destination:</strong> {it.destination}
                  </p>
                  <p>
                    <strong>Start:</strong> {it.startDate}
                  </p>
                  <p>
                    <strong>End:</strong> {it.endDate}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewEvents(it);
                    }}
                  >
                    View Events
                  </button>
                  <button
                    className="bg-yellow-400 text-white px-4 py-1 rounded hover:bg-yellow-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateClick(it);
                    }}
                  >
                    Update
                  </button>
                  <button
                    className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(it.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==== Itinerary Create / Edit Modal ==== */}
      {showModal && (
        <ItineraryModal
          onClose={() => {
            setEditingItinerary(null);
            setShowModal(false);
          }}
          onSave={handleSaveItinerary}
          defaultValues={editingItinerary ?? undefined}
        />
      )}

      {/* ==== Events Pop-up Modal ==== */}
      {showEventsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg w-full max-w-xl max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-xl font-semibold">Events for {eventsTitle}</h3>
              <button
                className="text-red-500 text-2xl leading-none"
                onClick={() => setShowEventsModal(false)}
              >
                ×
              </button>
            </div>
            <div className="p-4 overflow-y-auto h-[60vh] space-y-3">
              {currentEvents.length === 0 ? (
                <p className="text-gray-600">No events found.</p>
              ) : (
                currentEvents.map((evt) => (
                  <div
                    key={evt.eventId}
                    className="p-3 border rounded bg-gray-50"
                  >
                    <p className="text-sm text-gray-700">Date: {evt.date}</p>
                    <p className="font-bold">{evt.name}</p>
                    <p className="text-sm text-gray-700">Type: {evt.type}</p>
                    <p className="text-sm text-gray-700">
                      Categories: {evt.categories}
                    </p>
                    <p className="text-sm text-gray-700">
                      Time: {evt.startTime} – {evt.endTime}
                    </p>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t text-right">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => setShowEventsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Homepage;
