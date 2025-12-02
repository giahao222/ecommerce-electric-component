js: 
category.js
product_detail.js
index-2.js

**Hướng dẫn thực hiện Run Project chi tiết:**

---

### **Bước 1: Clone dự án**
1. Truy cập vào link Github của dự án: [https://github.com/1huyle/nodejs](https://github.com/1huyle/nodejs).
2. Sử dụng lệnh sau để clone dự án về máy:
   ```bash
   git clone https://github.com/1huyle/nodejs
   ```
3. Di chuyển vào thư mục dự án:
   ```bash
   cd nodejs
   ```

---

### **Bước 2: Cài đặt thư viện**
1. Chạy lệnh sau để cài đặt các thư viện cần thiết:
   ```bash
   npm install
   ```

---

### **Bước 3: Chạy ứng dụng**
1. Sử dụng lệnh để khởi chạy ứng dụng:
   ```bash
   npm start
   ```
2. Ứng dụng sẽ chạy trên `localhost:8080`.

---

### **Bước 4: Thêm tài khoản Admin**
- Thực hiện tạo tài khoản Admin bằng cách gửi request sau:
  **Payload để thêm Admin:**
  ```json
  {
      "full_name": "admin",
      "email": "admin@gmail.com",
      "password": "123456",
      "active": true
  }
  ```
- Cách thực hiện:
  - Gửi yêu cầu thông qua Postman hoặc bất kỳ công cụ API nào tới endpoint thêm tài khoản (ví dụ: `http://localhost:8080/api/admin`).

---

### **Bước 5: Cập nhật thông tin sản phẩm**
- Sau khi thêm Admin thành công, đăng nhập vào trang quản lý bằng tài khoản Admin.
- Truy cập mục **Quản lý sản phẩm**.
- Cập nhật các thông tin bao gồm:
  - Loại sản phẩm.
  - Màu sắc.
  - Kích cỡ.
  - Tags.

---

### **Bước 6: Cấu hình thanh toán**
1. **Cài đặt Ngrok:**
   - Truy cập trang [https://ngrok.com](https://ngrok.com) để tải và cài đặt Ngrok.
   - Sau khi cài đặt, chạy lệnh:
     ```bash
     ngrok http 8080
     ```
   - Lệnh trên sẽ trả về một URL (ví dụ: `https://abc123.ngrok.io`), sử dụng URL này thay thế `localhost:8080`.

2. **Cập nhật webhook URL:**
   - Truy cập vào [PayOS](https://payos.com) với tài khoản sau:
     - **Email:** `lehuuloi823@gmail`
     - **Mật khẩu:** `01297428776zx`
   - Chọn tổ chức **LEHUULOI**.
   - Đi đến phần **Kênh thanh toán** → **Cài đặt**.
   - Cập nhật **Webhook URL** bằng URL từ Ngrok, ví dụ: `https://abc123.ngrok.io/receive-hook`.

---

### **Video minh họa**
- Video demo các bước trên có thể xem tại đây: [Video Demo](https://youtu.be/bgDZk2kLD-k).

Nếu cần hỗ trợ thêm, hãy liên hệ để mình giúp bạn chi tiết hơn! 🚀
