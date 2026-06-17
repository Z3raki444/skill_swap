const path = require('path');
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const expressLayouts = require('express-ejs-layouts');
const { db, initDb, run } = require('./db/init');
const seedDb = require('./db/seed');

const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'skillswap-development-secret-change-in-production';

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

const categories = [
  'Programming',
  'Language',
  'Academic Support',
  'Career Skills',
  'Design',
  'Productivity Tools',
  'Other'
];

const levels = ['Beginner', 'Intermediate', 'Advanced'];

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 3
    }
  })
);

app.use(async (req, res, next) => {
  res.locals.currentUser = null;
  res.locals.flash = req.session.flash || null;
  res.locals.categories = categories;
  res.locals.levels = levels;
  delete req.session.flash;

  if (req.session.userId) {
    try {
      const user = await get('SELECT id, name, email, course, bio, skills_wanted, availability FROM users WHERE id = ?', [req.session.userId]);
      res.locals.currentUser = user || null;
      req.currentUser = user || null;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

function setFlash(req, type, message) {
  req.session.flash = { type, message };
}

function requireLogin(req, res, next) {
  if (!req.session.userId) {
    setFlash(req, 'error', 'Please log in to access this page.');
    return res.redirect('/login');
  }
  next();
}

app.get('/', async (req, res, next) => {
  try {
    const featuredSkills = await all(`
      SELECT skills.*, users.name AS teacher_name
      FROM skills
      JOIN users ON users.id = skills.user_id
      ORDER BY skills.created_at DESC
      LIMIT 6
    `);
    res.render('index', { title: 'SkillSwap', featuredSkills });
  } catch (err) {
    next(err);
  }
});

app.get('/register', (req, res) => {
  res.render('register', { title: 'Register', form: {} });
});

app.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, course, bio } = req.body;
    if (!name || !email || !password) {
      setFlash(req, 'error', 'Name, email, and password are required.');
      return res.render('register', { title: 'Register', form: req.body });
    }

    const existingUser = await get('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existingUser) {
      setFlash(req, 'error', 'This email is already registered. Please log in.');
      return res.render('register', { title: 'Register', form: req.body });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await run(
      'INSERT INTO users (name, email, password_hash, course, bio, skills_wanted, availability) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), passwordHash, course || '', bio || '', '', '']
    );

    req.session.userId = result.lastID;
    setFlash(req, 'success', 'Account created successfully. Welcome to SkillSwap!');
    res.redirect('/dashboard');
  } catch (err) {
    next(err);
  }
});

app.get('/login', (req, res) => {
  res.render('login', { title: 'Login', form: {} });
});

app.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await get('SELECT * FROM users WHERE email = ?', [String(email || '').trim().toLowerCase()]);

    if (!user || !(await bcrypt.compare(password || '', user.password_hash))) {
      setFlash(req, 'error', 'Invalid email or password.');
      return res.render('login', { title: 'Login', form: req.body });
    }

    req.session.userId = user.id;
    setFlash(req, 'success', `Welcome back, ${user.name}!`);
    res.redirect('/dashboard');
  } catch (err) {
    next(err);
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.get('/dashboard', requireLogin, async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const offeredCount = await get('SELECT COUNT(*) AS total FROM skills WHERE user_id = ?', [userId]);
    const pendingCount = await get('SELECT COUNT(*) AS total FROM swap_requests WHERE receiver_id = ? AND status = ?', [userId, 'Pending']);
    const acceptedCount = await get(
      `SELECT COUNT(*) AS total FROM swap_requests
       WHERE (receiver_id = ? OR sender_id = ?) AND status = ?`,
      [userId, userId, 'Accepted']
    );
    const latestRequests = await all(
      `SELECT sr.*, s.title AS skill_title, sender.name AS sender_name, receiver.name AS receiver_name
       FROM swap_requests sr
       JOIN skills s ON s.id = sr.skill_id
       JOIN users sender ON sender.id = sr.sender_id
       JOIN users receiver ON receiver.id = sr.receiver_id
       WHERE sr.receiver_id = ? OR sr.sender_id = ?
       ORDER BY sr.created_at DESC
       LIMIT 5`,
      [userId, userId]
    );

    res.render('dashboard', {
      title: 'Dashboard',
      offeredCount: offeredCount.total,
      pendingCount: pendingCount.total,
      acceptedCount: acceptedCount.total,
      latestRequests
    });
  } catch (err) {
    next(err);
  }
});

