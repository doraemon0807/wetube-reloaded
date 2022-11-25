import User from "../models/User";
import bcrypt from "bcrypt";
import fetch from "cross-fetch";

export const getJoin = (req, res) =>
  res.render("users/join", { pageTitle: "Join" });

export const postJoin = async (req, res) => {
  const { name, username, email, password, password2, location } = req.body;
  const pageTitle = "Join";

  if (password !== password2) {
    return res.status(400).render("users/join", {
      pageTitle,
      errorMessage: "Passwords do not match.",
    });
  }

  const exists = await User.exists({ $or: [{ username }, { email }] });
  if (exists) {
    return res.status(400).render("users/join", {
      pageTitle,
      errorMessage: "This username/email is already taken.",
    });
  }

  try {
    await User.create({
      name,
      username,
      email,
      password,
      location,
    });
    req.flash("success", "User created. Please log in.");
    return res.redirect("/login");
  } catch (error) {
    return res.status(400).render("users/join", {
      pageTitle,
      errorMessage: error._message,
    });
  }
};

export const getLogin = (req, res) =>
  res.render("users/login", { pageTitle: "Login" });

export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const pageTitle = "Login";

  //check if username exists
  const user = await User.findOne({ username, socialOnly: false });

  if (!user) {
    return res.status(400).render("users/login", {
      pageTitle,
      errorMessage: "An account with this username does not exist.",
    });
  }

  //check if password is correct
  const ok = await bcrypt.compare(password, user.password);

  if (!ok) {
    return res.status(400).render("users/login", {
      pageTitle,
      errorMessage: "Wrong password.",
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  req.flash("success", `Welcome, ${username}!`);
  return res.redirect("/");
};

// build URL with configuration parameter
export const startGithubLogin = (req, res) => {
  const baseUrl = `https://github.com/login/oauth/authorize`;
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  const baseUrl = `https://github.com/login/oauth/access_token`;
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();

  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";

    const userData = await (
      await fetch(`${apiUrl}/user`, {
        //method: "GET",
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();

    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        //method: "GET",
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    //If GitHub account doesn't have primary/verified email:
    if (!emailObj) {
      req.flash("error", "The account doesn't have primary/verified email.");
      return res.redirect("/login");
    }
    //If email exists
    //Find if user already has an account with same email:
    let user = await User.findOne({ email: emailObj.email });
    //If user's account doesn't exist already: create an account
    if (!user) {
      user = await User.create({
        avatarUrl: userData.avatar_url,
        name: userData.name ? userData.name : userData.login,
        username: userData.login,
        email: emailObj.email,
        password: "",
        socialOnly: true,
        location: userData.location ? userData.location : "Unknown",
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    req.flash("success", `Welcome, ${user.username}!`);
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

export const startKakaoLogin = (req, res) => {
  const baseUrl = `https://kauth.kakao.com/oauth/authorize`;
  const config = {
    client_id: process.env.KAKAO_CLIENT,
    redirect_uri: process.env.KAKAO_REDIRECT,
    response_type: "code",
    scopes: ["account_email", "profile"],
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishKakaoLogin = async (req, res) => {
  const baseUrl = `https://kauth.kakao.com/oauth/token`;
  const config = {
    client_id: process.env.KAKAO_CLIENT,
    redirect_uri: process.env.KAKAO_REDIRECT,
    client_secret: process.env.KAKAO_SECRET,
    code: req.query.code,
    grant_type: "authorization_code",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;

  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();

  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;

    const apiUrl = "https://kapi.kakao.com";
    const userData = await (
      await fetch(`${apiUrl}/v2/user/me`, {
        //method: "GET",
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
    ).json();

    let user = await User.findOne({ email: userData.kakao_account.email });
    //If user's account doesn't exist already: create an account
    if (!user) {
      user = await User.create({
        avatarUrl: userData.properties.thumbnail_image,
        name: userData.properties.nickname,
        username: userData.properties.nickname,
        email: userData.kakao_account.email,
        password: "",
        socialOnly: true,
      });
    }

    req.session.loggedIn = true;
    req.session.user = user;
    req.flash("success", `Welcome, ${user.username}!`);
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

export const logout = (req, res) => {
  req.flash("success", `See you later, ${req.session.user.username}!`);
  req.session.user = null;
  res.locals.loggedInUser = req.session.user;
  req.session.loggedIn = false;
  return res.redirect("/");
};

export const getEdit = (req, res) => {
  return res.render("users/edit-profile", { pageTitle: "Edit Profile" });
};

export const postEdit = async (req, res) => {
  const pageTitle = "Edit Profile";
  const {
    session: {
      user: { _id, avatarUrl },
    },
    body: { name, email, username, location },
    file,
  } = req;

  //Code challenge: error when user changes username/email, but the email already exists
  const existingEmail = await User.findOne({ email });
  if (existingEmail && existingEmail._id.toString() !== _id) {
    return res.status(400).render("users/edit-profile", {
      pageTitle,
      errorMessage: "This email is already in use.",
    });
  }

  const existingUsername = await User.findOne({ username });
  if (existingUsername && existingUsername._id.toString() !== _id) {
    return res.status(400).render("users/edit-profile", {
      pageTitle,
      errorMessage: "This username is already in use.",
    });
  }
  const updatedUser = await User.findByIdAndUpdate(
    _id, // <- find by id
    {
      // <-- update with these values
      avatarUrl: file
        ? res.locals.isHeroku
          ? file.location
          : file.path
        : avatarUrl, // <- if file doesn't exist, keep avatarUrl
      name,
      email,
      username,
      location,
    },
    { new: true } // <- and save the updated value
  );

  req.session.user = updatedUser;
  req.flash("success", "Changes saved.");

  return res.redirect(`/users/${_id}`);
};

export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly === true) {
    req.flash("error", "You cannot change your password.");
    return res.redirect("/");
  }
  return res.render("users/change-password", { pageTitle: "Change Password" });
};

export const postChangePassword = async (req, res) => {
  const pageTitle = "Change Password";
  const {
    session: {
      user: { _id },
    },
    body: { oldPassword, newPassword, newPasswordConfirmation },
  } = req;

  const user = await User.findById(_id);

  //if password is incorrect
  const ok = await bcrypt.compare(oldPassword, user.password);
  if (!ok) {
    return res.status(400).render("users/change-password", {
      pageTitle,
      errorMessage: "The current password is incorrect.",
    });
  }

  //if new password does not match with confirmation
  if (newPassword !== newPasswordConfirmation) {
    return res.status(400).render("users/change-password", {
      pageTitle,
      errorMessage: "Your new passwords do not match.",
    });
  }

  //if old password is same as new password
  if (oldPassword === newPassword) {
    return res.status(400).render("users/change-password", {
      pageTitle,
      errorMessage: "You cannot set your old password as your new password.",
    });
  }

  user.password = newPassword;
  await user.save(); // <- save() triggers pre middleware to hash password
  req.flash("info", "Password changed. Please log in with your new password.");

  req.session.destroy();
  return res.redirect("/login");
};

export const see = async (req, res) => {
  const { id } = req.params; // <- id of searched user

  const user = await User.findById(id)
    .populate({
      path: "videos",
      populate: {
        path: "owner",
        model: "User",
      },
    })
    .populate({
      path: "comments",
      populate: {
        path: "video",
        model: "Video",
      },
    });

  if (!user) {
    return res.status(404).render("404", { pageTitle: "User Not Found" });
  }

  if (req.session.loggedIn) {
    const {
      user: { _id }, // <= id of current user
    } = req.session;

    const currentUser = await User.findById(_id).populate("subbedUsers");

    const subbedFind = await currentUser.subbedUsers.find(
      (userList) => userList._id.toString() === user._id.toString()
    );

    if (subbedFind) {
      return res.render("users/profile", {
        pageTitle: user.name,
        user,
        subbedFind,
      });
    } else {
      return res.render("users/profile", {
        pageTitle: user.name,
        user,
      });
    }
  }
  return res.render("users/profile", {
    pageTitle: user.name,
    user,
  });
};

export const registerSubs = async (req, res) => {
  const { id } = req.params; //<- id of subscribed user
  const {
    user: { _id }, // <= id of subscribing user
  } = req.session;

  const subscribedUser = await User.findById(id);

  if (!subscribedUser) {
    return res.sendStatus(404);
  }
  subscribedUser.subs = subscribedUser.subs + 1;
  await subscribedUser.save();

  // const currentUser = await User.findById(_id).populate("subbedUsers");

  // currentUser.subbedUsers.unshift(id);
  // await currentUser.save();

  await User.findByIdAndUpdate(
    _id,
    {
      $push: { subbedUsers: subscribedUser._id },
    },
    {
      new: true,
    }
  );

  return res.sendStatus(200);
};

export const registerUnsubs = async (req, res) => {
  const { id } = req.params; //<- id of subscribed user
  const {
    user: { _id }, // <= id of subscribing user
  } = req.session;

  const subscribedUser = await User.findById(id);

  if (!subscribedUser) {
    return res.sendStatus(404);
  }
  subscribedUser.subs = subscribedUser.subs - 1;
  await subscribedUser.save();

  // const currentUser = await User.findById(_id).populate("subbedUsers");

  // currentUser.subbedUsers.remove(id);
  // await currentUser.save();

  await User.findByIdAndUpdate(
    _id,
    {
      $pull: { subbedUsers: subscribedUser._id },
    },
    {
      new: true,
    }
  );

  return res.sendStatus(200);
};
