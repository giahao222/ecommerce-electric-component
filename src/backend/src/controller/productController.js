const Product = require("../models/products");
const Categories = require("../models/categories");
const Tags = require("../models/tags");
const Colors = require("../models/colors");
const Sizes = require("../models/sizes");
const ProductDetails = require("../models/productdetails");
const multer = require("multer");
const cloudinary = require("../config/cloudinaryConfig");
const Review = require("../models/reviews");
const { ObjectId } = require('mongoose').Types;
const mongoose = require('mongoose');

const storage = multer.memoryStorage();

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
const get_all_attributes = async (req, res) => {
  try {
    // Lấy dữ liệu từ các bảng/tập collection khác nhau
    const categories = await Categories.find({});
    const tags = await Tags.find({});
    const sizes = await Sizes.find({});
    const colors = await Colors.find({});

    // Kiểm tra nếu có dữ liệu
    if (!categories && !tags && !sizes && !colors) {
      return res.status(404).json({ message: "Không tìm thấy thuộc tính nào" });
    }

    // Trả về tất cả các thuộc tính trong một đối tượng
    return res.status(200).json({
      message: "Lấy dữ liệu thuộc tính thành công",
      data: {
        categories,
        tags,
        sizes,
        colors,
      },
    });
  } catch (error) {
    console.error("Error fetching attributes:", error);
    return res.status(500).json({ message: "Lỗi khi lấy thuộc tính", error });
  }
};
const add_attribute = async (req, res) => {
  try {
    const { type, name } = req.body; // Lấy dữ liệu từ request

    let newAttribute;
    switch (type) {
      case 'category':
        newAttribute = new Categories({ name });
        break;
      case 'tag':
        newAttribute = new Tags({ name });
        break;
      case 'size':
        newAttribute = new Sizes({ name });
        break;
      case 'color':
        newAttribute = new Colors({ name });
        break;
      default:
        return res.status(400).json({ message: "Invalid attribute type" });
    }

    // Lưu thuộc tính vào cơ sở dữ liệu
    await newAttribute.save();
    
    return res.status(201).json({
      message: "Thêm thuộc tính thành công",
      data: newAttribute,
    });
  } catch (error) {
    console.error("Error adding attribute:", error);
    return res.status(500).json({ message: "Lỗi khi thêm thuộc tính", error });
  }
};
const update_attribute = async (req, res) => {
  try {
    const { id, type } = req.query; // Lấy ID, type và name từ request
    const {name} = req.body;
    let updatedAttribute;
    switch (type) {
      case 'category':
        updatedAttribute = await Categories.findByIdAndUpdate(id, { name }, { new: true });
        break;
      case 'tag':
        updatedAttribute = await Tags.findByIdAndUpdate(id, { name }, { new: true });
        break;
      case 'size':
        updatedAttribute = await Sizes.findByIdAndUpdate(id, { name }, { new: true });
        break;
      case 'color':
        updatedAttribute = await Colors.findByIdAndUpdate(id, { name }, { new: true });
        break;
      default:
        return res.status(400).json({ message: "Invalid attribute type" });
    }

    if (!updatedAttribute) {
      return res.status(404).json({ message: "Thuộc tính không tìm thấy" });
    }

    return res.status(200).json({
      message: "Cập nhật thuộc tính thành công",
      data: updatedAttribute,
    });
  } catch (error) {
    console.error("Error updating attribute:", error);
    return res.status(500).json({ message: "Lỗi khi cập nhật thuộc tính", error });
  }
};
const delete_attribute = async (req, res) => {
  try {
    const { id, type } = req.query; // Lấy ID và loại thuộc tính từ request

    let deletedAttribute;
    switch (type) {
      case 'category':
        deletedAttribute = await Categories.findByIdAndDelete(id);
        break;
      case 'tag':
        deletedAttribute = await Tags.findByIdAndDelete(id);
        break;
      case 'size':
        deletedAttribute = await Sizes.findByIdAndDelete(id);
        break;
      case 'color':
        deletedAttribute = await Colors.findByIdAndDelete(id);
        break;
      default:
        return res.status(400).json({ message: "Invalid attribute type" });
    }

    if (!deletedAttribute) {
      return res.status(404).json({ message: "Thuộc tính không tìm thấy" });
    }

    return res.status(200).json({
      message: "Xóa thuộc tính thành công",
      data: deletedAttribute,
    });
  } catch (error) {
    console.error("Error deleting attribute:", error);
    return res.status(500).json({ message: "Lỗi khi xóa thuộc tính", error });
  }
};

