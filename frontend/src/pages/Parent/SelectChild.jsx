import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

const SelectChild = () => {
  const navigate = useNavigate();
  const { parentId } = useParams();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [parentName, setParentName] = useState("Parent");
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setLoading(true);
        setMessage("");

        const response = await api.get(`/parent/dashboard/${parentId}`);
        const data = response.data?.data || {};

        setParentName(data?.parent?.parentName || "Parent");

        const studentList = data?.students || [];
        setStudents(studentList);

        if (studentList.length === 1) {
          const student = studentList[0];
          localStorage.setItem("selectedStudentId", String(student.studentId));
          localStorage.setItem("selectedStudentName", student.studentName || "");
          localStorage.setItem(
            "selectedStudentClass",
            `${student.class?.className || ""}-${student.class?.section || ""}`
          );
            localStorage.setItem(
                "selectedStudentClassId",
                String(student.class?.classId || "")
            );
          navigate(`/parent/dashboard/${parentId}`);
          return;
        }

        if (studentList.length > 1) {
          setSelectedStudentId(String(studentList[0].studentId));
        }
      } catch (error) {
        setMessage(
          error.response?.data?.message || "Failed to load children list."
        );
      } finally {
        setLoading(false);
      }
    };

    if (parentId) {
      fetchChildren();
    }
  }, [parentId, navigate]);

  const handleContinue = () => {
    const selectedStudent = students.find(
      (student) => String(student.studentId) === String(selectedStudentId)
    );

    if (!selectedStudent) {
      setMessage("Please select a child.");
      return;
    }

    localStorage.setItem("selectedStudentId", String(selectedStudent.studentId));
    localStorage.setItem("selectedStudentName", selectedStudent.studentName || "");
    localStorage.setItem(
        "selectedStudentClass",
        `${selectedStudent.class?.className || ""}-${selectedStudent.class?.section || ""}`
      );
        localStorage.setItem(
            "selectedStudentClassId",
             String(selectedStudent.class?.classId || "")
    );

    navigate(`/parent/dashboard/${parentId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("selectedStudentId");
    localStorage.removeItem("selectedStudentName");
    localStorage.removeItem("selectedStudentClass");
    localStorage.removeItem("selectedStudentClassId");
    navigate("/", { replace: true });
    };

  return (
    <div className="min-h-screen bg-[#f7f1e8] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-[#fffaf3] border border-[#d6c2a8] shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[650px]">
          <div className="flex flex-col justify-center bg-gradient-to-br from-[#1a1a1a] via-[#2d241a] to-[#b08d57] p-8 sm:p-10 lg:p-12 text-white">
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              Select
              <br />
              Child
            </h1>

            <p className="mt-5 text-sm sm:text-base leading-7 text-[#f7f1e8]/90">
              Choose the child you want to continue with. Dashboard, feedback
              submission, and feedback history will open for the selected child.
            </p>

            <div className="mt-10 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-xl font-semibold">Selected child context</p>
                <p className="mt-1 text-sm sm:text-base text-[#f7f1e8]/90">
                  You will not need to select the child again on every page.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-xl font-semibold">Can be changed later</p>
                <p className="mt-1 text-sm sm:text-base text-[#f7f1e8]/90">
                  You can switch the child anytime using the Change Child button.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center bg-[#fffaf3] p-6 sm:p-10 lg:p-12">
            <div className="w-full max-w-md">

                <div className="mb-6 flex justify-end">
                    <button
                        onClick={handleLogout}
                        className="rounded-xl bg-[#b08d57] px-5 py-2.5 font-semibold text-black shadow-sm transition hover:bg-[#c39a5f]"
                    >
                        Logout
                    </button>
                </div>
              <div className="mb-8 text-center lg:text-left">
                <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a]">
                  Welcome, {parentName}
                </h2>
                <p className="mt-2 text-sm sm:text-base text-[#6b7280]">
                  Select the child you want to continue with
                </p>
              </div>

              {loading && (
                <div className="rounded-xl border border-[#d6c2a8] bg-[#f7f1e8] p-4 text-sm text-[#1a1a1a]">
                  Loading children...
                </div>
              )}

              {!loading && students.length > 1 && (
                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#1a1a1a]">
                      Select Child
                    </label>
                    <select
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                      className="w-full rounded-xl border border-[#d6c2a8] bg-[#f7f1e8] px-4 py-3 text-sm text-[#1a1a1a] outline-none transition focus:border-[#b08d57] focus:bg-white focus:ring-4 focus:ring-[#b08d57]/20"
                    >
                      {students.map((student) => (
                        <option key={student.studentId} value={student.studentId}>
                          {student.studentName} - {student.class?.className}
                          {student.class?.section ? `-${student.class.section}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleContinue}
                    className="w-full rounded-xl bg-[#b08d57] px-4 py-3 font-semibold text-black shadow-md transition hover:bg-[#c39a5f]"
                  >
                    Continue
                  </button>
                </div>
              )}

              {!loading && students.length === 0 && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  No child found for this parent.
                </div>
              )}

              {message && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectChild;