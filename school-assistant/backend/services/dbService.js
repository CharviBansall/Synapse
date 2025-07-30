/**
 * Database Service
 * Handles all database operations using Supabase
 */

const { createClient } = require('@supabase/supabase-js');

class DatabaseService {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
  }

  /**
   * Initialize database connection
   */
  async initialize() {
    try {
      const { data, error } = await this.supabase.from('users').select('count').limit(1);
      if (error) {
        throw error;
      }
      console.log('Database connection established');
      return true;
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }

  /**
   * User operations
   */
  async createUser(userData) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .insert([userData])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  async updateUser(userId, updates) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Course operations
   */
  async createCourse(courseData) {
    try {
      const { data, error } = await this.supabase
        .from('courses')
        .insert([courseData])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  }

  async getUserCourses(userId) {
    try {
      const { data, error } = await this.supabase
        .from('user_courses')
        .select(`
          *,
          courses (*)
        `)
        .eq('user_id', userId);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user courses:', error);
      throw error;
    }
  }

  async updateCourse(courseId, updates) {
    try {
      const { data, error } = await this.supabase
        .from('courses')
        .update(updates)
        .eq('id', courseId)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  }

  /**
   * Assignment operations
   */
  async createAssignment(assignmentData) {
    try {
      const { data, error } = await this.supabase
        .from('assignments')
        .insert([assignmentData])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error creating assignment:', error);
      throw error;
    }
  }

  async getCourseAssignments(courseId) {
    try {
      const { data, error } = await this.supabase
        .from('assignments')
        .select('*')
        .eq('course_id', courseId)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching course assignments:', error);
      throw error;
    }
  }

  async updateAssignment(assignmentId, updates) {
    try {
      const { data, error } = await this.supabase
        .from('assignments')
        .update(updates)
        .eq('id', assignmentId)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating assignment:', error);
      throw error;
    }
  }

  /**
   * Grade operations
   */
  async createGrade(gradeData) {
    try {
      const { data, error } = await this.supabase
        .from('grades')
        .insert([gradeData])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error creating grade:', error);
      throw error;
    }
  }

  async getUserGrades(userId, courseId = null) {
    try {
      let query = this.supabase
        .from('grades')
        .select(`
          *,
          assignments (*)
        `)
        .eq('user_id', userId);

      if (courseId) {
        query = query.eq('course_id', courseId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user grades:', error);
      throw error;
    }
  }

  async updateGrade(gradeId, updates) {
    try {
      const { data, error } = await this.supabase
        .from('grades')
        .update(updates)
        .eq('id', gradeId)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating grade:', error);
      throw error;
    }
  }

  /**
   * Platform credentials operations
   */
  async savePlatformCredentials(userId, platform, credentials) {
    try {
      const { data, error } = await this.supabase
        .from('platform_credentials')
        .upsert([{
          user_id: userId,
          platform: platform,
          credentials: credentials
        }])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error saving platform credentials:', error);
      throw error;
    }
  }

  async getPlatformCredentials(userId, platform) {
    try {
      const { data, error } = await this.supabase
        .from('platform_credentials')
        .select('credentials')
        .eq('user_id', userId)
        .eq('platform', platform)
        .single();

      if (error) throw error;
      return data?.credentials;
    } catch (error) {
      console.error('Error fetching platform credentials:', error);
      throw error;
    }
  }
}

module.exports = DatabaseService; 