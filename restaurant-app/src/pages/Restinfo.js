import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import './css/Restinfo.css';

function Restaurantinfo() {
    const [restaurant, setRestaurant] = useState(null);
    const [comments, setComments] = useState({ recent: [], older: [] });
    const [newComment, setNewComment] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const { restaurantName } = useParams();
    let navigate = useNavigate();

    // useMemo to calculate the start of the day only once or when the date changes
    const todayStart = useMemo(() => {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        return start;
    }, []);

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
                // Fetch restaurants data
                let response = await fetch('/api/restaurants');
                if (!response.ok) throw new Error('Network response was not ok');
                const restaurants = await response.json();

                // Find the specific restaurant
                const foundRestaurant = restaurants.find(
                    (r) => decodeURIComponent(restaurantName).toLowerCase() === r.name.toLowerCase()
                );

                if (foundRestaurant) {
                    setRestaurant(foundRestaurant);

                    // Fetch model data for the found restaurant
                    response = await fetch('/api/models');
                    if (!response.ok) throw new Error('Models fetch response was not ok');
                    const models = await response.json();
                    const currentHour = new Date().getHours();
                    const modelType = foundRestaurant.type + "_model"; // This becomes "hybrid_model"
                    const modelInfo = models.find((m) => m.hasOwnProperty(modelType));

                    // Calculate status message if model info is available
                    if (modelInfo) {
                        const modelData = modelInfo[modelType];
                        const mean = modelInfo['day_mean'];
                        const stdDev = calculateStandardDeviation(modelData, mean);
                        const currentValue = modelData[currentHour];
                        const status = determineStatus(currentValue, mean, stdDev);
                        setStatusMessage(status);
                    }

                    // Fetch comments for the found restaurant
                    response = await fetch(`/api/comments/${foundRestaurant.id}`);
                    if (!response.ok) throw new Error('Comments fetch response was not ok');
                    const fetchedComments = await response.json();
                    
                    // Filter for today's comments and sort them by most recent
                    const todayComments = fetchedComments
                        .filter(comment => new Date(comment.timestamp) >= todayStart)
                        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

                    // Determine the current time and 30 minutes ago
                    const currentTime = Date.now();
                    const thirtyMinutesAgo = currentTime - (30 * 60 * 1000);

                    // Separate recent comments within the last 30 minutes
                    const recentComments = todayComments.filter(comment =>
                        new Date(comment.timestamp).getTime() >= thirtyMinutesAgo
                    );

                    // Keep other comments for the scrollable section
                    const olderComments = todayComments.filter(comment =>
                        new Date(comment.timestamp).getTime() < thirtyMinutesAgo
                    );

                    // Update the state with both recent and older comments
                    setComments({
                        recent: recentComments,
                        older: olderComments
                    });    
                }
            } catch (error) {
                console.error('Error:', error);
                navigate('/error');
            }
        };

        fetchData();
    }, [restaurantName, navigate, todayStart]);


    // Function to handle comment submission
    const handleCommentSubmit = async () => {
        // Check if the newComment is not just whitespace
        if (!newComment.trim()) {
            return;
        }
        const commentData = {
            restaurant_id: restaurant.id,
            author: 'User', // Replace with actual user data if you have authentication
            comment: newComment,
            timestamp: new Date().toISOString(),
            // Include other fields like 'rating' if needed
        };

        try {
            const response = await fetch(`/api/comments/${restaurant.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(commentData),
            });

            if (!response.ok) throw new Error('Network response was not ok');

            // Fetch ONLY the comments for the current restaurant to update the list
            const commentsResponse = await fetch(`/api/comments/${restaurant.id}`);
            if (!commentsResponse.ok) throw new Error('Comments fetch response was not ok');
            const updatedComments = await commentsResponse.json();
            setComments(updatedComments);
            setNewComment(''); // Clear the input field after submission
        } catch (error) {
            console.error('Error:', error);
            // Handle the error state appropriately
        }
    };

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
                <div className="comments-section">
                    <Typography variant="h5" gutterBottom>Live Updates</Typography>
                    {/* Display the 4 most recent comments */}
                    <div className="comments-container">
                        {comments.recent.map((comment, index) => (
                            <Card key={index} className="comment-card">
                                <CardContent>
                                    <span className="comment-author" variant="subtitle2">{comment.author}</span>
                                    <Typography variant="body1">{comment.comment}</Typography>
                                    <Typography variant="caption">{new Date(comment.timestamp).toLocaleString()}</Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </div >

                    {/* Scrollable section for older comments */}
                    <div className="older-comments-container">
                        {comments.older.map((comment, index) => (
                            <Card key={index} className="comment-card">
                                <CardContent>
                                    <span className="comment-author" variant="subtitle2">{comment.author}</span>
                                    <Typography variant="body1">{comment.comment}</Typography>
                                    <Typography variant="caption">{new Date(comment.timestamp).toLocaleString()}</Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="comment-form">
                        <textarea
                            className="comment-input"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Leave a comment..."
                        />
                        <Button className="submit-comment" variant="contained" color="primary" onClick={handleCommentSubmit}>
                            Submit Comment
                        </Button>
                    </div>
                </div>

                <div className="button-container">
                    <Button
                        variant="contained"
                        style={{ backgroundColor: 'rgb(60, 176, 95)' }}
                        onClick={handleButtonClick}
                        disabled={!restaurant}
                    >
                        Here currently? Click me!
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default Restaurantinfo;
