/**
 * Main Express Server
 * School Assistant Backend API
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import services
const DatabaseService = require('./services/dbService');
const NotificationService = require('./services/notify');

// Import platform clients
const CanvasClient = require('./platforms/canvas');
const WebAssignClient = require('./platforms/webassign');
const OWLv2Scraper = require('./platforms/owlv2Scraper');
const GradescopeClient = require('./platforms/gradescopeClient');
const PiazzaClient = require('./platforms/piazzaClient');
const MoodleClient = require('./platforms/moodleClient');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize services
const dbService = new DatabaseService();
const notificationService = new NotificationService();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// User routes
app.post('/api/users', async (req, res) => {
  try {
    const userData = req.body;
    const user = await dbService.createUser(userData);
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.get('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await dbService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.put('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    const user = await dbService.updateUser(userId, updates);
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Course routes
app.get('/api/users/:userId/courses', async (req, res) => {
  try {
    const { userId } = req.params;
    const courses = await dbService.getUserCourses(userId);
    res.json(courses);
  } catch (error) {
    console.error('Error fetching user courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

app.post('/api/courses', async (req, res) => {
  try {
    const courseData = req.body;
    const course = await dbService.createCourse(courseData);
    res.status(201).json(course);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// Assignment routes
app.get('/api/courses/:courseId/assignments', async (req, res) => {
  try {
    const { courseId } = req.params;
    const assignments = await dbService.getCourseAssignments(courseId);
    res.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

app.post('/api/assignments', async (req, res) => {
  try {
    const assignmentData = req.body;
    const assignment = await dbService.createAssignment(assignmentData);
    res.status(201).json(assignment);
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

// Grade routes
app.get('/api/users/:userId/grades', async (req, res) => {
  try {
    const { userId } = req.params;
    const { courseId } = req.query;
    const grades = await dbService.getUserGrades(userId, courseId);
    res.json(grades);
  } catch (error) {
    console.error('Error fetching grades:', error);
    res.status(500).json({ error: 'Failed to fetch grades' });
  }
});

app.post('/api/grades', async (req, res) => {
  try {
    const gradeData = req.body;
    const grade = await dbService.createGrade(gradeData);
    res.status(201).json(grade);
  } catch (error) {
    console.error('Error creating grade:', error);
    res.status(500).json({ error: 'Failed to create grade' });
  }
});

// Platform sync routes
app.post('/api/sync/canvas', async (req, res) => {
  try {
    const { userId, apiKey, baseUrl } = req.body;
    
    // Get user data
    const user = await dbService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Initialize Canvas client
    const canvasClient = new CanvasClient(apiKey, baseUrl);
    
    // Authenticate and fetch data
    await canvasClient.authenticate();
    const courses = await canvasClient.getCourses();
    
    // Save credentials
    await dbService.savePlatformCredentials(userId, 'canvas', { apiKey, baseUrl });
    
    // Process and save courses
    let newCourses = 0;
    for (const course of courses) {
      try {
        await dbService.createCourse({
          platform_id: course.id,
          platform: 'canvas',
          name: course.name,
          user_id: userId
        });
        newCourses++;
      } catch (error) {
        console.error('Error saving course:', error);
      }
    }

    // Send notification
    await notificationService.sendPlatformSyncNotification(user.email, {
      platform: 'Canvas',
      newCourses: newCourses
    });

    res.json({ 
      success: true, 
      message: 'Canvas sync completed',
      newCourses: newCourses
    });
  } catch (error) {
    console.error('Canvas sync error:', error);
    res.status(500).json({ error: 'Canvas sync failed' });
  }
});

app.post('/api/sync/webassign', async (req, res) => {
  try {
    const { userId, username, password } = req.body;
    
    const user = await dbService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const webassignClient = new WebAssignClient(username, password);
    await webassignClient.authenticate();
    const assignments = await webassignClient.getAssignments();
    
    await dbService.savePlatformCredentials(userId, 'webassign', { username, password });
    
    let newAssignments = 0;
    for (const assignment of assignments.assignments) {
      try {
        await dbService.createAssignment({
          platform_id: assignment.id,
          platform: 'webassign',
          title: assignment.title,
          user_id: userId
        });
        newAssignments++;
      } catch (error) {
        console.error('Error saving assignment:', error);
      }
    }

    await notificationService.sendPlatformSyncNotification(user.email, {
      platform: 'WebAssign',
      newAssignments: newAssignments
    });

    res.json({ 
      success: true, 
      message: 'WebAssign sync completed',
      newAssignments: newAssignments
    });
  } catch (error) {
    console.error('WebAssign sync error:', error);
    res.status(500).json({ error: 'WebAssign sync failed' });
  }
});

app.post('/api/sync/owlv2', async (req, res) => {
  try {
    const { userId, username, password } = req.body;
    
    const user = await dbService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const owlv2Scraper = new OWLv2Scraper(username, password);
    await owlv2Scraper.initialize();
    const courses = await owlv2Scraper.getCourses();
    
    await dbService.savePlatformCredentials(userId, 'owlv2', { username, password });
    
    let newCourses = 0;
    for (const course of courses) {
      try {
        await dbService.createCourse({
          platform_id: course.id,
          platform: 'owlv2',
          name: course.name,
          user_id: userId
        });
        newCourses++;
      } catch (error) {
        console.error('Error saving course:', error);
      }
    }

    await owlv2Scraper.close();

    await notificationService.sendPlatformSyncNotification(user.email, {
      platform: 'OWLv2',
      newCourses: newCourses
    });

    res.json({ 
      success: true, 
      message: 'OWLv2 sync completed',
      newCourses: newCourses
    });
  } catch (error) {
    console.error('OWLv2 sync error:', error);
    res.status(500).json({ error: 'OWLv2 sync failed' });
  }
});

// Notification routes
app.post('/api/notifications/assignment-reminder', async (req, res) => {
  try {
    const { userEmail, assignmentData } = req.body;
    await notificationService.sendAssignmentReminder(userEmail, assignmentData);
    res.json({ success: true, message: 'Assignment reminder sent' });
  } catch (error) {
    console.error('Error sending assignment reminder:', error);
    res.status(500).json({ error: 'Failed to send reminder' });
  }
});

app.post('/api/notifications/grade-update', async (req, res) => {
  try {
    const { userEmail, gradeData } = req.body;
    await notificationService.sendGradeUpdate(userEmail, gradeData);
    res.json({ success: true, message: 'Grade update notification sent' });
  } catch (error) {
    console.error('Error sending grade update:', error);
    res.status(500).json({ error: 'Failed to send grade update' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
async function startServer() {
  try {
    await dbService.initialize();
    console.log('Database initialized successfully');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app; 