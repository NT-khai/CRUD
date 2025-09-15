//ham lay thong tin tu json
async function GetData() {
  try {
    // goi API - GET
    const res = await fetch("http://localhost:3000/students");
    if (res.ok) {
      console.log("Lay du lieu thanh cong");
      let data = await res.json();
      console.log(data);

      const tbody = document.querySelector("#studentTable tbody");
      tbody.innerHTML = ""; // Xóa dữ liệu cũ trước khi thêm mới
      data.forEach((sv) => {
        let tr = document.createElement("tr");
        let td_name = document.createElement("td");
        td_name.textContent = sv.name;
        tr.appendChild(td_name);

        let td_age = document.createElement("td");
        td_age.textContent = sv.age;
        tr.appendChild(td_age);

        let td_mssv = document.createElement("td");
        td_mssv.textContent = sv.mssv;
        tr.appendChild(td_mssv);
        tbody.appendChild(tr);
      });
    } else {
      console.warn("Khong the lay du lieu");
    }
  } catch (error) {
    console.log(error);
  }
}
GetData();

async function AddData(obj) {
  //gui iu cau
  try {
    const res = await fetch("http://localhost:3000/students", {
      method: "POST",
      headers: { "content-Type": "application/json" },
      body: JSON.stringify(obj),
    });
    if (res.ok) {
      alert("Da them sinh vien thanh cong");
    }
  } catch (error) {
    alert(error);
  }
}

async function check_ID(value) {
  try {
    const res = await fetch("http://localhost:3000/students");
    const data = await res.json();
    let check = data.some((obj) => {
      return obj.mssv === value;
    });

    return check;
  } catch (error) {
    alert(error);
  }
}

let btn_add = document.getElementById("btn-add");
btn_add.addEventListener("click", async (e) => {
  e.preventDefault();
  let ten = document.getElementById("ten");
  let tuoi = document.getElementById("tuoi");
  let mssv = document.getElementById("mssv");

  const exists = await check_ID(mssv.value); // ✅ phải await

  if (!exists) {
    AddData({ name: ten.value, age: tuoi.value, mssv: mssv.value });
    GetData();
  } else {
    alert("Ma so sinh vien da ton tai");
  }
});

// Tim kiem sinh vien
let btn_search = document.getElementById("btn-search");

async function find_ID(value) {
  try {
    const res = await fetch("http://localhost:3000/students");
    const data = await res.json();

    const sv_ID = data.find((obj) => {
      return (
        (obj.mssv && obj.mssv.toUpperCase() === value) ||
        (obj.name && obj.name.toUpperCase() === value)
      );
    });

    if (!sv_ID) {
      alert("Không tìm thấy sinh viên");
      return;
    }

    const tbody = document.querySelector("#searchTable tbody");
    tbody.innerHTML = ""; // Xóa dữ liệu cũ trước khi thêm mới

    let tr = document.createElement("tr");

    let td_name = document.createElement("td");
    td_name.textContent = sv_ID.name;
    tr.appendChild(td_name);

    let td_age = document.createElement("td");
    td_age.textContent = sv_ID.age;
    tr.appendChild(td_age);

    let td_mssv = document.createElement("td");
    td_mssv.textContent = sv_ID.mssv;
    tr.appendChild(td_mssv);

    tbody.appendChild(tr);
  } catch (error) {
    alert(error);
  }
}

btn_search.addEventListener("click", async (e) => {
  e.preventDefault();
  const inputEl = document.getElementById("keyword");

  if (!inputEl) {
    alert("Không tìm thấy ô nhập liệu");
    return;
  }

  const keyword = inputEl.value.trim();

  if (!keyword) {
    alert("Vui lòng nhập từ khóa tìm kiếm");
    return;
  }

  await find_ID(keyword.toUpperCase());

  inputEl.value = "";
});

// XÓA SINH VIÊN
async function delete_ID(mssv) {
  try {
    // Tìm sinh viên theo mssv
    const res = await fetch(`http://localhost:3000/students?mssv=${mssv}`);
    const data = await res.json();

    if (data.length === 0) {
      alert("Không tìm thấy MSSV cần xóa");
      return;
    }

    const studentId = data[0].id; // id trong db.json
    const delRes = await fetch(`http://localhost:3000/students/${studentId}`, {
      method: "DELETE",
    });

    if (delRes.ok) {
      alert("Xóa thành công!");
    } else {
      alert("Xóa thất bại!");
    }
  } catch (error) {
    console.error(error);
    alert("Có lỗi xảy ra khi xóa");
  }
}

let delete_id = document.getElementById("delete-id");
let btn_delete = document
  .getElementById("btn-delete")
  .addEventListener("click", async (e) => {
    e.preventDefault();
    await delete_ID(delete_id.value);
  });

// Sua sinh vien
// Lay thong tinh sinh vien
let id_update = document.getElementById("edit-id");
let btn_edit_search = document.getElementById("btn-edit-search");
let editForm = document.getElementById("editForm");

let editName = document.getElementById("edit-name");
let editAge = document.getElementById("edit-age");

// Biến lưu id thật trong db.json (do JSON Server dùng id, không phải mssv)
let currentStudentId = null;

// 👉 B1: Tìm sinh viên theo MSSV
btn_edit_search.addEventListener("click", async (e) => {
  e.preventDefault();

  const mssv = id_update.value.trim();
  if (!mssv) {
    alert("Vui lòng nhập MSSV cần sửa");
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/students?mssv=${mssv}`);
    const data = await res.json();

    if (data.length === 0) {
      alert("Không tìm thấy sinh viên");
      return;
    }

    // Lấy sinh viên đầu tiên
    const sv = data[0];
    currentStudentId = sv.id;

    // Đổ dữ liệu vào form
    editName.value = sv.name;
    editAge.value = sv.age;

    // Hiện form chỉnh sửa
    editForm.style.display = "flex";
  } catch (error) {
    console.error(error);
    alert("Có lỗi khi tìm sinh viên");
  }
});

// 👉 B2: Cập nhật sinh viên
editForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!currentStudentId) {
    alert("Chưa chọn sinh viên để sửa");
    return;
  }

  const updatedStudent = {
    name: editName.value,
    age: parseInt(editAge.value),
    mssv: id_update.value.trim(),
  };

  try {
    const res = await fetch(
      `http://localhost:3000/students/${currentStudentId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedStudent),
      }
    );

    if (res.ok) {
      alert("Cập nhật thành công!");
      editForm.style.display = "none"; // Ẩn form sau khi cập nhật
    } else {
      alert("Cập nhật thất bại!");
    }
  } catch (error) {
    console.error(error);
    alert("Có lỗi khi cập nhật");
  }
});
