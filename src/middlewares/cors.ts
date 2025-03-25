import cors from 'cors';

const ACCEPTED_ORIGINS = [
  'http://localhost:5173',
  'https://omars-social-apps.netlify.app',
  'https://omars-social-apps.netlify.app/' // Add trailing slash variant
];

export const corsMiddleware = ({ acceptedOrigins = ACCEPTED_ORIGINS } = {}) =>
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., mobile apps, curl requests)
      if (!origin) {
        return callback(null, true);
      }

      // Check if the origin is in the accepted list
      if (acceptedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Reject requests from disallowed origins
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    exposedHeaders: ['set-cookie'] // Important for cookies
  });