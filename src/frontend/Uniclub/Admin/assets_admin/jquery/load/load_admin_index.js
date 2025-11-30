$(document).ready(function () {
  var token = localStorage.getItem("token");
  load_user_imformation(token);
  load_report_information(token);
});
// /get-report-information

function load_user_imformation(token) {
  fetch("http://localhost:8080/user-information", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  })
    .then((responce) => {
      if (responce.ok) {
        return responce.json();
      } else {
        throw new Error(responce.statusText);
      }
    })
    .then((data) => {
      const image = document.getElementById("images-user");
      image.src = data.userInformation.image;
      const full_name = document.getElementById("full-name");
      full_name.textContent = data.userInformation.name;
      const gmail = document.getElementById("gmail");
      gmail.textContent = data.userInformation.email;
    })
    .catch((error) => {
      console.error(error);
    });
}

function load_report_information(token) {
  fetch("http://localhost:8080/get-report-information", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  })
    .then((responce) => {
      if (responce.ok) {
        return responce.json();
      } else {
        throw new Error(responce.statusText);
      }
    })
    .then((data) => {
      const customer = document.getElementById("customer-report");
      customer.textContent = data.information.customer;

      const order = document.getElementById("order-report");
      order.textContent = data.information.order;

      const revenue = document.getElementById("revenue-report");
      revenue.textContent = data.information.revenue;

      const expense = document.getElementById("expense-report");
      expense.textContent = data.information.expenses;
    })
    .catch((error) => {
      console.error(error);
    });
}

document.addEventListener("DOMContentLoaded", function () {
  const timelineSelector = document.getElementById("timelineSelector");
  const apiUrl = "http://localhost:8080/get-report"; // API endpoint của bạn
  let chart; // Khởi tạo biến chart để lưu biểu đồ

  // Hàm cập nhật biểu đồ
  async function updateChart(timeline) {
    try {
      // Gửi yêu cầu đến API
      const response = await fetch(`${apiUrl}?timeline=${timeline}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();

      // Dữ liệu từ API
      const totalOrders = data.totalOrders;
      const totalProduct = data.totalProduct;
      const totalBill = data.totalBill;

      // Nếu biểu đồ đã tồn tại, cập nhật dữ liệu
      if (chart) {
        chart.data.datasets[0].data = [totalOrders, totalProduct, totalBill];
        chart.update();
      } else {
        // Nếu biểu đồ chưa tồn tại, tạo biểu đồ mới
        const ctx = document.getElementById("newrevenueChart").getContext("2d");
        chart = new Chart(ctx, {
          type: "bar",
          data: {
            labels: ["Orders", "Products", "Revenue"],
            datasets: [
              {
                label: `Report for ${timeline}`,
                data: [totalOrders, totalProduct, totalBill],
                backgroundColor: ["#4caf50", "#2196f3", "#ff9800"],
              },
            ],
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        });
      }
    } catch (error) {
      console.error("Error updating chart:", error);
    }
  }

  // Lắng nghe sự kiện khi người dùng chọn timeline
  timelineSelector.addEventListener("change", (event) => {
    const selectedTimeline = event.target.value;
    updateChart(selectedTimeline);
  });

  // Hiển thị dữ liệu mặc định (Today) khi trang load
  updateChart("today");
});
