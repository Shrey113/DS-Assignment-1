import http from 'http';
import { Server } from 'socket.io';
import app from './src/app.js';
import { config } from './src/config/env.js';
import { createAllTables } from './src/config/tables.js';
import { setup_queue_socket } from './src/core/data_structures/queue.socket.js';

async function bootstrap() {
  try {
    // Automatically verify/create database and tables on startup
    await createAllTables();

    // Create HTTP Server for Express & Socket.io
    const server = http.createServer(app);

    const io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    // Initialize 100% Real-time Socket.io Queue System
    setup_queue_socket(io);

    server.listen(config.port, () => {
      console.log(`
🚀 BloodLink Server is running!
📡 HTTP & WebSocket: http://localhost:${config.port}
⚡ Multilevel Queue: 100% Socket.io Real-time Driven
      `);
    });
  } catch (error) {
    console.error('Fatal Server Boot Error:', error.message);
    process.exit(1);
  }
}

bootstrap();
