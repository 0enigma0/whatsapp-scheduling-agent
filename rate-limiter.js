const MAX_REQUESTS_PER_MINUTE = 5;
const MAX_REQUESTS_PER_DAY = 10;

// This will store our rate limit data in memory.
// The key will be the user's WaId (phone number).
const rateLimitData = new Map();

function getNextMidnight() {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return tomorrow.getTime();
}

const rateLimiter = (req, res, next) => {
  const userId = req.body.From;

  // If for some reason we don't have a user ID, let it pass.
  if (!userId) {
    return next();
  }

  const now = Date.now();

  // Initialize user data if they are not in our map yet
  if (!rateLimitData.has(userId)) {
    rateLimitData.set(userId, {
      minute_requests: [],
      daily_count: 0,
      daily_reset_timestamp: getNextMidnight(),
    });
  }

  const userData = rateLimitData.get(userId);

  // --- 1. DAILY LIMIT CHECK ---
  // Check if we need to reset the daily counter
  if (now > userData.daily_reset_timestamp) {
    userData.daily_count = 0;
    userData.daily_reset_timestamp = getNextMidnight();
  }

  // Check if daily limit is exceeded
  if (userData.daily_count >= MAX_REQUESTS_PER_DAY) {
    console.log(`RATE LIMITER: Daily limit exceeded for user ${userId}`);
    // Respond with a 429 Too Many Requests status
    return res.status(429).json({
      status: 'error',
      message: 'Daily request limit exceeded. Please try again tomorrow.',
    });
  }


  // --- 2. MINUTE LIMIT CHECK ---
  // Filter out requests that are older than 1 minute (60,000 milliseconds)
  userData.minute_requests = userData.minute_requests.filter(
    (timestamp) => now - timestamp < 60000
  );

  // Check if minute limit is exceeded
  if (userData.minute_requests.length >= MAX_REQUESTS_PER_MINUTE) {
    console.log(`RATE LIMITER: Minute limit exceeded for user ${userId}`);
    return res.status(429).json({
      status: 'error',
      message: 'Request rate too high. Please wait a moment before trying again.',
    });
  }

  // --- 3. If all checks pass, record the request and continue ---
  userData.daily_count++;
  userData.minute_requests.push(now);
  
  console.log(`RATE LIMITER: User ${userId} - Minute count: ${userData.minute_requests.length}, Daily count: ${userData.daily_count}`);
  
  next(); // Proceed to the main webhook logic
};

module.exports = { rateLimiter };