# 🚀 Connexa Backend API Documentation

Refer to the main [Root README.md](../README.md) for full project architecture details.

## Quick Start (Backend)
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run endpoint verification test suite
node test_endpoints.js
```

## Modular Structure
- `config/`: MongoDB connection & Multer file upload filters
- `controllers/`: `auth`, `user`, `posts`, `comment`, `connection`
- `middlewares/`: `authmiddleware`, `errorMiddleware`, `rateLimiter`, `sanitize.middleware`
- `models/`: `userSchema`, `profileSchema`, `postSchema`, `commentSchema`, `connectionSchema`
- `routes/`: Versioned v1 routes + legacy compatibility router (`index.js`)
- `Utils/`: `AsyncHandler`, `ErrorHandler`, `ResponseHandler`, `pdfGenerator`
