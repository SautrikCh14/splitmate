import { AppError } from '../utils/AppError.js';

// Checks req.body against a Zod schema. On success, req.body becomes the cleaned data.
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body ?? {});

    if (!result.success) {
      const fieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join('.') || '_form';
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      return next(new AppError(400, 'Please fix the highlighted fields', fieldErrors));
    }

    req.body = result.data;
    next();
  };
}