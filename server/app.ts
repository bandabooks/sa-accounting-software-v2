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

// Function to ensure SA templates exist for all companies (run in background after startup)
let templatesInitialized = false;
async function ensureSATemplatesForAllCompanies() {
  if (templatesInitialized) {
    return; // Already initialized, skip
  }
  
  try {
    const { seedContractTemplates } = await import('./contractTemplatesSeeder');
    const allCompanies = await db.select().from(companies);
    
    console.log(`🔄 Starting background template seeding for ${allCompanies.length} companies...`);
    
    // Process companies in background without blocking
    for (const company of allCompanies) {
      try {
        await seedContractTemplates(company.id, 1); // Use system user ID 1
        console.log(`✓ Templates seeded for company ${company.id}`);
      } catch (companyError) {
        console.error(`⚠️ Failed to seed templates for company ${company.id}:`, companyError);
        // Continue with other companies even if one fails
      }
    }
    
    templatesInitialized = true;
    console.log("✅ Background template seeding completed for all companies");
  } catch (error) {
    console.error("⚠️ Warning: Could not ensure SA templates:", error);
    // Don't fail startup, just log the warning
  }
}

// Background task runner - runs template seeding after server starts
function runBackgroundTasks() {
  // Run template seeding in background without blocking server startup
  setTimeout(() => {
    ensureSATemplatesForAllCompanies().catch(error => {
      console.error("Background template seeding failed:", error);
    });
  }, 5000); // Wait 5 seconds after server starts
}

// Setup function to initialize the app
export async function setupApp() {
  // Register all routes and middleware
  await registerRoutes(app);
  
  // Template seeding will be handled in background after server starts
  // (removed blocking call to avoid startup delays)
  
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
export { server, runBackgroundTasks };