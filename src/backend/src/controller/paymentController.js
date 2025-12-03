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
  vnpayReturn(req, res) {
    let vnp_Params = req.query;
    const secureHash = vnp_Params['vnp_SecureHash'];

    console.log('===== DEBUG RETURN =====');
    console.log('1. Params nhận được:', vnp_Params);
    console.log('2. SecureHash từ VNPay:', secureHash);

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    // Sắp xếp params
    const sortedParams = sortObject(vnp_Params);
    console.log('3. Params đã sắp xếp:', sortedParams);
    
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

    res.render('payment/return', {
      title: 'Kết quả thanh toán',
      isValidSignature: isValidSignature,
      responseCode: responseCode,
      amount: vnp_Params['vnp_Amount'] / 100,
      orderInfo: vnp_Params['vnp_OrderInfo'],
      transactionNo: vnp_Params['vnp_TransactionNo'],
      txnRef: vnp_Params['vnp_TxnRef'],
      bankCode: vnp_Params['vnp_BankCode'],
      payDate: vnp_Params['vnp_PayDate']
    });
  }

  // Xử lý IPN (Instant Payment Notification)
  vnpayIPN(req, res) {
    let vnp_Params = req.query;
    const secureHash = vnp_Params['vnp_SecureHash'];
    const orderId = vnp_Params['vnp_TxnRef'];
    const rspCode = vnp_Params['vnp_ResponseCode'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    const isValidSignature = vnpayUtils.verifyIpnCall(vnp_Params, secureHash, vnpayConfig);

    if (!isValidSignature) {
      return res.status(200).json({ RspCode: '97', Message: 'Invalid signature' });
    }

    // TODO: Kiểm tra orderId có tồn tại trong database không
    // TODO: Kiểm tra số tiền có khớp không
    // TODO: Kiểm tra trạng thái đơn hàng

    if (rspCode === '00') {
      // Thanh toán thành công
      // TODO: Cập nhật trạng thái đơn hàng trong database
      return res.status(200).json({ RspCode: '00', Message: 'Success' });
    } else {
      // Thanh toán thất bại
      // TODO: Cập nhật trạng thái đơn hàng
      return res.status(200).json({ RspCode: '00', Message: 'Success' });
    }
  }
}
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
