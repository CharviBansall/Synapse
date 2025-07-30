// backend/platforms/canvas.js
const axios = require('axios');

async function fetchCanvasAssignments(canvasToken, canvasDomain) {
  const res = await axios.get(`https://${canvasDomain}/api/v1/courses`, {
    headers: { Authorization: `Bearer ${canvasToken}` }
  });

  const courses = res.data;
  const assignments = [];

  for (const course of courses) {
    const res2 = await axios.get(`https://${canvasDomain}/api/v1/courses/${course.id}/assignments`, {
      headers: { Authorization: `Bearer ${canvasToken}` }
    });

    res2.data.forEach(a => {
      assignments.push({
        title: a.name,
        due_date: a.due_at,
        course_name: course.name,
        url: a.html_url
      });
    });
  }

  return assignments;
}

module.exports = { fetchCanvasAssignments };
