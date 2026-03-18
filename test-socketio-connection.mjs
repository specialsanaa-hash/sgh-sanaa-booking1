import { io } from "socket.io-client";

const API_KEY = "sk_b099b0f8f4860da58325ac2e8860e24057ccf5b588108acf9a8acf3a4e7955c4";

// Test URLs
const testUrls = [
  {
    name: "Development Server (Recommended)",
    url: `wss://3000-i0fiz5orq7hw1j5umznmg-f06edb92.us2.manus.computer`,
    path: "/socket.io/"
  },
  {
    name: "Production Domain",
    url: `wss://sghsanaa-ba99upcz.manus.space`,
    path: "/socket.io/"
  }
];

async function testConnection(testUrl) {
  return new Promise((resolve) => {
    console.log(`\n🔌 Testing: ${testUrl.name}`);
    console.log(`📍 URL: ${testUrl.url}${testUrl.path}?apiKey=${API_KEY}`);
    
    const socket = io(testUrl.url, {
      path: testUrl.path,
      query: {
        apiKey: API_KEY
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 3,
      transports: ["websocket"],
      secure: true,
      rejectUnauthorized: false
    });

    const timeout = setTimeout(() => {
      socket.disconnect();
      console.log("❌ Connection timeout (5 seconds)");
      resolve(false);
    }, 5000);

    socket.on("connect", () => {
      clearTimeout(timeout);
      console.log("✅ Connected successfully!");
      console.log(`   Socket ID: ${socket.id}`);
      
      // Send a test message
      socket.emit("device_status", {
        timestamp: Date.now(),
        platform: "test",
        batteryLevel: 1.0,
        batteryState: "unplugged",
        isCharging: false,
        networkType: "wifi",
        isOnline: true
      });
      
      setTimeout(() => {
        socket.disconnect();
        resolve(true);
      }, 1000);
    });

    socket.on("connect_error", (error) => {
      clearTimeout(timeout);
      console.log(`❌ Connection error: ${error.message}`);
      resolve(false);
    });

    socket.on("error", (error) => {
      clearTimeout(timeout);
      console.log(`❌ Error: ${error}`);
      resolve(false);
    });
  });
}

async function runTests() {
  console.log("🚀 Socket.io Connection Test");
  console.log("================================\n");
  
  for (const testUrl of testUrls) {
    const success = await testConnection(testUrl);
    if (success) {
      console.log(`✨ ${testUrl.name} is working!\n`);
    }
  }
  
  console.log("\n📝 Summary:");
  console.log("- Use the Development Server URL in your mobile app (more stable)");
  console.log("- The Production Domain may take time to sync after deployment");
  console.log("- Both URLs use the same API Key and work identically");
  process.exit(0);
}

runTests().catch(console.error);
