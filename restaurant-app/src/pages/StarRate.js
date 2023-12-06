import React, { useState } from 'react';
import { FaStar, FaRegStar, FaRegStarHalf } from 'react-icons/fa';
import Button from '@mui/material/Button';

const StarRate = ({ onRatingSelect, restaurant }) => {
  const [rating, setRating] = useState(null);
  const [hover, setHover] = useState(null);

  const handleRatingSelect = (ratingValue) => {
    setRating(ratingValue);
  };

  const handleSubmit = () => {
    onRatingSelect(rating);
  };

  return (
    <div>
      {[...Array(5)].map((star, index) => {
        const ratingValue = index + 1;

        return (
          <label key={index}>
            <input 
              type="radio" 
              name="rating" 
              value={ratingValue} 
              onClick={() => handleRatingSelect(ratingValue)}
              style={{ display: 'none' }} 
            />
            <FaStar 
              size={30}
              color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
              onMouseEnter={() => setHover(ratingValue)}
              onMouseLeave={() => setHover(null)}
              onClick={() => handleRatingSelect(ratingValue)}
            />
          </label>
        );
      })}
      <Button variant="contained" color="primary" onClick={handleSubmit} disabled={!restaurant}>
        Submit Rating
      </Button>
      <p>
        {rating === 1 && 'Terrible'}
        {rating === 2 && 'Poor'}
        {rating === 3 && 'Average'}
        {rating === 4 && 'Very Good'}
        {rating === 5 && 'Excellent'}
      </p>
    </div>
  );
};

export default StarRate;
