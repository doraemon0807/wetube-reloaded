import express from "express";
import {
  registerView,
  createComment,
  removeComment,
  editComment,
} from "../controllers/videoController";

import { registerSubs, registerUnsubs } from "../controllers/userController";

const apiRouter = express.Router();

apiRouter.post("/videos/:id([0-9a-f]{24})/view", registerView);
apiRouter.post("/videos/:id([0-9a-f]{24})/comment", createComment);
apiRouter.delete("/comments/:id", removeComment);
apiRouter.post("/comments/:id/edit", editComment);
apiRouter.post("/users/:id([0-9a-f]{24})/subs", registerSubs);
apiRouter.post("/users/:id([0-9a-f]{24})/unsubs", registerUnsubs);

export default apiRouter;
