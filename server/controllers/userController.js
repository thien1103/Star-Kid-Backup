const { connection } = require("../configuration/dbConfig");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");


class User {
  //Controller cho API lấy, hiển thị thông tin người dùng
  GetUserInfo(req, res) {
    const userId = req.params.userId;

    // Truy vấn thông tin người dùng từ database
    const getUserSql =
      "SELECT u.name, u.email, u.username, u.phone_number, u.email, u.id_phong_ban FROM users u WHERE u.id = ?";
    connection.query(getUserSql, [userId], (err, userResult) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ status_code: 500, type: "error", message: "Lỗi server" });
      }

      if (userResult.length === 0) {
        console.log(err);
        return res.status(404).json({
          status_code: 404,
          type: "error",
          message: "Lỗi người dùng không tồn tại",
        });
      }

      const user = userResult[0];

      // Truy vấn thông tin phòng ban
      const getDepartmentSql = "SELECT name FROM phong_ban WHERE id = ?";
      connection.query(
        getDepartmentSql,
        [user.id_phong_ban],
        (err, departmentResult) => {
          if (err) {
            console.log(err);
            return res
              .status(500)
              .json({ status_code: 500, type: "error", message: "Lỗi server" });
          }

          const departmentName =
            departmentResult.length > 0 ? departmentResult[0].name : null;

          const userInfo = {
            name: user.name,
            username: user.username,
            phoneNumber: user.phone_number,
            email: user.email,
            phong_ban: departmentName,
          };

          return res.status(200).json({
            status_code: 200,
            type: "success",
            message: "Thông tin người dùng",
            data: userInfo,
          });
        }
      );
    });
  }

  GetAllUserInfo(req, res) {
    // Truy vấn toàn bộ thông tin người dùng từ database
    const getAllUserSql =
      "SELECT u.id, u.name, u.username, u.phone_number, u.email, u.id_phong_ban FROM users u";
    connection.query(getAllUserSql, (err, userResult) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ status_code: 500, type: "error", message: "Lỗi server" });
      }

      if (userResult.length === 0) {
        return res.status(404).json({
          status_code: 404,
          type: "error",
          message: "Chưa có người dùng nào tồn tại",
        });
      }

      // Tạo một mảng mới để lưu trữ data
      const userInfo = [];

      // Lặp qua từng người dùng và truy vấn thông tin phòng ban
      let pendingQueries = 0;
      for (const user of userResult) {
        pendingQueries++;
        const getDepartmentSql = "SELECT name FROM phong_ban WHERE id = ?";
        connection.query(
          getDepartmentSql,
          [user.id_phong_ban],
          (err, departmentResult) => {
            pendingQueries--;
            if (err) {
              console.log(err);
              if (pendingQueries === 0) {
                return res
                  .status(500)
                  .json({
                    status_code: 500,
                    type: "error",
                    message: "Lỗi server",
                  });
              }
              return;
            }

            const departmentName =
              departmentResult.length > 0 ? departmentResult[0].name : null;

            userInfo.push({
              id: user.id,
              name: user.name,
              username: user.username,
              phoneNumber: user.phone_number,
              email: user.email,
              phong_ban: departmentName,
            });

            if (pendingQueries === 0) {
              return res.status(200).json({
                status_code: 200,
                type: "success",
                data: userInfo,
              });
            }
          }
        );
      }
    });
  }

  // Controller for updating user information
  UpdateUserInfo(req, res) {
    const userId = req.params.userId;
    const {
      name,
      username,
      phone_number,
      email,
      id_phong_ban,
    } = req.body;

    // Build the SQL query dynamically based on the fields provided in the request body
    let updateUserSql = "UPDATE users SET ";
    const updateParams = [];

    // Add the fields to be updated and their corresponding values to the query
    if (name !== undefined) {
      updateUserSql += "name = ?, ";
      updateParams.push(name);
    }
    if (username !== undefined) {
      updateUserSql += "username = ?, ";
      updateParams.push(username);
    }
    if (phone_number !== undefined) {
      updateUserSql += "phone_number = ?, ";
      updateParams.push(phone_number);
    }
    if (email !== undefined) {
      updateUserSql += "email = ?, ";
      updateParams.push(email);
    }
    if (id_phong_ban !== undefined) {
      updateUserSql += "id_phong_ban = ?, ";
      updateParams.push(id_phong_ban);
    }


    // if (address !== undefined) {
    //   updateUserSql += "address = ?, ";
    //   updateParams.push(address);
    // }
    // if (mother !== undefined) {
    //   updateUserSql += "mother_name = ?, mother_phone = ?, mother_email = ?, ";
    //   updateParams.push(mother.name, mother.phoneNumber, mother.email);
    // }
    // if (father !== undefined) {
    //   updateUserSql += "parent_name = ?, parent_phone = ?, parent_email = ?, ";
    //   updateParams.push(father.name, father.phoneNumber, father.email);
    // }

    //Update the field updated_at in database
    const updated_at = new Date();
    updateUserSql += "updated_at = ?, ";
    updateParams.push(updated_at);


    // Remove the last comma from the SQL query
    updateUserSql = updateUserSql.slice(0, -2);
    updateUserSql += " WHERE id = ?";
    updateParams.push(userId);

    connection.query(updateUserSql, updateParams, (err, result) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ status_code: 500, type: "error", message: "Server error" });
      }

      if (result.affectedRows === 0) {
        console.log(err);
        return res.status(404).json({
          status_code: 404,
          type: "error",
          message: "Người dùng không tồn tại",
        });
      }

      return res.status(200).json({
        status_code: 200,
        type: "success",
        message: "Cập nhật thông tin người dùng thành công",
      });
    });
  }


