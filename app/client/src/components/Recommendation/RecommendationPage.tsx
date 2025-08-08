import React, { useEffect, useState } from "react";

interface Attraction {
  id: number;
  name: string;
  main_category: string;
  categories: string;
  rating: number;
}

interface CityRecommendation {
  city: string;
  attractions: Attraction[];
}

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<CityRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          throw new Error("Please sign in to get recommendations");
        }

        const response = await fetch(
          `http://localhost:3001/api/recommendations/${userId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch recommendations");
        }
        const data = await response.json();
        setRecommendations(data.recommendations);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []); // Empty dependency array means this runs once when component mounts

  if (loading)
    return (
      <div className="p-4 max-w-xl mx-auto">
        <p className="text-center">Loading recommendations...</p>
      </div>
    );

  if (error)
    return (
      <div className="p-4 max-w-xl mx-auto">
        <p className="text-red-500 text-center">Error: {error}</p>
        {error.includes("sign in") && (
          <p className="text-center mt-4">
            <a href="/signup" className="text-blue-500 hover:underline">
              Sign up
            </a>{" "}
            or{" "}
            <a href="/login" className="text-blue-500 hover:underline">
              log in
            </a>{" "}
            to get personalized recommendations
          </p>
        )}
      </div>
    );

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Based on your profile, here are some cities we recommend:
      </h1>
      {recommendations.length > 0 ? (
        <div className="space-y-6">
          {recommendations.map((recommendation) => (
            <div key={recommendation.city} className="border rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-3">{recommendation.city}</h2>
              {recommendation.attractions.length > 0 ? (
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-700">Recommended Attractions:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {recommendation.attractions.map((attraction) => (
                      <li key={attraction.id} className="text-gray-600">
                        <span className="font-medium">{attraction.name}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          ({attraction.main_category})
                        </span>
                        <span className="text-sm text-yellow-500 ml-2">
                          ★ {attraction.rating.toFixed(1)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-gray-500">No attractions found for this city.</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">
          No recommendations available at this time. Try updating your
          preferences!
        </p>
      )}
    </div>
  );
}
