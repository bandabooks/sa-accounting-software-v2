import express, { type Express } from "express";
import { createServer } from "http";
import { setupVite, serveStatic } from "./vite";
import { registerRoutes } from "./routes";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "./db";
import { companies } from "../shared/schema";

const app: Express = express();
const server = createServer(app);

// Function to ensure SA templates exist for all companies (run once on startup)
let templatesInitialized = false;
async function ensureSATemplatesForAllCompanies() {
  if (templatesInitialized) {
    return; // Already initialized, skip
  }
  
  try {
    const { seedContractTemplates } = await import('./contractTemplatesSeeder');
    const allCompanies = await db.select().from(companies);
    
    for (const company of allCompanies) {
      await seedContractTemplates(company.id, 1); // Use system user ID 1
    }
    
    templatesInitialized = true;
    console.log("✅ Ensured SA professional templates are available for all companies");
  } catch (error) {
    console.error("⚠️ Warning: Could not ensure SA templates:", error);
    // Don't fail startup, just log the warning
  }
}

// Setup function to initialize the app
export async function setupApp() {
  // Register all routes and middleware
  await registerRoutes(app);
  
  // Ensure SA templates exist for all companies
  await ensureSATemplatesForAllCompanies();
  
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