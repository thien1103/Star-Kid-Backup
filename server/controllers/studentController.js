const { connection } = require("../configuration/dbConfig");

class Student {
  //Controller cho API lấy, hiển thị thông tin người dùng
  GetStudent(req, res) {
    const id = req.params.id;

    // Query student information
    const getStudentSql =
      "SELECT id, name, gender, birth_date, address, id_doi_tuong_hoc_sinh, image, ngay_nhap_hoc, ngay_ket_thuc, id_tuition, status, hobby, ability, id_medical_record, note, id_class, parent_name, parent_phone, parent_job_id, mother_name, mother_phone, mother_job_id, type_relate, siblings, created_at, updated_at FROM student WHERE id = ?";
    connection.query(getStudentSql, [id], (err, studentResult) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ status_code: 500, type: "error", message: "Lỗi server" });
      }

      if (studentResult.length === 0) {
        console.log(err);
        return res.status(404).json({
          status_code: 404,
          type: "error",
          message: "Thông tin học sinh không tồn tại",
        });
      }

      const student = studentResult[0];

      // Query student type information
      const getDTHSsql = "SELECT name FROM doi_tuong_hoc_sinh WHERE id = ?";
      connection.query(
        getDTHSsql,
        [student.id_doi_tuong_hoc_sinh],
        (err, DTHSresult) => {
          if (err) {
            console.log(err);
            return res.status(500).json({
              status_code: 500,
              type: "error",
              message: "Lỗi server",
            });
          }

          const doi_tuong_hoc_sinh_name =
            DTHSresult.length > 0 ? DTHSresult[0].name : null;

          // Query tuition information
          const getTuitionSql = "SELECT data FROM student_fee WHERE id = ?";
          connection.query(
            getTuitionSql,
            [student.id_tuition],
            (err, TuitionResult) => {
              if (err) {
                console.log(err);
                return res.status(500).json({
                  status_code: 500,
                  type: "error",
                  message: "Lỗi server",
                });
              }

              const hoc_phi =
                TuitionResult.length > 0 ? TuitionResult[0].data : null;

              // Query class information
              const getClassSql = "SELECT name FROM class WHERE id = ?";
              connection.query(
                getClassSql,
                [student.id_class],
                (err, classResult) => {
                  if (err) {
                    console.log(err);
                    return res.status(500).json({
                      status_code: 500,
                      type: "error",
                      message: "Lỗi server",
                    });
                  }

                  const class_ =
                    classResult.length > 0 ? classResult[0].name : null;

                  // Query job information for mother
                  const getMotherJobSql = "SELECT name FROM job WHERE id = ?";
                  connection.query(
                    getMotherJobSql,
                    [student.mother_job_id],
                    (err, motherJobResult) => {
                      if (err) {
                        console.log(err);
                        return res.status(500).json({
                          status_code: 500,
                          type: "error",
                          message: "Lỗi server",
                        });
                      }

                      const motherJob =
                        motherJobResult.length > 0
                          ? motherJobResult[0].name
                          : null;

                      // Query job information for father
                      const getFatherJobSql =
                        "SELECT name FROM job WHERE id = ?";
                      connection.query(
                        getFatherJobSql,
                        [student.parent_job_id],
                        (err, fatherJobResult) => {
                          if (err) {
                            console.log(err);
                            return res.status(500).json({
                              status_code: 500,
                              type: "error",
                              message: "Lỗi server",
                            });
                          }

                          const fatherJob =
                            fatherJobResult.length > 0
                              ? fatherJobResult[0].name
                              : null;

                          // Prepare student information
                          const studentInfo = {
                            id: student.id,
                            name: student.name,
                            gender: student.gender === 1 ? "Nam" : "Nữ",
                            birth_date: student.birth_date,
                            address: student.address,
                            id_doi_tuong_hoc_sinh: doi_tuong_hoc_sinh_name,
                            image: student.image,
                            ngay_nhap_hoc: student.ngay_nhap_hoc,
                            ngay_ket_thuc: student.ngay_ket_thuc,
                            hoc_phi: hoc_phi,
                            status: student.status,
                            hobby: student.hobby,
                            ability: student.ability,
                            id_medical_record: student.id_medical_record,
                            note: student.note,
                            class: class_,
                            mother: {
                              name: student.mother_name,
                              phoneNumber: student.mother_phone,
                              job: motherJob,
                            },
                            father: {
                              name: student.parent_name,
                              phoneNumber: student.parent_phone,
                              job: fatherJob,
                            },
                            type_relate: student.type_relate,
                            siblings: student.siblings,
                            created_at: student.created_at,
                            updated_at: student.updated_at,
                          };

                          return res.status(200).json({
                            status_code: 200,
                            type: "success",
                            message: "Thông tin học sinh",
                            data: studentInfo,
                          });
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    });
  }

  GetAllStudent(req, res) {
    const getAllStudentSql = `
    SELECT
      s.id, s.name, s.gender, s.birth_date, s.address, dhs.name AS id_doi_tuong_hoc_sinh, s.image, s.ngay_nhap_hoc, s.ngay_ket_thuc, sf.data AS hoc_phi, s.status, s.hobby, s.ability, s.id_medical_record, s.note, c.name AS class_name,
      s.mother_name, s.mother_phone, mj.name AS mother_job,
      s.parent_name, s.parent_phone, fj.name AS father_job,
      s.type_relate, s.siblings, s.created_at, s.updated_at
    FROM student s
    LEFT JOIN doi_tuong_hoc_sinh dhs ON s.id_doi_tuong_hoc_sinh = dhs.id
    LEFT JOIN student_fee sf ON s.id_tuition = sf.id
    LEFT JOIN class c ON s.id_class = c.id
    LEFT JOIN job mj ON s.mother_job_id = mj.id
    LEFT JOIN job fj ON s.parent_job_id = fj.id
  `;

    connection.query(getAllStudentSql, (err, studentResult) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          status_code: 500,
          type: "error",
          message: "Lỗi server",
        });
      }

      if (studentResult.length === 0) {
        return res.status(404).json({
          status_code: 404,
          type: "error",
          message: "Thông tin học sinh không tồn tại",
        });
      }

      const students = studentResult.map((student) => ({
        id: student.id,
        name: student.name,
        gender: student.gender === 1 ? "Nam" : "Nữ",
        birth_date: student.birth_date,
        address: student.address,
        id_doi_tuong_hoc_sinh: student.id_doi_tuong_hoc_sinh,
        image: student.image,
        image: student.image,
        ngay_nhap_hoc: student.ngay_nhap_hoc,
        ngay_ket_thuc: student.ngay_ket_thuc,
        hoc_phi: student.hoc_phi,
        status: student.status,
        hobby: student.hobby,
        ability: student.ability,
        id_medical_record: student.id_medical_record,
        note: student.note,
        class: student.class_name,
        mother: {
          name: student.mother_name,
          phoneNumber: student.mother_phone,
          job: student.mother_job,
        },
        father: {
          name: student.parent_name,
          phoneNumber: student.parent_phone,
          job: student.father_job,
        },
        type_relate: student.type_relate,
        siblings: student.siblings,
        created_at: student.created_at,
        updated_at: student.updated_at,
      }));

      return res.status(200).json({
        status_code: 200,
        type: "success",
        message: "Thông tin học sinh",
        data: students,
      });
    });
  }

  // Controller for updating student information
  UpdateStudentInfo(req, res) {
    const id = req.params.id;
    const {
      name,
      gender,
      birth_date,
      address,
      id_doi_tuong_hoc_sinh,
      image,
      ngay_nhap_hoc,
      ngay_ket_thuc,
      id_tuition,
      status,
      hobby,
      ability,
      id_medical_record,
      note,
      id_class,
      type_relate,
      siblings,
    } = req.body;
    const mother = req.body.mother || {};
    const father = req.body.father || {};

    // Build the SQL query dynamically based on the fields provided in the request body
    let updateStudentSql = "UPDATE student SET ";
    const updateParams = [];

    // Add the fields to be updated and their corresponding values to the query
    if (name !== undefined) {
      updateStudentSql += "name = ?, ";
      updateParams.push(name);
    }
    if (gender !== undefined) {
      updateStudentSql += "gender = ?, ";
      updateParams.push(gender === "Nam" ? 1 : 0);
    }
    if (birth_date !== undefined) {
      updateStudentSql += "birth_date = ?, ";
      updateParams.push(birth_date);
    }
    if (address !== undefined) {
      updateStudentSql += "address = ?, ";
      updateParams.push(address);
    }
    if (id_doi_tuong_hoc_sinh !== undefined) {
      updateStudentSql += "id_doi_tuong_hoc_sinh = ?, ";
      updateParams.push(id_doi_tuong_hoc_sinh);
    }
    if (image !== undefined) {
      updateStudentSql += "image = ?, ";
      updateParams.push(image);
    }
    if (ngay_nhap_hoc !== undefined) {
      updateStudentSql += "ngay_nhap_hoc = ?, ";
      updateParams.push(ngay_nhap_hoc);
    }
    if (ngay_ket_thuc !== undefined) {
      updateStudentSql += "ngay_ket_thuc = ?, ";
      updateParams.push(ngay_ket_thuc);
    }
    if (id_tuition !== undefined) {
      updateStudentSql += "id_tuition = ?, ";
      updateParams.push(id_tuition);
    }
    if (status !== undefined) {
      updateStudentSql += "status = ?, ";
      updateParams.push(status);
    }
    if (hobby !== undefined) {
      updateStudentSql += "hobby = ?, ";
      updateParams.push(hobby);
    }
    if (ability !== undefined) {
      updateStudentSql += "ability = ?, ";
      updateParams.push(ability);
    }
    if (id_medical_record !== undefined) {
      updateStudentSql += "id_medical_record = ?, ";
      updateParams.push(id_medical_record);
    }
    if (note !== undefined) {
      updateStudentSql += "note = ?, ";
      updateParams.push(note);
    }
    if (id_class !== undefined) {
      updateStudentSql += "id_class = ?, ";
      updateParams.push(id_class);
    }
    if (type_relate !== undefined) {
      updateStudentSql += "type_relate = ?, ";
      updateParams.push(type_relate);
    }
    if (siblings !== undefined) {
      updateStudentSql += "siblings = ?, ";
      updateParams.push(siblings);
    }

    // Handle mother and father information
    if (mother.name !== undefined) {
      updateStudentSql += "mother_name = ?, ";
      updateParams.push(mother.name);
    }
    if (mother.phoneNumber !== undefined) {
      updateStudentSql += "mother_phone = ?, ";
      updateParams.push(mother.phoneNumber);
    }
    if (mother.job !== undefined) {
      updateStudentSql += "mother_job_id = ?, ";
      updateParams.push(mother.job);
    }
    if (father.name !== undefined) {
      updateStudentSql += "parent_name = ?, ";
      updateParams.push(father.name);
    }
    if (father.phoneNumber !== undefined) {
      updateStudentSql += "parent_phone = ?, ";
      updateParams.push(father.phoneNumber);
    }
    if (father.job !== undefined) {
      updateStudentSql += "parent_job_id = ?, ";
      updateParams.push(father.job);
    }

    // Update the field updated_at in the database
    const updated_at = new Date();
    updateStudentSql += "updated_at = ?, ";
    updateParams.push(updated_at);

    // Remove the last comma from the SQL query
    updateStudentSql = updateStudentSql.slice(0, -2);
    updateStudentSql += " WHERE id = ?";
    updateParams.push(id);

    connection.query(updateStudentSql, updateParams, (err, result) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ status_code: 500, type: "error", message: "Lỗi server" });
      }

      if (result.affectedRows === 0) {
        console.log(err);
        return res.status(404).json({
          status_code: 404,
          type: "error",
          message: "Học sinh không tồn tại",
        });
      }

      return res.status(200).json({
        status_code: 200,
        type: "success",
        message: "Thông tin học sinh đã được cập nhật thành công",
      });
    });
  }

  // Controller to add a new student
  AddStudent(req, res) {
    const {
      id,
      name,
      gender,
      birth_date,
      address,
      id_doi_tuong_hoc_sinh,
      image,
      ngay_nhap_hoc,
      ngay_ket_thuc,
      id_tuition,
      status,
      hobby,
      ability,
      id_medical_record,
      note,
      id_class,
      type_relate,
      siblings,
    } = req.body;

    const mother = req.body.mother || {};
    const father = req.body.father || {};

    // Check for required fields
    if (
      !id ||
      !name ||
      !gender ||
      !birth_date ||
      !address ||
      !id_doi_tuong_hoc_sinh ||
      !image ||
      !ngay_nhap_hoc ||
      !ngay_ket_thuc ||
      !id_tuition ||
      !status ||
      !hobby ||
      !ability ||
      !id_medical_record ||
      !note ||
      !id_class ||
      !type_relate ||
      !siblings
    ) {
      return res.status(400).json({
        status_code: 400,
        type: "error",
        message: "Vui lòng điền đầy đủ thông tin",
      });
    }

    const query =
      "INSERT INTO student (id, name, gender, birth_date, address, id_doi_tuong_hoc_sinh, image, ngay_nhap_hoc, ngay_ket_thuc, id_tuition, status, hobby, ability, id_medical_record, note, id_class, mother_name, mother_phone, mother_job_id, parent_name, parent_phone, parent_job_id, type_relate, siblings, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    const created_at = new Date();

    const params = [
      id,
      name,
      gender === "Nam" ? 1 : 0, // Assuming gender is either "Nam" (Male) or "Nữ" (Female)
      birth_date,
      address,
      id_doi_tuong_hoc_sinh,
      image,
      ngay_nhap_hoc,
      ngay_ket_thuc,
      id_tuition,
      status,
      hobby,
      ability,
      id_medical_record,
      note,
      id_class,
      mother.name || null,
      mother.phoneNumber || null,
      mother.job || null,
      father.name || null,
      father.phoneNumber || null,
      father.job || null,
      type_relate,
      siblings,
      created_at,
    ];

    connection.query(query, params, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          status_code: 500,
          type: "error",
          message:
            "Mã học sinh đã tồn tại hoặc có lỗi phát sinh trong quá trình xử lí. Vui lòng thử lại sau",
        });
      }

      return res.status(200).json({
        status_code: 200,
        type: "success",
        message: "Thêm thông tin học sinh thành công",
      });
    });
  }

  // Controller to delete a student
  DeleteStudent(req, res) {
    const { id } = req.params;

    // Check if the required field (id) is provided
    if (!id) {
      return res.status(400).json({
        status_code: 400,
        type: "error",
        message: "Vui lòng cung cấp ID của học sinh cần xóa",
      });
    }

    const query = "DELETE FROM student WHERE id = ?";

    connection.query(query, [id], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          status_code: 500,
          type: "error",
          message: "Lỗi không thể xóa thông tin học sinh. Vui lòng thử lại sau",
        });
      }

      // Check if the student was found and deleted
      if (result.affectedRows === 0) {
        return res.status(404).json({
          status_code: 404,
          type: "error",
          message: "Không tìm thấy học sinh với ID này",
        });
      }

      return res.status(200).json({
        status_code: 200,
        type: "success",
        message: "Xóa thông tin học sinh thành công",
      });
    });
  }
}

module.exports = new Student();
