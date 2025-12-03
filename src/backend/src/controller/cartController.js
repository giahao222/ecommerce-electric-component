const Card = require("../models/cards");
const { find } = require("../models/roles");
const User = require("../models/users");
const Product = require("../models/products");
const mongoose = require("mongoose");

const CardBasReponse = (card) => {
  return {
    _id: card._id,
    product: card.products,
    total: card.total,
  };
};
const get_card_for_user = async (req, res) => {
  try {
    const user_id = req.user._id;

    // Lấy giỏ hàng + populate đầy đủ (product_name + image)
    const card_for_user = await Card.findOne({ id_user: user_id }).populate({
      path: "products.ID_product",
      select: "product_name thumbnail", 
    });

    if (!card_for_user) {
      return res.status(200).json({
        message: "Giỏ hàng đang trống",
        data: "",
      });
    }

    return res.status(200).json({
      message: "Lấy thông tin giỏ hàng thành công",
      data: {
        _id: card_for_user._id,
        products: card_for_user.products,  // ← đúng dữ liệu
        total: card_for_user.total,
      },
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Lỗi không load được giỏ người của khách hàng",
    });
  }
};
const add_product_to_cart = async (req, res) => {
  try {
    console.log("user id");
    const user_id = req.user._id; 
    console.log("user id", user_id); // Lấy ID người dùng từ token
    const dataProduct = req.body; // Dữ liệu sản phẩm gửi lên
    const productss = await Product.findById(dataProduct.ID_product);
    console.log("user id", user_id);
    // Tìm giỏ hàng của người dùng
    let card_for_user = await Card.findOne({ id_user: user_id });

    if (!card_for_user) {
      console.log("card_for_user");

      console.log(productss._id);
      console.log(productss.product_name);
      console.log(productss.brand);
      console.log(productss.price_new);
      console.log(dataProduct.quantity);
      console.log("price_new:", productss.price_new, typeof productss.price_new);
      console.log("quantity:", dataProduct.quantity, typeof dataProduct.quantity);
      console.log("CALC:", productss.price_new * dataProduct.quantity);
      const price = Number(productss.price_new);
      const quantity = Number(dataProduct.quantity);
      // Nếu không có giỏ hàng, tạo mới
      const new_card = new Card({
        id_user: user_id,
        products: [
          {
            ID_product: productss._id, // Chuyển đổi ID thành ObjectId
            size_name: productss.product_name,
            color_name: productss.brand,
           price: price,
          quantity: quantity,
          },
        ],
        total: price * quantity,// Cập nhật tổng giá trị
        
      });

      await new_card.save();
      return res.status(200).json({
        message: "Thêm sản phẩm vào giỏ hàng thành công!",
        data: new_card,
      });
    } else {
      // Nếu giỏ hàng đã tồn tại
      let productExists = false;

      // Duyệt qua các sản phẩm trong giỏ hàng của người dùng
      for (let i = 0; i < card_for_user.products.length; i++) {
        const product = card_for_user.products[i];
        // Kiểm tra nếu sản phẩm đã tồn tại trong giỏ (cùng ID, màu sắc và kích thước)
        if (
          product.ID_product.equals(productss._id)&&
          product.size_name === productss.product_name &&
          product.color_name === productss.brand
        ) {
          // Cập nhật số lượng nếu sản phẩm đã tồn tại
          product.quantity += dataProduct.quantity; // Cộng thêm số lượng
          productExists = true;
          break; // Thoát khỏi vòng lặp sau khi tìm thấy sản phẩm
        }
      }

      // Nếu sản phẩm không tồn tại trong giỏ, thêm sản phẩm mới vào giỏ
      if (!productExists) {
        const price = Number(productss.price_new);
        const quantity = Number(dataProduct.quantity);
        card_for_user.products.push({
          ID_product: productss._id,
          size_name: productss.product_name,
          color_name: productss.brand,
          price: price,
          quantity: quantity,
        });
      }

      // Cập nhật tổng giá trị của giỏ hàng
      card_for_user.total = card_for_user.products.reduce((sum, product) => {
        return sum + product.price * product.quantity;
      }, 0);

      await card_for_user.save();
      return res.status(200).json({
        message: "Cập nhật giỏ hàng thành công!",
        data: card_for_user,
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Lỗi thêm sản phẩm vào giỏ hàng!",
    });
  }
};

const update_cart_quantity = async (req, res) => {
  try {
    const user_id = req.user._id; // Lấy ID người dùng từ token
    const updates = req.body; // Dữ liệu cập nhật: [{ _id, quantity }]
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        message: "Dữ liệu không hợp lệ!",
      });
    }

    // Tìm giỏ hàng của người dùng
    const cart = await Card.findOne({ id_user: user_id });

    if (!cart) {
      return res.status(404).json({
        message: "Giỏ hàng không tồn tại!",
      });
    }

    // Cập nhật số lượng các sản phẩm trong giỏ
    updates.forEach(({ _id, quantity }) => {
      const product = cart.products.find(
        (item) => item.ID_product.toString() === _id
      );

      if (product) {
        product.quantity = quantity; // Cập nhật số lượng
      }
    });

    // Tính lại tổng giá trị giỏ hàng
    cart.total = cart.products.reduce(
      (sum, product) => sum + product.price * product.quantity,
      0
    );

    await cart.save();

    return res.status(200).json({
      message: "Cập nhật giỏ hàng thành công!",
      data: cart,
    });
  } catch (error) {
    console.error("Error updating cart quantity:", error.message);
    return res.status(500).json({
      message: "Lỗi cập nhật giỏ hàng!",
    });
  }
};



const delete_product_in_cart = async (req, res) => {
  try {
    const user_id = req.user._id;
    const { product_id } = req.body;  // nhận đúng JSON

    const find_card = await Card.findOne({ id_user: user_id });

    if (!find_card) {
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng!" });
    }

    // Tìm index sản phẩm đúng
    const productIndex = find_card.products.findIndex(
      (p) => p.ID_product.toString() === product_id
    );

    if (productIndex === -1) {
      return res
        .status(404)
        .json({ message: "Sản phẩm không có trong giỏ hàng!" });
    }

    const deletedProduct = find_card.products[productIndex];
    const price_product_delete =
      deletedProduct.price * deletedProduct.quantity;

    find_card.products.splice(productIndex, 1);

    find_card.total -= price_product_delete;

    await find_card.save();

    return res.status(200).json({
      message: "Sản phẩm đã được xóa khỏi giỏ hàng",
      price_product_delete,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "Lỗi xóa sản phẩm trong giỏ hàng",
    });
  }
};

module.exports = {
  get_card_for_user,
  add_product_to_cart,
  update_cart_quantity,
  delete_product_in_cart,
};
