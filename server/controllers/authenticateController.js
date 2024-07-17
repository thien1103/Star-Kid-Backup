const { connection } = require("../configuration/dbConfig");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const salt = 10;

// Get the domain from an environment variable
const domainURL = process.env.VERIFICATION_DOMAIN || "localhost:8081";

class Authentication {
  // Hàm đăng nhập Sign In
  SignIn(req, res, next) {
    const { phoneNumber, password } = req.body;
    const sql =
      "SELECT id, password, phone_number FROM users WHERE phone_number = ?";

    connection.query(sql, [phoneNumber], (err, data) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ status_code: 500, type: "error", message: "Lỗi server" });
      }

      if (data.length === 0) {
        return res.status(404).json({
          status_code: 404,
          type: "error",
          message: "Người dùng không tồn tại",
        });
      }

      bcrypt.compare(password.toString(), data[0].password, (err, response) => {
        if (err) {
          return res.status(500).json({
            status_code: 500,
            type: "error",
            message: "Có lỗi trong quá trình xử lí",
          });
        }

        if (!response) {
          return res.status(401).json({
            status_code: 401,
            type: "error",
            message: "Sai mật khẩu",
          });
        }

        const userId = data[0].id;

        // Query roles and permissions
        const roleSql = `
                SELECT 
            r.id AS role_id, 
            r.name AS role_name,
            GROUP_CONCAT(DISTINCT p.id) AS id_permissions,
            GROUP_CONCAT(DISTINCT p.name) AS permission_names
        FROM roles r
        JOIN role_permission rp ON r.id = rp.id_role
        JOIN permissions p ON rp.id_permission = p.id
        WHERE r.id IN (SELECT role_id FROM user_role WHERE user_id = ?)
        GROUP BY r.id, r.name;
      `;

        /**  SELECT DISTINCT r.id AS role_id, r.name as role_name, rp.id_permission, p.name AS permission_name
        FROM roles r
        JOIN role_permission rp ON r.id = rp.id_role
        JOIN permissions p ON rp.id_permission = p.id
        WHERE r.id IN (SELECT role_id FROM user_role WHERE user_id = ?)
          **/

        connection.query(roleSql, [userId], (err, roleData) => {
          if (err) {
            console.log(err);
            return res.status(500).json({
              status_code: 500,
              type: "error",
              message: "Lỗi server khi truy vấn vai trò và quyền",
            });
          }

          const roles = roleData[0].role_name;
          // const permissions = roleData.map((row) => row.permission_name);
          const permissions = roleData[0].permission_names;
          const payload = { id: userId, role: roles, permissions };

          // Ensure to use the same secret key
          const token = jwt.sign(payload, "jwt-secret-key", {
            algorithm: "HS256",
          });

          return res.status(200).json({
            status_code: 200,
            type: "success",
            message: "Đăng nhập thành công",
            data: { id: userId, token, role: roles, permissions },
          });
        });
      });
    });
  }

  // checkPhoneExist(req, res) {
  //     console.log("Phone Number: ", req.body.phoneNumber);
  //     const userSql = `SELECT COUNT(*) AS count FROM user WHERE phoneNumber = ?`;

  //     connection.query(userSql, req.body.phoneNumber, (err, data) => {
  //         if (err) {
  //             console.log(err);
  //             return res.json(({ Error: "Lỗi xác thực kiểm tra số điện thoại" }))
  //         }
  //         if (data.some(row => row.count > 0)) {
  //             res.json({ phoneError: "Số điện thoại đã tồn tại" });
  //         } else return res.json({ Status: "Success" });
  //     })
  // };

  //Hàm đăng kí Sign Up
  SignUp(req, res) {
    // Kiểm tra số điện thoại đã tồn tại chưa
    const checkPhoneQuery =
      "SELECT COUNT(*) AS count FROM users WHERE phone_number = ?";
    connection.query(
      checkPhoneQuery,
      [req.body.phoneNumber],
      (err, phoneResult) => {
        if (err) {
          return res.status(500).json({
            status_code: 500,
            type: "error",
            message: "Lỗi trong quá trình xử lí",
          });
        }

        if (phoneResult[0].count > 0) {
          return res.status(400).json({
            status_code: 400,
            type: "error",
            message:
              "Số điện thoại đã được đăng kí. Vui lòng sử dụng số điện thoại khác",
          });
        }

        // Kiểm tra username đã tồn tại chưa
        const checkUsernameQuery =
          "SELECT COUNT(*) AS count FROM users WHERE username = ?";
        connection.query(
          checkUsernameQuery,
          [req.body.username],
          (err, usernameResult) => {
            if (err) {
              return res.status(500).json({
                status_code: 500,
                type: "error",
                message: "Lỗi trong quá trình xử lí",
              });
            }

            if (usernameResult[0].count > 0) {
              return res.status(400).json({
                status_code: 400,
                type: "error",
                message:
                  "Tên đăng nhập đã được sử dụng. Vui lòng sử dụng tên đăng nhập khác",
              });
            }

            const sql = `INSERT INTO users (username, phone_number, password, name, email, email_verified_at, id_phong_ban, isActived, isDeleted, created_at, updated_at) VALUES (?)`;
            bcrypt.hash(req.body.password.toString(), salt, (err, hash) => {
              if (err) {
                return res.status(500).json({
                  status_code: 500,
                  type: "error",
                  message: "Lỗi trong quá trình xử lí",
                });
              }
              const email_verified_at = null;
              const createdAt = new Date();
              const isActived = 1;
              const isDeleted = null;
              const rememberToken = null;
              const updated_at = null;
              const values = [
                req.body.username,
                req.body.phoneNumber,
                hash,
                req.body.name,
                req.body.email,
                email_verified_at,
                req.body.phongban,
                isActived,
                isDeleted,
                createdAt,
                updated_at,
              ];

              connection.query(sql, [values], (err, result) => {
                if (err) {
                  console.log(err);
                  return res.status(400).json({
                    status_code: 400,
                    type: "error",
                    message: "Đăng kí không thành công",
                  });
                } else {
                  const userId = result.insertId;
                  const token = crypto.randomBytes(16).toString("hex");

                  const verificationUrl = `http://${domainURL}/api/verify-email?token=${token}&id=${userId}`;

                  const transporter = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                      user: "tuhaothien52@gmail.com",
                      pass: "jltn kvtz znxr xgzj",
                    },
                  });

                  const mailOptions = {
                    from: "tuhaothien52@gmail.com",
                    to: req.body.email,
                    subject: "Email Verification For Star Kid",
                    text: `To verify your email. Follow this link: ${verificationUrl}`,
                  };

                  transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                      console.log(error);
                      return res.status(500).json({
                        status_code: 500,
                        type: "error",
                        message:
                          "Lỗi trong quá trình xử lí. Vui lòng thử lại sau",
                      });
                    }
                    console.log("Email sent: " + info.response);

                    // Save the token to the database
                    connection.query(
                      `UPDATE users SET remember_token = ? WHERE id = ?`,
                      [token, userId],
                      (err, result) => {
                        if (err) {
                          console.log(err);
                          return res.status(500).json({
                            status_code: 500,
                            type: "error",
                            message:
                              "Lỗi trong quá trình xử lí. Vui lòng thử lại sau",
                          });
                        }
                        return res.status(201).json({
                          status_code: 201,
                          type: "success",
                          message:
                            "Đăng kí thành công. Vui lòng kiểm tra email của bạn.",
                        });
                      }
                    );
                  });
                }
              });
            });
          }
        );
      }
    );
  }

  //Hàm đăng xuất
  async logoutExecute(req, res, next) {
    try {
      const authorizationHeader = req.headers.authorization;

      // Extract the token from the Authorization header
      const token = authorizationHeader.split(" ")[1];
      // Clear cookie
      res.clearCookie("token");
      console.log("Cookie is cleared");
      // Trả về thành công
      return res.status(200).json({
        status_code: 200,
        type: "success",
        message: "Đăng xuất thành công",
      });
    } catch (error) {
      console.error("Error during logout:", error);
      return res
        .status(500)
        .json({ status_code: 500, type: "error", message: "Lỗi server" });
    }
  }
  //   //Hàm chỉ định verify cho token
  //   showVerifyUser(req, res) {
  //     return res.json({ Status: "Success", name: req.name, phoneNumber: req.phoneNumber, userId: req.userId });
  // }

  //Hàm đổi mật khẩu
  ChangePassword(req, res) {
    const { userId, oldPassword, newPassword } = req.body;

    // Kiểm tra xem userId có tồn tại trong database không
    const checkUserSql = "SELECT * FROM users WHERE id = ?";
    connection.query(checkUserSql, [userId], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          status_code: 500,
          type: "error",
          message: "Lỗi không thể thay đổi mật khẩu. Vui lòng thử lại sao",
        });
      }

      if (result.length === 0) {
        return res.status(404).json({
          status_code: 404,
          type: "error",
          message: "Lỗi người dùng không tồn tại",
        });
      }

      const user = result[0];

      // Kiểm tra mật khẩu cũ
      bcrypt.compare(oldPassword, user.password, (err, match) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            status_code: 500,
            type: "error",
            message: "Lỗi trong quá trình xử lí",
          });
        }

        if (!match) {
          return res.status(400).json({
            status_code: 400,
            type: "error",
            message: "Mật khẩu cũ không đúng",
          });
        }

        // Mã hóa mật khẩu mới
        bcrypt.hash(newPassword, 10, (err, hash) => {
          if (err) {
            console.log(err);
            return res.status(500).json({
              status_code: 500,
              type: "error",
              message: "Lỗi trong quá trình xử lí",
            });
          }

          // Cập nhật mật khẩu mới trong database
          const updatePasswordSql =
            "UPDATE users SET password = ? WHERE id = ?";
          connection.query(updatePasswordSql, [hash, userId], (err, result) => {
            if (err) {
              console.log(err);
              return res.status(500).json({
                status_code: 500,
                type: "error",
                message: "Lỗi trong quá trình xử lí [Database]",
              });
            }

            return res.json({
              status_code: 200,
              type: "success",
              message: "Đổi mật khẩu thành công",
            });
          });
        });
      });
    });
  }

  VerifyEmail(req, res) {
    const { token, id } = req.query;

    if (!token || !id) {
      return res.status(400).json({
        status_code: 400,
        type: "error",
        message: "Yêu cầu không hợp lệ, vui lòng bổ sung token hoặc id",
      });
    }

    connection.query(
      `SELECT * FROM users WHERE id = ? AND remember_token = ?`,
      [id, token],
      (err, results) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            status_code: 500,
            type: "error",
            message: "Lỗi server",
          });
        }

        if (results.length === 0) {
          return res.status(400).json({
            status_code: 400,
            type: "error",
            message: "Token hoặc người dùng không hợp lệ",
          });
        }

        connection.query(
          `UPDATE users SET email_verified_at = ?, remember_token = null WHERE id = ?`,
          [new Date(), id],
          (err, result) => {
            if (err) {
              console.log(err);
              return res.status(500).json({
                status_code: 500,
                type: "error",
                message: "Không thể xác thực email",
              });
            }
            const responseData = {
              status_code: 200,
              type: "success",
              message: "Email đã được xác thực thành công",
            };
            return res
              .status(200)
              .send(
                `
            <!DOCTYPE html>
            <html>
            <head>
              <title>Email Verification Successful</title>
              <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
              <style>
                body {
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  margin: 0;
                  background-color: #f5f5f5;
                }
                .card {
                  max-width: 500px;
                  width: 100%;
                }
              </style>
            </head>
            <body>
              <div class="card">
                <div class="card-body">
                  <div class="text-center">
                    <i class="fas fa-check-circle fa-5x text-success mb-4"></i>
                    <h2 class="card-title">Xác Thực Email Thành Công</h2>
                    <p class="card-text">Chúc mừng bạn đã kích hoạt thành công email cá nhân. Chào mừng bạn đến với ngôi nhà chung Star Kid.</p>
                  </div>
                </div>
              </div>

              <script src="https://kit.fontawesome.com/your-font-awesome-kit.js"></script>
            </body>
            </html>
          `
              )
              .json(responseData);
          }
        );
      }
    );
  }
}
module.exports = new Authentication();
