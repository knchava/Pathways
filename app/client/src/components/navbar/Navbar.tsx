import React from "react";
import { NavLink, Link } from "react-router-dom";

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">

        <Link to="/" className="text-2xl font-bold text-blue-500">
          Welcome to Pathways
        </Link>

        <div className="flex items-center space-x-6">
          <NavLink
            to="/home"
            end
            className={({ isActive }) =>
              isActive
                ? "text-blue-600 font-medium"
                : "text-gray-600 hover:text-blue-600"
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/preferences/view"
            className={({ isActive }) =>
              isActive
                ? "text-blue-600 font-medium"
                : "text-gray-600 hover:text-blue-600"
            }
          >
            My Preferences
          </NavLink>
          <NavLink
            to="/recommendations"
            className={({ isActive }) =>
              isActive
                ? "text-blue-600 font-medium"
                : "text-gray-600 hover:text-blue-600"
            }
          >
            Recommendations
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
