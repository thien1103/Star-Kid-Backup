const mysql = require('mysql2');
const dotenv = require("dotenv");
dotenv.config();
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// const connection = mysql.createConnection({
//     host: 'localhost',
//     port: '3306',
//     user: 'root',
//     password: 'root',
//     database: 'testapi'
// });
module.exports = {
    connection
};