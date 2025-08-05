const { body } = require('express-validator');

const userValidationRules = [
  body('vname').notEmpty().withMessage('Field is required.'),
  body('vname').isLength({ min: 6}).withMessage('Name Column must atleast 6 Character.'),
  body('email').isEmail().withMessage('Email is not Valid.'),
  body('account').notEmpty().withMessage('Field is required.'),
  body('storeh').notEmpty().withMessage('Field is required.'),
  body('sex').notEmpty().withMessage('Field is required.'),
  body('dept_id').notEmpty().withMessage('Field is required.'),
  body('role_id').notEmpty().withMessage('Field is required.'),
  body('passw').notEmpty().withMessage('Field is required.'),
  body('cfm_passw')
    .notEmpty().withMessage('Field is required.')
    .custom((value, { req }) => value === req.body.passw)
    .withMessage('Confirm password not match.')
]

const upsrValidationRules = [
  body('vname').notEmpty().withMessage('Field is required.'),
  body('vname').isLength({ min: 6}).withMessage('Name Column must atleast 6 Character.'),
  body('email').isEmail().withMessage('Email is not Valid.'),
  body('account').notEmpty().withMessage('Field is required.'),
]

const upByusrValidationRules = [
  body('vname').notEmpty().withMessage('Field is required.'),
  body('vname').isLength({ min: 6}).withMessage('Name Column must atleast 6 Character.'),
  body('email').isEmail().withMessage('Email is not Valid.'),
]

const changePasswordValidation = [
 body('oldPswd')
    .notEmpty().withMessage('Old password is required'),
  body('newPswd')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  body('cfmPswd')
    .notEmpty().withMessage('Field is required.')
    .custom((value, { req }) => value === req.body.newPswd)
    .withMessage('Confirm password not match.')
]

module.exports = { userValidationRules, upsrValidationRules, upByusrValidationRules, changePasswordValidation }
