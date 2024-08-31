require('dotenv').config();
const express = require ('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');

const app = express();
const cache = new NodeCache({stdTTL: 300});


const limiter = rateLimit({
windowMs: 1 * 60 * 1000,
max: 5,
message: "Too many requests, please try again later.",
statusCode: 429,
});

app.use(limiter);

app.get('/weather', async(req, res) => {
    const{city} = req.query;
    if(!city){
        return res.status(400).json({ error: 'require city parameter'});
    }

    const cacheKey = city.toLowerCase();
    if(cache.has(cacheKey)){
      console.log('Server from cache');
      return res.json(cache.get(cacheKey));
    }

    try {
        
        const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
          params: {
            q: city,
            appid: process.env.OPENWEATHERMAP_API_KEY,  
            units: 'metric',  
          },
        });

        cache.set(cacheKey, response.data);
    
        
        res.json(response.data);
      } catch (error) {
        if(error.response){
          console.error('Error: ${error.response.status} - ${ error.response.data.message}');
          res.status(error.response.status).json({error: error.response.data.message});
        } else if (error.request){
          console.error('Error: No response received from the API');
          res.status(503).json({ error: 'No response received from the API. Please try again later.' });
        } else {
          console.error('Error: ', error.message);
          res.status(500).json({ error: 'An unexpected error occurred.' });
        }
      }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('server is running on port ${PORT}')
});