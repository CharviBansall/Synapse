/**
 * Canvas LMS Platform Integration
 * Handles authentication, course data retrieval, and grade synchronization
 */

class CanvasClient {
  constructor(apiKey, baseUrl) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Authenticate user with Canvas
   */
  async authenticate() {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/users/self`, {
        headers: this.headers
      });
      
      if (!response.ok) {
        throw new Error('Canvas authentication failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Canvas authentication error:', error);
      throw error;
    }
  }

  /**
   * Get user's courses
   */
  async getCourses() {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/courses?enrollment_state=active`, {
        headers: this.headers
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      
      return await response.json();
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
      const response = await fetch(`${this.baseUrl}/api/v1/courses/${courseId}/assignments`, {
        headers: this.headers
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch assignments');
      }
      
      return await response.json();
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
      const response = await fetch(`${this.baseUrl}/api/v1/courses/${courseId}/enrollments?user_id=self`, {
        headers: this.headers
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch grades');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching grades:', error);
      throw error;
    }
  }
}

module.exports = CanvasClient; 