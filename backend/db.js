const mysql = require('mysql2/promise');

const pool =  mysql.createPool({
  connectionLimit: 20, // number of connections you want to allow
  host: "localhost",
  user: "project",
  password: "00r4mlSC??2dJtZA/AmhROEwEc",
  database: "crowdfunding",
});

module.exports = pool;

