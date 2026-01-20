const { body } = require('express-validator');

const registerValidator = [
  body('email')
    .isEmail()
    .withMessage('Veuillez fournir un email valide')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'),
  
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('Le prénom est requis')
    .isLength({ min: 2 })
    .withMessage('Le prénom doit contenir au moins 2 caractères'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Le nom est requis')
    .isLength({ min: 2 })
    .withMessage('Le nom doit contenir au moins 2 caractères')
];

const loginValidator = [
  body('email')
    .isEmail()
    .withMessage('Veuillez fournir un email valide')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis')
];

module.exports = {
  registerValidator,
  loginValidator
};