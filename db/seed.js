const bcrypt = require('bcryptjs');
const { db, initDb, run } = require('./init');

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function seedDb() {
  const reset = process.argv.includes('--reset');
  await initDb();

  if (reset) {
    await run('DELETE FROM reviews');
    await run('DELETE FROM swap_requests');
    await run('DELETE FROM skills');
    await run('DELETE FROM users');
    await run("DELETE FROM sqlite_sequence WHERE name IN ('users','skills','swap_requests','reviews')");
  }

  const count = await get('SELECT COUNT(*) AS total FROM users');
  if (count.total > 0) {
    console.log('Seed skipped: database already contains users. Use npm run reset-db to reset.');
    return;
  }

  const passwordHash = await bcrypt.hash('Password123', 10);

  const users = [
    ['Praveen Muthukumar', 'praveen@example.com', passwordHash, 'MSc Computer Science', 'International student interested in programming, job applications, and practical peer learning.', 'German speaking practice, interview preparation', 'Weekdays after 18:00 and Saturday evening'],
    ['Anna Schneider', 'anna@example.com', passwordHash, 'BA International Management', 'German student who enjoys language exchange and helping international students feel confident.', 'Excel for business reports', 'Monday and Wednesday evening'],
    ['David Miller', 'david@example.com', passwordHash, 'MSc Data Science', 'Career-focused student with experience in CV writing, LinkedIn profiles, and interview preparation.', 'Frontend web development', 'Friday afternoon and Sunday morning'],
    ['Sara Khan', 'sara@example.com', passwordHash, 'BSc Media Design', 'Creative student who can help with slides, posters, and clean visual communication.', 'Mathematics support', 'Tuesday evening and Saturday morning'],
    ['Leon Fischer', 'leon@example.com', passwordHash, 'BSc Software Engineering', 'Web development learner who likes building small projects with HTML, CSS, JavaScript, and Node.js.', 'Public speaking practice', 'Thursday evening'],
    ['Maria Gomez', 'maria@example.com', passwordHash, 'MA Business Analytics', 'Excel and productivity enthusiast who helps students organize data and assignments.', 'German B1 grammar revision', 'Sunday afternoon']
  ];

  for (const user of users) {
    await run(
      'INSERT INTO users (name, email, password_hash, course, bio, skills_wanted, availability) VALUES (?, ?, ?, ?, ?, ?, ?)',
      user
    );
  }

  const skills = [
    [1, 'Python Basics for Beginners', 'Programming', 'Learn variables, loops, functions, lists, and small coding exercises in Python.', 'Beginner', 'Saturday evening'],
    [1, 'GitHub Portfolio Setup', 'Career Skills', 'I can help students create a simple GitHub profile, push code, and write a README file.', 'Beginner', 'Weekdays after 18:00'],
    [2, 'German A1 Conversation Practice', 'Language', 'Practice common German phrases, introductions, shopping, appointments, and daily conversation.', 'Beginner', 'Monday evening'],
    [2, 'German Email Writing Support', 'Language', 'Support for writing polite German emails for housing, university, or part-time job communication.', 'Intermediate', 'Wednesday evening'],
    [3, 'CV and LinkedIn Review', 'Career Skills', 'Review CV structure, write stronger profile summaries, and improve LinkedIn presentation.', 'Intermediate', 'Friday afternoon'],
    [3, 'Interview Preparation Basics', 'Career Skills', 'Practice common interview questions and prepare short answers using real examples.', 'Intermediate', 'Sunday morning'],
    [4, 'Presentation Design with Canva', 'Design', 'Learn clean slide layout, font choice, spacing, and simple presentation design principles.', 'Beginner', 'Saturday morning'],
    [4, 'Poster Design for University Projects', 'Design', 'Help with academic posters, color balance, section layout, and visual hierarchy.', 'Intermediate', 'Tuesday evening'],
    [5, 'HTML and CSS Starter Session', 'Programming', 'Build a simple responsive web page using semantic HTML and CSS styling.', 'Beginner', 'Thursday evening'],
    [6, 'Excel Formulas and Charts', 'Productivity Tools', 'Learn useful formulas, tables, filters, and charts for assignments and reports.', 'Intermediate', 'Sunday afternoon']
  ];

  for (const skill of skills) {
    await run(
      'INSERT INTO skills (user_id, title, category, description, level, availability) VALUES (?, ?, ?, ?, ?, ?)',
      skill
    );
  }

  const requests = [
    [1, 2, 3, 'Hi Anna, I would like to practice German A1 conversation. I can help you with Python basics in exchange.', 'Python basics', 'Pending'],
    [2, 6, 10, 'Hi Maria, I need Excel help for a university report. I can support you with German email writing practice.', 'German speaking practice', 'Accepted'],
    [3, 5, 9, 'Hi Leon, I want to improve my frontend basics. I can help you review your CV and LinkedIn profile.', 'CV and LinkedIn review', 'Completed'],
    [4, 1, 1, 'Hi Praveen, I want to learn Python for my assignment. I can help you with presentation design.', 'Presentation design', 'Accepted']
  ];

  for (const request of requests) {
    await run(
      'INSERT INTO swap_requests (sender_id, receiver_id, skill_id, message, offered_skill, status) VALUES (?, ?, ?, ?, ?, ?)',
      request
    );
  }

  await run(
    'INSERT INTO reviews (reviewer_id, receiver_id, request_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
    [3, 5, 3, 5, 'Leon explained HTML and CSS clearly with a simple practical example. Very helpful session.']
  );

  console.log('Database seeded successfully. Demo password for all users: Password123');
}

if (require.main === module) {
  seedDb()
    .then(() => db.close())
    .catch((err) => {
      console.error('Seeding failed:', err.message);
      db.close();
      process.exit(1);
    });
}

module.exports = seedDb;
