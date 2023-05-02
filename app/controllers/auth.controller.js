import { validationResult, body, checkSchema } from "express-validator";
import { CustomAPIError, BadRequestError } from "../../errors/index.js";
import { StatusCodes } from "http-status-codes";
import usersModel from "../models/users.model.js";
import sessionsModel from "../models/sessions.model.js";
import bcrypt from "bcrypt";

class AuthController {
  constructor() {
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
  }
  async comparePassword(password, hash) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, hash, function (err, result) {
        if (err) reject(err);
        resolve(result);
      });
    });
  }
  async hashPassword(password) {
    const saltRounds = 10;

    const hashedPassword = await new Promise((resolve, reject) => {
      bcrypt.hash(password, saltRounds, function (err, hash) {
        if (err) reject(err);
        resolve(hash);
      });
    });

    return hashedPassword;
  }
  async register(req, res) {
    /*=============================================
    =            validation            =
    =============================================*/
    await checkSchema({
      email: {
        isEmail: true,
        notEmpty: true,
        custom: {
          options: async (value, { req }) => {
            var user = await usersModel.findOne({ email: value });
            if (user) {
              throw new Error("E-mail is already used");
            }
          },
        },
      },
      name: { notEmpty: true },
      password: { notEmpty: true },
    }).run(req);
    const results = validationResult(req);
    if (!results.isEmpty()) {
      throw new CustomAPIError(
        "Invalid inputs",
        StatusCodes.UNPROCESSABLE_ENTITY,
        {
          errors: results.errors,
        }
      );
    }

    /*=====  End of validation  ======*/
    var hashedPassword = await this.hashPassword(req.body.password);
    var user = await usersModel.create({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });

    const token = await user.createJWT();

    res.json({
      user: {
        _id: user.id,
        name: user.name,
        email: user.email,
        token,
      },
    });
  }

  async login(req, res) {
    /*=============================================
    =            Validation            =
    =============================================*/

    await checkSchema({
      email: {
        notEmpty: true,
        isEmail: true,
        custom: {
          options: [
            async (value) => {
              var user = await usersModel.findOne({ email: value });
              if (!user) {
                throw new Error("You didn't register before");
              }
            },
          ],
        },
      },
      password: { notEmpty: true },
    }).run(req);
    const results = validationResult(req);
    if (!results.isEmpty()) {
      throw new CustomAPIError(
        "Non-valid inputs",
        StatusCodes.UNPROCESSABLE_ENTITY,
        {
          errors: results.errors,
        }
      );
    }

    /*=====  End of Validation  ======*/

    var user = await usersModel.findOne({ email: req.body.email });

    var result = await this.comparePassword(req.body.password, user.password);

    if (result) {
      var token = await user.createJWT();

      res.json({
        user: {
          _id: user.id,
          name: user.name,
          email: user.email,
          token,
        },
      });
    } else {
      throw new BadRequestError("Not Authenticated");
    }
  }
}

export default new AuthController();
