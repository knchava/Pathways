const express = require('express');
const mysql = require('mysql2');
const cors = require('cors'); 
const app = express();
const port = 3001; // Use 3001 for Express server


app.use(cors());
app.use(express.json());

// immplement routes in the future for better readability.

// connect our server to GCP MySQL
const connection = mysql.createConnection({
  host: '34.66.66.172',
  user: 'root',
  password: "ACID",
  database: "ACID",
  port: 3306    
});

// connect to database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting: ' + err);
    return;
  }
  console.log('Successfully connected to ACIDs Database');
});

// test tables query
app.get("/api/tables", (req, res) => {
  const query = "SHOW TABLES";
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error executing query", err);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.status(200).json({ tables: results });
  });
});

// get users query
app.get("/api/users", (req, res) =>{
  const query = "SELECT * FROM Users ORDER BY UserID DESC LIMIT 15";
  connection.query(query, (err, results)=> {
    if(err) {
      console.error("Error executing query", err);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.status(200).json({ users: results });
  });
});

// gets the top hotels
app.get("/api/top-hotels", (req, res) => {
  const city = req.query.city || ''; 
  const city_pattern = '%' + city + '%';
  console.log("Searching hotels with pattern:", city_pattern);

  const query = 'SELECT Hotel_Name, Hotel_Rating, Description FROM hotels WHERE City_Name LIKE ? ORDER BY Hotel_Rating DESC, Hotel_Name LIMIT 10';

  connection.query(query, [city_pattern], (err, results) => {
    if (err) {
      console.error("Error executing query", err);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.status(200).json({ hotels: results });
  });
});


app.post('/api/signup', (req, res) => {
  console.log("Incoming body:", req.body);

  const timeout = setTimeout(() => {
    console.error('Signup request timed out!');
    return res.status(500).json({ error: 'Server timeout' });
  }, 10000);

  const Name = req.body["name"];
  const Age = req.body["age"];
  const Location = req.body["location"];

  if (!Name || !Age || !Location) {
    clearTimeout(timeout);
    return res.status(400).json({ error: 'Missing fields' });
  }
  const findQuery = 'SELECT UserID FROM Users WHERE Name = ? AND Age = ? AND Location = ?';
  connection.query(findQuery, [Name, Age, Location], (err, results) => {
    if (err) {
      clearTimeout(timeout);
      console.error('Error finding user:', err);
      return res.status(500).send('Server error');
    }

    if (results.length > 0) {
      const existingUserId = results[0].UserID;
      console.log("User already exists with ID:", existingUserId);
      const prefQuery = `
        SELECT 
        Travel_Preferences AS travelPreferences,
        Interests AS interests,
        Accessibility_Need AS accessibilityNeed,
        Ambience_Preference AS ambiencePreference,
        Activity_Preferences AS activityPreferences,
        Age_Group AS ageGroup
        FROM UserProfile
        WHERE UserID = ?`;
    
      connection.query(prefQuery, [existingUserId], (err, prefResults) => {
        clearTimeout(timeout);
        if (err) {
          console.error('Error fetching preferences:', err);
          return res.status(500).send('Server error');
        }
    
        const preferences = prefResults[0] || null;
        return res.json({ success: true, id: existingUserId, preferences });
      });
    }    
    
    else {
      connection.query('SELECT MAX(UserID) AS maxId FROM Users', (err, result) => {
        if (err) {
          clearTimeout(timeout);
          console.error('Error finding max UserID:', err);
          return res.status(500).send('Server error');
        }

        const nextId = (result[0].maxId || 0) + 1;

        const insertQuery = 'INSERT INTO Users (UserID, Name, Age, Location) VALUES (?, ?, ?, ?)';
        connection.query(insertQuery, [nextId, Name, Age, Location], (err, result) => {
          clearTimeout(timeout);

          if (err) {
            console.error('Error inserting user:', err);
            return res.status(500).send('Server error');
          }
          console.log("New user signup success");
          return res.json({ success: true, id: nextId, preferences: null });
        });
      });
    }
  });
});

app.post("/api/itineraries", (req, res) => {
  const { userId, startDate, endDate, destination } = req.body;

  if (!userId || !startDate || !endDate || !destination) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const insertQuery = `
    INSERT INTO Itinerary (UserID, Itinerary_start_date, Itinerary_end_date, Destination)
    VALUES (?, ?, ?, ?)
  `;

  connection.query(
    insertQuery,
    [userId, startDate, endDate, destination],
    (err, results) => {
      if (err) {
        console.error("Error inserting itinerary:", err);
        return res.status(500).json({ error: "Failed to create itinerary" });
      }

      // Send the new itinerary ID back!
      const itineraryId = results.insertId;
      console.log(itineraryId);
      return res.status(201).json({
        message: "Itinerary created successfully",
        itineraryId: itineraryId,
      });
    }
  );
});

app.put("/api/itineraries/:id", (req, res) => {
  const itineraryId = req.params.id;
  const { startDate, endDate, destination } = req.body;

  console.log("HERE")
  if (!startDate || !endDate || !destination) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  console.log(itineraryId);
  const updateQuery = `
    UPDATE Itinerary
    SET Itinerary_start_date = ?, Itinerary_end_date = ?, Destination = ?
    WHERE ItineraryID = ?
  `;

  connection.query(updateQuery, [startDate, endDate, destination, itineraryId], (err, result) => {
    if (err) {
      console.error("Error updating itinerary:", err);
      return res.status(500).json({ error: "Failed to update itinerary" });
    }
    console.log("Updated iternary")

    return res.status(200).json({ message: "Itinerary updated successfully" });
  });
});


app.delete("/api/itineraries/:id", (req, res) => {
  const itineraryId = req.params.id;

  const deleteQuery = `DELETE FROM Itinerary WHERE ItineraryID = ?`;

  connection.query(deleteQuery, [itineraryId], (err, result) => {
    if (err) {
      console.error("Error deleting itinerary:", err);
      return res.status(500).json({ error: "Failed to delete itinerary" });
    }
    console.log("Deleted iternary")
    return res.status(200).json({ message: "Itinerary deleted successfully" });
  });
});
app.post("/api/save-preferences", (req, res) => {
  const { userId, travelPreferences, interests, accessibilityNeed, ambiencePreference, activityPreferences, ageGroup } = req.body;

  if (!userId || !travelPreferences || !interests || !accessibilityNeed || !ambiencePreference || !activityPreferences || !ageGroup) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const findQuery = "SELECT * FROM UserProfile WHERE UserID = ?";
  connection.query(findQuery, [userId], (err, results) => {
    if (err) {
      console.error("Error checking preferences:", err);
      return res.status(500).send("Server error");
    }

    if (results.length > 0) {
      const updateQuery = `
        UPDATE UserProfile
        SET Travel_Preferences = ?, Interests = ?, Accessibility_Need = ?, Ambience_Preference = ?, Activity_Preferences = ?, Age_Group = ?
        WHERE UserID = ?
      `;
      connection.query(updateQuery, [travelPreferences, interests, accessibilityNeed, ambiencePreference, activityPreferences, ageGroup, userId], (err, result) => {
        if (err) {
          console.error("Error updating preferences:", err);
          return res.status(500).send("Server error");
        }
        console.log("Updated preferences for user:", userId);
        return res.json({ success: true });
      });
    } else {
      const insertQuery = `
        INSERT INTO UserProfile (UserID, Travel_Preferences, Interests, Accessibility_Need, Ambience_Preference, Activity_Preferences, Age_Group)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      connection.query(insertQuery, [userId, travelPreferences, interests, accessibilityNeed, ambiencePreference, activityPreferences, ageGroup], (err, result) => {
        if (err) {
          console.error("Error inserting preferences:", err);
          return res.status(500).send("Server error");
        }
        console.log("Inserted preferences for user:", userId);
        return res.json({ success: true });
      });
    }
  });
});
app.get("/api/top-attractions", (req, res) => {
  const city = req.query.city || '';
  const cityPattern = '%' + city + '%';
  const userId = req.query.userId || "";

  const tailor_query = `
    (
      SELECT AttractionID as id, name, main_category, categories, rating, reviews
      FROM attractions a 
      JOIN UserProfile u ON u.UserID = ?
      WHERE 
        (address LIKE ? OR name LIKE ?)
        AND (
            a.main_category = u.Travel_Preferences
            OR a.main_category = u.Interests
            OR a.main_category = u.Activity_Preferences
            OR a.main_category = u.Ambience_Preference
            OR a.categories = u.Travel_Preferences
            OR a.categories = u.Interests
            OR a.categories = u.Activity_Preferences
            OR a.categories = u.Ambience_Preference
        )
    )
    UNION ALL
    (
      SELECT AttractionID as id, name, main_category, categories, rating, reviews
      FROM attractions
      WHERE address LIKE ? OR name LIKE ?
    )
    ORDER BY rating DESC, reviews DESC
    LIMIT 20`;

  connection.query(tailor_query, [userId, cityPattern, cityPattern, cityPattern, cityPattern], (err, results) => {
    if (err) {
      console.error("Error fetching attractions:", err);
      return res.status(500).json({ error: "Failed to fetch attractions" });
    }
    console.log("LETS GO IT WORKS");
    res.json({ attractions: results});
  });
});

app.get("/api/top-restaurants", (req, res) => {
  const city = req.query.city || '';
  const cityPattern = '%' + city + '%';
  const userId = req.query.userId || "";

  const tailor_query = `
  (
    SELECT Business_id as id, name, stars AS rating, Categories as categories
    FROM Restaurants as r
    JOIN UserProfile as u ON u.userId = ?
    WHERE (address LIKE ? OR name LIKE ? OR City LIKE ?) 
    AND
    (
      r.Categories LIKE u.Travel_Preferences
      OR r.Categories LIKE u.Interests
      OR r.Categories LIKE u.Activity_Preferences
      OR r.Categories LIKE u.Ambience_Preference
    )
  )
  UNION ALL
  (
    SELECT Business_id as id, name, stars AS rating, Categories as categories
    FROM Restaurants
    WHERE address LIKE ? OR name LIKE ? OR City LIKE ?
  )
  ORDER BY rating DESC
  LIMIT 20 
  `;

  // const query = `
  //   SELECT Business_id as id, name, stars AS rating, Categories as categories
  //   FROM Restaurants
  //   WHERE address LIKE ? OR name LIKE ? OR City LIKE ?
  //   ORDER BY stars DESC
  //   LIMIT 20`;
  connection.query(tailor_query, [userId, cityPattern, cityPattern, cityPattern, cityPattern, cityPattern, cityPattern], (err, results) => {
    if (err) {
      console.error("Error fetching restairants:", err);
      return res.status(500).json({ error: "Failed to fetch resturants" });
    }
    console.log("thank god this worked")
    res.json({ restaurants: results });
  });
});


app.get('/api/itineraries', (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }
  const query = `
    SELECT 
    i.ItineraryID as id,
    i.Destination as destination,
    DATE_FORMAT(i.Itinerary_start_date, '%Y-%m-%d') AS startDate,
    DATE_FORMAT(i.Itinerary_end_date, '%Y-%m-%d') AS endDate,
    i.Hotel_Id,
    h.Hotel_Name as hotel
    FROM Itinerary i
    LEFT JOIN hotels h ON i.Hotel_Id = h.Hotel_Id
    WHERE i.UserID = ?
    ORDER BY i.Itinerary_start_date`;

  connection.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching itineraries:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.json({ itineraries: results });
  });
});
app.put("/api/itineraries/:id/hotel", (req, res) => {
  const itineraryId = req.params.id;
  const { hotelId } = req.body;  

  if (!hotelId) {
    return res.status(400).json({ error: "Missing hotelId" });
  }
  const query = `
    UPDATE Itinerary
    SET Hotel_Id = ?
    WHERE ItineraryID = ?`;

  connection.query(query, [hotelId, itineraryId], (err, result) => {
    if (err) {
      console.error("Error updating hotel:", err);
      return res.status(500).json({ error: "Failed to update hotel" });
    }
    return res.status(200).json({ message: "Hotel updated successfully" });
  });
});
app.get("/api/hotel-id", (req, res) => {
  const hotelName = req.query.hotelName;
  if (!hotelName) {
    return res.status(400).json({ error: "Missing hotelName" });
  }

  const query = `SELECT Hotel_Id FROM hotels WHERE Hotel_Name = ? LIMIT 1`;

  connection.query(query, [hotelName], (err, results) => {
    if (err) {
      console.error("Error fetching hotel ID:", err);
      return res.status(500).json({ error: "Failed to fetch hotel ID" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Hotel not found" });
    }
    res.json({ hotelId: results[0].Hotel_Id });
  });
});

// Get recommended cities based on user preferences
app.get("/api/recommendations/:userId", (req, res) => {
  const userId = req.params.userId;

  // Set isolation level before starting transaction
  connection.query('SET TRANSACTION ISOLATION LEVEL READ COMMITTED', (err) => {
    if (err) {
      console.error("Error setting isolation level:", err);
      return res.status(500).json({ error: "Failed to set isolation level" });
    }

    // Start transaction
    connection.beginTransaction(err => {
      if (err) {
        console.error("Error starting transaction:", err);
        return res.status(500).json({ error: "Failed to start transaction" });
      }

      // obtan the user's preferences
      const getUserPreferencesQuery = `
        SELECT Activity_Preferences, Ambience_Preference
        FROM UserProfile
        WHERE UserID = ?
      `;

      connection.query(getUserPreferencesQuery, [userId], (err, userResults) => {
        if (err) {
          console.error("Error getting user preferences:", err);
          return connection.rollback(() => {
            res.status(500).json({ error: "Failed to get user preferences" });
          });
        }

        if (userResults.length === 0) {
          return connection.rollback(() => {
            res.status(404).json({ error: "User preferences not found" });
          });
        }

        const activityPreferences = userResults[0].Activity_Preferences;
        const ambiencePreference = userResults[0].Ambience_Preference;
        console.log("User preferences:", { activityPreferences, ambiencePreference });

        // lets get our recommended cities based on usr preferences
        const getRecommendedCitiesQuery = `
          (
            SELECT h.City_Name
            FROM hotels h
            WHERE 
                h.Hotel_Rating BETWEEN 4.0 AND 5.0
            GROUP BY h.City_Name
            HAVING COUNT(h.Hotel_Id) > 20
          )
          UNION
          (
            SELECT h.City_Name
            FROM hotels h
            WHERE 
                LOWER(h.Description) LIKE CONCAT('%', LOWER(?), '%')
            GROUP BY h.City_Name
          )
          ORDER BY City_Name
          LIMIT 5
        `;

        connection.query(getRecommendedCitiesQuery, [activityPreferences], (err, cityResults) => {
          if (err) {
            console.error("Error getting recommended cities:", err);
            return connection.rollback(() => {
              res.status(500).json({ error: "Failed to get recommended cities" });
            });
          }

          const recommendedCities = cityResults.map(city => city.City_Name);
          console.log("Recommended cities:", recommendedCities);

          // Step 3: Get attractions for each city
          const getAttractionsPromises = recommendedCities.map(city => {
            return new Promise((resolve, reject) => {
              // Extract city name before the state
              const cityName = city.split(',')[0].trim();
              const cityPattern = '%' + cityName + '%';
              console.log("Extracted city name:", cityName);

              // Modified query to use UNION for combining activity and ambience preferences
              const getAttractionsQuery = `
                (
                  SELECT 
                    AttractionID as id,
                    name,
                    main_category,
                    categories,
                    rating
                  FROM attractions
                  WHERE (address LIKE ? OR name LIKE ?)
                  AND (
                    LOWER(categories) LIKE CONCAT('%', LOWER(?), '%')
                    OR LOWER(main_category) LIKE CONCAT('%', LOWER(?), '%')
                    OR LOWER(name) LIKE CONCAT('%', LOWER(?), '%')
                    OR rating >= 4.0
                  )
                )
                UNION
                (
                  SELECT 
                    AttractionID as id,
                    name,
                    main_category,
                    categories,
                    rating
                  FROM attractions
                  WHERE (address LIKE ? OR name LIKE ?)
                  AND (
                    LOWER(categories) LIKE CONCAT('%', LOWER(?), '%')
                    OR LOWER(main_category) LIKE CONCAT('%', LOWER(?), '%')
                    OR LOWER(name) LIKE CONCAT('%', LOWER(?), '%')
                    OR rating >= 4.0
                  )
                )
                ORDER BY rating DESC
                LIMIT 3
              `;

              console.log("Searching attractions for city:", cityName);
              console.log("Using pattern:", cityPattern);
              console.log("Using preferences:", { activityPreferences, ambiencePreference });

              connection.query(
                getAttractionsQuery,
                [
                  cityPattern, 
                  cityPattern, 
                  activityPreferences, 
                  activityPreferences, 
                  activityPreferences,
                  cityPattern, 
                  cityPattern, 
                  ambiencePreference, 
                  ambiencePreference, 
                  ambiencePreference
                ],
                (err, results) => {
                  if (err) {
                    console.error("Error in attractions query for city", cityName, ":", err);
                    reject(err);
                    return;
                  }
                  console.log(`Found ${results.length} attractions for ${cityName}`);
                  resolve({
                    city,
                    attractions: results
                  });
                }
              );
            });
          });

          // Wait for all attraction queries to complete
          Promise.all(getAttractionsPromises)
            .then(cityAttractions => {
              // Commit the transaction
              connection.commit(err => {
                if (err) {
                  console.error("Error committing transaction:", err);
                  return connection.rollback(() => {
                    res.status(500).json({ error: "Failed to commit transaction" });
                  });
                }

                // Format the results
                const recommendations = cityAttractions.map(({ city, attractions }) => ({
                  city,
                  attractions
                }));
                
                console.log("Final recommendations:", recommendations);
                return res.status(200).json({
                  recommendations
                });
              });
            })
            .catch(err => {
              console.error("Error getting attractions:", err);
              return connection.rollback(() => {
                res.status(500).json({ error: "Failed to get attractions" });
              });
            });
        });
      });
    });
  });
});

// Get categories for attractions
app.get("/api/attraction-categories", (req, res) => {
  const query = "SELECT DISTINCT Categories FROM attractions WHERE Categories IS NOT NULL";
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching attraction categories:", err);
      return res.status(500).json({ error: "Failed to fetch categories" });
    }
    res.json({ categories: results.map(r => r.Categories) });
  });
});

// Get categories for restaurants
app.get("/api/restaurant-categories", (req, res) => {
  const query = "SELECT DISTINCT Categories FROM Restaurants WHERE Categories IS NOT NULL";
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching restaurant categories:", err);
      return res.status(500).json({ error: "Failed to fetch categories" });
    }
    res.json({ categories: results.map(r => r.Categories) });
  });
});

