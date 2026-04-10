const checkParentAccess = (req, res, next) => {
  const requestedParentId = parseInt(req.params.parentId || req.body.parentId, 10);
  const loggedInUserId = req.user.userId;
  const loggedInRole = req.user.roleName;

  if (loggedInRole === "Admin") {
    return next();
  }

  if (loggedInRole !== "Parent") {
    return res.status(403).json({
      success: false,
      message: "Only Parent or Admin can access this resource",
    });
  }

  if (loggedInUserId !== requestedParentId) {
    return res.status(403).json({
      success: false,
      message: "You can access only your own parent data",
    });
  }

  next();
};

const checkTeacherAccess = (req, res, next) => {
  const requestedTeacherId = parseInt(req.params.teacherId || req.body.teacherId, 10);
  const loggedInUserId = req.user.userId;
  const loggedInRole = req.user.roleName;

  if (loggedInRole === "Admin") {
    return next();
  }

  if (loggedInRole !== "Teacher") {
    return res.status(403).json({
      success: false,
      message: "Only Teacher or Admin can access this resource",
    });
  }

  if (loggedInUserId !== requestedTeacherId) {
    return res.status(403).json({
      success: false,
      message: "You can access only your own teacher data",
    });
  }

  next();
};

module.exports = {
  checkParentAccess,
  checkTeacherAccess,
};