app.get('/profile', requireLogin, async (req, res, next) => {
  try {
    const user = await get('SELECT id, name, email, course, bio, skills_wanted, availability FROM users WHERE id = ?', [req.session.userId]);
    const mySkills = await all('SELECT * FROM skills WHERE user_id = ? ORDER BY created_at DESC', [req.session.userId]);
    const reviews = await all(
      `SELECT reviews.*, users.name AS reviewer_name
       FROM reviews
       JOIN users ON users.id = reviews.reviewer_id
       WHERE reviews.receiver_id = ?
       ORDER BY reviews.created_at DESC`,
      [req.session.userId]
    );
    res.render('profile', { title: 'Profile', user, mySkills, reviews });
  } catch (err) {
    next(err);
  }
});

app.post('/profile', requireLogin, async (req, res, next) => {
  try {
    const { name, course, bio, skills_wanted, availability } = req.body;
    await run(
      'UPDATE users SET name = ?, course = ?, bio = ?, skills_wanted = ?, availability = ? WHERE id = ?',
      [name || '', course || '', bio || '', skills_wanted || '', availability || '', req.session.userId]
    );
    setFlash(req, 'success', 'Profile updated successfully.');
    res.redirect('/profile');
  } catch (err) {
    next(err);
  }
});

app.get('/skills', requireLogin, async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();
    const category = String(req.query.category || '').trim();
    const params = [];
    const filters = [];

    if (q) {
      filters.push('(skills.title LIKE ? OR skills.description LIKE ? OR users.name LIKE ?)');
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    if (category) {
      filters.push('skills.category = ?');
      params.push(category);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const skills = await all(
      `SELECT skills.*, users.name AS teacher_name, users.course AS teacher_course
       FROM skills
       JOIN users ON users.id = skills.user_id
       ${whereClause}
       ORDER BY skills.created_at DESC`,
      params
    );

    res.render('skills', { title: 'Browse Skills', skills, q, category });
  } catch (err) {
    next(err);
  }
});

app.get('/skills/add', requireLogin, (req, res) => {
  res.render('add-skill', { title: 'Add Skill', skill: {}, mode: 'add' });
});

app.post('/skills/add', requireLogin, async (req, res, next) => {
  try {
    const { title, category, description, level, availability } = req.body;
    if (!title || !category || !description || !level) {
      setFlash(req, 'error', 'Title, category, description, and level are required.');
      return res.render('add-skill', { title: 'Add Skill', skill: req.body, mode: 'add' });
    }

    await run(
      'INSERT INTO skills (user_id, title, category, description, level, availability) VALUES (?, ?, ?, ?, ?, ?)',
      [req.session.userId, title.trim(), category, description.trim(), level, availability || 'Flexible']
    );
    setFlash(req, 'success', 'Skill added successfully.');
    res.redirect('/skills');
  } catch (err) {
    next(err);
  }
});

app.get('/skills/:id', requireLogin, async (req, res, next) => {
  try {
    const skill = await get(
      `SELECT skills.*, users.name AS teacher_name, users.course AS teacher_course, users.bio AS teacher_bio,
              users.skills_wanted AS teacher_skills_wanted, users.availability AS teacher_general_availability
       FROM skills
       JOIN users ON users.id = skills.user_id
       WHERE skills.id = ?`,
      [req.params.id]
    );

    if (!skill) {
      setFlash(req, 'error', 'Skill not found.');
      return res.redirect('/skills');
    }

    const reviews = await all(
      `SELECT reviews.*, reviewer.name AS reviewer_name
       FROM reviews
       JOIN users reviewer ON reviewer.id = reviews.reviewer_id
       WHERE reviews.receiver_id = ?
       ORDER BY reviews.created_at DESC`,
      [skill.user_id]
    );

    res.render('skill-details', { title: skill.title, skill, reviews });
  } catch (err) {
    next(err);
  }
});

