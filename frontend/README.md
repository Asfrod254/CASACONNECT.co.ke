# CasaConnect

CasaConnect is a modern rental and property management platform designed for three user roles:

- Tenants: browse homes, submit requests, manage payments, and message landlords
- Landlords: manage properties, review applications, track payments, and talk to tenants
- Admins: approve landlords, monitor listings, manage users, and control platform settings

This project includes a React frontend and an Express backend connected to Supabase for authentication and data persistence.

## Project structure

```text
casaconnect/
├── backend/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   └── supabase.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── messages.js
│   │   └── properties.js
│   ├── utils/
│   │   ├── errors.js
│   │   └── token.js
│   ├── .env
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── README.md
└── README.md
```

## Features

### Tenant portal
- property discovery
- rental request tracking
- payment overview
- messaging center
- editable profile

### Landlord portal
- property dashboard
- tenant request review
- portfolio management
- payment activity
- communication tools

### Admin portal
- user management
- landlord onboarding and approval
- listing moderation
- review management
- system configuration

## Role rules

- Tenant self-registration is allowed
- Landlord accounts can only be created by admin
- Admin is responsible for platform approval and control

## Getting started

### 1. Install dependencies

Frontend:

```bash
cd frontend
npm install
```

Backend:

```bash
cd backend
npm install
```

### 2. Configure environment variables

Create a `.env` file in the `backend` folder with values like:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
JWT_SECRET=your_jwt_secret
PORT=5000
```

### 3. Run the app

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend:

```bash
cd frontend
npm start
```

The app will be available at:

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Available scripts

### Frontend

```bash
npm start
npm test
npm run build
```

### Backend

```bash
npm run dev
npm start
npm run lint
```

## Notes

The project is set up as a working prototype for a rental marketplace and property management platform. It includes the UI flow, role separation, and backend architecture needed for future live integration with Supabase, authentication, and real property data.

## License

MIT

## Author

Asford Mwangi Wakonyo
