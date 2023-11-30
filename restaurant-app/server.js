const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;
const DATABASE_PATH = path.join(__dirname, 'database');

app.use(express.json());

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

app.use('/api/restaurants', express.static(path.join(DATABASE_PATH, 'restaurants.json')));
app.use('/api/models', express.static(path.join(DATABASE_PATH, 'models.json')));







app.post('/api/increment-popularity/:restaurantId', async (req, res) => {
  const restaurantId = req.params.restaurantId;
  const filePath = path.join(DATABASE_PATH, 'restaurants.json');

  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    let restaurants = JSON.parse(data);
    const restaurantIndex = restaurants.findIndex(r => r.id === parseInt(restaurantId));

    if (restaurantIndex === -1) {
      res.status(404).send('Restaurant not found');
      return;
    }

    restaurants[restaurantIndex].popularity += 1;
    await fs.promises.writeFile(filePath, JSON.stringify(restaurants, null, 2));
    res.json(restaurants[restaurantIndex]); // Send back the updated restaurant data
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Server error');
  }
});

// Endpoint to get information about a specific restaurant
app.get('/api/info/:restaurantName', (req, res) => {
  const restaurantName = req.params.restaurantName;
  const filePath = path.join(DATABASE_PATH, `${restaurantName}.json`);
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.status(404).send('Restaurant not found');
      return;
    }
    res.json(JSON.parse(data));
  });
});

// New endpoint to post a comment for a specific restaurant
app.post('/api/comments/:restaurantId', async (req, res) => {
  const restaurantId = req.params.restaurantId;
  const commentData = {
    ...req.body,
    restaurant_id: restaurantId,
    timestamp: new Date().toISOString()
  };
  const filePath = path.join(DATABASE_PATH, 'comments.json');

  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    let comments = data ? JSON.parse(data) : [];
    comments.push(commentData);
    await fs.promises.writeFile(filePath, JSON.stringify(comments, null, 2));
    res.status(201).json(comments); // Send back the updated comments array
  } catch (err) {
    if (err.code === 'ENOENT') {
      // If the file doesn't exist, create it with the new comment
      await fs.promises.writeFile(filePath, JSON.stringify([commentData], null, 2));
      res.status(201).json([commentData]); // Send back the array with the new comment
    } else {
      res.status(500).send('Server error');
    }
  }
});




// New endpoint to get comments for a specific restaurant
app.get('/api/comments/:restaurantId', (req, res) => {
  const restaurantId = req.params.restaurantId;
  const filePath = path.join(DATABASE_PATH, 'comments.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err && err.code === 'ENOENT') {
      // If the file doesn't exist, send back an empty array
      res.json([]);
    } else if (err) {
      res.status(500).send('Server error');
    } else {
      let comments = [];
      try {
        comments = JSON.parse(data);
      } catch (parseErr) {
        console.error('Error parsing JSON:', parseErr);
        res.status(500).send('Error parsing comments data');
        return;
      }
      const restaurantComments = comments.filter(comment => comment.restaurant_id === restaurantId);
      res.json(restaurantComments);
    }
  });
});

// Catch-all handler for serving index.html must be declared after all other API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
