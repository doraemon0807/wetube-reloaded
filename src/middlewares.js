import multer from "multer";
import multerS3 from "multer-s3";
import aws from "aws-sdk";
import Video from "./models/Video";

import { deleteVideo } from "./controllers/videoController";

// middleware that saves info from backend to locals, accessible from any views
const isHeroku = process.env.NODE_ENV === "production";

export const localsMiddleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteName = "Wetube";
  res.locals.loggedInUser = req.session.user || {};
  res.locals.subbed = Boolean(req.session.subbed);
  res.locals.isHeroku = isHeroku;
  next();
};

export const protectorMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "Not authorized. Please log in first.");
    return res.redirect("/");
  }
};

export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    next();
  } else {
    req.flash("error", "Not authorized");
    return res.redirect("/");
  }
};

export const likeSubProtectorMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    return res.sendStatus(400);
  }
};

const s3 = new aws.S3({
  credentials: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

export const checkVideoExists = async (req, res, next) => {
  const { id } = req.params;

  const video = await Video.findById(id);

  const videoParams = {
    Bucket: "wetube-reloaded-2022",
    Key: `videos/${video.fileUrl.split("/")[4]}`,
  };
  const thumbParams = {
    Bucket: "wetube-reloaded-2022",
    Key: `videos/${video.thumbUrl.split("/")[4]}`,
  };

  try {
    await s3.headObject(videoParams).promise();
    next();
  } catch (error) {
    s3.deleteObject(thumbParams, (err, data) => {
      if (err) console.log(err);
      else console.log(data + "deleted");
    });

    deleteVideo();
    return res.status(404).render("404", {
      pageTitle: "Video Not Found",
    });
  }
};

const s3ImageUploader = multerS3({
  s3: s3,
  bucket: "wetube-reloaded-2022",
  acl: "public-read",
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: function (request, file, ab_callback) {
    const newFileName = Date.now() + "-" + file.originalname;
    const fullPath = "images/" + newFileName;
    ab_callback(null, fullPath);
  },
});

const s3VideoUploader = multerS3({
  s3: s3,
  bucket: "wetube-reloaded-2022",
  acl: "public-read",
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: function (request, file, ab_callback) {
    const newFileName = Date.now() + "-" + file.originalname;
    const fullPath = "videos/" + newFileName;
    ab_callback(null, fullPath);
  },
});

export const avatarUpload = multer({
  dest: "uploads/avatars/",
  limits: {
    fileSize: 3000000,
  },
  storage: isHeroku ? s3ImageUploader : undefined,
});

export const videoUpload = multer({
  dest: "uploads/videos/",
  limits: {
    fileSize: 10000000,
  },
  storage: isHeroku ? s3VideoUploader : undefined,
});
