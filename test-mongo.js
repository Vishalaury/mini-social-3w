const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');

const preferred = process.env.MONGO_URI;
const localFallback = 'mongodb://127.0.0.1:27017/mini-social';

const tryConnect = async (uri) => {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to', uri);
    return true;
  } catch (err) {
    console.error('Connect failed for', uri, err.message || err);
    return false;
  }
};

(async () => {
  const ok = (preferred && await tryConnect(preferred)) || await tryConnect(localFallback);
  if (!ok) {
    console.error('No MongoDB available. Exiting.');
    process.exit(1);
  }

  try {
    const u = new User({ username: `testuser_${Date.now()}`, fullname: 'Test User', email: `test_${Date.now()}@example.com`, password: 'hashed' });
    const saved = await u.save();
    console.log('Saved test user:', saved._id.toString());

    // cleanup
    await User.deleteOne({ _id: saved._id });
    console.log('Cleanup done.');
  } catch (err) {
    console.error('Failed to save test document:', err);
  } finally {
    await mongoose.disconnect();
  }
})();
