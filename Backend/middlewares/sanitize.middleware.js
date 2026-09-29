// Express 5 compatible MongoDB query sanitizer
const cleanObject = (obj) => {
  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    Object.keys(obj).forEach((key) => {
      if (key.startsWith("$") || key.includes(".")) {
        delete obj[key];
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        cleanObject(obj[key]);
      }
    });
  } else if (Array.isArray(obj)) {
    obj.forEach((item) => {
      if (typeof item === "object" && item !== null) {
        cleanObject(item);
      }
    });
  }
};

export const sanitizeInput = (req, res, next) => {
  try {
    if (req.body) cleanObject(req.body);
    if (req.params) cleanObject(req.params);
    if (req.query && typeof req.query === "object") cleanObject(req.query);
  } catch (err) {
    console.error("Sanitization Warning:", err.message);
  }
  next();
};

export default sanitizeInput;