//   //Hàm xử lí thay đổi avatar cá nhân
//   ChangeAvatar(req, res) {
//     const userId = req.params.userId;
//     console.log(req.body);
//     const { avatar } = req.body;

//     if (!avatar) {
//       return res.status(400).json({
//         status_code: 400,
//         type: "error",
//         message: "Vui lòng chọn ảnh đại diện",
//       });
//     }

//     try {
//       // Decode ảnh (base64)
//       const imageData = Buffer.from(avatar, "base64");

//       // Tạo filename (unique) cho avatar
//       const filename = `user-${userId}-avatar.jpg`;
//       const filePath = path.join("public", "image", filename);

//       // Lưu ảnh với filePath vào file system
//       fs.writeFileSync(filePath, imageData);

//       // Query update lại trường avatar trong database sử dụng biến publicPath
//       const updateAvatarSql = "UPDATE user SET avatar = ? WHERE userId = ?";
//       connection.query(updateAvatarSql, [filename, userId], (err, result) => {
//         if (err) {
//           console.log(err);
//           return res.status(500).json({
//             status_code: 500,
//             type: "error",
//             message: "Lỗi server",
//           });
//         }

//         if (result.affectedRows === 0) {
//           return res.status(404).json({
//             status_code: 404,
//             type: "error",
//             message: "Người dùng không tồn tại",
//           });
//         }

//         return res.status(200).json({
//           status_code: 200,
//           type: "success",
//           message: "Ảnh đại diện đã được cập nhật thành công",
//           avatar: filename,
//         });
//       });
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({
//         status_code: 500,
//         type: "error",
//         message: "Lỗi server",
//       });
//     }
//   }

//   //Hàm GetUserAvatar để gửi lên client
//   GetUserAvatar(req, res) {
//     const { filename } = req.params;
//     const imagePath = path.resolve(
//       __dirname,
//       "..",
//       "public",
//       "image",
//       filename
//     );

//     res.sendFile(imagePath, (err) => {
//       if (err) {
//         console.error(err);
//         return res.status(404).json({
//           status_code: 404,
//           type: "error",
//           message: "Ảnh không tồn tại",
//         });
//       }
//     });
//   }
}

module.exports = new User();


// NỀU LỠ QUÊN MẬT KHẨU THÌ THAY BẰNG HÀM NÀY ĐỂ ĐỔI LẠI MẬT KHẨU

// //Hàm đổi mật khẩu không hash
//   ChangePassword(req, res) {
//     const { userId } = req.params;
//     const { oldPassword, newPassword } = req.body;

//     // Kiểm tra xem userId có tồn tại trong database không
//     const checkUserSql = "SELECT * FROM user WHERE userId = ?";
//     connection.query(checkUserSql, [userId], (err, result) => {
//       if (err) {
//         console.log(err);
//         return res
//           .status(500)
//           .json({
//             status_code: 500,
//             type: "error",
//             message: "Lỗi không thể thay đổi mật khẩu. Vui lòng thử lại sao",
//           });
//       }

//       if (result.length === 0) {
//         return res
//           .status(404)
//           .json({
//             status_code: 404,
//             type: "error",
//             message: "Lỗi người dùng không tồn tại",
//           });
//       }

//       const user = result[0];

//         // Mã hóa mật khẩu mới
//         bcrypt.hash(newPassword, 10, (err, hash) => {
//           if (err) {
//             console.log(err);
//             return res
//               .status(500)
//               .json({
//                 status_code: 500,
//                 type: "error",
//                 message: "Lỗi trong quá trình xử lí",
//               });
//           }

//           // Cập nhật mật khẩu mới trong database
//           const updatePasswordSql =
//             "UPDATE user SET password = ? WHERE userId = ?";
//           connection.query(updatePasswordSql, [hash, userId], (err, result) => {
//             if (err) {
//               console.log(err);
//               return res
//                 .status(500)
//                 .json({
//                   status_code: 500,
//                   type: "error",
//                   message: "Lỗi trong quá trình xử lí [Database]",
//                 });
//             }

//             return res.json({
//               status_code: 200,
//               type: "success",
//               message: "Đổi mật khẩu thành công",
//             });
//           });
//         });
//       });
//     };
//   }
