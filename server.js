const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

// Local cache object
const cache = {};

// Middleware to check the cache
const checkCache = (req, res, next) => {
  const { id } = req.params;

  if (cache[id]) {
    const cachedData = cache[id];
    res.send(cachedData);
  } else {
    next();
  }
};

// Endpoint that uses caching
app.get('/data/:id', checkCache, async (req, res) => {
  const { id } = req.params;

  // Save the request state as "in progress"
  cache[id] = { status: 'in progress' };

  try {
    const response = await axios.get(`https://jsonplaceholder.typicode.com/posts/${id}`);
    const data = response.data;

    // Save the response in the local cache with status "success"
    cache[id] = { status: 'success', data };

    res.json(data);
  } catch (err) {
    console.error(err);

    // Save the request state as "error"
    cache[id] = { status: 'error', message: err.message };

    res.status(500).send('Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
