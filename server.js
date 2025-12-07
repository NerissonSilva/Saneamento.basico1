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

// Function to find frontend directory
function findFrontendPath() {
  // Check if FRONTEND_PATH is set (from Render environment variable)
  if (process.env.FRONTEND_PATH) {
    console.log(`📌 Using FRONTEND_PATH from environment: ${process.env.FRONTEND_PATH}`);
    if (fs.existsSync(process.env.FRONTEND_PATH)) {
      return process.env.FRONTEND_PATH;
    } else {
      console.warn(`⚠️  FRONTEND_PATH set but directory doesn't exist: ${process.env.FRONTEND_PATH}`);
    }
  }
  
  const isRender = process.env.RENDER === 'true';
  
  const possiblePaths = [
    path.join(__dirname, '../frontend'),                    // Local: backend/../frontend
    path.join(__dirname, '../../frontend'),                 // If in nested structure
    '/opt/render/project/src/frontend',                     // Render absolute path (most common)
    '/opt/render/project/frontend',                         // Render without src
    path.join('/opt/render/project/src', 'frontend'),       // Render constructed path
    path.resolve(process.cwd(), '../frontend'),             // From process working directory
    path.resolve(process.cwd(), 'frontend'),                // Direct from cwd
    path.join(process.cwd(), '../frontend')                 // Relative to cwd
  ];
  
  console.log(`🔍 Searching for frontend directory...`);
  console.log(`📁 __dirname: ${__dirname}`);
  console.log(`📁 process.cwd(): ${process.cwd()}`);
  console.log(`📁 Is Render: ${isRender}`);
  
  for (const testPath of possiblePaths) {
    console.log(`   Trying: ${testPath}`);
    try {
      if (fs.existsSync(testPath)) {
        const indexPath = path.join(testPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          console.log(`✅ Found frontend at: ${testPath}`);
          return testPath;
        } else {
          console.log(`   ⚠️  Directory exists but no index.html`);
        }
      }
    } catch (err) {
      console.log(`   ❌ Error checking path: ${err.message}`);
    }
  }
  
  console.error(`❌ Frontend not found in any location!`);
  console.error(`Tried paths:`);
  possiblePaths.forEach(p => console.error(`   - ${p}`));
  
  // List what's actually in the parent directory
  try {
    const parentDir = path.join(__dirname, '..');
    console.error(`\nContents of ${parentDir}:`);
    const contents = fs.readdirSync(parentDir);
    contents.forEach(item => console.error(`   - ${item}`));
  } catch (err) {
    console.error(`Could not list parent directory: ${err.message}`);
  }
  
  // Return default path as fallback
  return path.join(__dirname, '../frontend');
}

const frontendPath = findFrontendPath();

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

// ============================================
// API ROUTES (must come before static files)
// ============================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    frontend: frontendPath
  });
});

// API info
app.get('/api', (req, res) => {
  res.json({ 
    message: 'API is running', 
    status: 'ok',
    endpoints: {
      health: '/api/health',
      auth: {
        google: '/api/auth/google',
        user: '/api/auth/user',
        logout: '/api/auth/logout'
      }
    }
  });
});

// Google OAuth login
app.get('/api/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback
app.get('/api/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/?login=failed' }),
  (req, res) => {
    console.log('✅ User authenticated successfully');
    res.redirect('/?login=success');
  }
);

// Get current user
app.get('/api/auth/user', (req, res) => {
  if (req.isAuthenticated()) {
    console.log('✅ User is authenticated:', req.user.displayName);
    res.json({ user: req.user });
  } else {
    console.log('⚠️  User not authenticated');
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  const userName = req.user?.displayName || 'Unknown';
  req.logout((err) => {
    if (err) {
      console.error('❌ Logout failed:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    console.log(`✅ User logged out: ${userName}`);
    res.json({ message: 'Logged out successfully' });
  });
});

// ============================================
// STATIC FILES & FRONTEND
// ============================================

// Serve static files (CSS, JS, images)
app.use(express.static(frontendPath, {
  index: false // Don't serve index.html automatically
}));

// Serve frontend for all other routes (SPA fallback)
app.get('*', (req, res) => {
  // Don't log static file requests
  if (!req.path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg)$/)) {
    console.log(`📄 Serving index.html for: ${req.path}`);
  }
  
  const indexPath = path.join(frontendPath, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    console.error(`❌ index.html not found at: ${indexPath}`);
    res.status(404).send(`
      <h1>Frontend not found</h1>
      <p>Looking for: ${indexPath}</p>
      <p>Current directory: ${__dirname}</p>
      <p><a href="/api/health">Check API Health</a></p>
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
