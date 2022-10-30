import express from "express";
import {
  registerView,
  createComment,
  removeComment,
  editComment,
} from "../controllers/videoController";

const apiRouter = express.Router();

apiRouter.post("/videos/:id([0-9a-f]{24})/view", registerView);
apiRouter.post("/videos/:id([0-9a-f]{24})/comment", createComment);
apiRouter.delete("/comments/:id", removeComment);
apiRouter.post("/comments/:id/edit", editComment);

export default apiRouter;
