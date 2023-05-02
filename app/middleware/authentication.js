import sessionsModel from "../models/sessions.model.js";
import userModel from "../models/users.model.js";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { UnauthenticatedError, CustomAPIError } from "../../errors/index.js";

const authenticationMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthenticatedError("Invalid token");
  }
  var token = authHeader.replace("Bearer ", "");
  var token = await sessionsModel.findOne({
    jwt: token,
    expires: {
      $gt: new Date(),
    },
  });

  if (!token) {
    throw new UnauthenticatedError("Invalid token");
  }
  try {
    const decoded = jwt.verify(token.jwt, process.env.JWT_SECRET);
    if (decoded._id != token.user_id) {
      throw new CustomAPIError(
        "You are not allowed to access this page",
        StatusCodes.CONFLICT
      );
    }
    req.user = await userModel.findOne({
      _id: decoded._id,
    });
    next();
  } catch (error) {
    throw new CustomAPIError(
      "You are not allowed to access this page",
      StatusCodes.NOT_ACCEPTABLE
    );
  }
};
export default authenticationMiddleware;
