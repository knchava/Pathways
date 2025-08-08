import React, { useContext, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SearchPage from "../HotelSearch/SearchPage";
import AttractionSearch from "../AttractionSearch/AttractionSearch";
import EventPlanner from "../EventPlanner/EventPlanner";
import {
  ItinerariesContext,
  Itinerary,
} from "../../context/ItinerariesContext";
import { BagItem } from "../SearchLayout/SearchLayout";

export default function ItineraryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { list, setList } = useContext(ItinerariesContext);
  const itin = list.find((it) => it.id === Number(id));

  type Mode = "choose" | "hotel" | "attraction";
  const [mode, setMode] = useState<Mode>(() => {
    if (itin?.hotel) return "hotel";
    if (itin?.attraction) return "attraction";
    return "choose";
  });

  const [selHotel, setSelHotel] = useState<string>(itin?.hotel || "");
  const [selAttraction, setSelAttraction] = useState<string>(
    itin?.attraction || ""
  );
  const [attractions, setAttractions] = useState<string[]>([]);
  useEffect(() => {
    if (selHotel) setMode("hotel");
    else if (selAttraction) setMode("attraction");
    else setMode("choose");
  }, [selHotel, selAttraction]);

  useEffect(() => {
    if (itin?.hotel || itin?.hotel) {
      setSelHotel(itin.hotel || ""); // set hotel name if available, otherwise blank
      setMode("hotel");
    }
  }, [itin?.hotel, itin?.hotel]);

  useEffect(() => {
    if (itin?.destination) {
      fetch(
        `http://localhost:3001/api/top-attractions?city=${encodeURIComponent(
          itin.destination
        )}`
      )
        .then((res) => res.json())
        .then((data) => {
          setAttractions(data.attractions);
        })
        .catch(console.error);
    }
  }, [itin?.destination]);
  if (!itin) {
    return (
      <div className="p-4">
        <p>No itinerary found for ID {id}.</p>
        <button
          className="mt-2 text-blue-500"
          onClick={() => navigate("/home")}
        >
          Back to All Itineraries
        </button>
      </div>
    );
  }

  const addToBag = (item: BagItem) => {
    setList((prev) =>
      prev.map((it) =>
        it.id === itin.id ? { ...it, bag: [...(it.bag || []), item] } : it
      )
    );
  };

  return (
    <div className="container mx-auto p-4">
      <button className="text-blue-500 mb-4" onClick={() => navigate("/home")}>
        ← All Itineraries
      </button>

      <h1 className="text-3xl font-bold mb-4">{itin.destination}</h1>

      {(selAttraction || selHotel) && (
        <div className="mb-6 space-y-2">
          {selAttraction && (
            <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
              <strong>Attraction:</strong> {selAttraction}
            </div>
          )}
          {selHotel && (
            <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
              <strong>Hotel:</strong> {selHotel}
            </div>
          )}
        </div>
      )}

      {mode === "choose" && (
        <div className="text-center space-y-4">
          <h2 className="text-2xl">Select the hotel of your dreams!</h2>
          <div className="flex justify-center gap-4">
            <button
              className="px-4 py-2 bg-blue-500 text-white"
              onClick={() => setMode("hotel")}
            >
              Hotel
            </button>
            {/* <button
              className="px-4 py-2 bg-green-500 text-white"
              onClick={() => setMode("attraction")}
            >
              Attraction
            </button> */}
          </div>
        </div>
      )}

      {mode === "hotel" && !selHotel && (
        <>
          <h2 className="text-2xl mb-2">
            Select a Hotel{selAttraction ? ` near ${selAttraction}` : ""}
          </h2>
          <SearchPage
            onSelectHotel={(name) => setSelHotel(name)}
            attraction={itin.destination}
          />
          <button
            className="mt-4 text-sm text-red-500"
            onClick={() => setMode("choose")}
          >
            ← Start Over
          </button>
        </>
      )}
      {mode === "hotel" && selHotel && (
        <div className="text-center space-y-4">
          <h2 className="text-2xl">Hotel Selected:</h2>
          <p className="font-medium">{selHotel}</p>
          <button
            className="px-4 py-2 bg-blue-500 text-white"
            onClick={async () => {
              setList((prev) =>
                prev.map((it) =>
                  it.id === itin.id
                    ? ({ ...it, hotel: selHotel } as Itinerary)
                    : it
                )
              );

              console.log("jere")

              try {
                const hotelRes = await fetch(
                  `http://localhost:3001/api/hotel-id?hotelName=${encodeURIComponent(
                    selHotel
                  )}`
                );
                const hotelData = await hotelRes.json();
                const hotelId = hotelData.hotelId;

                if (!hotelId) {
                  console.error("Hotel ID not found for selected hotel.");
                  console.log(hotelId)
                }

                await fetch(
                  `http://localhost:3001/api/itineraries/${itin.id}/hotel`,
                  {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ hotelId: hotelId }),
                  }
                );

                console.log("Hotel updated in database.");
              } catch (error) {
                console.error("Error updating hotel:", error);
              }

              navigate(`/itineraries/${itin.id}/plan`);
            }}
          >
            Continue to Plan
          </button>
          <button
            className="mt-2 text-sm text-red-500"
            onClick={() => {
              setSelHotel("");
              setList((prev) =>
                prev.map((it) =>
                  it.id === itin.id
                    ? ({ ...it, hotel: undefined } as Itinerary)
                    : it
                )
              );
            }}
          >
            ← Change Hotel
          </button>
        </div>
      )}

      {/* {mode === "attraction" && !selAttraction && (
        <>
          <h2 className="text-2xl mb-2">Select an Attraction</h2>
          <AttractionSearch
            suggestions={attractions}
            onSelect={(name) => {
              setSelAttraction(name);
              setList((prev) =>
                prev.map((it) =>
                  it.id === itin.id
                    ? ({
                        ...it,
                        attraction: name,
                        bag: [
                          ...(it.bag || []),
                          { id: Date.now(), name, type: "attraction" },
                        ],
                      } as Itinerary)
                    : it
                )
              );
              setMode("hotel");
            }}
          />
          <button
            className="mt-4 text-sm text-red-500"
            onClick={() => setMode("choose")}
          >
            ← Start Over
          </button>
        </>
      )}
      {mode === "attraction" && selAttraction && (
        <div className="text-center space-y-4">
          <h2 className="text-2xl">Attraction Selected:</h2>
          <p className="font-medium">{selAttraction}</p>
          <button
            className="px-4 py-2 bg-blue-500 text-white"
            onClick={() => setMode("hotel")}
          >
            Select Hotel
          </button>
          <button
            className="mt-2 text-sm text-red-500"
            onClick={() => setSelAttraction("")}
          >
            ← Change Attraction
          </button>
        </div>
      )} */}

    </div>
  );
}
