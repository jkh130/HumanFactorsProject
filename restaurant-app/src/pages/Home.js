import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/Home.css';

function Home() {
    const [restaurants, setRestaurants] = useState([]);
    const [models, setModels] = useState([]);
    let navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                let response = await fetch('/api/restaurants'); // Updated endpoint
                let data = await response.json();
                console.log(data);
                setRestaurants(data);
    
                response = await fetch('/api/models'); // Updated endpoint
                data = await response.json();
                setModels(data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
    
        fetchData();
    }, []);

    const sortByName = () => {
        setRestaurants(currentRestaurants => {
            return [...currentRestaurants].sort((a, b) => a.name.localeCompare(b.name));
        });
    };

    const sortByModel = () => {
        const currentHour = new Date().getHours(); // Getting the current hour
        const sortedRestaurants = [...restaurants].sort((a, b) => {
            // For each restaurant, find its corresponding model based on its type
            const modelA = models.find(model => model.hasOwnProperty(a.type + '_model'));
            const modelB = models.find(model => model.hasOwnProperty(b.type + '_model'));
    
            // Sort the restaurants in ascending order based on their current hour's model score
            // If a model is not found for a restaurant, its score is assumed to be 0
            return (modelA ? modelA[a.type + '_model'][currentHour] : 0) - 
                   (modelB ? modelB[b.type + '_model'][currentHour] : 0);
        });
        setRestaurants(sortedRestaurants); // Updating the state with the sorted restaurants
    };

    const handleRestaurantClick = (restaurantName) => {
        navigate(`/info/${encodeURIComponent(restaurantName)}`);
    };

    return (
        <div className="page">
            <h1 className="title">Sort Restaurants by...</h1>

            <div className="sort">
                <button onClick={sortByName} className="sort-btn">Alphabetical</button>
                <button onClick={sortByModel} className="sort-btn">Quick</button>
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
