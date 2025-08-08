import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { BagItem } from '../components/SearchLayout/SearchLayout';


export interface Itinerary {
    id: number;
    userId: string;
    destination: string;
    startDate: string;
    endDate: string;
    hotel?: string;
    attraction?: string;
    bag?: BagItem[];         
  }
  
interface ItinerariesContextValue {
  list: Itinerary[];
  setList: React.Dispatch<React.SetStateAction<Itinerary[]>>;
}

interface ItinerariesProviderProps {
  children: ReactNode;
}

export const ItinerariesContext = createContext<ItinerariesContextValue>(
  {} as ItinerariesContextValue
);

export const ItinerariesProvider: React.FC<ItinerariesProviderProps> = ({ children }) => {
  const [list, setList] = useState<Itinerary[]>([]);

  // Uncomment when backend is ready:
  /*
  useEffect(() => {
    fetch('/api/itineraries')
      .then(r => r.json())
      .then(setList)
      .catch(console.error);
  }, []);
  */

  return (
    <ItinerariesContext.Provider value={{ list, setList }}>
      {children}
    </ItinerariesContext.Provider>
  );
};
