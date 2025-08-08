# Stage 2: Conceptual and Logical Design

## Assumption  

### Entity:  
- **User**: Each user has a unique `userId` and can register with name, age, and location. This information is represented as an entity since this information identifies each unique user and allows for easy management of user-related data.
- **UserProfile**: Each `UserProfile` has a unique `userId` and will store the user’s travel preferences (e.g., Interests, Ambience Preference, etc). `UserProfile` is separate from the the `User` entity so it doesn’t clutter the user entity and allows for easier scalability and flexibility. Moreover, keeping user profile as a separate entity allows for easier modification in the future. For example, if a user decides to change thier preferences, this entity can be adjusted appropriately without impacting the user's core data.
- **Itinerary**: Each `Itinerary` has a unique `ItineraryId` and can represent a single trip plan to a specific destination. It has attributes such as `Itinerary start date`, `end date`, and `destination`. Having the itinerary as a separate entity allows for flexibility in managing multiple trips for a singe unique user. Its useful in the event that a single user has many trips scheduled, and it ensures that each trip can be managed independently without affecting other trips.
- **RestaurantEvent**: Each `RestaurantEvent` has a unique `RestaurantEventId` and represents a dining activity in the `Itinerary`, tracking this dining event’s `start_time` and `end_time`. Having RestauarantEvent as an entity allows for scalability and flexibility in managing multiple dining events within a single itinerary so that each dining activity in the itinerary can be managed independently.
- **AttractionEvent**: Each `AttractionEvent` has a unique `AttractionEventId` and represents a visiting activity in the `Itinerary`, tracking this visit’s `start_time` and `end_time`.  Having AttractionEvent as an entity allows for scalability and flexibility in managing multiple dining events within a single itinerary so that each attraction activity in the itinerary can be managed independently.
- **Hotel**: Each `Hotel` has a unique `HotelId` and represents a hotel with its name, rating, address, and so on. Hotels are a separate entity since they have various attributes like (name, rating, etc) that are specific to each hotel and need to be managed independently.
- **Restaurant**: Each `Restaurant` has a unique `businessId` and represents a restaurant with its name, address, stars (rating), and so on. Restaurants are a separate entity since they have unqiue attributes that are specific to each restauarnt and need to be managed independently.
- **Attraction**: Each `Attraction` has a unique `AttractionId` and stores the relevant information of each attraction, such as name, main category, reviews, and so on. Attractions are a separate entitiy since they have unique attributes that are specific to each attraction and need to be managed independently.

### Relationship:  
- **User – "Creates" - UserProfile**: (1-to-1) 
  - Each user will create exactly one profile, and each user profile will belong to a single user, indicating a one-to-one relationship.  
- **User – 'creates' - Itinerary**: (1-to-Many)  
  - Each user can create as many itineraries as they want, but an itinerary belongs to exactly one user who creates it, indicating a one to many relationship.
- **Itinerary – 'contains' RestaurantEvent**: (1-to-Many)
  - Each itinerary can contain zero or many restaurant events, but a unique restaurant event belongs to exactly one itinerary.  
- **Itinerary – 'contains' - AttractionEvent**: (1-to-Many) 
  - Each itinerary can contain zero or many attraction events, but an unqiue attraction event belongs to exactly one itinerary.  
- **Itinerary – 'books at' - Hotels**: (Many-to-1)
  - Each Itinerary books at exactly one hotel, but a hotel can be booked by many itineraries, indicating a many-to-one relationship.
- **AttractionEvent – 'contains' - Attractions**: (Many-to-1)
  - Each attraction event contains exactly one attraction, but an attraction can belong to many attraction events, indicating a many to one relationship.  Typically, an itinerary event references exactly one place.  
  - One attraction may have zero or many attraction events taking place there, so the cardinality will be `0..*`.  
- **RestaurantEvent – 'contains' - Restaurants**: (Many-to-1)
  - Each itinerary event relates to exactly one restaurant/business. An itinerary event references exactly one place.  
  - One restaurant may have zero or many restaurant events taking place there, so the cardinality will be `0..*`.  

