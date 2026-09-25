const app = require('./app');
const { runMigrations } = require('./db/migrate');

const PORT = process.env.PORT || 5000;

async function start() {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL is not set — skipping migrations; DB-backed routes will fail.');
  } else {
    try {
      await runMigrations();
    } catch (err) {
      console.error(err.message);
      // In production a half-migrated schema would serve broken routes, so refuse to start
      // and let the host keep the previous deploy live.
      if (process.env.NODE_ENV === 'production') process.exit(1);
    }
  }

  app.listen(PORT, () => {
    console.log(`DevTrackr backend running on port ${PORT}`);
  });
}

start();
