import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import './css/Restinfo.css';

function Restaurantinfo() {
    const [restaurant, setRestaurant] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const { restaurantName } = useParams();
    let navigate = useNavigate();

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
        return 'Moderately busy';
    };

    const fetchComments = async (restaurantId) => {
        try {
            const response = await fetch(`/api/comments/${restaurantId}`);
            if (!response.ok) throw new Error('Comments fetch response was not ok');
            const fetchedComments = await response.json();
            const todayComments = fetchedComments
                .filter(comment => new Date(comment.timestamp) >= todayStart)
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, 4);
            setComments(todayComments);
        } catch (error) {
            console.error('Error:', error);
        }
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

                    response = await fetch('/api/models');
                    if (!response.ok) throw new Error('Models fetch response was not ok');
                    const models = await response.json();
                    const currentHour = new Date().getHours();
                    const modelType = foundRestaurant.type + "_model";
                    const modelInfo = models.find((m) => m.hasOwnProperty(modelType));

                    if (modelInfo) {
                        const modelData = modelInfo[modelType];
                        const mean = modelInfo['day_mean'];
                        const stdDev = calculateStandardDeviation(modelData, mean);
                        const currentValue = modelData[currentHour];
                        const status = determineStatus(currentValue, mean, stdDev);
                        setStatusMessage(status);
                    }

                    fetchComments(foundRestaurant.id);
                }
            } catch (error) {
                console.error('Error:', error);
                navigate('/error');
            }
        };

        fetchData();
    }, [restaurantName, navigate, todayStart]);

    useEffect(() => {
        if (restaurant) {
            const intervalId = setInterval(() => {
                fetchComments(restaurant.id);
            }, 15000);

            return () => clearInterval(intervalId);
        }
    }, [restaurant, todayStart]);

    const handleCommentSubmit = async () => {
        if (!newComment.trim()) {
            return;
        }
        const commentData = {
            restaurant_id: restaurant.id,
            author: 'User',
            comment: newComment,
            timestamp: new Date().toISOString(),
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

            const commentsResponse = await fetch(`/api/comments/${restaurant.id}`);
            if (!commentsResponse.ok) throw new Error('Comments fetch response was not ok');
            const updatedComments = await commentsResponse.json();
            setComments(updatedComments);
            setNewComment('');
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleButtonClick = async () => {
        try {
            const response = await fetch(`/api/increment-popularity/${restaurant.id}`, {
                method: 'POST',
            });
            if (!response.ok) throw new Error('Network response was not ok');
            const updatedRestaurant = await response.json();
            setRestaurant(updatedRestaurant);
        } catch (error) {
            console.error('Error:', error);
        }
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
                    <Button
                        variant="contained"
                        style={{ backgroundColor: 'rgb(60, 176, 95)' }}
                        onClick={handleButtonClick}
                        disabled={!restaurant}
                    >
                        Here currently? Click me!
                    </Button>
                </div>
                <div className="comments-section">
                    <Typography variant="h5" gutterBottom>Live Updates</Typography>
                    <div className="comments-container">
                        {comments.map((comment, index) => (
                            <Card key={index} className="comment-card">
                                <CardContent>
                                    <span className="comment-author" variant="subtitle2">{comment.author}</span>
                                    <Typography variant="body1">{comment.comment}</Typography>
                                    <Typography variant="caption">{new Date(comment.timestamp).toLocaleString()}</Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </div >

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
            </div>
        </div>
    );
}

export default Restaurantinfo;
