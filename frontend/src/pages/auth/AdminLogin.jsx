import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../../api/axios";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!identifier || !password) {
      setErrorMessage("Identifier and password are required");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post("/auth/login", {
        identifier,
        password,
      });

      if (response.data.success) {
        const { token, user } = response.data;

        if (user.roleName !== "Admin") {
          setErrorMessage("This page is only for admin login");
          return;
        }

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        navigate(`/admin/${user.userId}/dashboard`);
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f0e6] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-6xl rounded-[32px] overflow-hidden shadow-2xl border border-[#d2b07a] bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="bg-gradient-to-br from-black via-[#1a1410] to-[#a67c3d] text-[#f5f0e6] p-10 lg:p-14 flex flex-col justify-center">
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
              School Feedback
              <br />
              System
            </h1>

            <p className="text-lg leading-8 text-[#ece1cf] max-w-xl">
              Secure admin access to manage teachers, parents, students,
              classes, subjects, feedback forms and reports in one place.
            </p>

            <div className="mt-10 rounded-[28px] border border-[#d2b07a] bg-white/10 p-6">
              <h2 className="text-2xl font-semibold mb-2">Admin Access</h2>
              <p className="text-[#eee2cf] text-base leading-7">
                Use your admin credentials to control the School Feedback System.
              </p>
            </div>
          </div>

          <div className="bg-[#f7f1e8] p-8 lg:p-14 flex flex-col justify-center">
            <h2 className="text-4xl font-bold text-black mb-2">Welcome Back</h2>
            <p className="text-gray-600 text-lg">
              Login to continue to admin dashboard
            </p>

            <div className="mt-5 inline-flex w-fit rounded-full bg-[#e7dcc8] px-5 py-2 text-sm font-semibold text-black border border-[#d2b07a]">
              Selected Role: Admin
            </div>

            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Identifier
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter email, mobile or admin code"
                  className="w-full rounded-2xl border border-[#b9c7da] bg-[#dfe7f5] px-4 py-4 text-black outline-none focus:border-[#b79257] focus:ring-2 focus:ring-[#d2b07a]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Password
                </label>

                <div className="flex items-center rounded-2xl border border-[#b9c7da] bg-[#dfe7f5] overflow-hidden focus-within:border-[#b79257] focus-within:ring-2 focus-within:ring-[#d2b07a]">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-transparent px-4 py-4 text-black outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="px-4 text-gray-600 font-medium"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[#b79257] hover:bg-[#a57f42] disabled:opacity-70 text-black font-semibold py-4 shadow-md transition"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="mt-6 text-sm">
              <Link
                to="/"
                className="text-[#a57f42] font-semibold hover:underline"
              >
                Back to Parent / Teacher Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;