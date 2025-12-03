const moment = require('moment');
const vnpayConfig = require('../config/vnpay.config');
const vnpayUtils = require('../utils/vnpay.utils');

class PaymentController {
  // Hiển thị trang thanh toán
  showPaymentPage(req, res) {
    res.render('payment/index', {
      title: 'Thanh toán VNPay'
    });
  }



    createPayment(req, res) {
    try {
        process.env.TZ = 'Asia/Ho_Chi_Minh';
        
        const { amount, orderDescription, orderType, language, bankCode } = req.body;
        
        // Validate
        if (!amount || !orderDescription) {
        return res.status(400).json({
            success: false,
            message: 'Vui lòng điền đầy đủ thông tin'
        });
        }

        const date = new Date();
        const createDate = moment(date).format('YYYYMMDDHHmmss');
        const orderId = moment(date).format('DDHHmmss');
        
        // Lấy IP address
        let ipAddr = req.headers['x-forwarded-for'] ||
                    req.connection.remoteAddress ||
                    req.socket.remoteAddress ||
                    req.connection.socket.remoteAddress;

        // Xử lý IPv6 localhost
        if (ipAddr === '::1' || ipAddr === '::ffff:127.0.0.1') {
        ipAddr = '127.0.0.1';
        }

        // Tạo params (KHÔNG CÓ vnp_SecureHash)
        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = vnpayConfig.vnp_TmnCode;
        vnp_Params['vnp_Locale'] = language || 'vn';
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = orderDescription;
        vnp_Params['vnp_OrderType'] = orderType || 'other';
        vnp_Params['vnp_Amount'] = parseInt(amount) * 100;
        vnp_Params['vnp_ReturnUrl'] = vnpayConfig.vnp_ReturnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;
        
        if (bankCode && bankCode !== '') {
        vnp_Params['vnp_BankCode'] = bankCode;
        }

        vnp_Params = sortObject(vnp_Params);

        const querystring = require('qs');
        const signData = querystring.stringify(vnp_Params, { encode: false });
        const crypto = require("crypto");     
        const hmac = crypto.createHmac("sha512", vnpayConfig.vnp_HashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex"); 
        
        // Thêm chữ ký vào params
        vnp_Params['vnp_SecureHash'] = signed;
        
        // Tạo URL
        const vnpUrl = vnpayConfig.vnp_Url + '?' + 
                    querystring.stringify(vnp_Params, { encode: false });

        console.log('Payment URL:', vnpUrl);
        
        res.json({
        success: true,
        paymentUrl: vnpUrl
        });

    } catch (error) {
        console.error('Create payment error:', error);
        res.status(500).json({
        success: false,
        message: 'Có lỗi xảy ra khi tạo thanh toán'
        });
    }
    }

    

  
  // Xử lý return từ VNPay
  // vnpayReturn(req, res) {
  //   let vnp_Params = req.query;
  //   const secureHash = vnp_Params['vnp_SecureHash'];

  //   console.log('===== DEBUG RETURN =====');
  //   console.log('1. Params nhận được:', vnp_Params);
  //   console.log('2. SecureHash từ VNPay:', secureHash);

  //   delete vnp_Params['vnp_SecureHash'];
  //   delete vnp_Params['vnp_SecureHashType'];

  //   // Sắp xếp params
  //   const sortedParams = sortObject(vnp_Params);
  //   console.log('3. Params đã sắp xếp:', sortedParams);
    
  //   const querystring = require('qs');
  //   const signData = querystring.stringify(sortedParams, { encode: false });
  //   console.log('4. SignData:', signData);
    
  //   const crypto = require("crypto");
  //   const hmac = crypto.createHmac("sha512", vnpayConfig.vnp_HashSecret);
  //   const checkSum = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
  //   console.log('5. CheckSum tính được:', checkSum);
  //   console.log('6. Secret Key:', vnpayConfig.vnp_HashSecret);

  //   const isValidSignature = secureHash === checkSum;
  //   console.log('7. Chữ ký hợp lệ?', isValidSignature);
  //   console.log('========================');

  //   const responseCode = vnp_Params['vnp_ResponseCode'];

  //   res.render('payment/return', {
  //     title: 'Kết quả thanh toán',
  //     isValidSignature: isValidSignature,
  //     responseCode: responseCode,
  //     amount: vnp_Params['vnp_Amount'] / 100,
  //     orderInfo: vnp_Params['vnp_OrderInfo'],
  //     transactionNo: vnp_Params['vnp_TransactionNo'],
  //     txnRef: vnp_Params['vnp_TxnRef'],
  //     bankCode: vnp_Params['vnp_BankCode'],
  //     payDate: vnp_Params['vnp_PayDate']
  //   });
  // }
  async vnpayReturn(req, res) {
  try {
    let vnp_Params = { ...req.query };
    const secureHash = vnp_Params.vnp_SecureHash;

    // Xóa 2 field không dùng để verify
    delete vnp_Params.vnp_SecureHash;
    delete vnp_Params.vnp_SecureHashType;

    // XÁC THỰC CHỮ KÝ (bắt buộc)
    const sortedParams = sortObject(vnp_Params);
    const querystring = require('qs');
    const signData = querystring.stringify(sortedParams, { encode: false });
    console.log('4. SignData:', signData);
    
    const crypto = require("crypto");
    const hmac = crypto.createHmac("sha512", vnpayConfig.vnp_HashSecret);
    const checkSum = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
    console.log('5. CheckSum tính được:', checkSum);
    console.log('6. Secret Key:', vnpayConfig.vnp_HashSecret);

    const isValidSignature = secureHash === checkSum;
    console.log('7. Chữ ký hợp lệ?', isValidSignature);
    console.log('========================');

    const responseCode = vnp_Params['vnp_ResponseCode'];



    // Tạo query string đầy đủ để truyền vào HTML thuần
    const queryString = new URLSearchParams({
      vnp_Amount: vnp_Params.vnp_Amount || '0',
      vnp_BankCode: vnp_Params.vnp_BankCode || '',
      vnp_BankTranNo: vnp_Params.vnp_BankTranNo || '',
      vnp_CardType: vnp_Params.vnp_CardType || '',
      vnp_OrderInfo: vnp_Params.vnp_OrderInfo || 'Thanh toán đơn hàng',
      vnp_PayDate: vnp_Params.vnp_PayDate || '',
      vnp_ResponseCode: vnp_Params.vnp_ResponseCode || '',
      vnp_TmnCode: vnp_Params.vnp_TmnCode || '',
      vnp_TransactionNo: vnp_Params.vnp_TransactionNo || '',
      vnp_TransactionStatus: vnp_Params.vnp_TransactionStatus || '',
      vnp_TxnRef: vnp_Params.vnp_TxnRef || '',
      secureCheck: isValidSignature.toString()  // quan trọng!
    }).toString();

    // REDIRECT ĐẾN FILE HTML THUẦN (KHÔNG DÙNG EJS)
    return res.redirect(`/payment/return.html?${queryString}`);

  } catch (error) {
    console.error('Lỗi vnpayReturn:', error);
    return res.status(500).send(`
      <h3>Lỗi xử lý kết quả thanh toán</h3>
      <p>Vui lòng liên hệ admin nếu thấy bất thường.</p>
      <a href="/">← Về trang chủ</a>
    `);
  }
}

  // Xử lý IPN (Instant Payment Notification)
async vnpayIPN(req, res) {
    let vnp_Params = req.query;
    const secureHash = vnp_Params.vnp_SecureHash;
    const orderId = vnp_Params.vnp_TxnRef;
    const rspCode = vnp_Params.vnp_ResponseCode;
    const amountFromVNPay = parseInt(vnp_Params.vnp_Amount); // đơn vị: đồng * 100

    console.log('[VNPAY IPN] Received:', vnp_Params);

    // Bước 1: Xóa các tham số không cần thiết trước khi verify
    delete vnp_Params.vnp_SecureHash;
    delete vnp_Params.vnp_SecureHashType;

    // Bước 2: Kiểm tra chữ ký
    const isValidSignature = vnpayUtils.verifyIpnCall(vnp_Params, secureHash, vnpayConfig);
    if (!isValidSignature) {
      console.warn('[VNPAY IPN] Invalid signature from:', req.ip);
      return res.status(200).json({ RspCode: '97', Message: 'Fail checksum' });
    }

    try {
      // Bước 3: Tìm đơn hàng trong database theo vnp_TxnRef (orderId)
      const order = await Order.findOne({ orderId: orderId }); // giả sử bạn dùng Mongoose

      if (!order) {
        console.warn('[VNPAY IPN] Order not found:', orderId);
        return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
      }

      // Bước 4: Kiểm tra số tiền thanh toán có khớp không
      const expectedAmount = order.totalAmount * 100; // vì VNPay nhân 100
      if (amountFromVNPay !== expectedAmount) {
        console.warn('[VNPAY IPN] Amount mismatch. Expected:', expectedAmount, 'Received:', amountFromVNPay);
        // Vẫn trả về Success cho VNPay nhưng đánh dấu lỗi trong DB
        order.paymentStatus = 'failed';
        order.paymentNote = `Số tiền không khớp. Nhận: ${amountFromVNPay}, Kỳ vọng: ${expectedAmount}`;
        await order.save();
        return res.status(200).json({ RspCode: '04', Message: 'Invalid amount' });
      }

      // Bước 5: Kiểm tra trạng thái đơn hàng (tránh thanh toán trùng)
      if (order.paymentStatus === 'paid') {
        console.info('[VNPAY IPN] Order already paid:', orderId);
        return res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });
      }

      // Bước 6: Xử lý theo mã phản hồi từ VNPay
      if (rspCode === '00') {
        // Thanh toán thành công
        order.paymentStatus = 'paid';
        order.paidAt = moment(vnp_Params.vnp_PayDate, 'YYYYMMDDHHmmss').toDate();
        order.transactionNo = vnp_Params.vnp_TransactionNo;
        order.bankCode = vnp_Params.vnp_BankCode;
        order.paymentMethod = 'vnpay';
        order.paymentNote = 'Thanh toán thành công qua VNPay';


      } else {
        // Thanh toán thất bại
        order.paymentStatus = 'failed';
        order.paymentNote = `Thanh toán thất bại - Mã lỗi VNPay: ${rspCode}`;
      }

      await order.save();

      // Luôn trả về RspCode='00' và Message='Success' nếu chữ ký hợp lệ
      return res.status(200).json({ RspCode: '00', Message: 'Confirm success' });

    } catch (error) {
      console.error('[VNPAY IPN] Server error:', error);
      return res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
    }
  }
}


// function verifyIpnCall(vnp_Params, secureHash, config) {
//   try {
//     let signData = querystring.stringify(sortObject(vnp_Params), { encode: false });
//     let hmac = crypto.createHmac("sha512", config.vnp_HashSecret);
//     let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

//     console.log('[VNPAY VERIFY] signData:', signData);
//     console.log('[VNPAY VERIFY] signed (tính lại):', signed);
//     console.log('[VNPAY VERIFY] secureHash (từ VNPay):', secureHash);

//     return signed === secureHash;
//   } catch (error) {
//     console.error('Lỗi verify chữ ký:', error);
//     return false;
//   }
// }

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

module.exports = new PaymentController();
