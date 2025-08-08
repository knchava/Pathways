import React, { useState, useEffect } from "react";

interface Location {
  lat: number | null;
  lng: number | null;
}

interface Hotel {
  Hotel_Name: string;
  Hotel_Rating?: number;
  Description?: string;
}

interface SearchPageProps {
  onSelectHotel: (hotelName: string) => void;
  attraction?: string;
}

const SearchPage: React.FC<SearchPageProps> = ({
  onSelectHotel,
  attraction,
}) => {
  const [query, setQuery] = useState<string>("");
  const [location, setLocation] = useState<Location>({ lat: null, lng: null });
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [mapCity, setMapCity] = useState<string>("");

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) =>
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.error("Error getting geolocation:", err)
    );
  }, []);
  const fetchHotels = (city: string) => {
    fetch(
      `http://localhost:3001/api/top-hotels?city=${encodeURIComponent(city)}`
    )
      .then((res) => res.json())
      .then((data) =>
        setHotels(
          data.hotels.map((hotel: any) => ({
            ...hotel,
            Hotel_Rating: hotel.Hotel_Rating
              ? parseFloat(hotel.Hotel_Rating)
              : undefined,
          }))
        )
      )
      .catch(console.error);
  };
  useEffect(() => {
    if (attraction) {
      const city = attraction.trim();
      setQuery(city);
      setMapCity(city);
      fetchHotels(city);
    }
  }, [attraction]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const city = query.trim();
    setMapCity(city);
    fetchHotels(city);
  };

  const mapSrc = mapCity
    ? `https://maps.google.com/maps?q=${encodeURIComponent(
        mapCity
      )}&z=15&output=embed`
    : location.lat && location.lng
    ? `https://maps.google.com/maps?q=${location.lat},${location.lng}&z=15&output=embed`
    : "";

  return (
    <div className="min-h-screen bg-gray-100">
      <form
        onSubmit={handleSearch}
        className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-8"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">
          {attraction
            ? `Top Hotels near ${attraction}`
            : "Search Top Hotels by City"}
        </h1>
        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
          <input
            type="text"
            placeholder="Enter a city..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-4 py-2 focus:outline-none"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4"
          >
            Search
          </button>
        </div>
      </form>

      {mapSrc && (
        <div className="max-w-2xl h-64 mx-auto rounded-lg overflow-hidden shadow-lg mt-6">
          <iframe
            src={mapSrc}
            className="w-full h-full"
            frameBorder="0"
            allowFullScreen
            title="map"
          />
        </div>
      )}

      {hotels.length > 0 && (
        <div className="max-w-2xl mx-auto mt-6">
          <h2 className="text-xl font-bold mb-4">Top Hotels</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {hotels.map((hotel, idx) => (
              <div
                key={idx}
                className="p-4 border rounded shadow cursor-pointer hover:bg-gray-100"
                onClick={() => onSelectHotel(hotel.Hotel_Name)}
              >
                <h3 className="font-bold text-lg">{hotel.Hotel_Name}</h3>
                {hotel.Hotel_Rating !== undefined && (
                  <p className="text-sm">Rating: {hotel.Hotel_Rating}</p>
                )}
                {hotel.Description && (
                  <p className="mt-2 text-gray-600">{hotel.Description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
