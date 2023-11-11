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

    const sortByName = () => {
        setRestaurants([...restaurants].sort((a, b) => a.name.localeCompare(b.name)));
    };

    const sortByScore = () => {
        if (models.length > 0) {
            const currentHour = new Date().getHours();
            const sortedRestaurants = [...restaurants].sort((a, b) => {
                const modelA = models.find(model => model.hasOwnProperty(`${a.type}_model`));
                const modelB = models.find(model => model.hasOwnProperty(`${b.type}_model`));
                const scoreA = modelA ? modelA[`${a.type}_model`][currentHour] : 0;
                const scoreB = modelB ? modelB[`${b.type}_model`][currentHour] : 0;
                return scoreA - scoreB; // Sort in ascending order by score
            });
    
            setRestaurants(sortedRestaurants);
        }
    };

    const handleRestaurantClick = (restaurantName) => {
        navigate(`/info/${encodeURIComponent(restaurantName)}`);
    };

    return (
        <div className="page">
            <h1 className="title">Restaurants</h1>
            <div className="sort-buttons">
                <button onClick={sortByName} className="sort-btn">Alphabetical</button>
                <button onClick={sortByScore} className="sort-btn">By Score</button>
            </div>
            <div className="restaurant-list">
                {restaurants.map((restaurant) => (
                    <div key={restaurant.id} className="restaurant-card" onClick={() => handleRestaurantClick(restaurant.name)}>
                        <img src={restaurant.image} alt={restaurant.name} className="restaurant-image" />
                        <div className="restaurant-info">
                            <h2 className="restaurant-name">{restaurant.name}</h2>
                            <p className="restaurant-description">{restaurant.description || 'No description available'}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Home;
