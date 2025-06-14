# Prompt Forge Frontend

## Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

## Getting Started

1. **Install Dependencies**
```bash
npm install
```

2. **Start Development Server**
```bash
npm run dev
```

The application will start on `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production

## Environment Setup

Create a `.env` file in the frontend root directory:

```env
VITE_API_URL=http://localhost:5173
```

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── styles/         # Global css
│   ├── utils/         # Utility functions
│   ├── App.tsx        # Root component
│   └── main.tsx       # Entry point
├── public/            # Static assets
└── index.html         # HTML template
```

## Tech Stack
- React
- TypeScript
- Tailwind CSS
- Vite