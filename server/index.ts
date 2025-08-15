import { setupApp } from "./app";

const PORT = parseInt(process.env.PORT || "5000", 10);

// Initialize the app and start the server
setupApp().then(({ app }) => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((error) => {
  console.error("Failed to setup app:", error);
  process.exit(1);
});