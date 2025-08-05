const { body } = require('express-validator');

const deptValidationRules = [
  body('dept_code').notEmpty().withMessage('Dept code is required.'),
  body('dept_code').isLength({ min: 3, max: 3}).withMessage('Dept code must be 3 Character.'),
  body('dept_desc').notEmpty().withMessage('Dept Description is required.'),
  body('dept_desc').isLength({ min: 5}).withMessage('Dept desc atleast 5 character.'),
];

module.exports = deptValidationRules;
