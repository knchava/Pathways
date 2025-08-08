import React, { useState, useEffect, useCallback } from "react";

interface ItineraryFormData {
  userId: string;
  startDate: string;
  endDate: string;
  destination: string;
}

interface ItineraryModalProps {
  onClose: () => void;
  onSave: (data: ItineraryFormData & { id: number }) => void;
  defaultValues?: ItineraryFormData & { id?: number };
}

const ItineraryModal: React.FC<ItineraryModalProps> = ({
  onClose,
  onSave,
  defaultValues,
}) => {
  const [formData, setFormData] = useState<ItineraryFormData>({
    userId: "",
    startDate: "",
    endDate: "",
    destination: "",
  });
  const [loading, setLoading] = useState(false);
  const isEditMode = !!defaultValues?.id;

  // Close on ESC
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (defaultValues) {
      setFormData(defaultValues);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [defaultValues, handleKeyDown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const storedUserId = localStorage.getItem("userId");
      if (!storedUserId) {
        throw new Error("User ID not found.");
      }
      const payload = {
        userId: storedUserId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        destination: formData.destination,
      };
      let url = "http://localhost:3001/api/itineraries";
      let method = "POST";
      if (isEditMode && defaultValues?.id !== undefined) {
        url = `http://localhost:3001/api/itineraries/${defaultValues.id}`;
        method = "PUT";
      }
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error("Failed to save itinerary");
      }
      const result = await response.json();
      console.log("Backend saved Itinerary:", result);
      const newId = isEditMode ? defaultValues.id! : result.itineraryId;
      onSave({ ...payload, id: newId });
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error saving itinerary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg w-full max-w-md p-6">
        <h2 className="text-2xl font-semibold mb-4">
          {isEditMode ? "Update Itinerary" : "Create Itinerary"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* <div>
            <label className="block mb-1 font-medium">User ID</label>
            <input
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              placeholder="User ID"
              className="w-full p-2 border rounded"
              required
              disabled
            />
          </div> */}
          <div>
            <label className="block mb-1 font-medium">Start Date</label>
            <input
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">End Date</label>
            <input
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
              min={formData.startDate || undefined}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Destination</label>
            <input
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              placeholder="Destination City"
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? "Saving..." : isEditMode ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItineraryModal;
