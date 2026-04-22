import mysql from 'mysql2/promise';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

// Parse connection string
const url = new URL(connectionString);
const config = {
  host: url.hostname,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  ssl: {
    rejectUnauthorized: false,
  },
};

async function updateUsersTable() {
  let connection;
  try {
    connection = await mysql.createConnection(config);
    
    // Check if columns exist
    const [columns] = await connection.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND TABLE_SCHEMA = ?",[config.database]
    );
    
    const columnNames = columns.map(col => col.COLUMN_NAME);
    console.log('Current columns:', columnNames);
    
    // Add username column if it doesn't exist
    if (!columnNames.includes('username')) {
      console.log('Adding username column...');
      await connection.execute(
        'ALTER TABLE `users` ADD COLUMN `username` varchar(64) AFTER `id`'
      );
      await connection.execute(
        'ALTER TABLE `users` ADD UNIQUE KEY `username_unique` (`username`)'
      );
      console.log('✅ Added username column');
    }
    
    // Add passwordHash column if it doesn't exist
    if (!columnNames.includes('passwordHash')) {
      console.log('Adding passwordHash column...');
      await connection.execute(
        'ALTER TABLE `users` ADD COLUMN `passwordHash` varchar(255) AFTER `username`'
      );
      console.log('✅ Added passwordHash column');
    }
    
    // openId is already nullable, skip modification
    
    // Update loginMethod default value
    if (columnNames.includes('loginMethod')) {
      console.log('Updating loginMethod default...');
      await connection.execute(
        "ALTER TABLE `users` MODIFY COLUMN `loginMethod` varchar(64) DEFAULT 'local'"
      );
      console.log('✅ Updated loginMethod default');
    }
    
    console.log('✅ Users table updated successfully!');
  } catch (error) {
    console.error('❌ Error updating users table:', error.message || error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

updateUsersTable();
