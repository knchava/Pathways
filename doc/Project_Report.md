## Changes in Project Direction from Original Proposal
Originally, our project aimed to include a total cost estimation feature that would calculate and display the recommendation based on the users’ budget for their itineraries. However, as we experimented with more datasets, we realized that it would be relatively hard to give the user an appropriate cost for their itinerary. In the end, we decided to include a user information page for city recommendations and incorporate more filters relating to accessibility to make up for this lack of an approximate cost feature. In the future, we definitely want to enable users to make an itinerary based on their budget, but for now we feel like we could leave the budget up to the user without causing a great inconvenience.

## Achievements Regarding Usefulness

#### Personalized Recommendations
Our project was able to successfully provide travelers with personalized recommendations for possible accommodations, attractions, and restaurants that a user may want to explore during their trip! We effectively utilized the data the user inputted, like travel preferences, personality traits, and accessibility needs to query our database to give the most suitable recommendations. Therefore, instead of going through possible options that may seem boring or uninteresting to the users, we were able to present them with tailored options that aligned with their interests
#### Accessibility-Focused Features
A relatively small yet impactful achievement of our project was the incorporation of accessibility filters. If a user inputted an accessibility accommodation into our project, we made sure that the recommendations that were presented to them considered specific accessibility needs, like wheelchair accessibility and sidewalk quality. This achievement helps our project be more inclusive of those with mobility considerations!

## Limitations Regarding Usefulness

####  Absence of Budget Calculation Feature
The biggest limitation in our eyes was the absence of the total cost estimation functionality that the initial proposal suggested. However, due to the fact that the datasets didn’t really contain a price range and other constraints, we did not implement this feature. Lacking this real-time budget feature meant that our users would miss a crucial tool for itinerary planning and decision making. Therefore, as a result, our application’s overall practically was limited for many travelers, especially younger travelers who tend to think about budget first when travelling.
#### Real-Time Data Limitations
While we used popular and relevant databases like those from yelp and google, there were data freshness issues since some hotels, attractions, and restaurants may not be up to date in terms of availability and ratings. This meant that some recommendations might not have reflected the current state of the prospective recommendation, which might impact the experience of a user’s trip. Therefore, this lack of real-time data about our accommodations, attractions, and restaurants might lead to unforeseen inconveniences during a user’s trip.
####  Limited Geographical Scope
As of right now, our application focuses on travel within only the USA, which greatly hinders travelers who want to travel to destinations other than cities in the USA. A main cause of this was because of data limitations, as we did not find enough data from other countries to make incorporating other countries worthwhile. In the future, once we do expand out of the USA, we could greatly increase our user base.

## Discuss if you change the schema or source of the data for your application

Overall, our data sources included the yelp business dataset, google local review dataset, hotels 50k dataset, and the global tourist hotspot dataset. Eventually, we ended up using the first three datasets as source of the data for our application and didn’t end up using the global tourist hotspot dataset because we made the choice to limit the travel within the USA. 


Regarding the schema, we stuck to the schema choices we made in stage 2 of the project since we felt like it was well thought out and would make all of the database CRUD operations easier.

## Discuss what you change to your ER diagram and/or your table implementations. What are some differences between the original design and the final design? Why? What do you think is a more suitable design?
We essentially stuck true to our UML diagram because we felt like it was very well thought out and complemented our CRUD and advanced database programs well. However, just before we committed to our current UML design, we first thought of how to keep track of different events in our itinerary and eventually decided to make each event a single table called ItineraryEvent. This event could then be a specific restaurant or attraction a user could visit. However, as we talked more about it within our group and our ta, we realized that splitting this ItineraryEvent into two specific event tables like RestaurantEvent and AttractionEvent was more useful in the end since it will allow us to add event specific attributes to each table in the future which will make our application more scalable. In the future, for example, if we wanted to include other trip options like BreakEvent, we could incorporate specific attributes like rest-time more efficiently.
We think that this was a more suitable design because we feel like it would be easier to scale the main aspect of our application - building an itinerary - as new types of events are introduced. This structure also helps prevent an unorganized and cluttered table with multiple unrelated attributes.

## Discuss what functionalities you added or removed. Why?
We removed the interactive map visualization feature that we incorporated in the early parts since we were running into many bugs with that and decided to focus more on the database aspect of the application. It was a really cool feature, but bugs we ran into were really annoying and took a lot of time to solve. In the end, scrapping the idea was bittersweet, but much needed in order to make substantial improvements to our application!


We added functionality to help our user decide on a city that they would potentially like. At first, we didn’t think of the possibility that the user may come to our application with no destination in mind. Therefore, we added a page where a user can see the cities that our application recommends them to go! We felt like this feature would help immerse the user more and make them feel more connected to the application.

## Explain how you think your advanced database programs complement your application. 

#### Constriants: 
One key database constraint that we implemented within each event table (Attraction and Restaurant events) was that on the deletion of an itinerary, we would cascade all of the corresponding events. This constraint compliments our application really well since it makes deleting an itinerary at once really convenient and ensures that there are no loose connections between itinerary events and the itinerary itself. It ensures that each event must have a valid itinerary and that there doesn’t exist events that map to a deleted itinerary id.

Looks like this:
- In each event table we would do
- ForiegnKey(Itinerary) references Itinerary(Itinerary) ON DELETE CASCADE

#### Stored Procedures
Overall, we had three stored procedures. One created an attraction event row based on the user’s parameters and the information the database gave about the specific attraction. Another created a restaurant event row based on the information the database gave about that specific restaurant. The last procedure receives an itinerary id, and then returns all event information, including name, date, time, etc, for that specific itinerary. We feel like all of these advanced database programs complement our application really well since it helps our application invoke a single structured routine to make each event and list out all events in a specific itinerary, which helps ensure that small bugs that can hinder user experience can be handled in the database layer instead of going through our front-end logic. Moreover, the implementation of such procedures helps our application’s code remain simple, easy to read, and easy to scale/maintain.

