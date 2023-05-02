import mongoose from "mongoose";
import sessionsModel from "./sessions.model.js";
import jwt from "jsonwebtoken";

const UsersSchema = mongoose.Schema(
  {
    name: {
      required: true,
      type: String,
    },
    email: {
      required: true,
      type: String,
    },
    password: {
      required: true,
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

UsersSchema.methods.createJWT = async function () {
  const token = jwt.sign(
    {
      email: this.email,
      _id: this._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );
  var tokenExpires = new Date();
  tokenExpires = tokenExpires.setDate(tokenExpires.getDate() + 30);

  await sessionsModel.create({
    jwt: token,
    user_id: this._id,
    expires: tokenExpires,
  });
  return token;
};

export default mongoose.model("Users", UsersSchema);
