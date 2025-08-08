## Code for Triggers and how we implemented them:
![image](https://github.com/user-attachments/assets/e91e984b-bc6b-4ffc-ae54-1101c127f8c5)
Overall we have two triggers, one that occurs after an insert into the iternary table and one that occurs after an update on the iternary table, more specifically, when the status of the hotel_id changes.

#### Trigger One:
```
CREATE TRIGGER after_itinerary_hotel_insert
AFTER INSERT ON Itinerary
FOR EACH ROW
BEGIN
  IF NEW.Hotel_Id IS NOT NULL THEN
    UPDATE hotels
    SET Hotel_Rating = Hotel_Rating + 0.1
    WHERE Hotel_Id = NEW.Hotel_Id;
  END IF;
END$$
```

DELIMITER ;

#### Trigger Two:
```
CREATE TRIGGER increment_hotel_rating
AFTER UPDATE ON Itinerary
FOR EACH ROW
BEGIN
  IF NEW.Hotel_Id IS NOT NULL
     AND (OLD.Hotel_Id IS NULL OR OLD.Hotel_Id <> NEW.Hotel_Id)
  THEN
    UPDATE hotels
    SET Hotel_Rating = Hotel_Rating + 0.1
    WHERE Hotel_Id = NEW.Hotel_Id;
  END IF;
END$$
```
Overall, these triggers ensure that whenever a hotel is added to an iternary, its rating goes up. The first one ensures that the initial hotel selected gets its rating increased by .1. The second trigger ensures that if a user decides to change the hotel, that hotel gets a boost of .1!

## Code for Stored Procedures and how we implemented them:
```javascript
// Creates an attraction event using the stored procedure CreateAttractionEvent
app.post("/api/attraction-events", (req, res) => {
  const { attractionId, categories, itineraryId, startTime, endTime } = req.body;

  if (!attractionId || !categories || !itineraryId || !startTime || !endTime) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = "CALL CreateAttractionEvent(?, ?, ?, ?, ?)";

  connection.query(query, [attractionId, categories, itineraryId, startTime, endTime], (err, results) => {
    if (err) {
      console.error("Error creating attraction event:", err);
      return res.status(500).json({ error: "Failed to create event" });
    }

    res.status(201).json({
      message: "Event created successfully",
      eventId: results[0][0].eventId
    });
  });
});
```
```sql
CREATE DEFINER=`root`@`%` PROCEDURE `CreateAttractionEvent`(
    IN p_attractionId INT,
    IN p_categories VARCHAR(255),
    IN p_itineraryId INT,
    IN p_startTime DATETIME,
    IN p_endTime DATETIME
)
BEGIN
    INSERT INTO AttractionEvent (
        AttractionId,
        Categories,
        ItineraryId,
        Start_time,
        End_time
    )
    VALUES (
        p_attractionId,
        p_categories,
        p_itineraryId,
        p_startTime,
        p_endTime
    );

    SELECT LAST_INSERT_ID() as eventId;
END
```
```javascript
// Creates a restaurant event using the stored procedure CreateRestaurantEvent
app.post("/api/restaurant-events", (req, res) => {
  const { businessId, categories, itineraryId, startTime, endTime } = req.body;

  if (!businessId || !categories || !itineraryId || !startTime || !endTime) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = "CALL CreateRestaurantEvent(?, ?, ?, ?, ?)";

  connection.query(query, [String(businessId), categories, itineraryId, startTime, endTime], (err, results) => {
    if (err) {
      console.error("Error creating restaurant event:", err);
      return res.status(500).json({ error: "Failed to create event" });
    }

    res.status(201).json({
      message: "Event created successfully",
      eventId: results[0][0].eventId
    });
  });
});
```
```sql
CREATE DEFINER=`root`@`%` PROCEDURE `CreateRestaurantEvent`(
    IN p_businessId VARCHAR(255),
    IN p_categories VARCHAR(255),
    IN p_itineraryId INT,
    IN p_startTime DATETIME,
    IN p_endTime DATETIME
)
BEGIN
    INSERT INTO RestaurantEvent (
        Business_Id,
        Categories,
        ItineraryId,
        Start_time,
        End_time
    )
    VALUES (
        p_businessId,
        p_categories,
        p_itineraryId,
        p_startTime,
        p_endTime
    );

    SELECT LAST_INSERT_ID() as eventId;
END
```
```javascript
// Gets all events for an itinerary using the stored procedure GetItineraryEvents
app.get("/api/itineraries/:itineraryId/events", (req, res) => {
  const itineraryId = req.params.itineraryId;

  const query = "CALL GetItineraryEvents(?)";

  connection.query(query, [itineraryId], (err, results) => {
    if (err) {
      console.error("Error fetching events:", err);
      return res.status(500).json({ error: "Failed to fetch events" });
    }

    res.json({ events: results[0] });
  });
});
```
```sql
CREATE DEFINER=`root`@`%` PROCEDURE `GetItineraryEvents`(IN p_itineraryId INT)
BEGIN
    SELECT 
        'attraction' as type,
        ae.AttractionEventId as eventId,
        ae.AttractionId as id,
        ae.Categories,
        ae.Start_time,
        ae.End_time,
        a.name as name
    FROM AttractionEvent ae
    JOIN attractions a ON ae.AttractionId = a.AttractionID
    WHERE ae.ItineraryId = p_itineraryId

    UNION ALL

    SELECT 
        'restaurant' as type,
        re.RestaurantEventId as eventId,
        re.Business_Id as id,
        re.Categories,
        re.Start_time,
        re.End_time,
        r.name as name
    FROM RestaurantEvent re
    JOIN Restaurants r ON re.Business_Id = r.Business_ID
    WHERE re.ItineraryId = p_itineraryId

    ORDER BY Start_time;
END
```
This code handles creating and retrieving events for an itinerary. It uses stored procedures to create attraction events, restaurant events, and fetch all itinerary events.
## Code for Transactions and how we implemented them:
```javascript
app.get("/api/recommendations/:userId", (req, res) => {
  const userId = req.params.userId;

  connection.query('SET TRANSACTION ISOLATION LEVEL READ COMMITTED', (err) => {
    if (err) {
      console.error("Error setting isolation level:", err);
      return res.status(500).json({ error: "Failed to set isolation level" });
    }

    connection.beginTransaction(err => {
      if (err) {
        console.error("Error starting transaction:", err);
        return res.status(500).json({ error: "Failed to start transaction" });
      }

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

        const getRecommendedCitiesQuery = `
          (
            SELECT h.City_Name
            FROM hotels h
            WHERE h.Hotel_Rating BETWEEN 4.0 AND 5.0
            GROUP BY h.City_Name
            HAVING COUNT(h.Hotel_Id) > 20
          )
          UNION
          (
            SELECT h.City_Name
            FROM hotels h
            WHERE LOWER(h.Description) LIKE CONCAT('%', LOWER(?), '%')
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

          const getAttractionsPromises = recommendedCities.map(city => {
            return new Promise((resolve, reject) => {
              const cityName = city.split(',')[0].trim();
              const cityPattern = '%' + cityName + '%';

              const getAttractionsQuery = `
                (
                  SELECT AttractionID as id, name, main_category, categories, rating
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
                  SELECT AttractionID as id, name, main_category, categories, rating
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

              connection.query(
                getAttractionsQuery,
                [
                  cityPattern, cityPattern, activityPreferences, activityPreferences, activityPreferences,
                  cityPattern, cityPattern, ambiencePreference, ambiencePreference, ambiencePreference
                ],
                (err, results) => {
                  if (err) {
                    console.error("Error in attractions query for city", cityName, ":", err);
                    reject(err);
                    return;
                  }
                  resolve({ city, attractions: results });
                }
              );
            });
          });

          Promise.all(getAttractionsPromises)
            .then(cityAttractions => {
              connection.commit(err => {
                if (err) {
                  console.error("Error committing transaction:", err);
                  return connection.rollback(() => {
                    res.status(500).json({ error: "Failed to commit transaction" });
                  });
                }

                const recommendations = cityAttractions.map(({ city, attractions }) => ({
                  city,
                  attractions
                }));

                return res.status(200).json({ recommendations });
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
```
The transaction makes sure we safely get the user’s preferences, city suggestions, and attractions all together without anything changing halfway. If anything goes wrong, it cancels everything and doesn’t send bad results.
