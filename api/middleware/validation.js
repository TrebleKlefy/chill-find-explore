const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: errors.array()
    });
  }
  next();
};

const validatePost = [
  body('type').isIn(['event', 'restaurant', 'chill']).withMessage('Invalid post type'),
  body('title').isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
  body('description').isLength({ min: 1, max: 2000 }).withMessage('Description must be between 1 and 2000 characters'),
  body('location').isObject().withMessage('Location must be an object'),
  body('location.coordinates').isArray().withMessage('Location coordinates must be an array'),
  handleValidationErrors
];

const validateUserSettings = [
  body('notifications.email.marketing').optional().isBoolean(),
  body('privacy.profileVisibility').optional().isIn(['public', 'private', 'friends']),
  handleValidationErrors
];

const validateComment = [
  body('content').isLength({ min: 1, max: 500 }).withMessage('Comment must be between 1 and 500 characters'),
  handleValidationErrors
];

const validateCollection = [
  body('name').isLength({ min: 1, max: 100 }).withMessage('Collection name must be between 1 and 100 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('is_private').optional().isBoolean(),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validatePost,
  validateUserSettings,
  validateComment,
  validateCollection
};