const get_all_products = async (req, res) => {
  try {
    // Lấy tất cả sản phẩm
    const products = await Product.find();

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    // Lấy chi tiết sản phẩm tương ứng với mỗi sản phẩm
    const productDetails = await Promise.all(
      products.map(async (product) => {
        const productDetail = await ProductDetails.findOne({
          ID_product: product._id,
        });
        return {
          product: product,
          product_detail: productDetail,
        };
      })
    );

    res.status(200).json({
      message: "Lấy dữ liệu thành công !",
      data: productDetails,
    });
  } catch (error) {
    console.error("Error getting products and product details:", error);
    res.status(500).json({ message: "Có lỗi khi lấy dữ liệu" });
  }
};

const get_newest_products = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).limit(8);

    if (products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    res
      .status(200)
      .json({ message: "Lấy sản phẩm mới nhất thành công!", products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({
      message: "Có lỗi xảy ra khi lấy sản phẩm",
      error: error.message,
    });
  }
};

const add_product = async (req, res) => {
  try {
    // if (!req.file) {
    //   return res.status(400).json({ error: "Image file not provided" });
    // }

    // console.log("File received:", req.file);

    // const link_image = await upload_img(req.file.buffer);
    const { category, tag, sizes, colors } = req.body;
    console.log(req.body);
    const isValidObjectId = (id) => ObjectId.isValid(id);
    const categoryIds = category.split(',').filter(isValidObjectId).map(id => new ObjectId(id.trim()));
    const tagIds = tag.split(',').filter(isValidObjectId).map(id => new ObjectId(id.trim()));
    const sizeIds = sizes.split(',').filter(isValidObjectId).map(id => new ObjectId(id.trim()));
    const colorIds = colors.split(',').filter(isValidObjectId).map(id => new ObjectId(id.trim()));
    const product = new Product({
      product_name: req.body.product_name,
      price_new: req.body.price_new,
      price_old: req.body.price_old,
      description: req.body.description,
      image: "",
      star: 0,
      information: req.body.information,
      sku: req.body.sku,
    });
    await product.save();

    const product_details = new ProductDetails({
      ID_product: product._id,
      ID_tag: tagIds,
      ID_category: categoryIds,
      ID_color: colorIds,
      ID_size: sizeIds,
      quantity: req.body.quantity,
    });
    await product_details.save();

    res.status(201).json({ message: "Product added successfully", product });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: "Failed to add product" });
  }
};

