require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Validate required environment variables
const requiredEnvVars = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_CALLBACK_URL'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please configure these in your Render dashboard or .env file');
  process.exit(1);
}

// PostgreSQL connection pool
let pool;
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
}

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // Permite inline scripts do frontend
}));
app.use(compression());
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));

// Determine frontend path (works in both local and Render)
const fs = require('fs');
let frontendPath = path.join(__dirname, '../frontend');

// Check if frontend exists, if not try alternative paths
if (!fs.existsSync(frontendPath)) {
  console.log(`⚠️  Frontend not found at: ${frontendPath}`);
  
  // Try Render's src directory structure
  const renderPath = path.join(__dirname, '../../src/frontend');
  if (fs.existsSync(renderPath)) {
    frontendPath = renderPath;
    console.log(`✅ Found frontend at Render path: ${frontendPath}`);
  } else {
    // Try absolute path
    const absolutePath = '/opt/render/project/src/frontend';
    if (fs.existsSync(absolutePath)) {
      frontendPath = absolutePath;
      console.log(`✅ Found frontend at absolute path: ${frontendPath}`);
    } else {
      console.error(`❌ Frontend not found! Tried:
        - ${path.join(__dirname, '../frontend')}
        - ${renderPath}
        - ${absolutePath}`);
    }
  }
} else {
  console.log(`✅ Frontend path: ${frontendPath}`);
}

// Serve static files from frontend
app.use(express.static(frontendPath));

// Session configuration with PostgreSQL store
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
};

// Use PostgreSQL store if DATABASE_URL is available
if (process.env.DATABASE_URL && pool) {
  sessionConfig.store = new pgSession({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: true
  });
  console.log('✅ Using PostgreSQL session store');
} else {
  console.log('⚠️  Using MemoryStore (not recommended for production)');
}

app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }
));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

console.log('✅ Google OAuth configured successfully');

// API Routes
app.get('/api', (req, res) => {
  res.json({ message: 'API is running', status: 'ok' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/api/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/api/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/?login=failed' }),
  (req, res) => {
    res.redirect('/?login=success');
  }
);

app.get('/api/auth/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.json({ message: 'Logged out successfully' });
  });
});

// Serve frontend for all other routes (SPA fallback)
app.get('*', (req, res) => {
  const indexPath = path.join(frontendPath, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    console.error(`❌ index.html not found at: ${indexPath}`);
    res.status(404).send(`
      <h1>Frontend not found</h1>
      <p>Looking for: ${indexPath}</p>
      <p>Current directory: ${__dirname}</p>
    `);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend and Backend served together on same URL`);
  console.log(`📁 __dirname: ${__dirname}`);
  console.log(`📁 Frontend path: ${frontendPath}`);
  
  // Verify frontend files exist
  const indexPath = path.join(frontendPath, 'index.html');
  const indexExists = fs.existsSync(indexPath);
  console.log(`📄 index.html exists: ${indexExists}`);
  
  if (indexExists) {
    console.log(`✅ All systems ready!`);
  } else {
    console.error(`❌ WARNING: Frontend files not accessible!`);
  }
});
