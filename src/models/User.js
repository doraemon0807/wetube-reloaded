import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  avatarUrl: String,
  socialOnly: { type: Boolean, default: false },
  username: { type: String, required: true, unique: true, maxLength: 20 },
  password: { type: String, required: false },
  name: { type: String, required: true, maxLength: 20 },
  location: String,
  comments: [{ type: mongoose.SchemaTypes.ObjectId, ref: "Comment" }],
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
  subs: { type: Number, default: 0, required: true },
  subbedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  likedComments: [{ type: mongoose.SchemaTypes.ObjectId, ref: "Comment" }],
  likedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
});

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 5);
  }
});

const User = mongoose.model("User", userSchema);
export default User;
