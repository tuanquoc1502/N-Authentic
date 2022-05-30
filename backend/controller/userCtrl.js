const Users = require("../models/userModel");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const Payments = require("../models/paymentModel");
const userCtrl = {
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const user = await Users.findOne({ email });
      if (user)
        return res
          .status(400)
          .json({ status: false, msg: "Email này đã có người sử dụng" });

      if (password.length < 6)
        return res
          .status(400)
          .json({ status: false, msg: "Độ dài mật khẩu tối thiểu 6 kí tự" });
      // Password Encryption
      const hashedPassword = await argon2.hash(password);
      const newUser = new Users({
        name,
        email,
        password: hashedPassword,
      });

      //   Save mongodb
      await newUser.save();
      //   Then create jsonwebtoken to authentication
      const accesstoken = createAccessToken({ id: newUser._id });
      const refreshtoken = createRefreshToken({ id: newUser._id });
      res.cookie("refreshtoken", refreshtoken, {
        httpOnly: true,
        path: "/user/refresh_token",
      });
      res.json({ accesstoken });
    } catch (error) {
      return res.status(500).json({ msg: err });
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await Users.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: "User does not exist." });
      }
      const isMatch = await argon2.verify(user.password, password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Incorrect password." });
      }
      // If login success, create access token and refresh token
      const accesstoken = createAccessToken({ id: user._id });
      const refreshtoken = createRefreshToken({ id: user._id });
      res.cookie("refreshtoken", refreshtoken, {
        httpOnly: true,
        path: "/user/refresh_token",
      });
      res.json({ accesstoken });
    } catch (err) {
      return res.status(500).json({ msg: err });
    }
  },
  logout: async (req, res) => {
    try {
      res.clearCookie("refreshtoken", { path: "/user/refresh_token" });
      return res.json({ msg: "Logged out" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  refreshToken: (req, res) => {
    try {
      const rf_token = req.cookies.refreshtoken;
      if (!rf_token) {
        res
          .status(400)
          .json({ sucess: false, msg: "Please Login or Register" });
      }
      jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) {
          res
            .status(400)
            .json({ sucess: false, msg: "Please Login or Register" });
        }
        const accesstoken = createAccessToken({ id: user.id });
        res.json({ user, accesstoken });
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getUser: async (req, res) => {
    try {
      const user = await Users.findById(req.user.id).select("-password");
      if (!user) {
        return res.status(400).json({ msg: "User does not exist." });
      }
      res.json(user);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  addCart: async (req, res) => {
    try {
      const user = await Users.findById(req.user.id);
      if (!user) {
        return res.status(400).json({ msg: "Người dùng không tồn tại." });
      }
      await Users.findOneAndUpdate(
        { _id: req.user.id },
        { cart: req.body.cart }
      );
      return res.json({ msg: "Đã thêm vào giỏ hàng" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  history: async (req, res) => {
    try {
      const history = await Payments.find({ user_id: req.user.id });
      res.json(history);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};
const createAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "11m" });
};
const createRefreshToken = (user) => {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "1d" });
};
module.exports = userCtrl;
