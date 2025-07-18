// Enhanced API client with authentication
export async function authenticatedApiRequest(
  method: string,
  url: string,
  data?: any
): Promise<Response> {
  const token = localStorage.getItem('authToken');
  const sessionToken = localStorage.getItem('sessionToken');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (sessionToken) {
    headers['X-Session-Token'] = sessionToken;
  }
  
  const response = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });
  
  // Handle authentication errors
  if (response.status === 401) {
    // Clear authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('userData');
    
    // Redirect to login
    window.location.href = '/login';
    
    throw new Error('401: Authentication failed');
  }
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${response.status}: ${errorText || response.statusText}`);
  }
  
  return response;
}