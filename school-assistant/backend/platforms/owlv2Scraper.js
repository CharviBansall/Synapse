/**
 * OWLv2 Platform Scraper
 * Handles web scraping for OWLv2 (Cengage) platform
 */

const puppeteer = require('puppeteer');

class OWLv2Scraper {
  constructor(username, password) {
    this.username = username;
    this.password = password;
    this.baseUrl = 'https://owlv2.cengage.com';
    this.browser = null;
    this.page = null;
  }

  /**
   * Initialize browser and authenticate
   */
  async initialize() {
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      this.page = await this.browser.newPage();
      await this.authenticate();
    } catch (error) {
      console.error('OWLv2 initialization error:', error);
      throw error;
    }
  }

  /**
   * Authenticate with OWLv2
   */
  async authenticate() {
    try {
      await this.page.goto(`${this.baseUrl}/login`);
      
      // Wait for login form to load
      await this.page.waitForSelector('#username', { timeout: 10000 });
      
      // Fill in credentials
      await this.page.type('#username', this.username);
      await this.page.type('#password', this.password);
      
      // Submit form
      await this.page.click('button[type="submit"]');
      
      // Wait for navigation
      await this.page.waitForNavigation({ timeout: 15000 });
      
      // Check if login was successful
      const currentUrl = this.page.url();
      if (currentUrl.includes('login') || currentUrl.includes('error')) {
        throw new Error('OWLv2 authentication failed');
      }
      
      console.log('OWLv2 authentication successful');
    } catch (error) {
      console.error('OWLv2 authentication error:', error);
      throw error;
    }
  }

  /**
   * Get user's courses
   */
  async getCourses() {
    try {
      if (!this.page) {
        throw new Error('Not initialized. Call initialize() first.');
      }

      // Navigate to courses page
      await this.page.goto(`${this.baseUrl}/courses`);
      await this.page.waitForSelector('.course-list', { timeout: 10000 });

      // Extract course data
      const courses = await this.page.evaluate(() => {
        const courseElements = document.querySelectorAll('.course-item');
        return Array.from(courseElements).map(course => ({
          id: course.getAttribute('data-course-id'),
          name: course.querySelector('.course-name')?.textContent?.trim(),
          instructor: course.querySelector('.instructor')?.textContent?.trim(),
          status: course.querySelector('.status')?.textContent?.trim()
        }));
      });

      return courses;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  }

  /**
   * Get assignments for a specific course
   */
  async getAssignments(courseId) {
    try {
      if (!this.page) {
        throw new Error('Not initialized. Call initialize() first.');
      }

      // Navigate to course assignments page
      await this.page.goto(`${this.baseUrl}/course/${courseId}/assignments`);
      await this.page.waitForSelector('.assignment-list', { timeout: 10000 });

      // Extract assignment data
      const assignments = await this.page.evaluate(() => {
        const assignmentElements = document.querySelectorAll('.assignment-item');
        return Array.from(assignmentElements).map(assignment => ({
          id: assignment.getAttribute('data-assignment-id'),
          title: assignment.querySelector('.assignment-title')?.textContent?.trim(),
          dueDate: assignment.querySelector('.due-date')?.textContent?.trim(),
          status: assignment.querySelector('.status')?.textContent?.trim(),
          score: assignment.querySelector('.score')?.textContent?.trim()
        }));
      });

      return assignments;
    } catch (error) {
      console.error('Error fetching assignments:', error);
      throw error;
    }
  }

  /**
   * Get grades for a specific course
   */
  async getGrades(courseId) {
    try {
      if (!this.page) {
        throw new Error('Not initialized. Call initialize() first.');
      }

      // Navigate to course grades page
      await this.page.goto(`${this.baseUrl}/course/${courseId}/grades`);
      await this.page.waitForSelector('.grade-list', { timeout: 10000 });

      // Extract grade data
      const grades = await this.page.evaluate(() => {
        const gradeElements = document.querySelectorAll('.grade-item');
        return Array.from(gradeElements).map(grade => ({
          assignmentId: grade.getAttribute('data-assignment-id'),
          assignmentName: grade.querySelector('.assignment-name')?.textContent?.trim(),
          score: grade.querySelector('.score')?.textContent?.trim(),
          maxScore: grade.querySelector('.max-score')?.textContent?.trim(),
          percentage: grade.querySelector('.percentage')?.textContent?.trim()
        }));
      });

      return grades;
    } catch (error) {
      console.error('Error fetching grades:', error);
      throw error;
    }
  }

  /**
   * Close browser
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

module.exports = OWLv2Scraper; 