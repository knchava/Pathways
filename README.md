# Project Title: Pathway: Travel Smart

# Summary

Our project helps excited travelers plan their trip efficiently by guiding them towards creating their own personalized itineraries. They can input their travel preferences and details about their personality, and location of travel (within the USA). Then, our application first helps users acquire a place to stay using the user-demographic information they input. For example, if a user likes the ocean, our application will recommend a hotel by the ocean or a body of water if it exists. After selecting their hotel, the traveler can then map out every day of their trip, selecting different attractions for each day. Based on different things the traveler likes, our application will recommend different attractions aligned with their interests.

The project will also have features that will help users feel good about thier selected attractions. Pathway will summarize reviews about different attractions they may choose and guide them towards choosing the best attraction for thier needs. Moreover, the built in total cost estimation will allow users to optimize their budgets to create an iternitary that is budget-friendly, structured, and engaging! In the end, users will be able to narrow down the vast amounts of attractions and accomodations offered to a select few that match their preferences. To tackle these vast amount of options, Pathway provides a streamlined, enjoyable, and user-friendly experience that makes the overwhelming process of trip-planning fun!

# Description

**Pathway** is a trip-planning application designed to help travelers efficiently create personalized itineraries within the USA. It will allow them to input their travel preferences, interests, hobbies, personality traits, and budget, which we will then use to give the user the appropriate attractions, accommodations, and dining experiences. Oftentimes, many travelers struggle with poor trip management, which leads them to miss key attractions, exceed their budget, or overload their schedule. There are just so many options available, and it is inconvenient for travelers to look through endless reviews and recommendations to find the best options. 

Pathway helps solve this problem using data to streamline the planning process, which will ensure that users receive well-balanced and self-fulfilling itineraries. We will first help users receive tailored hotel recommendations based on their preferences. Once they decide on where they will live for the duration of their trip, they will then be able to get access to different attractions and sites to visit. The itinerary will first start off with the first day of the trip, and the user can allocate the appropriate time for each attraction and move onto the next day. For these attractions, users can also apply an appropriate filter for things like accessibility, family-friendliness, dietary restrictions, etc., to ensure that the recommendations align with their needs. In the end, we want to help travelers tackle the abundance of choices in going on a trip by providing a structured and data-driven approach to trip planning.

# Creative Component

Our application can include multiple useful creative components such as an interactive itinerary visualization, which will make the process of creating and updating a user’s itinerary fun and engaging.

## Interactive Itinerary Visualization

Our vision for this creative component is that users can look at a visualization of their itinerary through a visual timeline component, and they can drag and drop activities into their itinerary. This will help users visualize their itinerary and be more engaged with making their itinerary.


# Usefulness

Our trip planner application is highly useful because it addresses the problem of poor trip organizing by allowing users to plan their itinerary based on their preferences, budget, and accessibility needs. Unlike most other travel booking websites that focus on a very specific aspect of travel, ours will combine many aspects of trip planning including hotels, attractions, and restaurants, into one single platform. 

Beyond this, our platform will recommend these aspects of the trip based on what things they like to do and what they prefer on a trip. Users will be able to create personal profiles, where they can put their age, budget, interests, and preferences. We will then use this information along with other information such as proximity to public attractions to recommend an attraction or accommodation that closely matches their needs. These recommendations would help prevent bad trip organizing by making it more convenient and efficient for the user, as they will likely be drawn to our recommendations. This feature also helps the users navigate through the mountain-load of options they might have. Moreover, they can also visualize and modify their itineraries interactively, adding or removing activities with ease.

There are existing platforms such as TripAdvisor and Expedia that assist users in booking hotels and finding attractions, but our application offers a more personalized, interactive, and efficient itinerary planning experience. For example, rather than showing a list of attractions or hotels in a selected area, Pathway will show users attractions or accommodations that most closely match their needs, allowing users to connect all aspects of their trip into a structured plan with ease. This makes Pathway a more convenient and efficient option for travelers, as they can navigate through mountains of options to plan out their best trip yet!


