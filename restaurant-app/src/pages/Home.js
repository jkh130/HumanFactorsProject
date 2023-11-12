// Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Restaurants from '../components/Restaurants'; // Import the Restaurants component
import './css/Home.css';

function Home() {
    let navigate = useNavigate();

    const handleRestaurantClick = (restaurantName) => {
        navigate(`/info/${encodeURIComponent(restaurantName)}`);
    };

    return (
        <div className="page">
            <h1 className="title">Restaurants</h1>
            <Restaurants onRestaurantClick={handleRestaurantClick} />
        </div>
    );
}

export default Home;
