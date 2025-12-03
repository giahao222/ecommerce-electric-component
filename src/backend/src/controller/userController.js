const User = require("../models/users");
const cloudinary = require("../config/cloudinaryConfig");
const Role = require("../models/roles");
const bcrypt = require("bcrypt");

const userBaseResponse = (user) => {
  return {
    id: user._id,
    name: user.full_name,
    email: user.email,
    role: user.id_roles,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

function upload_img(imgBuffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream((error, result) => {
      if (error) {
        console.error("Cloudinary upload error:", error);
        reject(error);
      } else {
        console.log("Cloudinary upload successful:", result);
        resolve(result.url); // Trả về URL hình ảnh
      }
    });
    stream.end(imgBuffer); // Truyền buffer ảnh vào stream
  });
}

const get_all_users_information = async (req, res) => {
  try {
    const users = await User.find().populate("id_roles");
    if (!users || users.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy người dùng nào",
      });
    }
    const userResponse = users.map((user) => {
      return {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        role: user.id_roles ? user.id_roles.name : "N/A",
        active: user.active,
        image: user.image || null,
      };
    });

    return res.status(200).json({
      message: "Đã lấy danh sách thành công!",
      data: userResponse,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      message: "Có lỗi xảy ra khi lấy danh sách người dùng!",
    });
  }
};

const lock_user_by_id = async (req, res) => {
  try {
    const id = req.query.id;
    const user = await User.findOne({ _id: id });
    if (!user) {
      return res.status(404).json({
        message: "Không tìm thấy người dùng",
      });
    }
    user.active = false;
    await user.save();
    return res.status(200).json({ message: "Thay đổi thành công" });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi không thể lock active user" });
  }
};

const unlock_user_by_id = async (req, res) => {
  try {
    const id = req.query.id;
    const user = await User.findOne({ _id: id });
    if (!user) {
      return res.status(404).json({
        message: "Không tìm thấy người dùng",
      });
    }
    user.active = true;
    await user.save();
    return res.status(200).json({ message: "Thay đổi thành công" });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi không thể lock active user" });
  }
};

const upload_picture_user_by_id = async (req, res) => {
  try {
    const { email, full_name } = req.body; // Nhận thêm full_name từ body
    const file = req.file;

    if (!email || !file) {
      return res
        .status(400)
        .json({ message: "Email hoặc file ảnh không được cung cấp." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user!" });
    }

    // Xóa ảnh cũ nếu tồn tại
    if (user.image) {
      const imagePublicId = user.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imagePublicId);
    }

    // Upload ảnh mới
    const newLinkUrl = await upload_img(file.buffer);
    user.image = newLinkUrl;

    // Cập nhật tên nếu full_name được cung cấp
    if (full_name) {
      user.full_name = full_name;
    }

    await user.save();

    return res.status(200).json({
      message: "Đã cập nhật thành công!",
      userImage: user.image,
      fullName: user.full_name, // Trả về full_name đã cập nhật
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Lỗi không thể upload ảnh hoặc cập nhật tên." });
  }
};

const get_user_by_id = async (req, res) => {
  try {
    const id = req.user;
    const user = await User.findOne({ _id: id });
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    const user_information = {
      name: user.full_name,
      email: user.email,
      image: user.image,
    };
    return res.status(200).json({
      message: "Đã lấy được thông tin",
      userInformation: user_information,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Lỗi không thể tìm thấy user!" });
  }
};

const changes_for_admin = async (req, res) => {
  try {
    const id = req.user._id;
    const password = req.body;
    const user = await User.findOne({ _id: id });
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    const hashedPassword = await bcrypt.hash(password.password, 10);
    user.password = hashedPassword;
    await user.save();
    return res.status(200).json({
      message: "Đã cập nhật thành công!",
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      message: "Lỗi không thể cập nhật thông tin admin",
    });
  }
};

const get_user_profile = async (req, res) => {
  try {
    const userId = req.user._id; // lấy từ token

    const user = await User.findById(userId).populate("id_roles");

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user!" });
    }

    return res.status(200).json({
      message: "Lấy thông tin thành công!",
      data: {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number || "",
        address: user.address || "",
        createdAt: user.createdAt,
        role: user.id_roles ? user.id_roles.name : "User",
        image: user.image || "",
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Lỗi server!" });
  }
};

const update_user_profile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { full_name, phone_number, address } = req.body;
    const file = req.file; // avatar

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user!" });
    }

    // Nếu có upload ảnh
    if (file) {
      // Xoá ảnh cũ
      if (user.image) {
        const publicId = user.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }

      const newImageUrl = await upload_img(file.buffer);
      user.image = newImageUrl;
    }

    // Update thông tin text
    if (full_name) user.full_name = full_name;
    if (phone_number) user.phone_number = phone_number;
    if (address) user.address = address;

    await user.save();

    return res.status(200).json({
      message: "Cập nhật thông tin thành công!",
      data: {
        full_name: user.full_name,
        phone_number: user.phone_number,
        address: user.address,
        image: user.image,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Không thể cập nhật hồ sơ!" });
  }
};


module.exports = {
  get_all_users_information,
  lock_user_by_id,
  unlock_user_by_id,
  upload_picture_user_by_id,
  get_user_by_id,
  changes_for_admin,
  update_user_profile,
  get_user_profile,
  
};
