// Restaurants.js
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
    const [models, setModels] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [restaurantsRes, modelsRes] = await Promise.all([
                    fetch('/api/restaurants'),
                    fetch('/api/models')
                ]);

                if (!restaurantsRes.ok || !modelsRes.ok) {
                    throw new Error('HTTP error when fetching data');
                }

                const restaurantsData = await restaurantsRes.json();
                const modelsData = await modelsRes.json();

                setRestaurants(restaurantsData);
                setModels(modelsData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <>
            <div className="sort-buttons">
                <button onClick={() => setRestaurants([...restaurants].sort((a, b) => a.name.localeCompare(b.name)))} className="sort-btn">Alphabetical</button>
                <button onClick={() => {
                    if (models.length > 0) {
                        const currentHour = new Date().getHours();
                        setRestaurants([...restaurants].sort((a, b) => {
                            const modelA = models.find(model => model.hasOwnProperty(`${a.type}_model`));
                            const modelB = models.find(model => model.hasOwnProperty(`${b.type}_model`));
                            const scoreA = modelA ? modelA[`${a.type}_model`][currentHour] : 0;
                            const scoreB = modelB ? modelB[`${b.type}_model`][currentHour] : 0;
                            return scoreB - scoreA;
                        }));
                    }
                }} className="sort-btn">By Score</button>
            </div>
            <div className="restaurant-list">
                {restaurants.map((restaurant) => (
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