// Create attraction event using stored procedure
app.post("/api/attraction-events", (req, res) => {
  const { attractionId, categories, itineraryId, startTime, endTime } = req.body;

  if (!attractionId || !categories || !itineraryId || !startTime || !endTime) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = "CALL CreateAttractionEvent(?, ?, ?, ?, ?)";

  connection.query(
    query,
    [attractionId, categories, itineraryId, startTime, endTime],
    (err, results) => {
      if (err) {
        console.error("Error creating attraction event:", err);
        return res.status(500).json({ error: "Failed to create event" });
      }
      res.status(201).json({ 
        message: "Event created successfully",
        eventId: results[0][0].eventId 
      });
    }
  );
});

// Create restaurant event using stored procedure
app.post("/api/restaurant-events", (req, res) => {
  console.log('Received restaurant event request:', req.body);
  const { businessId, categories, itineraryId, startTime, endTime } = req.body;

  console.log('Parsed values:', {
    businessId,
    categories,
    itineraryId,
    startTime,
    endTime
  });

  if (!businessId || !categories || !itineraryId || !startTime || !endTime) {
    console.log('Missing fields:', {
      businessId: !businessId,
      categories: !categories,
      itineraryId: !itineraryId,
      startTime: !startTime,
      endTime: !endTime
    });
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = "CALL CreateRestaurantEvent(?, ?, ?, ?, ?)";

  connection.query(
    query,
    [String(businessId), categories, itineraryId, startTime, endTime],
    (err, results) => {
      if (err) {
        console.error("Error creating restaurant event:", err);
        return res.status(500).json({ error: "Failed to create event" });
      }
      res.status(201).json({ 
        message: "Event created successfully",
        eventId: results[0][0].eventId 
      });
    }
  );
});

// Get events for an itinerary using stored procedure
app.get("/api/itineraries/:itineraryId/events", (req, res) => {
  const itineraryId = req.params.itineraryId;

  const query = "CALL GetItineraryEvents(?)";

  connection.query(query, [itineraryId], (err, results) => {
    if (err) {
      console.error("Error fetching events:", err);
      return res.status(500).json({ error: "Failed to fetch events" });
    }
    res.json({ events: results[0] }); // Stored procedure results are in the first element
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${port}`);
});


app.delete('/api/attraction-event/:eventId', (req, res) => {
  const { eventId } = req.params;
  console.log(eventId);
  const query = 'DELETE FROM AttractionEvent WHERE AttractionEventId = ?'
  connection.query(query, [eventId], (err, result) => {
    if (err) {
      console.error("Error deleting events:", err);
      return res.status(500).json({ error: "Failed to delete evens" });
    }
    console.log("Deleted event")
    return res.status(200).json({ message: "eventy deleted successfully" });
  })
});


app.delete('/api/restaurant-event/:eventId', (req, res) => {
  const { eventId } = req.params;
  const query = 'DELETE FROM RestaurantEvent WHERE RestaurantEventId = ?'
  connection.query(query, [eventId], (err, result) => {
    if (err) {
      console.error("Error deleting events:", err);
      return res.status(500).json({ error: "Failed to delete evens" });
    }
    console.log("Deleted event")
    return res.status(200).json({ message: "eventy deleted successfully" });
  })
});