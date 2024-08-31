require('dotenv').config();
const express = require ('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit');

const app = express();

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

    try {
        
        const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
          params: {
            q: city,
            appid: process.env.OPENWEATHERMAP_API_KEY,  
            units: 'metric',  
          },
        });
    
        
        res.json(response.data);
      } catch (error) {
        console.error('Error fetching data from OpenWeatherMap API:', error.message);  // Log error
        res.status(500).json({ error: 'Failed to fetch data from OpenWeatherMap API' });  // Send error response
      }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('server is running on port ${PORT}')
});