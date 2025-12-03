const crypto = require('crypto');
const querystring = require('querystring');

class VNPayUtils {
  // Sắp xếp object theo alphabet
  sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    keys.forEach(key => {
      sorted[key] = obj[key];
    });
    return sorted;
  }

  // Tạo chữ ký
  createSignature(secretKey, signData) {
    const hmac = crypto.createHmac('sha512', secretKey);
    return hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  }

  // Tạo query string cho VNPay
//   buildPaymentUrl(params, vnpayConfig) {
//     // Sắp xếp params
//     const sortedParams = this.sortObject(params);
    
//     // Tạo query string
//     const signData = querystring.stringify(sortedParams, { encode: false });
    
//     // Tạo secure hash
//     const secureHash = this.createSignature(vnpayConfig.vnp_HashSecret, signData);
//     sortedParams['vnp_SecureHash'] = secureHash;
    
//     // Build URL
//     return vnpayConfig.vnp_Url + '?' + querystring.stringify(sortedParams, { encode: false });
//   }

  buildPaymentUrl(params, vnpayConfig) {
    let sortedParams = this.sortObject(params);
    
    // Stringify 1 lần duy nhất
    let signData = require('qs').stringify(sortedParams, { encode: false });
    
    // Ký hash
    let hmac = require('crypto').createHmac('sha512', vnpayConfig.vnp_HashSecret);
    let secureHash = hmac.update(signData, 'utf-8').digest('hex');
    
    // Dùng lại signData, chỉ thêm secureHash
    return vnpayConfig.vnp_Url + '?' + signData + '&vnp_SecureHash=' + secureHash;
}



  // Verify IPN call
  verifyIpnCall(vnpParams, secureHash, vnpayConfig) {
    delete vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHashType'];
    
    const sortedParams = this.sortObject(vnpParams);
    const signData = querystring.stringify(sortedParams, { encode: false });
    const checkSum = this.createSignature(vnpayConfig.vnp_HashSecret, signData);
    
    return secureHash === checkSum;
  }
}

module.exports = new VNPayUtils();