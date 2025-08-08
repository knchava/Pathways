# CS 411 Project 1 Stage 3 - Database Design

## Command line information
![image](https://github.com/user-attachments/assets/2bdc0036-ed93-4bdb-8429-08b42bcb2e45)


## Here are the tables we implemented and here are the respective lines per table

### Restaurants
<img width="422" alt="image" src="https://github.com/user-attachments/assets/e5ef7bf9-0740-4d94-91c5-efa68d8bb5e1" />

### Attractions
<img width="421" alt="image" src="https://github.com/user-attachments/assets/043d2daf-81ba-4cfd-9e21-3574eaf6683c" />

### Hotels
<img width="377" alt="image" src="https://github.com/user-attachments/assets/53d10871-1b0f-43e1-8217-a8759a951c2f" />

## For Users and UserProfile, we randomly generated data using a python script.
### Users
<img width="377" alt="image" src="https://github.com/user-attachments/assets/7f7db21c-103f-4a75-a224-21d3b47bfdf5" />

### UserProfile
<img width="420" alt="image" src="https://github.com/user-attachments/assets/d0fe5ba0-d541-40e3-a5c7-37b432004b73" />



## DDL - Data Definition Language used to create such tables as follows:

### Restaurants:
```sql
CREATE TABLE Restaurants (
    Business_id VARCHAR(255) PRIMARY KEY,
    Name VARCHAR(255),
    City VARCHAR(100),
    State VARCHAR(50),
    Postal_code VARCHAR(20),
    Stars FLOAT,
    Categories TEXT,
    Wheelchair_Accessible VARCHAR(10),
    Ambience TEXT,
    Address TEXT
);
```

### Attractions:
```sql
CREATE TABLE attractions (
    attractionID INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    main_category VARCHAR(100),
    rating FLOAT,
    reviews INT,
    categories TEXT,
    address TEXT
);
```

### Users:
```sql
CREATE TABLE Users (
    UserID INT PRIMARY KEY,
    Name VARCHAR(100),
    Age INT,
    Location VARCHAR(255)
);
```

### UserProfile:
```sql
CREATE TABLE UserProfile (
    UserID INT PRIMARY KEY,
    Travel_Preferences VARCHAR(255),
    Interests VARCHAR(255),
    Accessibility_Need VARCHAR(255),
    Ambience_Preference VARCHAR(255),
    Activity_Preferences VARCHAR(255),
    Age_Group VARCHAR(50),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);
```

### Hotels:
```sql
CREATE TABLE hotels (
    Hotel_Id INT PRIMARY KEY,
    Hotel_Name VARCHAR(100),
    Hotel_Rating DECIMAL(2,1),
    Address VARCHAR(255),
    City_Code INT,
    City_Name VARCHAR(100),
    Description TEXT
);
```
## Advanced Queries

### 1) For a specific attraction (in this case attraction 1611 which is a six flags in texas) and for a specific user profile(in this case user profile 3), give me the top 5 hotels, ordering by a hotel’s description similarity to a user’s preference, and then ordering by rating.
- Satisfies Subquery, Set operations, and Join

```sql
SELECT DISTINCT *
FROM (

    SELECT
        h.Hotel_Name,
        h.Hotel_Rating,
        h.Address,
        a.name as AttractionName
    FROM hotels h
    JOIN attractions a
        ON LOWER(a.address) LIKE LOWER(CONCAT('%', SUBSTRING_INDEX(h.City_Name, ',', 1), '%'))
    JOIN UserProfile u
        ON u.UserID = 102
    WHERE a.attractionID = 1611
    AND (
        h.Description LIKE CONCAT('%', u.Travel_Preferences, '%') OR
        h.Description LIKE CONCAT('%', u.Interests, '%') OR
        h.Description LIKE CONCAT('%', u.Activity_Preferences, '%') OR
        h.Description LIKE CONCAT('%', u.Ambience_Preference, '%')
    )
    
    UNION ALL

    SELECT
        h.Hotel_Name,
        h.Hotel_Rating,
        h.Address,
        a.name AS AttractionName
    FROM hotels h
    JOIN attractions a
        ON LOWER(a.address) LIKE LOWER(CONCAT('%', SUBSTRING_INDEX(h.City_Name, ',', 1), '%'))
    WHERE a.attractionID = 1611
) AS combined_results
ORDER BY Hotel_Rating DESC
LIMIT 15;
```
#### result of query 1:
![image](https://github.com/user-attachments/assets/7f5b298d-937e-472e-9bf2-5aa1f4c82301)


### 2) This query returns the top 15 restauarents based on a specfic attraction's location, in this case attraction 456 which is 18th century garden in philly, and it lists the average city score for that restaurant's city.
- This query satisfies using joins and subqueries
```sql
SELECT
    R.Name AS Restaurant_Name,
    R.Stars AS Restaurant_Rating,
    R.Categories,
    R.City,
    ROUND(
        (SELECT AVG(R2.Stars)
         FROM Restaurants R2
         WHERE R2.City = R.City), 
        2
    ) AS Avg_City_Rating
FROM Restaurants R
JOIN attractions A
    ON A.address LIKE CONCAT('%', R.City, '%')
    OR A.address LIKE CONCAT('%', R.Postal_code, '%')
WHERE A.attractionID = 456 
ORDER BY R.Stars DESC
LIMIT 15;
```
#### result of query:
![image](https://github.com/user-attachments/assets/032e7ceb-7dfd-4dbe-b730-45dd374fd3f3)


### 3) This query returns a list of recommended cities which have more than 20 4-5stars rating hotels to those users who prefer "relaxation" and "indoor activity" (as an example). It lists the userId, userName, and a list of five matched cities.
- This query satisfies using multiple joins and aggregation.
```sql
SELECT 
    final.UserID,
    final.Name,
    GROUP_CONCAT(final.City_Name ORDER BY final.City_Name SEPARATOR ', ') AS Recommended_Cities
FROM (
    SELECT 
        u.UserID,
        u.Name,
        h.City_Name,
        ROW_NUMBER() OVER (PARTITION BY u.UserID ORDER BY h.City_Name) AS rn
    FROM hotels h
    JOIN (
        SELECT u.UserID, u.Name
        FROM Users u
        JOIN UserProfile up ON u.UserID = up.UserID
        WHERE up.Activity_Preferences IN ('Indoor Activities', 'Relaxation')
    ) AS u ON 1 = 1
    WHERE (h.Hotel_Rating BETWEEN 4.0 AND 5.0 OR LOWER(h.Description) LIKE '%relax%')
    GROUP BY h.City_Name, u.UserID, u.Name
    HAVING COUNT(h.Hotel_Id) > 20
) AS final
WHERE final.rn <= 5
GROUP BY final.UserID, final.Name
ORDER BY final.UserID
LIMIT 15;
```
#### result of query:
![image](https://github.com/user-attachments/assets/dc174163-e849-4f4c-adf2-c630ae5f3db3)



### 4) This query returns the best attractions near a specific hotel, first based on the user profile's preferences, and then it defaults to the best attractions rating wise.
- This satisfies using multiple joins and set operations
```sql
SELECT 
    a.name AS Attraction_Name,
    a.main_category AS Category,
    a.rating AS Attraction_Rating,
    a.address AS Attraction_Address,
    h.Hotel_Name AS Nearby_Hotel,
    h.Hotel_Rating AS Hotel_Rating
FROM hotels h
JOIN attractions a 
    ON LOWER(a.address) LIKE LOWER(CONCAT('%', SUBSTRING_INDEX(h.City_Name, ',', 1), '%'))
JOIN UserProfile u ON u.UserID = 1
WHERE h.Hotel_Id = 1200167
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

UNION ALL

SELECT 
    a.name AS Attraction_Name,
    a.main_category AS Category,
    a.rating AS Attraction_Rating,
    a.address AS Attraction_Address,
    h.Hotel_Name AS Nearby_Hotel,
    h.Hotel_Rating AS Hotel_Rating
FROM hotels h
JOIN attractions a 
    ON LOWER(a.address) LIKE LOWER(CONCAT('%', SUBSTRING_INDEX(h.City_Name, ',', 1), '%'))
WHERE h.Hotel_Id = 1200167

ORDER BY Attraction_Rating DESC
LIMIT 15;
```
#### result of query:
![image](https://github.com/user-attachments/assets/083d5062-012c-40db-a1dd-cec800db5069)


## Indexing
## Query 1:
#### Query Performance before adding an index
- There was a table scan on the temporary table costing betweeen 729- and 7454.
- There was a temporary table with deduplication to hold all the results of union all, which costed 7290  
- There was a table scan on the combined results table which costed between 5841 and 6005
- There was a materizaliation of the union all into a temp table which costed 5841 
- Then, there was a filter on the table which costed 1986
      - Then, there was a table scan on this table which costed 1986
- Then, there was another filter on the table which costed 2570
      - Then, there was a table sacn on this table which costed 2570
<img width="1008" alt="image" src="https://github.com/user-attachments/assets/6b24a036-c31c-4903-86ad-364f78e8a5d1" />

### index 1 Single column index on hotels(Description)
```sql
CREATE FULLTEXT INDEX idx_description ON hotels(Description));
```
### Anaysis
As we can see, the cost of everything went down as the index on the Description improved the performance. This helps reduce the cost of using LIKE "%..%" filters since the original query performed full table scans, searching each row/hotel for similar LIKE patterns, which is really inefficent. Using this full text index, we can help the database locate relevant rows based on indexed words in the hotel's descriptions.
<img width="1008" alt="image" src="https://github.com/user-attachments/assets/ecf58c3a-b9f0-49dd-8b03-e6d7d1563483" />

### index 2 Composite index on hotels(City_Name, Hotel_Rating)
```sql
CREATE INDEX idx_city_rating ON hotels(City_Name, Hotel_Rating);
```
### Analysis
The composite index on City_Name and Hotel_Rating had no impact on performance. This is because the composite index is not directly utilzied by the query, since the query's main focus is to filte rhotels based on ther description column using like operators. Therefore, the query's costs is still dominated by the full text search, so indexing based on city name and hotel rating doesn't contribute to the query's performance. Therefore, at the end of the day, the database still processes the same number of rows during join and filtering operations.

<img width="1007" alt="image" src="https://github.com/user-attachments/assets/dd0a664a-a5aa-43b6-bcf2-c30630cd359f" />


### index 3 CREATE INDEX idx_hotel_rating ON hotels(Hotel_Rating DESC)
```sql
CREATE INDEX idx_hotel_rating ON hotels(Hotel_Rating DESC);
```
### Analysis 
The index on just the hotel rating did not make the queru's performance improve. This is again due to the query's main operation being filtering hotels based on the hotel's description using LIKE patterns, which indexing on hotel rating will not help. Although the query orders the resulting hotels by the rating, it occurs after the database has already performed a full scan through the table, and so the index does not help the cost despite this fact.
<img width="1004" alt="image" src="https://github.com/user-attachments/assets/c773f924-1fe9-47d8-a5c4-f05c8b483424" />

### Final Analysis
The final index design I selected is the full-text index on the description column. This is the only index that improved our cost, and so we will be using this one! This will be more efficent for us since the full table scans performed without this index are now reduced. Now the database can optimze searching for hotels based on the description because of this index. Therefore, since the full text index on Desscription directly addressed the query's main issue of scanning through the entire hotel database for the description, we chose it.

## Query 2:
### Query performance before adding an index:
- Limiting the 15 rows costed 5973
- Sorting the rows costed 5973
- filtering the table costed 5973
- the table scan from this filter also costed 5973
- the aggregate costed 1831
- the filter on this costed 1313
- the table scan on from this filer costed 1313
![image](https://github.com/user-attachments/assets/6e82c3f3-a8d1-44b3-8d78-bf39cd430b17)

### index 1 Single column index on Restaurants(Stars DESC)
```sql
CREATE INDEX idx_restaurants_stars_desc ON Restaurants(Stars DESC);
```
### Analysis
Addaning an index on Stars DESC helped improve our performance signficantly! This is since this index helps sorting and filtering operations on the stars clumn which our query without the indexes performed full table scans on. Indexing based on the stars allowed our database to efficiently access the rows in a sorted order without scanning all of them.
![image](https://github.com/user-attachments/assets/e4ecb9f3-d046-4cce-bb0d-cf98b47a1bcb)

### index 2 Single column index on Restaurants(City)
```sql
CREATE INDEX idx_restaurants_city ON Restaurants(City);
```
### Analysis
This index did not improve the query cost. This is because the query uses LIKE '%...%' on both City and Postal_code, which stops the database from using the index properly. Since the pattern starts with a wildcard, the index can’t help, and the database still has to check each row manually. So, the index on city didn’t make things faster, and we chose not to keep it.
Index 3: CREATE INDEX idx_restaurants_postal_city ON Restaurants(Postal_code, City);
![image](https://github.com/user-attachments/assets/7e373614-8845-43be-a481-829db0e368d6)


### index 3 Single column index on Restaurants(Postal_code, City)
```sql
CREATE INDEX idx_restaurants_postal_city ON Restaurants(Postal_code, City);
```
### Analysis
This index did not improve the query cost, so we will not be using it. This is because the filter condition compares the full address from the attractions table using a LIKE '%...%' pattern on both City and Postal_code. Since the pattern starts with a wildcard, the database cannot use the index on (Postal_code, City) efficiently. As a result, the optimizer continues to perform a scan and apply the filter manually.
Index 3: CREATE INDEX idx_restaurants_postal_city ON Restaurants(Postal_code, City);
![image](https://github.com/user-attachments/assets/8d5744a8-eb2f-467f-b484-e49f86baf8da)

### Final Analysis
For this Query we are only using Index 1 since it is the only one that made an improvement. The cost reduces by almost 10000 times. Indexing based on the stars allowed our database to efficiently access the rows in a sorted order without scanning all of them!


## Query 3: 
#### Query Performance before adding an index
- There was a filter on the table which costed 28315
- There was a table scan on final costed between 28314 and 28315
- There was a materizaliation of the union all into a temp table which costed 24516 
- There was a window aggregate time costed between 28236 and 28296.
- Then, there was a temporary table with deduplication to hold all the results of union all, which costed 7290  
- Then, there was a table scan on the temporary table costing betweeen 22681 and 25394.
- Then, there was a aggregate using time temporary table costed 22680
- Then, there was a nested inner loop join costed 428703
- Then, there was a inner hash join costed between 357839
- Then, there was a table scan on up costed 66^98
- Then, there was a filter on hotel condition costed 2066
- Then, there was another filter on the table which costed 2570
- Then, there was a table sacn on this table which costed 53.8

<img width="1006" alt="image" src="https://github.com/user-attachments/assets/119594a7-4448-4b45-9fa8-13759dd8de63" />

### index 1:
```sql
CREATE INDEX idx_userprofile_activity ON UserProfile(Activity_Preferences);
```
### Analysis
The index on Activity_Preferences didn’t improve performance because MySQL didn’t use it. This is likely because many users have the same activity, so the index doesn’t narrow down the results much. Also, since the query joins all users with all hotels, the filter on activities doesn’t change the total amount of work by much.

<img width="625" alt="image" src="https://github.com/user-attachments/assets/4a3f39d0-1a3c-4cd6-8b1a-7db6f28ed238" />

## index 2:
```sql
CREATE INDEX idx_rating_city ON hotels(Hotel_Rating, City_Name);
```
### Analysis
The index on (Hotel_Rating, City_Name) did not improve performance, as the cost of filtering and sorting hotels stayed the same. The query still performs a full table scan on hotels with a cost of 1746, and the expensive nested loop join remains unchanged. This means the index was not used because MySQL estimated that scanning the whole table was more efficient than using the index.

<img width="626" alt="image" src="https://github.com/user-attachments/assets/5f5f5233-2116-4ea3-942f-7627e3ec528e" />

## index 3:
```sql
CREATE INDEX idx_users_userid ON Users(UserID);
```

### Analysis: 
The index on Users(UserID) did not improve performance, because the cost of joining users with profiles and hotels stayed the same at 1.76e+6, and the table scan on Users still occurred. MySQL continued to perform a full scan on the Users table instead of using the index, likely because the number of user rows is small or the join pattern didn’t benefit from indexed access.

<img width="625" alt="image" src="https://github.com/user-attachments/assets/f63f0872-83e4-44ba-8e8f-1a4925a1a2db" />


### Final Analysis
For this Query we are not using any indexes since none of the index increased performance. This is because it is dominated from the large full table scan that our indexes failed to make more effcient.
﻿ 


## Query 4:
#### Query perforamnce before the indexing
- Limiting the table to 15 rows cost 1561
- Sorting the rows cost 1561
- Table scanning on the unioned rows cost 1011
- The table that was materialzied from the UNION ALL cost 1011
- The filter on this table cost 199
      - The table scan for this filter cost 199
- Another filter on this table cost 331
      - The table scan for this filter cost 331
<img width="1005" alt="image" src="https://github.com/user-attachments/assets/38d8ed41-6fa8-4bd9-a889-efe7a3823010" />

## index 1: 

```sql
CREATE INDEX idx_city_name ON hotels(City_Name)
```
### Analysis
The index on City_Name doesn’t reduce the query cost because MySQL still has to scan the entire attractions table. This happens because the query uses LIKE '%...%' and SUBSTRING_INDEX, which make it hard for MySQL to use the index efficiently. So even though our index exists, the cost stayed the same.
<img width="1007" alt="image" src="https://github.com/user-attachments/assets/62d8502c-12d3-4719-b4a3-117ee6bbfbf5" />

## index2:
```sql
CREATE INDEX idx_main_category ON attractions(main_category)
```
### Analysis
The index on main_category helps filter the attraction categories faster, but the overall query cost remains the same since the bigger issue is still with the LIKE on the address. Therefore, while filtering by the main category is more efficent now, the query's cost gets taken up by the expensive full table scan on the address since the full table scan on the address still happens. 

<img width="1006" alt="image" src="https://github.com/user-attachments/assets/b7acf7e2-3c46-458b-9c3e-3a1f8d94c675" />

## index3:
```sql
CREATE INDEX idx_user_id ON UserProfile(UserID)
```
### Analysis
The final index design I tested was the single-column index on the UserID column in the UserProfile table. However, this index did not improve our query cost, so we will not be using it. This is because our query only looks up one specific user with UserID = 1, and the table is small. Therefore, the performance gained by indexing based on userid was neglible, so filtering by a single user id doesn't justify using an index. 


<img width="1008" alt="image" src="https://github.com/user-attachments/assets/ece9f614-4831-489a-8efe-7a2048c27aa7" />

### Final analysis
After testing all of these indexes, none of them signficantly improved our query's performance since our querys biggest problem is still the like filter on the addresses. This is why we did not find any difference in our results:(



