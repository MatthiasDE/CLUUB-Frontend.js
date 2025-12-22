# CLUUB Frontend - Association Management Web Application

A lean, modular frontend for time booking, time administration, and member management for non-profit associations.

## License

AGPL-3.0-or-later

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:8001`

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build

```bash
npm run build
npm run preview
```

## Features

### Screen 1: Time Recording & Administration
- Fuzzy search member selection (minimum 5 characters)
- Date and time pickers for work start/end
- Operation description field (max 140 characters)
- Display of all time records with today's start date

### Screen 2: Member Management
- Create new association members
- Fields: Member ID, First Name, Last Name

### Screen 3: List Members
- Plain sortable table showing all members
- Sort by: ID, First Name, Last Name

## Technology Stack

- **Vue.js 3** - Progressive JavaScript framework
- **Vue Router** - Official router for Vue.js
- **Vite** - Next generation frontend tooling
- **Tailwind CSS** - Utility-first CSS framework

## API Integration

The frontend connects to the CLUUB Backend API at `http://localhost:8001`.

Key endpoints used:
- `GET /api/v1/members` - List and search members
- `POST /api/v1/members` - Create new member
- `GET /api/v1/timerecords` - List time records
- `POST /api/v1/timerecords` - Create time record

## Project Structure

```
├── src/
│   ├── views/
│   │   ├── TimeRecording.vue      # Time recording interface
│   │   ├── MemberManagement.vue   # Member creation
│   │   └── ListMembers.vue        # Member listing
│   ├── App.vue                    # Main app component with navigation
│   ├── main.js                    # Application entry point
│   └── style.css                  # Global styles with Tailwind
├── index.html                     # HTML entry point
├── package.json                   # Dependencies and scripts
├── vite.config.js                 # Vite configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── AGENTS.md                      # AI agent development guide
└── README.md                      # This file
```

## Development Notes

- Keep the codebase modular and clean
- Minimize dependencies
- Follow the lean philosophy (keep it short and stupid)
- API proxy configured in Vite to forward `/api` requests to backend

## Security

- Input validation on all forms
- String length limits enforced
- Proper error handling
- HTTPS should be enforced in production via reverse proxy

## Future Enhancements

- Google OAuth2 integration planned