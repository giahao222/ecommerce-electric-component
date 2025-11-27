document.addEventListener("DOMContentLoaded", function () {
    const apiUrl = "http://localhost:8080/all-history-order-user";
    const tableBody = document.querySelector("#recent_order_data_table tbody");
  
    async function fetchOrders() {
      try {
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });
  
        if (response.ok) {
          const data = await response.json();
  
          // Lọc ra các đơn hàng có status là 'handle'
          const handleOrders = data.data.filter((order) => order.status === "handle");
  
          // Làm rỗng nội dung bảng trước khi thêm mới
          tableBody.innerHTML = "";
  
          // Hiển thị các đơn hàng đã lọc
          handleOrders.forEach((order) => {
            const row = document.createElement("tr");
            row.innerHTML = `
              <td>#${order._id}</td>
              <td>${order.name}</td>
              <td>${order.address}</td>
              <td>${order.phone}</td>
              <td>${order.email_address}</td>
              <td>${order.status}</td>
              <td>$${order.total.toLocaleString()}</td>
              <td>
                <a href="#" class="update-order" data-id="${order._id}">Update</a> | 
                <a href="#" class="delete-order" data-id="${order._id}">Delete</a>
              </td>
            `;
            tableBody.appendChild(row);
          });
        } else {
          console.error("Failed to fetch orders:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    }
  
    fetchOrders();
  });
  