var dataLoaded = false;

$(document).ready(function () {  
    if (dataLoaded === false) {
        loadData();
    }
});

function loadData() {
    $.ajax({
        method: "GET",
        url: "http://localhost:8080/attribute",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("Token"),
        },
    })
    .done(function (result) {
        // Kiểm tra cấu trúc dữ liệu và đảm bảo data tồn tại
        if (result.data && typeof result.data === 'object' && !Array.isArray(result.data)) {
            // Nếu data là đối tượng, đảm bảo rằng nó có các thuộc tính mong đợi
            if (result.data.categories && Array.isArray(result.data.categories) &&
                result.data.tags && Array.isArray(result.data.tags) &&
                result.data.sizes && Array.isArray(result.data.sizes) &&
                result.data.colors && Array.isArray(result.data.colors)) {
                
                displayAttributes(result.data); // Truyền đối tượng `data`
                var data = JSON.stringify(result.data); // Lưu dữ liệu vào LocalStorage
                localStorage.setItem("Attribute", data);
                dataLoaded = true; // Đánh dấu dữ liệu đã được tải
            } else {
                console.error("Invalid attribute format in data:", result.data);
            }
        } else {
            console.error("Invalid data format:", result);
        }
    })
    .fail(function (error) {
        console.error("Error loading data:", error);
    });
}

function displayAttributes(data){
    var categories = "";
    var tags = "";
    var colors = "";
    var sizes = "";
    data.categories.forEach((category) => {
        categories += createProductHTML(category , "category");
    });
    $("#recent_data_table_1 tbody").empty().append(categories);
    data.tags.forEach((tag) => {
        tags += createProductHTML(tag , "tag");
    });
    $("#recent_data_table_2 tbody").empty().append(tags);
    data.sizes.forEach((size) => {
        sizes += createProductHTML(size , "size");
    });
    $("#recent_data_table_3 tbody").empty().append(sizes);
    data.colors.forEach((color) => {
        colors += createProductHTML(color , "color");
    });
    $("#recent_data_table_4 tbody").empty().append(colors);

}
function createProductHTML(data_attribute, type) {
    return `
        <tr>
            <td>${data_attribute.name}</td>
            <td>
                <a href="#" data-attribute-id="${data_attribute._id}" 
                   onclick="editAttribute('${data_attribute._id}', '${type}')">Update</a> | 
                <a href="#" 
                   onclick="deleteAttribute('${data_attribute._id}', '${type}')">Delete</a>
            </td>
        </tr>`;
}

