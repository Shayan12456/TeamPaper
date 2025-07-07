const { createClient } = require("redis");
require("dotenv").config();

const client = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_URL,
        port: 17069
    }
});

client.on('error', err => console.log('Redis Client Error', err));

async function connectToRedisCloud() {
  await client.connect();
  console.log("connected to redis cloud")
}

connectToRedisCloud();

module.exports = client;