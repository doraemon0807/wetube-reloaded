import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  video: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Video" },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  like: { type: Number, default: 0, required: true },
  edited: { type: Boolean, default: false },
});

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
