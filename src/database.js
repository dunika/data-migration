const mysql = require('promise-mysql');

let cachedConnection = null

const connect = async () => {
  if (!cachedConnection) {
    cachedConnection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'chachacha100',
      database: 'beseen_jaalert'
    });
  }
  
  return cachedConnection
} 

module.exports = { connect }