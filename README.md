# Employee Task Manager - Frontend

React frontend for the Employee Task Manager application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Features

### Admin
- Employee management (CRUD)
- Task creation and assignment
- Dashboard with analytics
- View all tasks and employees

### Employee
- View assigned tasks
- Update task status
- View task details
- Personal dashboard

### Shared
- Authentication
- Dark mode
- Responsive design
- Real-time notifications

## Tech Stack

- React 18
- Vite
- TailwindCSS
- React Router DOM
- Axios
- Recharts
- React Toastify
- React Icons

## Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist` folder.

### Deploy to Netlify

1. Build the project
2. Deploy the `dist` folder
3. Add `_redirects` file:
```
/*    /index.html   200
```

### Deploy to Vercel

1. Build the project
2. Deploy the `dist` folder
3. Add `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```
