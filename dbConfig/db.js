const path = require("path");
const dotenv = require("dotenv");
const mysql = require("mysql2/promise");

const envPath = path.join(__dirname, "..", ".env");

console.log("ENV PATH:", envPath);

dotenv.config({
    path: envPath
});

console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", process.env.DB_NAME);

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT || 3306),

    waitForConnections: true,
    connectionLimit: 10
});

module.exports = pool;