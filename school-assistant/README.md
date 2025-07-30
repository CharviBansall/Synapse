# School Assistant

A comprehensive platform that integrates with multiple educational platforms to provide students with a unified dashboard for managing their academic life.

## Features

- **Multi-Platform Integration**: Connect with Canvas, WebAssign, OWLv2, Gradescope, Piazza, and Moodle
- **Unified Dashboard**: View all courses, assignments, and grades in one place
- **Smart Notifications**: Get reminders for upcoming assignments and grade updates
- **Grade Tracking**: Monitor your academic progress across all platforms
- **Study Session Tracking**: Log and analyze your study habits
- **Real-time Sync**: Automatically sync data from connected platforms

## Project Structure

```
/school-assistant
│
├── /frontend         → React dashboard
├── /backend          → Express server
│   ├── /platforms    → Platform integrations
│   │   ├── canvas.js
│   │   ├── webassign.js
│   │   ├── owlv2Scraper.js
│   │   ├── gradescopeClient.js
│   │   ├── piazzaClient.js
│   │   └── moodleClient.js
│   ├── /services     → Core services
│   │   ├── dbService.js
│   │   └── notify.js
│   └── index.js      → Main server
└── /db               → Supabase schema
    └── schema.sql
```

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account
- SMTP email service (for notifications)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd school-assistant
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Copy the environment file and configure it:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here
SMTP_FROM=noreply@schoolassistant.com

# JWT Secret
JWT_SECRET=your_jwt_secret_here
```

### 3. Database Setup

1. Create a new Supabase project
2. Run the SQL schema from `db/schema.sql` in your Supabase SQL editor
3. Copy your Supabase URL and keys to the `.env` file

### 4. Frontend Setup

```bash
cd ../frontend
npm install
```

### 5. Start the Application

Start the backend:
```bash
cd backend
npm run dev
```

Start the frontend (in a new terminal):
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## API Endpoints

### Users
- `POST /api/users` - Create a new user
- `GET /api/users/:userId` - Get user by ID
- `PUT /api/users/:userId` - Update user

### Courses
- `GET /api/users/:userId/courses` - Get user's courses
- `POST /api/courses` - Create a new course

### Assignments
- `GET /api/courses/:courseId/assignments` - Get course assignments
- `POST /api/assignments` - Create a new assignment

### Grades
- `GET /api/users/:userId/grades` - Get user's grades
- `POST /api/grades` - Create a new grade

### Platform Sync
- `POST /api/sync/canvas` - Sync Canvas data
- `POST /api/sync/webassign` - Sync WebAssign data
- `POST /api/sync/owlv2` - Sync OWLv2 data

### Notifications
- `POST /api/notifications/assignment-reminder` - Send assignment reminder
- `POST /api/notifications/grade-update` - Send grade update notification

## Platform Integrations

### Canvas
- Uses Canvas API for authentication and data retrieval
- Supports course, assignment, and grade synchronization

### WebAssign
- Web scraping integration for assignment data
- Session-based authentication

### OWLv2 (Cengage)
- Puppeteer-based web scraping
- Handles dynamic content and authentication

### Gradescope
- Web scraping for assignment and grade data
- Session management for authentication

### Piazza
- Forum post retrieval and creation
- Class and post management

### Moodle
- LMS integration with course content access
- Assignment and grade synchronization

## Database Schema

The application uses Supabase (PostgreSQL) with the following main tables:

- **users**: User profiles and authentication
- **courses**: Course information from all platforms
- **user_courses**: User-course enrollment relationships
- **assignments**: Assignment details and due dates
- **grades**: Grade records and feedback
- **platform_credentials**: Encrypted platform login credentials
- **notifications**: User notification history
- **sync_logs**: Platform synchronization history
- **study_sessions**: Study session tracking

## Security Features

- Row Level Security (RLS) policies in Supabase
- Encrypted platform credentials storage
- Rate limiting on API endpoints
- CORS configuration
- Helmet.js for security headers
- Input validation and sanitization

## Development

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Code Style

The project uses:
- ESLint for JavaScript/React linting
- Prettier for code formatting
- Conventional commit messages

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Deployment

### Backend Deployment

The backend can be deployed to:
- Heroku
- Railway
- DigitalOcean App Platform
- AWS Elastic Beanstalk

### Frontend Deployment

The frontend can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

### Environment Variables

Make sure to set all required environment variables in your deployment platform.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## License

This project is licensed under the MIT License - see the LICENSE file for details. 