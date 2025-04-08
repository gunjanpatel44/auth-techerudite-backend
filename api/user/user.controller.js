const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const User = require("../../models/User");
const sendVerificationEmail = require("../../utils/sendEmail");
const jwt = require("jsonwebtoken");
const { Format } = require("../../utils/format");

exports.registerUser = async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;
  try {
    const existing = await User.findOne({ where: { email } });
    if (existing)
      return res.status(400).json(Format.conflict(null, "User already exists"));
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = uuidv4().slice(0, 6);
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: role || "customer",
      verificationCode,
    });
    if (!user)
      return res
        .status(500)
        .json(Format.internalError("Failed to register user", error));
    await sendVerificationEmail(email, verificationCode);
    res.status(201).json(Format.response(201, "User registered successfully"));
  } catch (error) {
    res.status(500).json(Format.internalError("Internal server error", error));
  }
};

exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    console.log(user, "user");
    if (!user)
      return res.status(404).json(Format.notFound(null, "User not found"));
    if (user.role !== "admin") {
      return res
        .status(403)
        .json(
          Format.badRequest(null, "You are not allowed to login from here")
        );
    }
    if (!user.isVerified) {
      return res
        .status(403)
        .json(
          Format.badRequest(null, "Please verify your email before logging in")
        );
    }
    const match = bcrypt.compareSync(password, user.password);
    if (!match)
      return res
        .status(401)
        .json(Format.badRequest(null, "Incorrect password"));
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res
      .status(200)
      .json(
        Format.success({ user, token }, `${user.role} logged in successfully`)
      );
  } catch (error) {
    res.status(500).json(Format.internalError("Internal server error", error));
  }
};

exports.loginCustomer = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    console.log(user, "user");
    if (!user)
      return res.status(404).json(Format.notFound(null, "User not found"));
    if (user.role !== "customer") {
      return res
        .status(403)
        .json(
          Format.badRequest(null, "You are not allowed to login from here")
        );
    }
    if (!user.isVerified) {
      return res
        .status(403)
        .json(
          Format.badRequest(null, "Please verify your email before logging in")
        );
    }
    const match = bcrypt.compareSync(password, user.password);
    if (!match)
      return res
        .status(401)
        .json(Format.badRequest(null, "Incorrect password"));
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res
      .status(200)
      .json(
        Format.success({ user, token }, `${user.role} logged in successfully`)
      );
  } catch (error) {
    res.status(500).json(Format.internalError("Internal server error", error));
  }
};

exports.verifyUser = async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code)
    return res
      .status(400)
      .json(Format.badRequest(null, "Email and code are required"));
  const user = await User.findOne({ where: { email } });
  if (!user)
    return res.status(404).json(Format.notFound(null, "User not found"));
  if ((user.isVerified === true))
    return res
      .status(400)
      .json(Format.badRequest(null, "User already verified"));
  if (user.verificationCode !== code)
    return res
      .status(400)
      .json(Format.badRequest(null, "Incorrect verification code"));
  user.isVerified = true;
  user.verificationCode = null;
  await user.save();
  res.status(200).json(Format.response(200, "User verified successfully"));
};

exports.getUserFromId = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id, {
      attributes: { exclude: ["password", "verificationCode"] },
    });
    if (!user)
      return res.status(404).json(Format.notFound(null, "User not found"));
    res.status(200).json(Format.success(user, "User fetched successfully"));
  } catch (error) {
    res.status(500).json(Format.internalError("Internal server error", error));
  }
};
