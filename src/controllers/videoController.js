import Comment from "../models/Comment";
import User from "../models/User";
import Video from "../models/Video";

export const home = async (req, res) => {
  const videos = await Video.find({})
    .sort({ createdAt: "desc" })
    .populate("owner");
  return res.render("home", { pageTitle: "Home", videos });
};

export const watch = async (req, res) => {
  const { id } = req.params; // <- id of video

  const video = await Video.findById(id)
    .populate("owner")
    .populate({
      path: "comments",
      populate: { path: "owner" },
    });

  if (!video) {
    return res.status(404).render("404", {
      pageTitle: "Video Not Found",
    });
  } else if (req.session.loggedIn) {
    const {
      user: { _id }, // <= id of current user
    } = req.session;

    const currentUser = await User.findById(_id)
      .populate("subbedUsers")
      .populate("likedVideos")
      .populate("likedComments");

    return res.render("videos/watch", {
      pageTitle: video.title,
      video,
      subbedFind: currentUser.subbedUsers.find(
        (user) => user._id.toString() === video.owner._id.toString()
      ),
      likedVideoFind: currentUser.likedVideos.find(
        (likedVideo) => likedVideo._id.toString() === video._id.toString()
      ),
      currentUser,
    });
  }
  return res.render("videos/watch", {
    pageTitle: video.title,
    video,
  });
};

export const getEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", {
      pageTitle: "Video Not Found",
    });
  }

  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }

  return res.render("videos/edit", {
    pageTitle: `Edit: ${video.title}`,
    video,
  });
};

export const postEdit = async (req, res) => {
  const { id } = req.params;
  const { title, description, hashtags } = req.body;
  const video = await Video.findById(id);
  const {
    session: {
      user: { _id },
    },
  } = req;

  if (!video) {
    return res.status(404).render("404", {
      pageTitle: "Video Not Found",
    });
  }

  if (String(video.owner) !== String(_id)) {
    req.flash("error", "Not authorized. You are not the owner of the video.");
    return res.status(403).redirect("/");
  }

  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });
  req.flash("success", "Changes successfully saved.");
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("videos/upload", { pageTitle: `Upload Video` });
};

export const postUpload = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { video, thumb } = req.files; // <- same as const fileUrl = req.file.path
  const { title, description, hashtags } = req.body;
  try {
    const newVideo = await Video.create({
      title,
      description,
      fileUrl: video[0].location,
      thumbUrl: Video.changePathFormula(thumb[0].location),
      owner: _id,
      hashtags: Video.formatHashtags(hashtags),
    });

    const user = await User.findById(_id);
    user.videos.unshift(newVideo._id);
    user.save();

    req.flash("success", "Video uploaded.");
    return res.redirect("/");
  } catch (error) {
    return res.status(400).render("videos/upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  const {
    session: {
      user: { _id },
    },
  } = req;

  const video = await Video.findById(id);

  if (!video) {
    return res.status(404).render("404", {
      pageTitle: "Video Not Found",
    });
  }

  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }

  if (video.comments) {
    for (const comment of video.comments) {
      let commentUser = (await User.find({ comments: comment }))[0];
      if (commentUser) {
        commentUser.comments.splice(commentUser.comments.indexOf(comment), 1);
        await commentUser.save();
        await Comment.findByIdAndDelete(comment);
      }
    }
  }

  await Video.findByIdAndDelete(id);

  const user = await User.findById(_id);
  user.videos.splice(user.videos.indexOf(id), 1);
  user.save();

  req.flash("success", "Video deleted.");
  return res.redirect("/");
};

export const search = async (req, res) => {
  let videos = [];
  let searched = false;
  const { keyword } = req.query;
  if (keyword) {
    videos = await Video.find({
      title: {
        $regex: new RegExp(keyword, "i"), // <- contains (both lower and capital case)
        // $regex: new RegExp(`^${keyword}`, "i"), <- starts with
        // $regex: new RegExp(`${keyword}$`, "i"), <- ends with
      },
    }).populate("owner");
    searched = true;
  }
  return res.render("videos/search", {
    pageTitle: "Search",
    videos,
    keyword,
    searched,
  });
};

export const registerView = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);

  if (!video) {
    return res.sendStatus(404);
  }
  video.meta.views = video.meta.views + 1;
  await video.save();
  return res.sendStatus(200);
};

