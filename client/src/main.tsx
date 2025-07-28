import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Handle unhandled promise rejections to prevent blank screens
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  
  // Check if it's an authentication error
  if (event.reason?.message?.includes('401') || 
      event.reason?.message?.includes('authentication') ||
      event.reason?.message?.includes('Invalid or expired token')) {
    
    // Clear authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('userData');
    
    // Only redirect if we're not already on the login page
    if (window.location.pathname !== '/login') {
      console.log('Authentication error detected, redirecting to login');
      window.location.href = '/login';
    }
  }
  
  // Prevent the default browser error handling
  event.preventDefault();
});

createRoot(document.getElementById("root")!).render(<App />);
