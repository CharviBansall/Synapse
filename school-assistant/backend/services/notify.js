/**
 * Notification Service
 * Handles email notifications, push notifications, and alerts
 */

const nodemailer = require('nodemailer');

class NotificationService {
  constructor() {
    this.emailTransporter = null;
    this.initializeEmailTransporter();
  }

  /**
   * Initialize email transporter
   */
  initializeEmailTransporter() {
    try {
      this.emailTransporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } catch (error) {
      console.error('Email transporter initialization error:', error);
    }
  }

  /**
   * Send email notification
   */
  async sendEmail(to, subject, content, htmlContent = null) {
    try {
      if (!this.emailTransporter) {
        throw new Error('Email transporter not initialized');
      }

      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@schoolassistant.com',
        to: to,
        subject: subject,
        text: content
      };

      if (htmlContent) {
        mailOptions.html = htmlContent;
      }

      const result = await this.emailTransporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  /**
   * Send assignment due date reminder
   */
  async sendAssignmentReminder(userEmail, assignmentData) {
    try {
      const subject = `Assignment Reminder: ${assignmentData.title}`;
      const content = `
        Hello!
        
        This is a reminder that your assignment "${assignmentData.title}" is due on ${assignmentData.dueDate}.
        
        Course: ${assignmentData.courseName}
        Platform: ${assignmentData.platform}
        
        Please make sure to submit your work on time!
        
        Best regards,
        School Assistant
      `;

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Assignment Reminder</h2>
          <p>Hello!</p>
          <p>This is a reminder that your assignment <strong>"${assignmentData.title}"</strong> is due on <strong>${assignmentData.dueDate}</strong>.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Course:</strong> ${assignmentData.courseName}</p>
            <p><strong>Platform:</strong> ${assignmentData.platform}</p>
          </div>
          <p>Please make sure to submit your work on time!</p>
          <p>Best regards,<br>School Assistant</p>
        </div>
      `;

      return await this.sendEmail(userEmail, subject, content, htmlContent);
    } catch (error) {
      console.error('Error sending assignment reminder:', error);
      throw error;
    }
  }

  /**
   * Send grade update notification
   */
  async sendGradeUpdate(userEmail, gradeData) {
    try {
      const subject = `Grade Update: ${gradeData.assignmentTitle}`;
      const content = `
        Hello!
        
        Your grade has been updated for the assignment "${gradeData.assignmentTitle}".
        
        Course: ${gradeData.courseName}
        Score: ${gradeData.score}/${gradeData.maxScore} (${gradeData.percentage}%)
        
        Keep up the great work!
        
        Best regards,
        School Assistant
      `;

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Grade Update</h2>
          <p>Hello!</p>
          <p>Your grade has been updated for the assignment <strong>"${gradeData.assignmentTitle}"</strong>.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Course:</strong> ${gradeData.courseName}</p>
            <p><strong>Score:</strong> ${gradeData.score}/${gradeData.maxScore} (${gradeData.percentage}%)</p>
          </div>
          <p>Keep up the great work!</p>
          <p>Best regards,<br>School Assistant</p>
        </div>
      `;

      return await this.sendEmail(userEmail, subject, content, htmlContent);
    } catch (error) {
      console.error('Error sending grade update:', error);
      throw error;
    }
  }

  /**
   * Send platform sync notification
   */
  async sendPlatformSyncNotification(userEmail, platformData) {
    try {
      const subject = `Platform Sync Complete: ${platformData.platform}`;
      const content = `
        Hello!
        
        Your ${platformData.platform} account has been successfully synchronized.
        
        New items found:
        - Courses: ${platformData.newCourses || 0}
        - Assignments: ${platformData.newAssignments || 0}
        - Grades: ${platformData.newGrades || 0}
        
        Your dashboard has been updated with the latest information.
        
        Best regards,
        School Assistant
      `;

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Platform Sync Complete</h2>
          <p>Hello!</p>
          <p>Your <strong>${platformData.platform}</strong> account has been successfully synchronized.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>New items found:</h3>
            <ul>
              <li><strong>Courses:</strong> ${platformData.newCourses || 0}</li>
              <li><strong>Assignments:</strong> ${platformData.newAssignments || 0}</li>
              <li><strong>Grades:</strong> ${platformData.newGrades || 0}</li>
            </ul>
          </div>
          <p>Your dashboard has been updated with the latest information.</p>
          <p>Best regards,<br>School Assistant</p>
        </div>
      `;

      return await this.sendEmail(userEmail, subject, content, htmlContent);
    } catch (error) {
      console.error('Error sending platform sync notification:', error);
      throw error;
    }
  }

  /**
   * Send error notification
   */
  async sendErrorNotification(userEmail, errorData) {
    try {
      const subject = `Platform Sync Error: ${errorData.platform}`;
      const content = `
        Hello!
        
        We encountered an error while syncing your ${errorData.platform} account.
        
        Error: ${errorData.error}
        Time: ${new Date().toLocaleString()}
        
        Please check your credentials and try again, or contact support if the issue persists.
        
        Best regards,
        School Assistant
      `;

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d32f2f;">Platform Sync Error</h2>
          <p>Hello!</p>
          <p>We encountered an error while syncing your <strong>${errorData.platform}</strong> account.</p>
          <div style="background-color: #ffebee; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #d32f2f;">
            <p><strong>Error:</strong> ${errorData.error}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p>Please check your credentials and try again, or contact support if the issue persists.</p>
          <p>Best regards,<br>School Assistant</p>
        </div>
      `;

      return await this.sendEmail(userEmail, subject, content, htmlContent);
    } catch (error) {
      console.error('Error sending error notification:', error);
      throw error;
    }
  }

  /**
   * Send push notification (placeholder for future implementation)
   */
  async sendPushNotification(userId, title, body, data = {}) {
    try {
      // This would integrate with a push notification service like Firebase Cloud Messaging
      console.log(`Push notification sent to user ${userId}: ${title} - ${body}`);
      return { success: true, messageId: `push_${Date.now()}` };
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  }

  /**
   * Send SMS notification (placeholder for future implementation)
   */
  async sendSMSNotification(phoneNumber, message) {
    try {
      // This would integrate with an SMS service like Twilio
      console.log(`SMS sent to ${phoneNumber}: ${message}`);
      return { success: true, messageId: `sms_${Date.now()}` };
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  }
}

module.exports = NotificationService; 