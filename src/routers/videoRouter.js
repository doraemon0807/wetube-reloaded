import express from "express";
import {
  protectorMiddleware,
  videoUpload,
  checkVideoExists,
  deleteVideoFromDb,
} from "../middlewares";

import {
  watch,
  getEdit,
  postEdit,
  getUpload,
  postUpload,
  deleteVideo,
  getNoVideo,
} from "../controllers/videoController";

const videoRouter = express.Router();

videoRouter.get("/:id([0-9a-f]{24})", checkVideoExists, watch);

videoRouter
  .route("/upload")
  .all(protectorMiddleware)
  .get(getUpload)
  .post(
    videoUpload.fields([
      { name: "video", maxCount: 1 },
      { name: "thumb", maxCount: 1 },
    ]),
    postUpload
  );

videoRouter
  .route("/:id([0-9a-f]{24})/edit")
  .all(protectorMiddleware)
  .get(getEdit)
  .post(postEdit);

videoRouter
  .route("/:id([0-9a-f]{24})/delete")
  .all(protectorMiddleware, deleteVideoFromDb)
  .get(deleteVideo);

videoRouter.get("/:falseid", getNoVideo);

export default videoRouter;