app.post('/skills/:id/request', requireLogin, async (req, res, next) => {
  try {
    const skill = await get('SELECT * FROM skills WHERE id = ?', [req.params.id]);
    if (!skill) {
      setFlash(req, 'error', 'Skill not found.');
      return res.redirect('/skills');
    }

    if (skill.user_id === req.session.userId) {
      setFlash(req, 'error', 'You cannot request your own skill.');
      return res.redirect(`/skills/${skill.id}`);
    }

    const { message, offered_skill } = req.body;
    if (!message || !offered_skill) {
      setFlash(req, 'error', 'Please enter a message and the skill you can offer in exchange.');
      return res.redirect(`/skills/${skill.id}`);
    }

    await run(
      'INSERT INTO swap_requests (sender_id, receiver_id, skill_id, message, offered_skill, status) VALUES (?, ?, ?, ?, ?, ?)',
      [req.session.userId, skill.user_id, skill.id, message.trim(), offered_skill.trim(), 'Pending']
    );
    setFlash(req, 'success', 'Swap request sent successfully.');
    res.redirect('/requests');
  } catch (err) {
    next(err);
  }
});

app.get('/skills/:id/edit', requireLogin, async (req, res, next) => {
  try {
    const skill = await get('SELECT * FROM skills WHERE id = ? AND user_id = ?', [req.params.id, req.session.userId]);
    if (!skill) {
      setFlash(req, 'error', 'You can only edit your own skills.');
      return res.redirect('/profile');
    }
    res.render('add-skill', { title: 'Edit Skill', skill, mode: 'edit' });
  } catch (err) {
    next(err);
  }
});

app.post('/skills/:id/edit', requireLogin, async (req, res, next) => {
  try {
    const { title, category, description, level, availability } = req.body;
    const result = await run(
      `UPDATE skills
       SET title = ?, category = ?, description = ?, level = ?, availability = ?
       WHERE id = ? AND user_id = ?`,
      [title || '', category || '', description || '', level || '', availability || '', req.params.id, req.session.userId]
    );

    if (result.changes === 0) {
      setFlash(req, 'error', 'Skill not found or you do not have permission to edit it.');
      return res.redirect('/profile');
    }

    setFlash(req, 'success', 'Skill updated successfully.');
    res.redirect('/profile');
  } catch (err) {
    next(err);
  }
});

app.post('/skills/:id/delete', requireLogin, async (req, res, next) => {
  try {
    const result = await run('DELETE FROM skills WHERE id = ? AND user_id = ?', [req.params.id, req.session.userId]);
    if (result.changes === 0) {
      setFlash(req, 'error', 'Skill not found or you do not have permission to delete it.');
    } else {
      setFlash(req, 'success', 'Skill deleted successfully.');
    }
    res.redirect('/profile');
  } catch (err) {
    next(err);
  }
});

app.get('/requests', requireLogin, async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const receivedRequests = await all(
      `SELECT sr.*, s.title AS skill_title, sender.name AS sender_name, sender.email AS sender_email
       FROM swap_requests sr
       JOIN skills s ON s.id = sr.skill_id
       JOIN users sender ON sender.id = sr.sender_id
       WHERE sr.receiver_id = ?
       ORDER BY sr.created_at DESC`,
      [userId]
    );
    const sentRequests = await all(
      `SELECT sr.*, s.title AS skill_title, receiver.name AS receiver_name, receiver.email AS receiver_email
       FROM swap_requests sr
       JOIN skills s ON s.id = sr.skill_id
       JOIN users receiver ON receiver.id = sr.receiver_id
       WHERE sr.sender_id = ?
       ORDER BY sr.created_at DESC`,
      [userId]
    );
    const myReviews = await all('SELECT request_id FROM reviews WHERE reviewer_id = ?', [userId]);
    const reviewedRequestIds = myReviews.map((row) => row.request_id);

    res.render('requests', { title: 'My Requests', receivedRequests, sentRequests, reviewedRequestIds });
  } catch (err) {
    next(err);
  }
});

