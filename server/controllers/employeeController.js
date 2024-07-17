const { connection } = require("../configuration/dbConfig");

class Employee {
  //Controller cho API lấy, hiển thị thông tin người dùng
  GetEmployee(req, res) {
    const id = req.params.id;

    // Query student information
    const GetEmployeeSql =
      "SELECT * FROM nhan_vien WHERE ma_nv = ?";
    connection.query(GetEmployeeSql, [id], (err, EmployeeResult) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ status_code: 500, type: "error", message: "Lỗi server" });
      }

      if (EmployeeResult.length === 0) {
        console.log(err);
        return res.status(404).json({
          status_code: 404,
          type: "error",
          message: "Thông tin nhân viên không tồn tại",
        });
      }

      const employee = EmployeeResult[0];
      // Prepare student information
      const employeeInfo = {
        hinh_anh: employee.hinh_anh,
        ho: employee.ho,
        ten: employee.ten,
        gioi_tinh: employee.gioitinh,
        ngay_sinh: employee.ngay_sinh,
        noi_sinh: employee.noi_sinh,
        dien_thoai: employee.dien_thoai,
        email: employee.email,
        dia_chi: employee.dia_chi,
        tam_tru: employee.tam_tru,
        chuc_vu: employee.chuc_vu,
        trang_thai: employee.trang_thai,
        ngay_vao_lam: employee.ngay_vao_lam,
        quoc_tich: employee.quoc_tich,
        dan_toc: employee.dan_toc,
        ton_giao: employee.ton_giao,
        hoc_van: employee.hoc_van,
        ngoai_ngu: employee.ngoai_ngu,
        tin_hoc: employee.tin_hoc,
        chuyen_mon: employee.chuyen_mon,
        hon_nhan: employee.hon_nhan,
        suc_khoe: employee.suc_khoe,
        chieu_cao: employee.chieu_cao,
        can_nang: employee.can_nang,
        bhxh: employee.bhxh,
        ngay_cap_bhxh: employee.ngay_cap_bhxh,
        cmnd: employee.cmnd,
        ngay_cap: employee.ngay_cap,
        noi_cap: employee.noi_cap,
        start_thu_viec: employee.start_thu_viec,
        end_thu_viec: employee.end_thu_viec,
        ma_hop_dong: employee.ma_hop_hong,
        loai_hop_dong: employee.loai_hop_dong,
        ngay_ky: employee.ngay_ky,
        tu_ngay: employee.tu_ngay,
        den_ngay: employee.den_ngay,
        ghi_chu: employee.ghi_chu,
        status_nghi_viec: employee.status_nghi_viec,
        luong: employee.luong,
      };

      return res.status(200).json({
        status_code: 200,
        type: "success",
        message: "Thông tin nhân viên",
        data: employeeInfo,
      });
    });
  }

  GetAllEmployee(req, res) {
    const getAllEmployeeSql = `
    SELECT * FROM nhan_vien
  `;

    connection.query(getAllEmployeeSql, (err, employeeResult) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          status_code: 500,
          type: "error",
          message: "Lỗi server",
        });
      }

      if (employeeResult.length === 0) {
        return res.status(404).json({
          status_code: 404,
          type: "error",
          message: "Thông tin nhân viên không tồn tại",
        });
      }

      const employee = employeeResult.map((employee) => ({
        hinh_anh: employee.hinh_anh,
        ho: employee.ho,
        ten: employee.ten,
        gioi_tinh: employee.gioitinh,
        ngay_sinh: employee.ngay_sinh,
        noi_sinh: employee.noi_sinh,
        dien_thoai: employee.dien_thoai,
        email: employee.email,
        dia_chi: employee.dia_chi,
        tam_tru: employee.tam_tru,
        chuc_vu: employee.chuc_vu,
        trang_thai: employee.trang_thai,
        ngay_vao_lam: employee.ngay_vao_lam,
        quoc_tich: employee.quoc_tich,
        dan_toc: employee.dan_toc,
        ton_giao: employee.ton_giao,
        hoc_van: employee.hoc_van,
        ngoai_ngu: employee.ngoai_ngu,
        tin_hoc: employee.tin_hoc,
        chuyen_mon: employee.chuyen_mon,
        hon_nhan: employee.hon_nhan,
        suc_khoe: employee.suc_khoe,
        chieu_cao: employee.chieu_cao,
        can_nang: employee.can_nang,
        bhxh: employee.bhxh,
        ngay_cap_bhxh: employee.ngay_cap_bhxh,
        cmnd: employee.cmnd,
        ngay_cap: employee.ngay_cap,
        noi_cap: employee.noi_cap,
        start_thu_viec: employee.start_thu_viec,
        end_thu_viec: employee.end_thu_viec,
        ma_hop_dong: employee.ma_hop_hong,
        loai_hop_dong: employee.loai_hop_dong,
        ngay_ky: employee.ngay_ky,
        tu_ngay: employee.tu_ngay,
        den_ngay: employee.den_ngay,
        ghi_chu: employee.ghi_chu,
        status_nghi_viec: employee.status_nghi_viec,
        luong: employee.luong,
      }));

      return res.status(200).json({
        status_code: 200,
        type: "success",
        message: "Thông tin tất cả nhân viên",
        data: employee,
      });
    });
  }
}

module.exports = new Employee();