#### Triggers
Our trigger increment_hotel_rating is designed to automatically increase a hotel’s rating by 0.1 whenever a hotel is assigned to an itinerary. It starts after an update operation on the Itinerary table, specifically when the Hotel_Id is modified. This trigger first checks if the new Hotel_Id is not null and if it’s either a new assignment or a change to the old hotel. If these conditions are met, then it updates the corresponding new hotel’s rating in the hotels table by adding 0.1 to its current Hotel_Rating value. This trigger ensures that hotels gain a small rating increase each time when they are selected. This makes up for the fact that our data isn’t real time, and the fact that ratings usually fluctuate in real time helped us decide that we should incorporate something like that to ensure that the ratings remain something close to “real time”

#### Transactions
Our transactions process takes place in api/recommendations/:userId endpoints with the following working flow:
It begins by setting the READ COMMIT isolation level to prevent dirty read.
It starts the transaction that first retrieves user’s activity_preferences and ambience_preferences from the UserProfile table.
If it reads those values successfully, then it will fetch the recommended city based on the hotel_ratings in those cities and user’s activity_preferences.
Finally, for each recommended city, we will recommended three attractions based on user’s activity_preferences, ambience_preferences, and ratings of that attraction, and then using UNION to combine those results.
Throughout this process, any error at any step will triggers a rollback to maintain database consistency, while successful completion will lead to a commit that returns the combined recommendations for users, ensuring durability of the program.



## One technical challenge that the team encountered:

#### Shrut
One technical challenge the team encountered was finding a way we could all work on both frontend and backend at the same time. In the beginning, one of our members worked on building the code in the gcp environment, one of our members ssh’d onto the gcp environment, and the two others developed server code locally. This proved to be a great hindrance to members that built a route in the backend and wanted to connect it to the frontend, since the frontend was developed by those two who were working on the server locally. Therefore, our frontend would always query our database that was running on localhost. This made it difficult for our other two members since they had to continuously change the api request address in the frontend from localhost to gcp’s external ip address. We eventually fixed this problem by deciding on a single way for us to develop the server, where we chose the gcp and ssh into the gcp route. Then, we changed each query in our frontend to query the gcp’s external address. This made development so much faster since all of us were now able to work on wiring different aspects of the frontend to the backend.

#### Zhen wu
When we first implemented hotel search in our front end, we naively called fetchHotels on every keystroke by placing it directly in the input’s onChange handler. The result for this is every character triggered an API request which causes the UI to jitter and lead to failed requests. In order to solve this, we decoupled typing from fetching: the onChange handler now only updated the query state. The fetchHotels call was moved into a form submit handler so that it only runs when the user clicks the “search” button.

#### Jiayi:
One technical challenge we encountered was the limitation of datasets. When we are trying to implement the personalized recommendation system, the attractions dataset doesn’t have a column that can describe the properties of those attractions, so we have a hard time matching a user’s preference to the tag of attractions. Only a few attractions can be matched to the user's preference. Then we incorporated the rating of attraction into our recommendation system by UNION the results from rating with the results from user’s preferences. To develop a mature recommendation system, a more comprehensive dataset is needed.


#### Kushal: 
One technical challenge I encountered was getting the frontend and backend to connect. Even when I was able to connect them on mine the same code wouldn't work for the rest of the team which I had to deal with since I was the one who made the server on GCP. This proved quite a challenge since not all of us could test the frontend and backend together, which made website development quite a challenge. Another challenge I encountered was getting hotel selections to properly update in the database. Initially, only hotel names were captured on the frontend, but the backend needed hotel IDs. I fixed this by fetching the hotel ID after selection and updating the server API to store it correctly, ensuring consistent frontend and backend data.


## Describe future work that you think, other than the interface, that the application can improve on

#### Budget & financial planning
We could implement the budget calculation that we originally planned to build. This could greatly help our users by giving them a sense of how much their trip could potentially cost.
#### Advanced Personalization & Machine Learning
We could use data from users that have already completed their trips and give users who have a similar user profile recommendations that include the tag “people like you also loved…”. This would help users feel a sense of reassurance that they might like going to a specific place. Moreover, we could use data and ratings from users who have gone to places recommended by our applications to train a machine learning model that will help give better recommendations to users.
#### Real Time Data
We can use some real time event apis that give information about potential concerts, sport events, and festivals occurring near a users destination that may match their interests. 

## Describe the final division of labor and how well you managed teamwork.

#### Shrut:
Worked on crud operations with itinerary, and developed and tested the frontend with mock data that made integration with the backend easier. I also developed some backend api endpooints.

#### Michael
worked on the frontend structure such as the basic home page and the user sign up interface, and the integration with google API with search interface.

#### Jiayi
Worked on transaction on recommendation system, and developed triggers for rating_increment and stored_procedure for insertion of Event tables. Also worked on testing the backend api’s functionality.

#### Kushal
Worked on getting the GCP server up, getting the databases on SQL and connecting the frontend to the backend. Also worked on the frontend and backend involving User, UserProfile, Itinerary, and Hotel tables.


Overall, we felt that our teamwork was really good, and the way we managed it was really good too! We would text often about our application and met on zoom at least once a week to discuss progress and potential things that each of us could work on. Overall, it was a really fun time!
 
#### Project Video Link: 
https://www.youtube.com/watch?v=f2I5qYRpdqA&ab_channel=KushalChava
