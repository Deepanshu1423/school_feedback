import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate, useParams } from "react-router-dom";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { adminId } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user")) || {};

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("selectedStudentId");
    localStorage.removeItem("selectedStudentName");
    localStorage.removeItem("selectedStudentClass");
    localStorage.removeItem("selectedStudentClassId");
    navigate("/");
  };

  const navItems = [
    { label: "Dashboard", path: `/admin/${adminId}/dashboard` },
    { label: "Teachers", path: `/admin/${adminId}/teachers` },
    { label: "Parents", path: `/admin/${adminId}/parents` },
    { label: "Students", path: `/admin/${adminId}/students` },
    { label: "Classes", path: `/admin/${adminId}/classes` },
    { label: "Subjects", path: `/admin/${adminId}/subjects` },
    { label: "Mappings", path: `/admin/${adminId}/mappings` },
    { label: "Feedback Forms", path: `/admin/${adminId}/feedback-forms` },
    { label: "Reports", path: `/admin/${adminId}/reports` },
    { label: "All Feedbacks", path: `/admin/${adminId}/all-feedbacks` },
  ];

  const getPageDetails = () => {
    if (location.pathname.includes("/dashboard")) {
      return {
        title: "Admin Dashboard",
        subtitle: "Manage teachers, parents, students, forms and reports",
      };
    }
    if (location.pathname.includes("/teachers")) {
      return {
        title: "Teachers Management",
        subtitle: "Manage teacher records, update details, and control active status",
      };
    }
    if (location.pathname.includes("/parents")) {
      return {
        title: "Parents Management",
        subtitle: "Manage parent records, update details, and control active status",
      };
    }
    if (location.pathname.includes("/students")) {
      return {
        title: "Students Management",
        subtitle: "Manage student records, classes, and active status",
      };
    }
    if (location.pathname.includes("/classes")) {
      return {
        title: "Classes Management",
        subtitle: "Manage class records, sections, and academic year details",
      };
    }
    if (location.pathname.includes("/subjects")) {
      return {
        title: "Subjects Management",
        subtitle: "Create, update, and manage subject records",
      };
    }
    if (location.pathname.includes("/mappings")) {
      return {
        title: "Mappings Management",
        subtitle: "Manage parent-student and teacher-class-subject mappings",
      };
    }
    if (location.pathname.includes("/feedback-forms")) {
      return {
        title: "Feedback Forms Management",
        subtitle: "Create and manage feedback forms for the school system",
      };
    }
    if (location.pathname.includes("/reports")) {
      return {
        title: "Reports Management",
        subtitle: "View analytics, reports, and feedback insights",
      };
    }
    if (location.pathname.includes("/all-feedbacks")) {
      return {
        title: "All Feedbacks",
        subtitle: "Review all submitted feedback records in one place",
      };
    }

    return {
      title: "Admin Panel",
      subtitle: "Manage teachers, parents, students, forms and reports",
    };
  };

  const pageDetails = getPageDetails();

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-[#f5f0e6] overflow-x-hidden">
      <div className="flex min-h-screen overflow-x-hidden">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={closeSidebar}
          />
        )}

        <aside
          className={`fixed left-0 top-0 z-50 h-screen w-[280px] max-w-[85vw] transform bg-gradient-to-b from-black via-[#1a1410] to-[#a67c3d] p-5 text-[#f5f0e6] shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:block lg:min-h-screen lg:w-72 lg:shrink-0 lg:translate-x-0 lg:p-6 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-8 flex items-start justify-between lg:mb-10">
            <div>
              <h1 className="text-2xl font-bold leading-tight sm:text-3xl">
                School Feedback System
              </h1>
              <p className="mt-3 text-sm text-[#e7dcc8]">Admin Control Panel</p>
            </div>

            <button
              type="button"
              onClick={closeSidebar}
              className="rounded-xl border border-white/20 px-3 py-2 text-sm text-white lg:hidden"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3 overflow-y-auto pb-6">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `block rounded-2xl border px-4 py-3 transition-all duration-200 ${
                    isActive
                      ? "border-[#f0d6a6] bg-[#d2b07a] font-semibold text-black shadow-lg"
                      : "border-white/10 bg-white/10 text-[#f5f0e6] hover:bg-white/20"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
          <header className="sticky top-0 z-30 border-b border-[#d6c4a8] bg-[#f5f0e6] px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="rounded-xl bg-[#e9dfcf] px-3 py-2 text-black shadow-sm border border-[#d2b07a] lg:hidden"
                >
                  ☰
                </button>

                <div className="min-w-0">
                  <h2 className="text-2xl font-bold text-black sm:text-3xl">
                    {pageDetails.title}
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    {pageDetails.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
                <div className="rounded-2xl border border-[#d2b07a] bg-[#e9dfcf] px-4 py-2 text-left sm:text-right">
                  <p className="text-xs text-gray-600">Logged in as</p>
                  <p className="font-semibold text-black">
                    {user.fullName || "Admin"}
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="rounded-2xl bg-[#b79257] px-5 py-3 font-semibold text-black shadow-md transition hover:bg-[#a57f42]"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          <main className="w-full min-w-0 max-w-full overflow-x-hidden p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;