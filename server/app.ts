import express, { type Express } from "express";
import { createServer } from "http";
import { setupVite } from "./vite";
import { registerRoutes } from "./routes";

const app: Express = express();
const server = createServer(app);

// Set up routes and middleware through registerRoutes
const setupServer = async () => {
  // Register all routes and middleware
  await registerRoutes(app);
  
  // Vite middleware for development
  if (process.env.NODE_ENV === 'development') {
    setupVite(app, server);
  }
  
  return server;
};

// Initialize server
setupServer().catch(console.error);

export default app;
export { server };