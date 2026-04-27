import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";

const Login = () => {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState("Parent");
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!formData.identifier || !formData.password) {
      setMessage("Please enter identifier and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        identifier: formData.identifier,
        password: formData.password,
      });

      const data = response.data;

      if (!data?.token || !data?.user) {
        setMessage("Invalid login response.");
        return;
      }

      const user = data.user;

      if (selectedRole !== user.roleName) {
        setMessage(
          `This account belongs to ${user.roleName}. Please select the correct role and try again.`
        );
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.roleName === "Parent") {
        navigate(`/parent/dashboard/${user.userId}`);
      } else if (user.roleName === "Teacher") {
        navigate(`/teacher/dashboard/${user.userId}`);
      } else if (user.roleName === "Admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const cardBaseClass =
    "rounded-3xl border p-5 transition cursor-pointer";
  const activeCardClass =
    "border-[#d6c2a8] bg-white/10 shadow-lg ring-2 ring-[#b08d57]/50";
  const inactiveCardClass =
    "border-white/10 bg-white/5 hover:bg-white/10";

  return (
    <div className="min-h-screen bg-[#f7f1e8] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-6xl overflow-hidden rounded-3xl bg-[#fffaf3] border border-[#d6c2a8] shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[700px]">
          <div className="flex flex-col justify-center bg-gradient-to-br from-[#1a1a1a] via-[#2d241a] to-[#b08d57] p-8 sm:p-10 lg:p-12 text-white">
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              School Feedback
              <br />
              System
            </h1>

            <p className="mt-5 text-sm sm:text-base leading-8 text-[#f7f1e8]/90">
              A smart platform for Parents and Teachers to manage feedback,
              communication, and performance in one place.
            </p>

            <div className="mt-10 space-y-5">
              <div
                onClick={() => setSelectedRole("Parent")}
                className={`${cardBaseClass} ${
                  selectedRole === "Parent" ? activeCardClass : inactiveCardClass
                }`}
              >
                <p className="text-2xl font-semibold">Parent</p>
                <p className="mt-2 text-sm sm:text-base text-[#f7f1e8]/90">
                  Submit feedback and view history.
                </p>
              </div>

              <div
                onClick={() => setSelectedRole("Teacher")}
                className={`${cardBaseClass} ${
                  selectedRole === "Teacher" ? activeCardClass : inactiveCardClass
                }`}
              >
                <p className="text-2xl font-semibold">Teacher</p>
                <p className="mt-2 text-sm sm:text-base text-[#f7f1e8]/90">
                  View received feedback and respond.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center bg-[#fffaf3] p-6 sm:p-10 lg:p-12">
            <div className="w-full max-w-md">
              <div className="mb-8 text-center lg:text-left">
                <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a]">
                  Welcome Back
                </h2>
                <p className="mt-2 text-sm sm:text-base text-[#6b7280]">
                  Login to continue to your dashboard
                </p>
                <p className="mt-3 inline-block rounded-full bg-[#eee6d8] px-4 py-1 text-sm font-semibold text-[#1a1a1a]">
                  Selected Role: {selectedRole}
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#1a1a1a]">
                    Identifier
                  </label>
                  <input
                    type="text"
                    name="identifier"
                    placeholder={
                      selectedRole === "Parent"
                        ? "Enter email or mobile"
                        : "Enter teacher email or mobile"
                    }
                    value={formData.identifier}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#d6c2a8] bg-[#f7f1e8] px-4 py-3 text-sm text-[#1a1a1a] outline-none transition focus:border-[#b08d57] focus:bg-white focus:ring-4 focus:ring-[#b08d57]/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#1a1a1a]">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-[#d6c2a8] bg-[#f7f1e8] px-4 py-3 pr-12 text-sm text-[#1a1a1a] outline-none transition focus:border-[#b08d57] focus:bg-white focus:ring-4 focus:ring-[#b08d57]/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 px-4 text-[#5b5b5b]"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {message && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#b08d57] px-6 py-3.5 font-semibold text-black shadow-md transition hover:bg-[#c39a5f] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>

              {selectedRole === "Parent" && (
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-[#b08d57] lg:justify-start">
                  <Link
                    to="/register-parent"
                    className="font-medium transition hover:text-[#8d6b3f]"
                  >
                    Parent Registration
                  </Link>
                  <span className="text-[#d6c2a8]">|</span>
                  <Link
                    to="/forgot-password?role=parent"
                    className="font-medium transition hover:text-[#8d6b3f]"
                  >
                    Forgot Password?
                  </Link>
                </div>
              )}

              {selectedRole === "Teacher" && (
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-[#b08d57] lg:justify-start">
                  <Link
                    to="/forgot-password?role=teacher"
                    className="font-medium transition hover:text-[#8d6b3f]"
                  >
                    Forgot Password?
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;