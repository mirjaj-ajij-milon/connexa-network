import User from "../models/userSchema.js";
import bcrypt from "bcrypt";
import Profile from "../models/profileSchema.js";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import fs from "fs";
import ConnectionRequest from "../models/connectionSchema.js";

// const convertUserDataToPdf = async (userData) => {
//   const doc = new PDFDocument();
//   const outputPath = crypto.randomBytes(32).toString("hex") + ".pdf";
//   const stream = fs.createWriteStream("uploads/" + outputPath);

//   doc.pipe(stream);

//   doc.image(`uploads/${userData.userId.profilePicture}`, {
//     align: "center",
//     width: 100,
//   });
//   doc.fontSize(14).text(`Name: ${userData.userId.name}`);
//   doc.fontSize(14).text(`Username: ${userData.userId.username}`);
//   doc.fontSize(14).text(`Email: ${userData.userId.email}`);
//   doc.fontSize(14).text(`Bio: ${userData.bio}`);
//   doc.fontSize(14).text(`Current Possition: ${userData.currentPost}`);

//   doc.fontSize(14).text(`Past Works:`);
//   userData.pastWork.forEach((work, index) => {
//     doc.fontSize(14).text(`Company Name: ${work.company}`);
//     doc.fontSize(14).text(`Possition: ${work.position}`);
//     doc.fontSize(14).text(`Years: ${work.years}`);
//   });

//   doc.end();

//   return outputPath;
// };

const convertUserDataToPdf = async (userData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const outputPath = crypto.randomBytes(32).toString("hex") + ".pdf";
      const stream = fs.createWriteStream("uploads/" + outputPath);
      doc.pipe(stream);

      if (
        userData?.userId?.profilePicture &&
        fs.existsSync(`uploads/${userData.userId.profilePicture}`)
      ) {
        doc.image(`uploads/${userData.userId.profilePicture}`, {
          width: 100,
          align: "center",
        });
      }

      doc.moveDown();
      doc.fontSize(16).text(`Name: ${userData?.userId?.name || "N/A"}`);
      doc.fontSize(14).text(`Username: ${userData?.userId?.username || "N/A"}`);
      doc.fontSize(14).text(`Email: ${userData?.userId?.email || "N/A"}`);
      doc.moveDown();

      doc.fontSize(14).text(`Bio: ${userData?.bio || "N/A"}`);
      doc
        .fontSize(14)
        .text(`Current Position: ${userData?.currentPost || "N/A"}`);
      doc.moveDown();

      if (userData?.pastWork?.length > 0) {
        doc.fontSize(14).text("Past Works:");
        userData.pastWork.forEach((work) => {
          doc.text(`• Company: ${work.company}`);
          doc.text(`  Position: ${work.position}`);
          doc.text(`  Years: ${work.years} experiance`);
          doc.moveDown(0.5);
        });
      }

      doc.end();

      stream.on("finish", () => resolve(outputPath));
      stream.on("error", (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, username } = req.body;

    if (!name || !email || !password || !username) {
      return res.status(400).json({ message: "all feilds are required!" });
    }

    const existUser = await User.findOne({
      email,
    });

    if (existUser) {
      return res.status(400).json({ message: "User already exists!" });
    }

    const hashedPass = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPass,
      username,
    });

    await newUser.save();
    const profile = new Profile({ userId: newUser._id });

    await profile.save();

    return res.status(200).json({ message: "User registered successfull!" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Please provide a valid email!" });
    }
    if (!password) {
      return res
        .status(400)
        .json({ message: "Please provide a valid password!" });
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res
        .status(404)
        .json({ message: "User not found for given email!" });
    }

    const match = await bcrypt.compare(password, existingUser.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid email and password!" });
    }

    const token = crypto.randomBytes(34).toString("hex");

    await User.updateOne({ _id: existingUser._id }, { token });

    return res.status(200).json({
      message: "Login successful!",
      user: {
        _id: existingUser._id,
        email: existingUser.email,
        name: existingUser.name,
      },
      token,
    });
  } catch (error) {
    console.error(`Error while Login: ${error.message}`);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const uploadProfilePicture = async (req, res) => {
  const { token } = req.body;

  try {
    const user = await User.findOne({ token: token });
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded!" });
    }

    user.profilePicture = req.file.filename;

    await user.save();
    return res.status(200).json({
      message: "Profile picture uploaded successfully!",
      file: req.file,
      profilePictureUrl: `/uploads/${req.file.filename}`, // optional
    });
  } catch (error) {
    console.error("Upload Error:", error.message);
    res
      .status(500)
      .json({ message: "File upload failed", error: error.message });
  }
};

