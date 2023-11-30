import React, { useState, useEffect } from 'react';
import './css/Restaurants.css';

const Restaurant = ({ restaurant, onRestaurantClick }) => {
    return (
        <div className="restaurant-card" onClick={() => onRestaurantClick(restaurant.name)}>
            <img src={restaurant.image} alt={restaurant.name} className="restaurant-image" />
            <div className="restaurant-info">
                <h2 className="restaurant-name">{restaurant.name}</h2>
                <p className="restaurant-description">{restaurant.description || 'No description available'}</p>
            </div>
        </div>
    );
};

const Restaurants = ({ onRestaurantClick }) => {
    const [restaurants, setRestaurants] = useState([]);
    const [displayedRestaurants, setDisplayedRestaurants] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const restaurantsRes = await fetch('/api/restaurants');
                if (!restaurantsRes.ok) {
                    throw new Error('HTTP error when fetching data');
                }
                const restaurantsData = await restaurantsRes.json();
                setRestaurants(restaurantsData);
                setDisplayedRestaurants(restaurantsData); // Initially displayed restaurants are the same as fetched
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const sortByAlphabetical = () => {
        const sortedRestaurants = [...restaurants].sort((a, b) => a.name.localeCompare(b.name));
        setDisplayedRestaurants(sortedRestaurants);
    };

    const sortByPopularity = () => {
        const sortedRestaurants = [...restaurants].sort((a, b) => a.popularity - b.popularity);
        setDisplayedRestaurants(sortedRestaurants);
    };

    return (
        <>
            <div className="sort-buttons">
                <button onClick={sortByAlphabetical} className="sort-btn">Alphabetical</button>
                <button onClick={sortByPopularity} className="sort-btn">By Popularity</button>
            </div>
            <div className="restaurant-list">
                {displayedRestaurants.map((restaurant) => (
                    <Restaurant
                        key={restaurant.id}
                        restaurant={restaurant}
                        onRestaurantClick={onRestaurantClick}
                    />
                ))}
            </div>
        </>
    );
};

export default Restaurants;
