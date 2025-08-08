// src/components/SearchLayout/SearchLayout.tsx
import React, { useState, useEffect } from 'react';

export interface Place {
  id: number;
  name: string;
  mainCategory?: string;
  categories?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  stars?: number;
}

export interface BagItem extends Place {
  type: 'attraction' | 'restaurant';
}

export interface SearchLayoutProps {
  city?: string;
  bag: BagItem[];
  onAdd: (place: Place, type: 'attraction' | 'restaurant') => void;
  onRemove: (id: number, type: 'attraction' | 'restaurant') => void;
  onContinue: () => void;
}

const SearchLayout: React.FC<SearchLayoutProps> = ({
  city, bag, onAdd, onRemove, onContinue,
}) => {
  const [attractionList, setAttractionList] = useState<Place[]>([]);
  const [restaurantList, setRestaurantList]   = useState<Place[]>([]);
  const [searchAttraction, setSearchAttraction] = useState('');
  const [searchRestaurant,  setSearchRestaurant]  = useState('');

  useEffect(() => {
    const userId = localStorage.getItem('userId') ?? '';
    if (!city) {
      setAttractionList([]);
      setRestaurantList([]);
      return;
    }

    fetch(`http://localhost:3001/api/top-attractions?city=${encodeURIComponent(city)}&userId=${encodeURIComponent(userId)}`)
      .then(res => res.json())
      .then(data => {
        const raw = data.attractions ?? [];
        const places: Place[] =
          raw.length && typeof raw[0] === 'object'
            ? (raw as any[]).map(o => ({
                id: o.attractionID ?? o.id,
                name: o.name,
                mainCategory: o.main_category,
                categories: o.categories,
              }))
            : (raw as string[]).map((name, i) => ({ id: i+1, name }));
        setAttractionList(places);
      })
      .catch(err => {
        console.error('Failed to load attractions:', err);
        setAttractionList([]);
      });

    fetch(`http://localhost:3001/api/top-restaurants?city=${encodeURIComponent(city)}&userId=${encodeURIComponent(userId)}`)
      .then(res => res.json())
      .then(data => {
        const raw = data.restaurants ?? [];
        let places: Place[];
        console.log(raw);
        if (raw.length && typeof raw[0] === 'object') {
          // [{ id, name, rating, categories }, …]
          console.log(raw);
          places = (raw as any[]).map(o => ({
            id:       o.id,
            name:     o.name,
            stars:    o.rating,
            categories: o.categories,
          }));
        } else {
          places = (raw as string[]).map((name, i) => ({ id: i+1, name }));
        }
        setRestaurantList(places);
        console.log(places)
      })
      .catch(err => {
        console.error('Failed to load restaurants:', err);
        setRestaurantList([]);
      });
  }, [city]);

  // Always guard against undefined name
  const filteredAttractions = attractionList.filter(
    a => a.name?.toLowerCase().includes(searchAttraction.toLowerCase())
  );
  const filteredRestaurants = restaurantList.filter(
    r => r.name?.toLowerCase().includes(searchRestaurant.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Attractions */}
      <section>
        <h2 className="text-2xl font-semibold mb-2">
          Search Attractions{city ? ` in ${city}` : ''}
        </h2>
        <input
          type="text"
          placeholder="Filter attractions…"
          value={searchAttraction}
          onChange={e => setSearchAttraction(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <ul className="space-y-1 max-h-48 overflow-auto">
          {filteredAttractions.map(place => (
            <li
              key={place.id}
              className="flex justify-between items-center p-2 border rounded hover:bg-gray-100"
            >
              <div>
                <p className="font-medium">{place.name}</p>
                {place.mainCategory && <p className="text-sm">{place.mainCategory}</p>}
                {place.categories   && <p className="text-xs">{place.categories}</p>}
              </div>
              <button onClick={() => onAdd(place, 'attraction')} className="text-blue-500">
                Add
              </button>
            </li>
          ))}
          {filteredAttractions.length === 0 && (
            <li className="text-gray-500 p-2">No attractions found.</li>
          )}
        </ul>
      </section>

      {/* Restaurants */}
      <section>
        <h2 className="text-2xl font-semibold mb-2">Search Restaurants</h2>
        <input
          type="text"
          placeholder="Filter restaurants…"
          value={searchRestaurant}
          onChange={e => setSearchRestaurant(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <ul className="space-y-1 max-h-48 overflow-auto">
          {filteredRestaurants.map(place => (
            <li
              key={place.id}
              className="flex justify-between items-center p-2 border rounded hover:bg-gray-100"
            >
              <div>
                <p className="font-medium">{place.name}</p>
                {place.categories && (
                  <p className="text-xs text-gray-500 truncate">{place.categories}</p>
                )}
                {place.stars != null && (
                  <p className="text-sm">⭐ {place.stars}</p>
                )}
              </div>
              <button onClick={() => onAdd(place, 'restaurant')} className="text-blue-500">
                Add
              </button>
            </li>
          ))}
          {filteredRestaurants.length === 0 && (
            <li className="text-gray-500 p-2">No restaurants found.</li>
          )}
        </ul>
      </section>

      {/* Bag */}
      <section>
        <h2 className="text-2xl font-semibold mb-2">Your Bag</h2>
        {bag.length === 0 ? (
          <p>No items added yet.</p>
        ) : (
          <ul className="space-y-1">
            {bag.map(item => (
              <li
                key={`${item.type}-${item.id}`}
                className="flex justify-between items-center p-2 border rounded"
              >
                <span>
                  [{item.type === 'attraction' ? 'Attraction' : 'Restaurant'}]{' '}
                  {item.name}
                </span>
                <button
                  onClick={() => onRemove(item.id, item.type)}
                  className="text-red-500"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Continue */}
      <div className="text-right">
        <button
          onClick={onContinue}
          className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default SearchLayout;
