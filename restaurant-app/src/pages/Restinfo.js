import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './css/Restinfo.css';

function Restaurantinfo() {
    const [restaurant, setRestaurant] = useState(null);
    const [statusMessage, setStatusMessage] = useState('');
    const { restaurantName } = useParams();
    let navigate = useNavigate();

    const calculateStandardDeviation = (values, mean) => {
        const squareDiffs = values.map(value => {
            const diff = value - mean;
            return diff * diff;
        });
        const avgSquareDiff = squareDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
        return Math.sqrt(avgSquareDiff);
    };

    const determineStatus = (currentValue, mean, stdDev) => {
        if (currentValue >= mean + 2 * stdDev) return 'Super busy';
        if (currentValue >= mean + stdDev) return 'Busier than usual';
        if (currentValue <= mean - 2 * stdDev) return 'Walk right in!';
        if (currentValue <= mean - stdDev) return 'Not very busy';
        return 'Average busyness';
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                let response = await fetch('/api/restaurants');
                if (!response.ok) throw new Error('Network response was not ok');
                const restaurants = await response.json();
                const foundRestaurant = restaurants.find(
                    (r) => decodeURIComponent(restaurantName).toLowerCase() === r.name.toLowerCase()
                );
        
                if (foundRestaurant) {
                    setRestaurant(foundRestaurant);
                
                    const response = await fetch('/api/models');
                    // Error handling
                    const models = await response.json();
                    const currentHour = new Date().getHours();
                    const modelType = foundRestaurant.type + "_model";  // This becomes "hybrid_model"
                    const modelInfo = models.find((m) => m.hasOwnProperty(modelType));
                
                    if (modelInfo) {
                        const modelData = modelInfo[modelType];
                        const mean = modelInfo['day_mean'];
                        const stdDev = calculateStandardDeviation(modelData, mean);
                        const currentValue = modelData[currentHour];
                        const status = determineStatus(currentValue, mean, stdDev);
                        setStatusMessage(status);
                    }
                }
            } catch (error) {
                console.error('Error:', error);
                navigate('/error');
            }
        };

        fetchData();
    }, [restaurantName, navigate]);

    const handleButtonClick = () => {
        // Implementation for button click
    };

    return (
        <div className="page2">
            <div className="restaurant-info">
                <h2 className="title">{restaurant ? restaurant.name : 'Loading...'}</h2>
                {statusMessage && (
                    <div className="availability">
                        <p>{statusMessage}</p>
                    </div>
                )}
                <div className="button-container">
                    <button
                        className="button"
                        onClick={handleButtonClick}
                        disabled={!restaurant}
                    >
                        Here currently? Click me!
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Restaurantinfo;
