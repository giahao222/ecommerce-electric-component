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
    const card_for_user = await Card.findOne({ id_user: user_id }).populate({
      path: "products.ID_product",
      select: "product_name",
    });
    if (!card_for_user) {
      return res.status(200).json({
        message: "Giỏ hàng đang trống",
        data: "",
      });
    }
    return res.status(200).json({
      message: "Lấy thông tin giỏ hàng thành công",
      data: CardBasReponse(card_for_user),
    });
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Lỗi không load được giỏ người của khách hàng" });
  }
};

const add_product_to_cart = async (req, res) => {
  try {
    const user_id = req.user._id; // Lấy ID người dùng từ token
    const dataProduct = req.body; // Dữ liệu sản phẩm gửi lên
    const productss = await Product.findById(dataProduct.ID_product);
    // Tìm giỏ hàng của người dùng
    let card_for_user = await Card.findOne({ id_user: user_id });

    if (!card_for_user) {
      // Nếu không có giỏ hàng, tạo mới
      const new_card = new Card({
        id_user: user_id,
        products: [
          {
            ID_product: productss._id, // Chuyển đổi ID thành ObjectId
            size_name: dataProduct.size_name,
            color_name: dataProduct.color_name,
            price: dataProduct.price,
            quantity: dataProduct.quantity,
          },
        ],
        total: dataProduct.price * dataProduct.quantity, // Cập nhật tổng giá trị
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
          product.size_name === dataProduct.size_name &&
          product.color_name === dataProduct.color_name
        ) {
          // Cập nhật số lượng nếu sản phẩm đã tồn tại
          product.quantity += dataProduct.quantity; // Cộng thêm số lượng
          productExists = true;
          break; // Thoát khỏi vòng lặp sau khi tìm thấy sản phẩm
        }
      }

      // Nếu sản phẩm không tồn tại trong giỏ, thêm sản phẩm mới vào giỏ
      if (!productExists) {
        card_for_user.products.push({
          ID_product: productss._id,
          size_name: dataProduct.size_name,
          color_name: dataProduct.color_name,
          price: dataProduct.price,
          quantity: dataProduct.quantity,
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
    const product_id = req.body;
    
    // Tìm giỏ hàng của người dùng
    const find_card = await Card.findOne({ id_user: user_id });
    console.log(find_card);
    if (!find_card) {
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng!" });
    }

    // Tìm sản phẩm để xóa
    const productIndex = 0;
    for (let i = 0; i < find_card.products.length; i++) {
      if (find_card.products[i].ID_product == product_id) {
        productIndex = i;
        break;
      }
    }

    if (productIndex === -1) {
      return res
        .status(404)
        .json({ message: "Sản phẩm không có trong giỏ hàng!" });
    }

    const quantityToDelete = find_card.products[productIndex].quantity;
    const price_product_delete =
      find_card.products[productIndex].price * quantityToDelete;

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
