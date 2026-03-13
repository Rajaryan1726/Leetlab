import { body } from "express-validator";
import {AvailableRolesEnum} from "../utils/constants.js";
export const userRegistrationValidator = () => {
  return [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Email is invalid."),

  body("username")
    .trim()
    .notEmpty().withMessage("Username is required.")
    .isLength({ min: 3 }).withMessage("Username must be at least 3 characters.")
    .isLength({ max: 17 }).withMessage("Username must not exceed 17 characters.")
    .matches(/^[a-zA-Z0-9_]+$/).withMessage("Username can only contain letters, numbers, and underscore.")
    .toLowerCase(),

  body("password")
    .notEmpty().withMessage("Password is required.")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters.")
    .isLength({ max: 30 }).withMessage("Password must not exceed 30 characters.")
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    }).withMessage(
      "Password must include 1 uppercase, 1 lowercase, 1 number, and 1 symbol."
    ),

  ]}


export const userLoginValidator = () => {
  return [
    body("email")
    .optional()
    .isEmail()
    .withMessage("Email is invalid.")
    .trim(),

    body("username")
    .optional(),

    body("password")
    .notEmpty()
    .withMessage("Password is required")
  ]
};

export const userChangeCurrentPasswordValidator = () => {
  return [
    body("oldPassword")
    .notEmpty()
    .withMessage("Old password is required"),

    body("newPassword")
    .notEmpty()
    .withMessage("New password is required."),
  ]
};

export const userForgotPasswordValidator = () => {
  return [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
  ];
};

export const userResetForgottenPasswordValidator = () => {
  return [
    body("password")
    .notEmpty()
    .withMessage("password is required."),
  ]
};