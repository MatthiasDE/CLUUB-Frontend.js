import { reactive } from 'vue';

// Reactive state for authentication
export const authState = reactive({
  user: null,
  token: localStorage.getItem('auth_token'),
  isAuthenticated: !!localStorage.getItem('auth_token')
});

export const authService = {
  /**
   * Initialize the authentication state by decoding the stored token if it exists
   */
  init() {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        // Decode JWT payload (standard Google ID Token)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        authState.user = JSON.parse(jsonPayload);
        authState.isAuthenticated = true;
      } catch (e) {
        console.error("Failed to parse stored auth token", e);
        this.logout();
      }
    }
  },

  /**
   * Handle the response from Google Identity Services
   */
  handleSignIn(response) {
    const token = response.credential;
    localStorage.setItem('auth_token', token);
    authState.token = token;

    // Decode token to get user info
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const user = JSON.parse(atob(base64));

    authState.user = user;
    authState.isAuthenticated = true;

    return user;
  },

  /**
   * Log the user out and clear storage
   */
  logout() {
    localStorage.removeItem('auth_token');
    authState.user = null;
    authState.token = null;
    authState.isAuthenticated = false;
    // Redirect to login page
    window.location.href = '/login';
  },

  /**
   * Get the authorization header for fetch requests
   */
  getAuthHeader() {
    const token = localStorage.getItem('auth_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
};
