import React, { useState, useEffect } from "react";

interface Hotel {
  Hotel_Id: number;
  Hotel_Name: string;
  Hotel_Rating: number;
  Address: string;
  City_Code: number;
  City_Name: string;
  Description: string;
}

const TopHotels: React.FC = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>("");

  useEffect(() => {
    if (selectedCity) {
      fetchTopHotels();
    }
  }, [selectedCity]);

  const fetchTopHotels = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching hotels for city:", selectedCity);
      const url = `http://localhost:3001/api/top-hotels?city=${encodeURIComponent(
        selectedCity
      )}`;
      console.log("Request URL:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }).catch((error) => {
        console.error("Network error:", error);
        throw new Error(`Network error: ${error.message}`);
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Server error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log("Received data:", data);
      setHotels(data.hotels);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while fetching hotels"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedCity(e.target.value);
  };

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Top 5-Star Hotels</h2>
      <div className="mb-4">
        <input
          type="text"
          value={selectedCity}
          onChange={handleCityChange}
          placeholder="Enter city name"
          className="border rounded-lg px-4 py-2 w-full md:w-64"
        />
      </div>
      {loading && selectedCity ? (
        <div className="p-4">Loading hotels in {selectedCity}...</div>
      ) : selectedCity ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hotels.map((hotel) => (
            <div
              key={hotel.Hotel_Id}
              className="border rounded-lg p-4 shadow hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2">{hotel.Hotel_Name}</h3>
              <p className="text-gray-600 mb-2">{hotel.Address}</p>
              <p className="text-gray-600 mb-2">{hotel.City_Name}</p>
              <div className="flex items-center mb-2">
                <span className="text-yellow-500">★</span>
                <span className="ml-1">{hotel.Hotel_Rating}</span>
              </div>
              <p className="text-gray-700">{hotel.Description}</p>
            </div>
          ))}
          {hotels.length === 0 && !loading && (
            <div className="col-span-full text-center text-gray-500">
              No 5-star hotels found in {selectedCity}
            </div>
          )}
        </div>
      ) : (
        <div className="text-gray-500">
          Please enter a city name to search for 5-star hotels
        </div>
      )}
    </div>
  );
};

export default TopHotels;
