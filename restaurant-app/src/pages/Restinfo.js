import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './css/Restinfo.css';

function Restaurantinfo() {
    const [busynessLevel, setBusynessLevel] = useState('');
    const { restaurantName } = useParams();
    let navigate = useNavigate();

    // Function to determine the level of busyness
    const getBusynessLevel = (score) => {
        if (score <= 1.25) return 'walk right in!';
        if (score <= 2.5) return 'available';
        if (score <= 3.75) return 'small wait time';
        return 'busy currently'; // Assuming the score will not exceed 5
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/restaurants.json');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const restaurants = await response.json();
                // Find the restaurant by name
                const restaurant = restaurants.find(
                    (r) => decodeURIComponent(restaurantName).toLowerCase() === r.name.toLowerCase()
                );

                if (restaurant) {
                    // Get the current time rounded to the nearest hour
                    const currentHour = new Date().getHours() + 1; // JavaScript hours are 0-indexed (0-23)
                    // Get the busyness score for the current hour
                    const score = restaurant.busyness[currentHour.toString()];
                    // Determine the level of busyness
                    const level = getBusynessLevel(score);
                    setBusynessLevel(level);
                }
            } catch (error) {
                console.error('Error fetching restaurants:', error);
                navigate('/error'); // navigate to an error page or home if there's an error
            }
        };

        fetchData();
    }, [restaurantName, navigate]);

    return (
        <div className="page2">
            <div className="restaurant-info">
            <h2 className="title">{decodeURIComponent(restaurantName)}</h2>
            {busynessLevel && (
                <p className="availability">{busynessLevel}</p>
            )}
        </div>
        </div>
        
    );
}

export default Restaurantinfo;
