import mongoose from "mongoose";

const SessionSchema = mongoose.Schema(
  {
    jwt: {
      required: true,
      type: String,
    },
    user_id: {
      required: true,
      type: mongoose.Types.ObjectId,
    },
    expires: {
      required: true,
      type: Date,
      default: Date.now(),
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Session", SessionSchema);
