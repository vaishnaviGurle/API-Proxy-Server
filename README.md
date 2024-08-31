# API Proxy Server

This project is a simple API proxy server built using Node.js and Express. It proxies requests to the OpenWeatherMap API to fetch weather data for a specified city. The server includes features such as rate limiting, caching, request logging, and API key-based authentication.

## Features

- **Proxy to Public API**: The server acts as a proxy to the OpenWeatherMap API to retrieve weather information.
- **Rate Limiting**: Limits requests to a configurable number of requests per minute per IP address. Configurable via environment variables.
- **Caching**: Caches successful API responses for a configurable duration to reduce redundant API calls. Configurable via environment variables.
- **Logging**: Logs each request with a timestamp, IP address, and rate limit status.
- **Authentication**: Uses API key-based authentication to restrict access to the proxy endpoint.


## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/vaishnaviGurle/API-Proxy-Server.git
   cd api-proxy-server
2. **Install the dependencies:** 
    npm install 

## create .env file
PORT=3000
OPENWEATHERMAP_API_KEY=your_openweathermap_api_key  # Replace with your actual OpenWeatherMap API key
API_KEY=qwert@987  # Your secret API key for authentication

# Configurable Rate Limit and Cache Duration
RATE_LIMIT_WINDOW=1  # Rate limit window duration in minutes
RATE_LIMIT_MAX=5  # Maximum number of requests per IP within the rate limit window
CACHE_DURATION=300  # Cache duration in seconds (e.g., 300 seconds = 5 minutes)

## start sever
node index.js

## Contact
Vaishnavi Gurle
vaishnavigurle10@gmail.com

