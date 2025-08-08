import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface SignupFormData {
  name: string;
  age: string;
  location: string;
}

const Signup: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<SignupFormData>({
    name: "",
    age: "",
    location: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3001/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to sign up");
      const data = await response.json();
      console.log("User created with ID:", data.id);

      localStorage.setItem("userId", String(data.id));

      if (data.preferences) {
        console.log("Existing preferences found:", data.preferences);
        localStorage.setItem(
          "userPreferences",
          JSON.stringify(data.preferences)
        );
      } else {
        console.log("No preferences found for this user — clearing old ones");
        localStorage.removeItem("userPreferences");
      }

      navigate("/preferences");
    } catch (error) {
      console.error("Error signing up:", error);
      alert("Signup failed, please try again!");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white shadow p-6 rounded">
        <h1 className="text-3xl font-bold text-center mb-6">Sign Up</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full p-2 border rounded"
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            className="w-full p-2 border rounded"
            type="text"
            name="age"
            placeholder="Age"
            value={formData.age}
            onChange={handleChange}
            required
          />
          <input
            className="w-full p-2 border rounded"
            type="text"
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            required
          />
          <button
            type="submit"
            className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
