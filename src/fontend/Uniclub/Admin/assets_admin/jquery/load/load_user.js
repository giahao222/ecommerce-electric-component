$(document).ready(function () {
  var token = localStorage.getItem("token");
  if (!token) {
    alert("Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.");
    return;
  }

  fetch("http://localhost:8080/users", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Không thể lấy dữ liệu người dùng.");
      }
      return response.json();
    })
    .then((data) => {
      updateUsersList(data.data); // Cập nhật danh sách người dùng
    })
    .catch((error) => {
      console.error("Error fetching users:", error);
      alert("Không thể tải danh sách người dùng.");
    });
});

function updateUsersList(users) {
  const tableBody = $("#recent_order_data_table tbody");
  tableBody.empty(); // Xóa các dòng cũ trong bảng
  users.forEach((user) => {
    const userRow = `
      <tr>
        <td><img class="cat-thumb" src="${
          user.image ||
          "http://res.cloudinary.com/du0alko2s/image/upload/v1730623463/ouocis8y5by261rdxfyv.jpg"
        }" alt="clients Image"></td>
        <td>${user.full_name}</td>
        <td>${user.email}</td>
        <td>${user.role ? user.role : "N/A"}</td>
        <td>${user.active ? "On" : "Off"}</td>
        <td>
          <button class="toggle_active" data-user-id="${
            user.id
          }" data-active="${user.active}">
            ${user.active ? "Deactivate" : "Activate"}
          </button>
        </td>
      </tr>
    `;
    tableBody.append(userRow);
  });
}

// Event delegation
$("#recent_order_data_table").on("click", ".toggle_active", async function () {
  const button = $(this);
  const userId = button.data("user-id");
  const isActive = button.data("active");
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.");
    return;
  }

  const url = isActive
    ? `http://localhost:8080/lock-user?id=${userId}`
    : `http://localhost:8080/unlock-user?id=${userId}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const result = await response.json();
      alert(result.message);

      button.text(isActive ? "Activate" : "Deactivate");
      button.data("active", !isActive);
      button
        .closest("tr")
        .find("td:nth-child(5)")
        .text(isActive ? "Off" : "On");
    } else {
      const errorData = await response.json();
      alert(errorData.message || "Lỗi khi thay đổi trạng thái.");
    }
  } catch (error) {
    console.error("Lỗi khi gửi yêu cầu:", error);
    alert("Không thể thay đổi trạng thái.");
  }
});
