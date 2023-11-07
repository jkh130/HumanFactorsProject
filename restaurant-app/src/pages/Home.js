import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/Home.css';

function Home() {
    const [restaurants, setRestaurants] = useState([]);
    let navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/restaurants.json');
                const data = await response.json();

                // Get the current time rounded to the nearest hour
                const currentHour = new Date().getHours() + 1;

                // Add a busynessLevel property to each restaurant based on the current hour
                const updatedData = data.map(restaurant => {
                    const busynessScore = restaurant.busyness[currentHour.toString()];
                    const busynessLevel = getBusynessLevel(busynessScore);
                    return {
                        ...restaurant,
                        busynessLevel
                    };
                });

                setRestaurants(updatedData);
            } catch (error) {
                console.error('Error fetching restaurants:', error);
            }
        };

        fetchData();
    }, []);

    // Convert busyness score to level
    const getBusynessLevel = (score) => {
        if (score <= 1.25) return 1;
        if (score <= 2.5) return 2;
        if (score <= 3.75) return 3;
        return 4;
    };

    // Sort by Popularity
    const sortByPopularity = () => {
        const sortedRestaurants = [...restaurants].sort((a, b) => b.popularity - a.popularity);
        setRestaurants(sortedRestaurants);
    };

    // Sort by Name (alphabetical order)
    const sortByName = () => {
        const sortedRestaurants = [...restaurants].sort((a, b) => a.name.localeCompare(b.name));
        setRestaurants(sortedRestaurants);
    };

    // Sort by Current Busyness Level
    const sortByBusyness = () => {
        const sortedRestaurants = [...restaurants].sort((a, b) => a.busynessLevel - b.busynessLevel);
        setRestaurants(sortedRestaurants);
    };

    const handleRestaurantClick = (restaurantName) => {
        navigate(`/info/${encodeURIComponent(restaurantName)}`);
    };

    return (
        <div className="page">
            <h1 className="title">Sort Restaurants by...</h1>

            <div className="sort">
                <button onClick={sortByPopularity} className="sort-btn">Popularity</button>
                <button onClick={sortByName} className="sort-btn">Alphabetical</button>
                <button onClick={sortByBusyness} className="sort-btn">Time</button>
            </div>

            <ul className="restaurant-list">
                {restaurants.map((restaurant) => (
                    <li key={restaurant.id}>
                        <button
                            className="restaurant-btn"
                            onClick={() => handleRestaurantClick(restaurant.name)}
                        >
                            {restaurant.name}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Home;