# Realness

## Hotels50K Dataset
[Hotels50K Dataset on Kaggle](https://www.kaggle.com/datasets/jejomon/hotels50k)  
For hotel information, we would like to integrate datasets such as the Hotels50K dataset from Kaggle and real-time data from the Booking.com Affiliate API. Hotels50K offers over 50,000 global hotel listings in CSV format, including hotel name, location, and star rating. The Booking.com API would provide up-to-date hotel availability, pricing, and comprehensive property details via JSON.

## Yelp Open Dataset
[Yelp Open Dataset](https://www.yelp.com/dataset)  
The Yelp dataset provides millions of user reviews, ratings, and category tags for local businesses such as restaurants, parks, and shopping malls in JSON format. By implementing this dataset, we can ensure users receive rich, geographically diverse recommendations.

## Google Local Reviews Data
[Google Local Reviews Data](https://datarepo.eng.ucsd.edu/mcauley_group/gdrive/googlelocal/#sample-metadata)  
This dataset is in JSON format and boasts high cardinality with over 5 million reviews from thousands of locations, businesses, and attractions. Each review contains details such as business name, address, geo coordinates, accessibility, star rating, and review text. Additionally, the dataset contains wheelchair accessibility information, which would enable customers to focus on their mobility needs. It also includes points of interest, such as museums, parks, and landmarks, along with geolocation data.

## Global Tourist Hotspot Dataset
[Global Tourist Hotspot Dataset on Kaggle](https://www.kaggle.com/datasets/maedemaftouni/global-tourist-hotspots-us-india-iran?select=cleaned_data_USA.csv)  
This dataset offers both CSV and JSON formats and covers hundreds of thousands of points of interest across more than 200 countries. The key information from this dataset includes tourist attractions from around the world, which feature the attraction's name, geolocation coordinates, category, visitor ratings, and review summaries. Additionally, it contains data such as ticket pricing, accessibility attributes, and operating hours.

# Functionality

## User profile management
Users can upload their information which includes details such as age, budget, travel preferences, accessibility requirements, etc.

## Trip itinerary planning
Users can then create a new trip itinerary by selecting a destination and trip dates. They can then search for hotels, attractions, and restaurants by applying various filters and then add an update to their trip itinerary with the attraction or accommodation they would like to indulge in.

## Personalized Recommendations
After the user inputs their information, our website will deliver them with personalized recommendations on what attractions or accommodations would be good in respect to their needs, which helps users update their itinerary.

## Interactive Map with Filters
The users will be able to search through a detailed visual map representation of their destination and will be able to search for attractions based on their personalized recommendations and potential filters.

## Total Cost Estimation
The system will calculate and display an estimated total cost of the trip based on their current itinerary, which would help users make updates to their itinerary based on their budget.

## Dynamic Itinerary Visualizations
Users will have the option to visualize their itinerary in an interactive and easy-to-navigate timeline. This feature will allow users to update their itinerary through drag and drop, helping them quickly modify their schedule and get a clearer understanding of their trip.

## Review Summaries and Ratings
The website will use AI to summarize a lot of review data on a particular attraction and offer the user a simple and concise summary of how the attraction is based on reviews. This will help users make decisions on whether to update their itinerary to include the respective attraction.

## AI-Powered Insights
The website will use AI to suggest adjustments to the user's itinerary based on information like weather and current season.

## Customizable Trip Themes
The website will allow users to update their different trip themes (e.g., adventure, relaxation, culture, family-friendly), which will play a role in the attractions or accommodations that get recommended to the user.

## Smart Export Function
The website will allow users to search for a way to export their current itinerary in multiple formarts, turning thier pathway adventure into something concrete they can follow.

## Low-fidelity UI mockup
[Pathway Final PDF](./doc/pathwayfinal.pdf)
![image](https://github.com/user-attachments/assets/74ed64fa-0c71-485d-82d8-1f5340517231)
