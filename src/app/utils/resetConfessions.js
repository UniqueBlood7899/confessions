const mysql = require('mysql2/promise');
require('dotenv').config();

async function resetConfessions() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  try {
    await connection.execute('UPDATE srn_verifier SET number_of_confessions = 3, is_the_textbox_locked = 0');
    console.log('Confessions reset successfully and textboxes unlocked');
  } catch (error) {
    console.error('Error resetting confessions:', error);
  } finally {
    await connection.end();
  }
}

resetConfessions();