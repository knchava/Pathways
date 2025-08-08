import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SearchLayout, { Place, BagItem } from '../SearchLayout/SearchLayout';
import { ItinerariesContext } from '../../context/ItinerariesContext';

export default function PlanStep() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { list, setList } = useContext(ItinerariesContext);
  const itin = list.find(it => it.id === Number(id));
  const [bag, setBag] = useState<BagItem[]>(itin?.bag ?? []);

  useEffect(() => {
    setBag(itin?.bag ?? []);
  }, [itin?.bag]);

  const updateContextBag = (newBag: BagItem[]) => {
    setList(prev =>
      prev.map(it => (it.id === Number(id) ? { ...it, bag: newBag } : it))
    );
  };

  const handleAdd = (place: Place, type: BagItem['type']) => {
    setBag(prev => {
      if (prev.some(item => item.id === place.id && item.type === type)) {
        return prev;
      }
      const next = [...prev, { ...place, type }];
      updateContextBag(next);
      return next;
    });
  };

  const handleRemove = (itemId: number, type: BagItem['type']) => {
    setBag(prev => {
      const next = prev.filter(item => !(item.id === itemId && item.type === type));
      updateContextBag(next);
      return next;
    });
  };


  if (!itin) {
    return (
      <div className="p-4">
        <p>No itinerary found.</p>
        <button
          className="mt-2 text-blue-500"
          onClick={() => navigate('/home')}
        >
          Back Home
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <button
        className="text-blue-500 mb-4"
        onClick={() => navigate(`/itineraries/${itin.id}`)}
      >
        ← Back to Steps
      </button>

      <h1 className="text-3xl font-bold mb-4">{itin.destination}</h1>
      <h2 className="text-2xl font-semibold mb-4">Discover Nearby Places</h2>

      <SearchLayout
        city={itin.destination}
        bag={bag}
        onAdd={handleAdd}
        onRemove={handleRemove}
        onContinue={() => navigate(`/itineraries/${itin.id}/visualize`)}
      />
    </div>
  );
}
