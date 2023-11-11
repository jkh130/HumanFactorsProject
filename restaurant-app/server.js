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

// Catch-all handler for serving index.html must be declared after all other API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
