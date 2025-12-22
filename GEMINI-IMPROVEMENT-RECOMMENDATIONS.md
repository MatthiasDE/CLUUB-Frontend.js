# Gemini Improvement Recommendations: CLUUB Modular Frontend

This document outlines a high-leverage architectural improvement plan for the CLUUB Modular Frontend, focusing on modularity, maintainability, and code reuse while strictly adhering to the "KISS" (Keep It Short and Stupid) principle.

## Phase 1: Foundation (Centralized Services)

The primary goal is to extract logic from Vue components into standalone, testable JavaScript modules.

### 1. Centralized API Client
Current state: `fetch` calls are hardcoded in every view.
Improvement: Create a lightweight wrapper for standardized error handling and configuration.

**File:** `src/api/client.js`
- Standardizes `Content-Type` headers.
- Centralizes error parsing (extracting `detail` from FastAPI responses).
- Handles environment-based `BASE_URL`.

```javascript
// src/api/client.js
const BASE_URL = import.meta.env.VITE_API_URL || '';

async function request(endpoint, options = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An unknown error occurred' }));
    throw new Error(error.detail || response.statusText);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  get: (url) => request(url, { method: 'GET' }),
  post: (url, body) => request(url, { method: 'POST', body: JSON.stringify(body) }),
  put: (url, body) => request(url, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (url) => request(url, { method: 'DELETE' }),
};
```

**File:** `src/api/members.js` & `src/api/timerecords.js`
- Domain-specific functions (e.g., `membersApi.list()`, `timeRecordsApi.create()`).
- Simplifies component code from 10-15 lines of `fetch` boilerplate to a single function call.

```javascript
// src/api/members.js
import { api } from './client';

export const membersApi = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/api/v1/members?${query}`);
  },
  create: (member) => api.post('/api/v1/members', member),
  search: (query) => api.get(`/api/v1/members?search=${encodeURIComponent(query)}&fuzzy=true`),
};

// src/api/timerecords.js
import { api } from './client';

export const timeRecordsApi = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/api/v1/timerecords?${query}`);
  },
  create: (record) => api.post('/api/v1/timerecords', record),
};
```

### 2. Date & Time Utilities
Current state: Formatting and duration logic is duplicated or locally scoped in `TimeRecording.vue`.
Improvement: Extract pure functions for date manipulation.

**File:** `src/utils/date.js`
- `formatDateTime(isoString)`: Consistent German locale formatting with timezone handling.
- `calculateDuration(from, to)`: Standardized calculation for work hours.
- `getTodayAtMidnight()`: Helper for the "Today's Records" filter.

```javascript
// src/utils/date.js
export function formatDateTime(isoString) {
  if (!isoString) return '-';
  let dateString = isoString.trim().replace(' ', 'T');
  if (!dateString.endsWith('Z') && !dateString.includes('+') && !dateString.includes('-', 10)) {
    dateString += 'Z';
  }
  const date = new Date(dateString);
  return date.toLocaleString('de-DE', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin'
  });
}

export function calculateDuration(from, to) {
  if (!from || !to) return '-';
  const start = new Date(from.replace(' ', 'T') + (from.includes('Z') ? '' : 'Z'));
  const end = new Date(to.replace(' ', 'T') + (to.includes('Z') ? '' : 'Z'));
  const diffMs = end - start;
  const hours = Math.floor(diffMs / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}

export function getTodayAtMidnight() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.toISOString();
}
```

---

## Phase 2: Component Refactoring

Once the foundation is laid, the views should be refactored to use these services.

### 1. View Simplification
- Remove all `fetch` logic from `mounted()` and `methods`.
- Replace local date formatting methods with imports from `src/utils/date.js`.
- **Impact:** Reduces component size by ~30% and improves readability.

### 2. Global UI Components
Extract repeated UI patterns into `src/components/`.

- **`BaseAlert.vue`**: A single component for success/error messages with consistent styling.
- **`MemberSearch.vue`**: The fuzzy search input logic (including debouncing and dropdown) is complex. Extracting this makes it reusable if other screens need to select members.

---

## Phase 3: Infrastructure & DX

### 1. Environment Configuration
Create a `.env` file to manage the backend API URL.
```
VITE_API_URL=http://localhost:8000
```
This prevents hardcoding URLs and allows different settings for production/development.

### 2. Standardized Error Handling
Implement a consistent way to display API errors to the user.
- Instead of manual `try/catch` blocks in every method, use a reactive global error state or a composition function (Composable) to handle loading states and error messages automatically.

---

## Summary of Leverage
| Action | Impact | Difficulty |
| :--- | :--- | :--- |
| **Centralized API** | High: Single point of change for backend updates. | Low |
| **Date Utilities** | Medium: Eliminates formatting bugs and duplication. | Low |
| **Search Component** | High: Simplifies the most complex UI interaction. | Medium |
| **BaseAlert** | Low: Ensures visual consistency. | Low |

## Implementation Priority
1. `src/api/client.js` & Domain APIs
2. `src/utils/date.js`
3. Refactor `TimeRecording.vue` (uses both API and Dates)
4. Extract `MemberSearch.vue` component