## BCNF  

### User Table  
**Functional Dependencies:**  
`UserID → Name, Age, Location`  
**Analysis:** All non-key attributes depend on the primary key, so this table is in BCNF.  

### UserProfile  
**Functional Dependencies:**  
`UserID → Travel_Preferences, Interests, Accessbility_Need, Ambience, Activity_Preferences, Age_Group`  
**Analysis:** All non-key attributes depend on the primary key, so this table is in BCNF.  

### Itinerary  
**Functional Dependencies:**  
`ItineraryID → Itinerary_start_date, Itinerary_end_date, Destination, UserID, Hotel_id`  
**Analysis:** All non-key attributes depend on the primary key, so this table is in BCNF.  

### RestaurantEvent  
**Functional Dependencies:**  
`RestaurantEventId → ItineraryID, Categories, Start_Time, End_Time, Business_id`  
**Analysis:** All non-key attributes depend on the primary key, so this table is in BCNF.  

### AttractionEvent  
**Functional Dependencies:**  
`AttractionEventId → ItineraryID, Categories, Start_Time, End_Time, AttractionID`  
**Analysis:** All non-key attributes depend on the primary key, so this table is in BCNF.  

### Hotels  
**Functional Dependencies:**  
`Hotel_Id → HotelName, HotelRating, Address, CityCode, Description`  
**Analysis:** All non-key attributes depend on the primary key, so this table is in BCNF.  

### Restaurants  
**Functional Dependencies:**  
`Business_id → name, address, city, state, postal_code, stars, categories, Wheelchair_Accessible, ambience, address`  
**Analysis:** All non-key attributes depend on the primary key, so this table is in BCNF.  

## Relational Schema  

```sql
User (
  UserID: INT [PK], 
  Name: VARCHAR(100), 
  Age: INT,
  Location: VARCHAR(255)
);

UserProfile (
  UserID: INT [PK, FK to User.UserID], 
  Travel_Preferences: VARCHAR(255), 
  Interests: VARCHAR(255), 
  Accessibility_Need: VARCHAR(255),
  Ambience_Preference: VARCHAR(255), 
  Activity_Preferences: VARCHAR(255), 
  Age_Group: VARCHAR(50)
);

Itinerary (
  ItineraryID: INT [PK], 
  Itinerary_start_date: DATE, 
  Itinerary_end_date: DATE, 
  Destination: VARCHAR(100), 
  UserID: INT [FK to User.UserID], 
  Hotel_Id: INT [FK to Hotels.Hotel_Id]
);

AttractionEvent (
  AttractionEventId: INT [PK], 
  AttractionID: INT [FK to Attractions.AttractionID], 
  Categories: TEXT, 
  ItineraryId: INT [FK to Itinerary.ItineraryID], 
  Start_Time: TIME, 
  End_Time: TIME
);

RestaurantEvent (
  RestaurantEventId: INT [PK], 
  PlaceId: INT [FK to Restaurants.business_id], 
  Categories: TEXT, 
  ItineraryId: INT [FK to Itinerary.ItineraryID], 
  Start_Time: TIME, 
  End_Time: TIME
);

Hotels (
  Hotel_Id: INT [PK], 
  HotelName: VARCHAR(100),
  HotelRating DECIMAL, 
  Address: VARCHAR(255),
  CityCode: VARCHAR(50), 
  Description: TEXT
);

Restaurants (
  Business_id: INT [PK],
  Name: VARCHAR(50),
  City: VARCHAR(50),
  State: VARCHAR(50),
  Postal_Code: INT,
  Stars: DECIMAL,
  Categories: TEXT,
  Wheelchair_Accessible: BOOLEAN,
  Ambience: VARCHAR(255),
  Address: TEXT
);

Attractions (
  AttractionID: INT [PK],
  Name: VARCHAR(255),
  MainCategory: VARCHAR(255),
  Categories: TEXT,
  Rating: DECIMAL,
  Reviews: TEXT,
  Address: TEXT,
  CityCode: VARCHAR(50)
);