const delete_product_by_id = async (req, res) => {
  try {
    const product_id = req.query.id;
    const product = await Product.findOne({ _id: product_id });
    const productDetails = await ProductDetails.findOne({
      ID_product: product_id,
    });

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    if (product.image) {
      const imagePublicId = product.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imagePublicId);
    }

    await ProductDetails.deleteOne({ ID_product: product_id });
    await Product.deleteOne({ _id: product_id });

    res.status(200).json({ message: "Xóa sản phẩm thành công" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({ message: "Lỗi không thể xóa sản phẩm" });
  }
};

// const get_product_by_id = async (req, res) => {
//   try {
//     const product_id = req.query.id;
//     const product = await Product.findOne({ _id: product_id });

//     if (!product) {
//       return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
//     }

//     const product_details_need = await ProductDetails.findOne({
//       ID_product: product._id,
//     });

//     if (!product_details_need) {
//       return res
//         .status(404)
//         .json({ message: "Không tìm thấy chi tiết sản phẩm" });
//     }

//     const sizeIds = [product_details_need.ID_size];
//     const colorIds = [product_details_need.ID_color];

//     const sizes = await Size.find({ _id: { $in: sizeIds } });
//     const colors = await Colors.find({ _id: { $in: colorIds } });

//     const product_details = {
//       ID_product: product_details_need.ID_product,
//       size: sizes,
//       color: colors,
//     };

//     return res.status(200).json({
//       message: "Đã lấy được dữ liệu",
//       data: {
//         product,
//         product_details,
//       },
//     });
//   } catch (error) {
//     console.error("Error getting product:", error);
//     return res.status(500).json({ message: "Lỗi không thể tìm sản phẩm" });
//   }
// };
const get_product_by_id = async (req, res) => {
  try {
    const product_id = req.query.id;
    const product = await Product.findOne({ _id: product_id });
    const product_details = await ProductDetails.findOne({ ID_product: product_id })
      .populate('ID_category', 'name') // Lấy tên category
      .populate('ID_color', 'name') // Lấy tên color
      .populate('ID_size', 'name') // Lấy tên size
      .populate('ID_tag', 'name');
    if (!product && product_details) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
    return res.status(200).json({
      message: "Đã lấy được dữ liệu",
      data: { product, product_details },// da fix
    });
  } catch (error) {
    console.error("Error getting product:", error);
    return res.status(500).json({ message: "Lỗi không thể tìm sản phẩm" });
  }
};


const put_product_by_id = async (req, res) => {
  try {
    const product_id = req.query.id;
    const product = await Product.findOne({ _id: product_id });
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
    let productDetails = await ProductDetails.findOne({
      ID_product: product_id,
    });
    if (!productDetails) {
      productDetails = new ProductDetails({
        ID_product: product_id,
        ID_tag: [],
        ID_category: [],
        ID_color: [],
        ID_size: [],
        quantity: 0,
      });
    }
   
    const {
      product_name,
      price_new,
      price_old,
      description,
      information,
      category,
      colors,
      sizes,
      tag,
      quantity,
      sku,
    } = req.body;
    // Parse the category, tag, sizes, and colors fields from string to actual arrays
    const categoryArray = JSON.parse(category || '[]');
    const tagArray = JSON.parse(tag || '[]');
    const sizeArray = JSON.parse(sizes || '[]');
    const colorArray = JSON.parse(colors || '[]');
    const isValidObjectId = (id) => ObjectId.isValid(id);
    // Filter and map the parsed arrays to ObjectId
    const categoryIds = categoryArray.filter(isValidObjectId).map(id => new mongoose.Types.ObjectId(id.trim()));
    const tagIds = tagArray.filter(isValidObjectId).map(id => new mongoose.Types.ObjectId(id.trim()));
    const sizeIds = sizeArray.filter(isValidObjectId).map(id => new mongoose.Types.ObjectId(id.trim()));
    const colorIds = colorArray.filter(isValidObjectId).map(id => new mongoose.Types.ObjectId(id.trim()));
     // Loại bỏ phần tử trùng lặp trong mảng
     const removeDuplicates = (array) => [...new Set(array.map(id => id.toString()))].map(id => new mongoose.Types.ObjectId(id));

     // Loại bỏ trùng lặp
     const uniqueCategoryIds = removeDuplicates(categoryIds);
     const uniqueTagIds = removeDuplicates(tagIds);
     const uniqueSizeIds = removeDuplicates(sizeIds);
     const uniqueColorIds = removeDuplicates(colorIds);
    let link_image = product.image;
    if (req.file) {
      const oldImagePublicId = product.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(oldImagePublicId);
      link_image = await upload_img(req.file.buffer);
    }

    // Cập nhật sản phẩm
    product.product_name = product_name || product.product_name;
    product.price_new = price_new || product.price_new;
    product.price_old = price_old || product.price_old;
    product.description = description || product.description;
    product.information = information || product.information;
    product.image = link_image;
    product.sku = sku;
    await product.save();
    // Cập nhật chi tiết sản phẩm
    productDetails.ID_tag = uniqueTagIds;
    productDetails.ID_category = uniqueCategoryIds;
    productDetails.ID_color = uniqueColorIds;
    productDetails.ID_size = uniqueSizeIds;
    productDetails.quantity = quantity || productDetails.quantity;

    await productDetails.save();

    return res.status(200).json({ message: "Cập nhật thành công", data: product });
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({ message: "Lỗi không thể cập nhật sản phẩm" });
  }
};


const searchProduct = async (req, res) => {
  try {
    const { searchInformation } = req.body;

    // Tạo đối tượng điều kiện tìm kiếm (search criteria)
    const searchCriteria = {};

    // Kiểm tra và thêm các điều kiện vào searchCriteria nếu có
    if (searchInformation) {
      searchCriteria.$or = []; // Sử dụng $or để tìm kiếm ở nhiều trường

      searchCriteria.$or.push({
        product_name: { $regex: searchInformation, $options: "i" },
      });

      searchCriteria.$or.push({
        description: { $regex: searchInformation, $options: "i" },
      });

      searchCriteria.$or.push({
        information: { $regex: searchInformation, $options: "i" },
      });

      searchCriteria.$or.push({
        sku: { $regex: searchInformation, $options: "i" },
      });
    }

    // Tìm kiếm sản phẩm theo các tiêu chí đã cho
    const products = await Product.find(searchCriteria);

    if (products.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found matching the search criteria" });
    }

    return res.status(200).json({
      message: "Search successful",
      data: products,
    });
  } catch (error) {
    console.error("Error searching products:", error);
    return res.status(500).json({
      message: "Error searching products",
    });
  }
};

module.exports = {
  add_product,
  get_all_attributes,
  add_attribute,
  update_attribute,
  delete_attribute,
  get_all_products,
  get_newest_products,
  delete_product_by_id,
  get_product_by_id,
  put_product_by_id,
  searchProduct,
};
