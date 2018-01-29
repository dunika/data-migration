const cachedConnection = null

const connect = async () => {
  if (!cachedConnection) {
    const cachedConnection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'chachacha100',
      database: 'beseen_jalert'
    });
  }
  
  return cachedConnection
} 