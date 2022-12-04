import multer from "multer";
import multerS3 from "multer-s3";
import aws from "aws-sdk";
import Video from "./models/Video";
import User from "./models/User";

import fs from "fs";
import path from "path";

// middleware that saves info from backend to locals, accessible from any views
const isHeroku = process.env.NODE_ENV === "production";

export const localsMiddleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteName = "Wetube";
  res.locals.loggedInUser = req.session.user || {};
  res.locals.subbed = Boolean(req.session.subbed);
  res.locals.isHeroku = isHeroku;
  res.locals.url = req.url;
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
  if (video) {
    try {
      if (isHeroku) {
        const awsParams = {
          Bucket: "wetube-reloaded-2022",
          Key: `videos/${video.fileUrl.split("/")[4]}`,
        };
        await s3.headObject(awsParams).promise();
      } else {
        if (!fs.existsSync(path.join(__dirname, "..", video.fileUrl))) {
          deleteFromDb(id, video, "videos");
          return res.status(404).render("404", {
            pageTitle: "Video Not Found",
          });
        }
      }
      next();
    } catch (error) {
      deleteFromDb(id, video, "videos");
      return res.status(404).render("404", {
        pageTitle: "Video Not Found",
      });
    }
  } else {
    return res.status(404).render("404", {
      pageTitle: "Video Not Found",
    });
  }
};

export const deleteVideoFromDb = async (req, res, next) => {
  const { id } = req.params; // <- video ID
  const video = await Video.findById(id);
  deleteFromDb(id, video, "videos");
  next();
};

export const deleteAvatarFromDb = async (req, res, next) => {
  const {
    user: { _id }, // <= id of current user
  } = req.session;
  const user = await User.findById(_id);
  console.log(user);
  deleteFromDb(_id, user, "images");
  next();
};

const deleteFromDb = async (id, object, type) => {
  switch (type) {
    case "videos":
      if (isHeroku) {
        try {
          const thumbParams = {
            Bucket: "wetube-reloaded-2022",
            Key: `${type}/${object.thumbUrl.split("/")[4]}`,
          };

          s3.deleteObject(thumbParams, (err, data) => {
            if (err) console.log(err);
            else console.log("thumbnail deleted");
          });
        } catch (error) {
          console.log(error);
        }

        try {
          const videoParams = {
            Bucket: "wetube-reloaded-2022",
            Key: `${type}/${object.fileUrl.split("/")[4]}`,
          };

          s3.deleteObject(videoParams, (err, data) => {
            if (err) console.log(err);
            else console.log("video deleted");
          });
        } catch (error) {
          console.log(error);
        }
      } else {
        try {
          fs.unlinkSync(path.join(__dirname, "..", object.thumbUrl));
        } catch (error) {
          console.log(error);
        }
        try {
          fs.unlinkSync(path.join(__dirname, "..", object.fileUrl));
        } catch (error) {
          console.log(error);
        }
      }

      try {
        if (object.comments) {
          for (const comment of object.comments) {
            let commentUser = (await User.find({ comments: comment }))[0];
            if (commentUser) {
              commentUser.comments.splice(
                commentUser.comments.indexOf(comment),
                1
              );
              await commentUser.save();
              await Comment.findByIdAndDelete(comment);
            }
          }
        }
      } catch (error) {
        console.log(error);
      }

      const user = await User.findById(object.owner);
      user.videos.splice(user.videos.indexOf(id), 1);
      user.save();

      await Video.findByIdAndDelete(id);

      break;

    case "images":
      if (isHeroku) {
        try {
          const avatarParam = {
            Bucket: "wetube-reloaded-2022",
            Key: `${type}/${object.avatarUrl.split("/")[4]}`,
          };

          s3.deleteObject(avatarParam, (err, data) => {
            if (err) console.log(err);
            else console.log("avatar deleted");
          });
        } catch (error) {
          console.log(error);
        }
      } else {
        try {
          fs.unlinkSync(path.join(__dirname, "..", object.avatarUrl));
        } catch (error) {
          console.log(error);
        }
      }
      break;
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
