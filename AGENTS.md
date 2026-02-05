# AGENTS.md - AI Agent Development Guide

## Project Overview
CLUUB is a lean association management system for non-profit organizations. This frontend provides an interface for time recording, member creation, and member listing. It is built with Vue 3, Tailwind CSS, and Vite, focusing on the "KISS" (Keep It Short and Stupid) principle.

## Guiding Principles
- **KISS**: Keep implementation simple and avoid over-engineering.
- **Security**: Protect all API calls with Google OAuth 2.0 tokens.
- **Utility-First**: Use Tailwind CSS for all styling.
- **Modular**: Extract repeated logic into services or utilities.

## Implemented Functionality

### Screen 1: Time Recording & Administration
Interface for recording member work hours:
- **Member Selection**: Fuzzy search selection (triggers after 5 characters) via `/api/v1/members`.
- **Time Pickers**: Standard HTML5 `datetime-local` inputs for start and end times.
- **Operation**: Text area for description (max 140 characters).
- **Daily View**: Table showing all records starting today.

### Screen 2: Member Management
- **Member Creation**: Form to create new members with ID, First Name, and Last Name.

### Screen 3: List Members
- **Member Directory**: Sortable table of all members (sort by ID, First Name, or Name).

## Project Structure
```
├── src/
│   ├── api/             # (Planned) Centralized API client logic
│   ├── services/
│   │   └── auth.js      # Authentication state and Google OAuth helpers
│   ├── views/
│   │   ├── Login.vue            # Authentication entry point
│   │   ├── TimeRecording.vue    # Main dashboard / time entry
│   │   ├── MemberManagement.vue # Member creation form
│   │   └── ListMembers.vue      # Member directory table
│   ├── App.vue          # Main layout with navigation and auth guards
│   ├── main.js          # App entry point, Router, and Auth initialization
│   └── style.css        # Tailwind CSS directives and global styles
├── AGENTS.md            # This file - AI agent guidance
├── README.md            # User-facing documentation
└── vite.config.js       # Build config and API proxy (localhost:8001)
```

## Dependencies
- `Vue.js 3` - Frontend framework
- `Vue Router 4` - Client-side routing
- `Tailwind CSS` - Styling
- `Google Identity Services` - OAuth 2.0 authentication

## Information for the API Layer
The frontend communicates with a FastAPI backend. All requests to `/api/v1/*` must include a Bearer token in the `Authorization` header.

### API Endpoints (Excerpt)
- `GET /api/v1/members`: List/search members.
- `POST /api/v1/members`: Create member.
- `GET /api/v1/timerecords`: List records (supports `start_date` filter).
- `POST /api/v1/timerecords`: Create record.

## Code Style Guidelines
- **Options API**: Current components use the Vue Options API.
- **Standardized Fetch**: Use `authService.getAuthHeader()` for all authenticated requests.
- **Formatting**: Use German locale for date/time display (`de-DE`).

## Security Considerations
- **Authentication**: Google Identity Services (GSI) is integrated. Users must sign in to access any route except `/login`.
- **Authorization**: Tokens are passed to the backend for verification.
- **Validation**:
    - Frontend enforces string lengths (e.g., 140 chars for operations).
    - Basic date logic (End time > Start time) is checked before submission.