app.post('/requests/:id/accept', requireLogin, async (req, res, next) => {
  try {
    await run('UPDATE swap_requests SET status = ? WHERE id = ? AND receiver_id = ? AND status = ?', ['Accepted', req.params.id, req.session.userId, 'Pending']);
    setFlash(req, 'success', 'Request accepted.');
    res.redirect('/requests');
  } catch (err) {
    next(err);
  }
});

app.post('/requests/:id/reject', requireLogin, async (req, res, next) => {
  try {
    await run('UPDATE swap_requests SET status = ? WHERE id = ? AND receiver_id = ? AND status = ?', ['Rejected', req.params.id, req.session.userId, 'Pending']);
    setFlash(req, 'success', 'Request rejected.');
    res.redirect('/requests');
  } catch (err) {
    next(err);
  }
});

app.post('/requests/:id/complete', requireLogin, async (req, res, next) => {
  try {
    await run(
      `UPDATE swap_requests SET status = ?
       WHERE id = ? AND status = ? AND (sender_id = ? OR receiver_id = ?)`,
      ['Completed', req.params.id, 'Accepted', req.session.userId, req.session.userId]
    );
    setFlash(req, 'success', 'Request marked as completed. You can now leave a review.');
    res.redirect('/requests');
  } catch (err) {
    next(err);
  }
});

app.post('/requests/:id/review', requireLogin, async (req, res, next) => {
  try {
    const request = await get(
      'SELECT * FROM swap_requests WHERE id = ? AND status = ? AND (sender_id = ? OR receiver_id = ?)',
      [req.params.id, 'Completed', req.session.userId, req.session.userId]
    );

    if (!request) {
      setFlash(req, 'error', 'Only completed requests can be reviewed.');
      return res.redirect('/requests');
    }

    const receiverId = request.sender_id === req.session.userId ? request.receiver_id : request.sender_id;
    const rating = Number(req.body.rating);
    const comment = String(req.body.comment || '').trim();

    if (!rating || rating < 1 || rating > 5 || !comment) {
      setFlash(req, 'error', 'Please provide a rating from 1 to 5 and a review comment.');
      return res.redirect('/requests');
    }

    try {
      await run(
        'INSERT INTO reviews (reviewer_id, receiver_id, request_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
        [req.session.userId, receiverId, request.id, rating, comment]
      );
      setFlash(req, 'success', 'Review submitted successfully.');
    } catch (err) {
      if (err.message.includes('UNIQUE')) {
        setFlash(req, 'error', 'You have already reviewed this request.');
      } else {
        throw err;
      }
    }

    res.redirect('/requests');
  } catch (err) {
    next(err);
  }
});

app.get('/reviews', requireLogin, async (req, res, next) => {
  try {
    const reviews = await all(
      `SELECT reviews.*, reviewer.name AS reviewer_name, receiver.name AS receiver_name
       FROM reviews
       JOIN users reviewer ON reviewer.id = reviews.reviewer_id
       JOIN users receiver ON receiver.id = reviews.receiver_id
       ORDER BY reviews.created_at DESC`
    );
    res.render('reviews', { title: 'Reviews', reviews });
  } catch (err) {
    next(err);
  }
});

app.use((req, res) => {
  res.status(404).render('index', {
    title: 'Page Not Found',
    featuredSkills: [],
    pageNotFound: true
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('A server error occurred. Please check the terminal for details.');
});

async function start() {
  try {
    await initDb();
    const count = await get('SELECT COUNT(*) AS total FROM users');
    if (count.total === 0) {
      await seedDb();
    }
    app.listen(PORT, () => {
      console.log(`SkillSwap running at http://localhost:${PORT}`);
      console.log('Demo login: praveen@example.com / Password123');
    });
  } catch (err) {
    console.error('Failed to start SkillSwap:', err.message);
    process.exit(1);
  }
}

start();
