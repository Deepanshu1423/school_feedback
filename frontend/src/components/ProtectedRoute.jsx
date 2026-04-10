import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.roleName)) {
    if (user.roleName === "Parent") {
      return <Navigate to={`/parent/dashboard/${user.userId}`} replace />;
    }

    if (user.roleName === "Teacher") {
      return <Navigate to={`/teacher/dashboard/${user.userId}`} replace />;
    }

    if (user.roleName === "Admin") {
      return <Navigate to={`/admin/${user.userId}/dashboard`} replace />;
    }

    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;