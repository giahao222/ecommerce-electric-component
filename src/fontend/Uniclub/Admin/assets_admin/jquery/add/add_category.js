var dataLoaded = false;
var addCategory = false;
$(document).ready(function () {
  if (!dataLoaded) {
    loadData();
  }
  $(".add-category-name").submit(function (e) {
    e.preventDefault();
    var name_category = $("#name-category").val();
    console.log("Name Category : " + name_category);
    $.ajax({
      method: "POST",
      url: "http://localhost:8080/category/" + name_category,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("Token"),
      },
    }).done(function (result) {
      if(result.data !=null){
        clearCaterory();
        loadData();
        alert("Dữ liệu được thêm thành công")
      }
      alert("Hệ thống đã có dữ liệu này rồi hãy kiểm tra lại!");
    });
  });
});

function loadData() {
  $.ajax({
    method: "GET",
    url: "http://localhost:8080/category",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("Token"),
    },
  })
    .done(function (result) {
      clearCaterory();
      displayCategory(result.data);
      console.log(result.data);
      var data = JSON.stringify(result.data);
      localStorage.setItem("CateroryList", data);
      dataLoaded = true;
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
      console.error("AJAX request failed: " + textStatus, errorThrown);
    });
}

function displayCategory(categorys) {
  var htmlItem = "";
  for (var i = 0; i < categorys.length; i++) {
    var category = categorys[i];
    htmlItem += createcategoryHTML(category);
  }
  $("#category_data_table tbody").append(htmlItem);
}
function clearCaterory() {
  $("#category_data_table tbody").empty();
}
function createcategoryHTML(category) {
  return ` <tr>
            <td class="col-md-1">${category.id_category}</td>
            <td class="col-md-4">${category.name}</td>
            <td>
              <div>
                <button type="button"
                  class="btn btn-outline-success dropdown-toggle dropdown-toggle-split"
                  data-bs-toggle="dropdown" aria-haspopup="true"
                  aria-expanded="false" data-display="static">
                  <span class="sr-only"><i
                      class="ri-settings-3-line"></i></span>
                </button>

                <div class="dropdown-menu">
                  <a class="dropdown-item" href="#">Edit</a>
                  <a class="dropdown-item" href="#">Delete</a>
                </div>
              </div>
            </td>
          </tr>
          `;
}
