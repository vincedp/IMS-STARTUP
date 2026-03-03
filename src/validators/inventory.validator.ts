import { body, param } from 'express-validator';

export const addProductValidator = [
  body('name')
    .notEmpty()
    .withMessage('Product name is required')
    .bail()
    .isString()
    .withMessage('Product name must be a string')
    .bail()
    .isLength({ min: 3, max: 50 })
    .withMessage('Product name must be between 3-50 characters')
    .trim(),

  body('description')
    .optional()
    .isString()
    .withMessage('Product description must be a string')
    .bail()
    .isLength({ min: 5, max: 255 })
    .withMessage('Product description must be between 5-255 characters ')
    .trim(),

  body('quantity')
    .notEmpty()
    .withMessage('Product quantity is required')
    .bail()
    .isNumeric()
    .withMessage('Product quantity must be a number')
    .bail()
    .custom(val => {
      if (val < 0) {
        throw new Error('Product quantity must be greater than zero');
      }
      return true;
    }),

  body('price')
    .notEmpty()
    .withMessage('Product price is required')
    .bail()
    .isNumeric()
    .withMessage('Product price must be a number')
    .bail()
    .custom(val => {
      if (val < 0) {
        throw new Error('Product price must be greater than zero');
      }
      return true;
    }),
];

export const updateProductValidator = [
  param('productId')
    .notEmpty()
    .withMessage('Product id is required')
    .bail()
    .isNumeric()
    .withMessage('Product id must be a number')
    .bail()
    .custom(val => {
      if (val < 0) {
        throw new Error('Product price must be greater than zero');
      }
      return true;
    }),

  body('name')
    .notEmpty()
    .withMessage('Product name is required')
    .bail()
    .isString()
    .withMessage('Product name must be a string')
    .bail()
    .isLength({ min: 3, max: 50 })
    .withMessage('Product name must be between 3-50 characters')
    .trim(),

  body('description')
    .notEmpty()
    .withMessage('Product description is required')
    .bail()
    .isString()
    .withMessage('Product description must be a string')
    .bail()
    .isLength({ min: 5, max: 255 })
    .withMessage('Product description must be between 5-255 characters ')
    .trim(),

  body('quantity')
    .notEmpty()
    .withMessage('Product quantity is required')
    .bail()
    .isNumeric()
    .withMessage('Product quantity must be a number')
    .bail()
    .custom(val => {
      if (val < 0) {
        throw new Error('Product quantity must be greater than zero');
      }
      return true;
    }),

  body('price')
    .notEmpty()
    .withMessage('Product price is required')
    .bail()
    .isNumeric()
    .withMessage('Product price must be a number')
    .bail()
    .custom(val => {
      if (val < 0) {
        throw new Error('Product price must be greater than zero');
      }
      return true;
    }),
];

export const deleteProductValidator = [
  param('productId')
    .notEmpty()
    .withMessage('Product id is required')
    .bail()
    .isNumeric()
    .withMessage('Product id must be a number')
    .bail()
    .custom(val => {
      if (val < 0) {
        throw new Error('Product price must be greater than zero');
      }
      return true;
    }),
];
