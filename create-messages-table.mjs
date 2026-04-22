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

async function createMessagesTable() {
  let connection;
  try {
    connection = await mysql.createConnection(config);
    
    const sql = `
      CREATE TABLE IF NOT EXISTS \`messages\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`messageText\` text NOT NULL,
        \`messageType\` enum('SMS','WhatsApp') NOT NULL,
        \`direction\` enum('sent','received') NOT NULL,
        \`status\` enum('pending','sent','delivered','failed','read') NOT NULL DEFAULT 'pending',
        \`externalId\` varchar(255),
        \`relatedBookingId\` int,
        \`relatedPatientId\` int,
        \`metadata\` json,
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT \`messages_id\` PRIMARY KEY(\`id\`)
      );
    `;
    
    await connection.execute(sql);
    console.log('✅ Messages table created successfully!');
  } catch (error) {
    if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.message?.includes('already exists')) {
      console.log('✅ Messages table already exists');
    } else {
      console.error('❌ Error creating messages table:', error.message || error);
      process.exit(1);
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createMessagesTable();
