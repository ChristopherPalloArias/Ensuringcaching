const express = require('express');
const axios = require('axios');
const redis = require('redis');

const app = express();
const port = 3000;

// Configure Redis client
const redisClient = redis.createClient();

redisClient.on('error', (err) => {
  console.log('Error connecting to Redis', err);
});

// Middleware to check the cache
const checkCache = (req, res, next) => {
  const { id } = req.params;

  redisClient.get(id, (err, data) => {
    if (err) throw err;

    if (data !== null) {
      res.send(JSON.parse(data));
    } else {
      next();
    }
  });
};

// Endpoint that uses caching
app.get('/data/:id', checkCache, async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`https://jsonplaceholder.typicode.com/posts/${id}`);
    const data = response.data;

    // Save the response in Redis with an expiration time
    redisClient.setex(id, 3600, JSON.stringify(data));

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
