require('dotenv').config();
const express = require ('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');
const morgan = require('morgan');

const app = express();

const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW) || 1; 
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX) || 5; 
const CACHE_DURATION = parseInt(process.env.CACHE_DURATION) || 300;


const cache = new NodeCache({stdTTL: CACHE_DURATION});
const fs = require('fs');
const path = require('path');
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'),{ flags: 'a'});

app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"', { stream: accessLogStream }));


const limiter = rateLimit({
windowMs: RATE_LIMIT_WINDOW * 60 * 1000,
max: RATE_LIMIT_MAX,
message: "Too many requests, please try again later.",
statusCode: 429,
handler: (req,res, next) => {
      console.log(`Rate limit exceeded for IP: ${req.ip} at ${new Date().toISOString()}`);
      res.status(429).json({ error: 'Too many requests, please try again later.' });
    },
});

app.use(limiter);

app.use((req, res, next) => {
  const apiKey = req.headers['x-api-key']; 
  if (!apiKey || apiKey !== process.env.API_KEY) { 
    console.log(`Unauthorized access attempt from IP: ${req.ip} at ${new Date().toISOString()}`);
    return res.status(401).json({ error: 'Unauthorized: Invalid API key' }); 
  }
  next();
});

app.use((req, res, next) => {
  const currentDate = new Date().toISOString();
  const ip = req.ip;
  console.log(`Request from IP: ${ip} at ${currentDate} - Rate Limit Remaining: ${res.get('X-RateLimit-Remaining')}`);
  next();
});

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

        if (error.response) {
          if (error.response.status === 404) {
            res.status(404).json({ error: 'City not found. Please check the city name and try again.' });
          } else {
            console.error(`Error: ${error.response.status} - ${error.response.data.message}`);
            res.status(error.response.status).json({ error: error.response.data.message });
          }
        } else if (error.request) {
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