export const updateUserProfille = async (req, res) => {
  const { token, ...newUserData } = req.body;
  try {
    const user = User.findOne({ token: token });
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const { email, username } = newUserData;
    const existingUser = User.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
      if (existingUser || String(existingUser._id) !== String(user._id)) {
        return res.status(404).json({ message: "user already exist!" });
      }
    }

    Object.assign(user, newUserData);

    await user.save();

    return res.status(200).json({ message: "User Updated!" });
  } catch (error) {
    console.error("Profile update Error:", error.message);
    res
      .status(500)
      .json({ message: "Profile update failed", error: error.message });
  }
};

export const getUserAndProfile = async (req, res) => {
  try {
    const { token } = req.body;

    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name email username profilePicture"
    );

    // await userProfile.save();
    return res.status(200).json(userProfile);
  } catch (error) {
    console.error("Error in getUserAndProfile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateProfileData = async (req, res) => {
  try {
    const { token, ...newProfileData } = req.body; //newProfileData is take all JSON Data

    const userProfile = await User.findOne({ token: token });

    if (!userProfile) {
      return res.status(404).json({ message: "User not found" });
    }

    const profile_to_update = await Profile.findOne({
      userId: userProfile._id,
    });

    Object.assign(profile_to_update, newProfileData);

    await profile_to_update.save();

    return res.status(200).json({
      message: "Profile Updated!",
      profile_to_update: profile_to_update,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllUserProfile = async (req, res) => {
  try {
    const profiles = await Profile.find().populate(
      "userId",
      "name username profilePicture"
    );
    return res.json({ profiles });
  } catch (error) {
    console.log(`Error to get all userprofiledata ${error.message}`);
    return res.status(500).json({ message: error.message });
  }
};

export const downloadProfile = async (req, res) => {
  try {
    const user_id = req.query.id;

    const userProfile = await Profile.findOne({ userId: user_id }).populate(
      "userId",
      "name username email profilePicture"
    );

    let outputPath = await convertUserDataToPdf(userProfile);

    return res
      .status(200)
      .json({ message: "user data to pdf successfull", Result: outputPath });
  } catch (error) {
    console.log(`Error downloading resume: ${error.message}`);
    return res.status(500).json({ message: error.message });
  }
};

export const sendConnectionRequest = async (req, res) => {
  const { token, connectionId } = req.body;
  try {
    const user = await User.findOne({ token: token });

    if (!user) {
      res.status(404).json({ message: "User not found!" });
    }

    const connectionUser = await User.findOne({ _id: connectionId });

    if (!connectionUser) {
      req.status(404).json({ message: "connection user not found!" });
    }

    const existingRequest = await ConnectionRequest.findOne({
      userId: user._id,
      connectionId: connectionUser._id,
    });

    if (existingRequest) {
      res.status(400).json({ message: "Request already exist!" });
    }

    const newConnectionRequest = new ConnectionRequest({
      userId: user._id,
      connectionId: connectionUser._id,
    });

    await newConnectionRequest.save();

    res.status(200).json({ message: "Request send...." });
  } catch (error) {
    console.log(`Error sending to connection request...! ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

export const getMyConnectionRequest = async (req, res) => {
  const { token } = req.body;
  try {
    const user = await User.findOne({ token: token });

    if (!user) {
      res.status(404).json({ message: "User not found..!" });
    }

    const connections = await ConnectionRequest.findOne({
      userId: user._id,
    }).populate("connectionId", "name username email profilePicture");

    res.json({ connections });
  } catch (error) {
    console.log(`error to get my connection request : ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

export const whatAreMyConnection = async (req, res) => {
  const { token } = req.body;
  try {
    const user = await User.findOne({ token: token });
    if (!user) {
      res.status(404).json({ message: "User not found..!" });
    }

    const connections = ConnectionRequest.find({
      connectionId: user._id,
    }).populate("userId", "name username email profilePicture");
    return res.json(connections);
  } catch (error) {
    console.log(`error to get what Are My Connection : ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

export const acceptConnectionRequest = async (req, res) => {
  const { token, requestId, action_type } = req.body;
  try {
    const user = await User.findOne({ token: token });
    if (!user) {
      res.status(404).json({ message: "User not found..!" });
    }

    const connection = await ConnectionRequest.findOne({ _id: requestId });

    if (!connection) {
      res.status(404).json({ message: "Connection Not found..!" });
    }

    if (action_type === "accept") {
      connection.status_accepted = true;
    } else {
      connection.status_accepted = false;
    }

    await connection.save();
    return res.status(200).json({ message: "Request Updated..!" });
  } catch (error) {
    console.log(`error to accepting Connection request : ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};
