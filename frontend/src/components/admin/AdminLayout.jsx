import { NavLink, Outlet, useLocation, useNavigate, useParams } from "react-router-dom";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { adminId } = useParams();

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

  return (
    <div className="min-h-screen bg-[#f5f0e6] flex overflow-x-hidden">
      <aside className="w-72 shrink-0 min-h-screen bg-gradient-to-b from-black via-[#1a1410] to-[#a67c3d] text-[#f5f0e6] p-6 shadow-2xl">
        <div className="mb-10">
          <h1 className="text-3xl font-bold leading-tight">School Feedback System</h1>
          <p className="text-sm text-[#e7dcc8] mt-3">Admin Control Panel</p>
        </div>

        <div className="space-y-3">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `block rounded-2xl px-4 py-3 transition-all duration-200 border ${
                  isActive
                    ? "bg-[#d2b07a] text-black border-[#f0d6a6] font-semibold shadow-lg"
                    : "bg-white/10 text-[#f5f0e6] border-white/10 hover:bg-white/20"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </aside>

      <div className="flex-1 min-w-0 min-h-screen overflow-x-hidden">
        <header className="bg-[#f5f0e6] border-b border-[#d6c4a8] px-8 py-5 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h2 className="text-3xl font-bold text-black">{pageDetails.title}</h2>
            <p className="text-sm text-gray-600 mt-1">{pageDetails.subtitle}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-[#e9dfcf] rounded-2xl px-4 py-2 text-right border border-[#d2b07a]">
              <p className="text-xs text-gray-600">Logged in as</p>
              <p className="font-semibold text-black">{user.fullName || "Admin"}</p>
            </div>

            <button
              onClick={handleLogout}
              className="bg-[#b79257] hover:bg-[#a57f42] text-black font-semibold px-5 py-3 rounded-2xl shadow-md transition"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="p-8 w-full min-w-0 max-w-full overflow=-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;