export const createComment = async (req, res) => {
  const {
    session: { user },
    params: { id },
    body: { text },
  } = req;

  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }

  const comment = await Comment.create({
    text,
    owner: user._id,
    video: id,
  });
  video.comments.unshift(comment._id);
  video.save();

  const userSave = await User.findById(user);
  userSave.comments.unshift(comment._id);
  userSave.save();

  const commentInfo = await Comment.findById(comment._id).populate("owner");
  const commentInfoJSON = JSON.stringify(commentInfo);
  return res.status(201).json({ commentInfoJSON });
};

let commentOwner = "";

const checkCommentOwner = async (user, id) => {
  commentOwner = (await User.find({ comments: id }))[0];

  if (!commentOwner.id === user) {
    console.log("You are not the owner of the comment!");
    return res.sendStatus(404);
  }
};

export const removeComment = async (req, res) => {
  const {
    session: { user }, // <- current user ID
    params: { id }, // <- selected comment ID
    body: { videoId }, // <- video's ID
  } = req;

  const video = await Video.findById(videoId);

  await checkCommentOwner(user, id);

  commentOwner.comments.splice(commentOwner.comments.indexOf(id), 1);
  commentOwner.save();

  video.comments.splice(video.comments.indexOf(id), 1);
  video.save();

  await Comment.findByIdAndDelete(id);

  //return status 200
  return res.sendStatus(200);
};

export const editComment = async (req, res) => {
  const {
    session: { user }, // <- current user ID
    params: { id }, // <- selected comment ID
    body: { text }, // modified comment text
  } = req;

  await checkCommentOwner(user, id);

  const comment = await Comment.findByIdAndUpdate(id, {
    text,
    edited: true,
  });

  return res.sendStatus(200);
};

export const registerLike = async (req, res) => {
  const { id } = req.params; // <- id of liked video
  const {
    user: { _id }, // <= id of current user
  } = req.session;

  const video = await Video.findById(id);

  if (!video) {
    return res.sendStatus(404);
  }

  video.meta.like = video.meta.like + 1;
  await video.save();

  // const currentUser = await User.findById(_id);
  // currentUser.likedVideos.unshift(video._id);
  // await currentUser.save();

  await User.findByIdAndUpdate(
    _id,
    {
      $push: { likedVideos: video._id },
    },
    {
      new: true,
    }
  );

  return res.sendStatus(200);
};

export const registerUnlike = async (req, res) => {
  const { id } = req.params; // <- id of liked video
  const {
    user: { _id }, // <= id of current user
  } = req.session;

  const video = await Video.findById(id);

  if (!video) {
    return res.sendStatus(404);
  }

  video.meta.like = video.meta.like - 1;
  await video.save();

  // const currentUser = await User.findById(_id);
  // currentUser.likedVideos.splice(currentUser.likedVideos.indexOf(id), 1);
  // await currentUser.save();

  await User.findByIdAndUpdate(
    _id,
    {
      $pull: { likedVideos: video._id },
    },
    {
      new: true,
    }
  );

  return res.sendStatus(200);
};

export const registerCommentLike = async (req, res) => {
  const { id } = req.params; // <- id of liked comment
  const {
    user: { _id }, // <= id of current user
  } = req.session;

  const comment = await Comment.findById(id);

  if (!comment) {
    return res.sendStatus(404);
  }
  comment.like = comment.like + 1;
  await comment.save();

  // const currentUser = await User.findById(_id);
  // currentUser.likedComments.unshift(comment._id);
  // await currentUser.save();

  await User.findByIdAndUpdate(
    _id,
    {
      $push: { likedComments: comment._id },
    },
    {
      new: true,
    }
  );

  return res.sendStatus(200);
};

export const registerCommentUnlike = async (req, res) => {
  const { id } = req.params; // <- id of liked comment
  const {
    user: { _id }, // <= id of current user
  } = req.session;

  const comment = await Comment.findById(id);

  if (!comment) {
    return res.sendStatus(404);
  }

  comment.like = comment.like - 1;
  await comment.save();

  // const currentUser = await User.findById(_id);
  // currentUser.likedComments.splice(currentUser.likedComments.indexOf(id), 1);
  // await currentUser.save();

  await User.findByIdAndUpdate(
    _id,
    {
      $pull: { likedComments: comment._id },
    },
    {
      new: true,
    }
  );

  return res.sendStatus(200);
};

export const getNoVideo = async (req, res) => {
  req.flash("error", "Video could not be found. Please check the address.");
  return res.status(404).render("404", {
    pageTitle: "Video Not Found",
  });
};
