import express, { type Express } from "express";
import { createServer } from "http";
import { setupVite, serveStatic } from "./vite";
import { registerRoutes } from "./routes";
import path from "path";
import { fileURLToPath } from "url";

const app: Express = express();
const server = createServer(app);

// Setup function to initialize the app
export async function setupApp() {
  // Register all routes and middleware
  await registerRoutes(app);
  
  // Set up proper static file serving based on environment
  if (process.env.NODE_ENV === 'production') {
    // In production, serve the built React app
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const distPath = path.resolve(__dirname, "..", "dist", "public");
    
    // Serve static files from the dist/public directory
    app.use(express.static(distPath));
    
    // Fallback to index.html for client-side routing
    app.get("*", (req, res) => {
      // Don't serve index.html for API routes
      if (req.path.startsWith("/api")) {
        return res.status(404).json({ message: "API endpoint not found" });
      }
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  } else {
    // In development, use Vite middleware
    await setupVite(app, server);
  }
  
  return { app, server };
}

export default app;
export { server };