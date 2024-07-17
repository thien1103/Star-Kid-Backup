// Middleware to check roles or permissions
const checkPermission = (requiredPermissions) => {
  return (req, res, next) => {
    const user = req.user; // Assume the user is attached to the request

    if (!user || !user.role) {
      return res.status(403).json({
        status_code: 403,
        type: "error",
        message: "Từ chối truy cập. Quyền hạn chưa tồn tại",
      });
    }

    const hasPermission = requiredPermissions.some((role) =>
      user.role.includes(role)
    );

    if (!hasPermission) {
      return res.status(403).json({
        status_code: 403,
        type: "error",
        message: "Bạn không có quyền truy cập trang này",
      });
    }

    next();
  };
};

module.exports = checkPermission;
