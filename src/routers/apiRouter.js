import express from "express";
import {
  registerView,
  createComment,
  removeComment,
  editComment,
  registerLike,
  registerUnlike,
  registerCommentLike,
  registerCommentUnlike,
} from "../controllers/videoController";

import { registerSubs, registerUnsubs } from "../controllers/userController";

import { likeSubProtectorMiddleware } from "../middlewares";

const apiRouter = express.Router();

apiRouter.post("/videos/:id([0-9a-f]{24})/view", registerView);

apiRouter.post("/videos/:id([0-9a-f]{24})/comment", createComment);

apiRouter.post(
  "/videos/:id([0-9a-f]{24})/like",
  likeSubProtectorMiddleware,
  registerLike
);

apiRouter.post(
  "/videos/:id([0-9a-f]{24})/unlike",
  likeSubProtectorMiddleware,
  registerUnlike
);

apiRouter.delete("/comments/:id", removeComment);

apiRouter.post("/comments/:id/edit", editComment);

apiRouter.post(
  "/comments/:id/like",
  likeSubProtectorMiddleware,
  registerCommentLike
);
apiRouter.post(
  "/comments/:id/unlike",
  likeSubProtectorMiddleware,
  registerCommentUnlike
);

apiRouter.post(
  "/users/:id([0-9a-f]{24})/subs",
  likeSubProtectorMiddleware,
  registerSubs
);

apiRouter.post(
  "/users/:id([0-9a-f]{24})/unsubs",
  likeSubProtectorMiddleware,
  registerUnsubs
);

export default apiRouter;
