import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import api from "../../api/axios";

const cleanStorageValue = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    value === "undefined" ||
    value === "null"
  ) {
    return "";
  }
  return value;
};

const SubmitFeedback = () => {
  const navigate = useNavigate();
  const { parentId } = useParams();
  const [searchParams] = useSearchParams();

  const formIdFromQuery = searchParams.get("formId") || "";

  const [selectedStudentId, setSelectedStudentId] = useState(
    cleanStorageValue(localStorage.getItem("selectedStudentId"))
  );
  const [selectedStudentName, setSelectedStudentName] = useState(
    cleanStorageValue(localStorage.getItem("selectedStudentName"))
  );
  const [selectedStudentClass, setSelectedStudentClass] = useState(
    cleanStorageValue(localStorage.getItem("selectedStudentClass"))
  );
  const [selectedStudentClassId, setSelectedStudentClassId] = useState(
    cleanStorageValue(localStorage.getItem("selectedStudentClassId"))
  );

  const [students, setStudents] = useState([]);

  const [formData, setFormData] = useState({
    studentId: cleanStorageValue(localStorage.getItem("selectedStudentId")),
    teacherId: "",
    classId: cleanStorageValue(localStorage.getItem("selectedStudentClassId")),
    subjectId: "",
    feedbackFormId: formIdFromQuery || "",
    categoryId: "",
    rating: "",
    comments: "",
  });

  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropdownLoading, setDropdownLoading] = useState(false);

  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [hoverRating, setHoverRating] = useState(0);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("selectedStudentId");
    localStorage.removeItem("selectedStudentName");
    localStorage.removeItem("selectedStudentClass");
    localStorage.removeItem("selectedStudentClassId");
    navigate("/");
  };

  const fetchDropdownData = async ({
    studentId,
    classId,
    teacherId = "",
    subjectId = "",
    preserveFeedbackForm = true,
    clearMessage = true,
  }) => {
    try {
      setDropdownLoading(true);

      if (clearMessage) {
        setMessage("");
      }

      const response = await api.get(
        `/parent/dropdown-data/${parentId}?studentId=${studentId}&classId=${classId}&teacherId=${teacherId}&subjectId=${subjectId}`
      );

      const data = response.data?.data || {};
      const forms = data.feedbackForms || [];
      const nextTeachers = data.teachers || [];
      const nextSubjects = data.subjects || [];
      const nextCategories = data.categories || [];

      setTeachers(nextTeachers);
      setSubjects(nextSubjects);
      setCategories(nextCategories);

      setFormData((prev) => {
        const requestedTeacherId = teacherId ?? prev.teacherId ?? "";
        const requestedSubjectId = subjectId ?? prev.subjectId ?? "";

        const teacherStillExists = requestedTeacherId
          ? nextTeachers.some(
              (teacher) => String(teacher.id) === String(requestedTeacherId)
            )
          : true;

        const subjectStillExists = requestedSubjectId
          ? nextSubjects.some(
              (subject) => String(subject.id) === String(requestedSubjectId)
            )
          : true;

        return {
          ...prev,
          studentId,
          classId,
          teacherId:
            requestedTeacherId && teacherStillExists ? requestedTeacherId : "",
          subjectId:
            requestedSubjectId && subjectStillExists ? requestedSubjectId : "",
          feedbackFormId: preserveFeedbackForm
            ? prev.feedbackFormId || formIdFromQuery || forms[0]?.id || ""
            : formIdFromQuery || forms[0]?.id || "",
          categoryId: prev.categoryId || "",
        };
      });
    } catch (error) {
      setTeachers([]);
      setSubjects([]);
      setCategories([]);
      setIsSuccess(false);
      setMessage(
        error.response?.data?.message || "Failed to load dropdown data."
      );
    } finally {
      setDropdownLoading(false);
    }
  };

  useEffect(() => {
    const fetchParentDashboard = async () => {
      try {
        setMessage("");
        setIsSuccess(false);

        const response = await api.get(`/parent/dashboard/${parentId}`);
        const studentsData = response.data?.data?.students || [];
        setStudents(studentsData);

        if (studentsData.length > 0) {
          const storedStudentId = cleanStorageValue(
            localStorage.getItem("selectedStudentId")
          );

          const activeStudent = studentsData.some(
            (student) => String(student.studentId) === String(storedStudentId)
          )
            ? studentsData.find(
                (student) => String(student.studentId) === String(storedStudentId)
              )
            : studentsData[0];

          if (activeStudent) {
            const classId = String(activeStudent.class?.classId || "");
            const classText = `${activeStudent.class?.className || ""}${
              activeStudent.class?.section ? `-${activeStudent.class.section}` : ""
            }`;

            localStorage.setItem(
              "selectedStudentId",
              String(activeStudent.studentId)
            );
            localStorage.setItem(
              "selectedStudentName",
              activeStudent.studentName || ""
            );
            localStorage.setItem("selectedStudentClass", classText);
            localStorage.setItem("selectedStudentClassId", classId);

            setSelectedStudentId(String(activeStudent.studentId));
            setSelectedStudentName(activeStudent.studentName || "");
            setSelectedStudentClass(classText);
            setSelectedStudentClassId(classId);

            setFormData((prev) => ({
              ...prev,
              studentId: String(activeStudent.studentId),
              classId,
            }));
          }
        } else {
          setSelectedStudentId("");
          setSelectedStudentName("");
          setSelectedStudentClass("");
          setSelectedStudentClassId("");
          setFormData((prev) => ({
            ...prev,
            studentId: "",
            classId: "",
          }));
        }
      } catch (error) {
        setIsSuccess(false);
        setMessage(
          error.response?.data?.message || "Failed to load parent dashboard."
        );
      }
    };

    if (parentId) {
      fetchParentDashboard();
    }
  }, [parentId]);

  useEffect(() => {
    if (!parentId || !selectedStudentId || !selectedStudentClassId) return;

    fetchDropdownData({
      studentId: selectedStudentId,
      classId: selectedStudentClassId,
      teacherId: "",
      subjectId: "",
      preserveFeedbackForm: true,
      clearMessage: true,
    });
  }, [parentId, selectedStudentId, selectedStudentClassId, formIdFromQuery]);

  const handleStudentChange = (e) => {
    const newStudentId = e.target.value;

    const selected = students.find(
      (student) => String(student.studentId) === String(newStudentId)
    );

    if (selected) {
      const classId = String(selected.class?.classId || "");
      const classText = `${selected.class?.className || ""}${
        selected.class?.section ? `-${selected.class.section}` : ""
      }`;

      localStorage.setItem("selectedStudentId", String(selected.studentId));
      localStorage.setItem("selectedStudentName", selected.studentName || "");
      localStorage.setItem("selectedStudentClass", classText);
      localStorage.setItem("selectedStudentClassId", classId);

      setSelectedStudentId(String(selected.studentId));
      setSelectedStudentName(selected.studentName || "");
      setSelectedStudentClass(classText);
      setSelectedStudentClassId(classId);

      setTeachers([]);
      setSubjects([]);
      setCategories([]);
      setHoverRating(0);
      setMessage("");
      setIsSuccess(false);

      setFormData((prev) => ({
        ...prev,
        studentId: String(selected.studentId),
        classId,
        teacherId: "",
        subjectId: "",
        categoryId: "",
        rating: "",
        comments: "",
      }));
    }
  };

  const handleTeacherChange = async (e) => {
    const teacherId = e.target.value;

    await fetchDropdownData({
      studentId: selectedStudentId,
      classId: selectedStudentClassId,
      teacherId,
      subjectId: formData.subjectId || "",
      preserveFeedbackForm: true,
      clearMessage: true,
    });
  };

  const handleSubjectChange = async (e) => {
    const subjectId = e.target.value;

    await fetchDropdownData({
      studentId: selectedStudentId,
      classId: selectedStudentClassId,
      teacherId: formData.teacherId || "",
      subjectId,
      preserveFeedbackForm: true,
      clearMessage: true,
    });
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      studentId: selectedStudentId,
      classId: selectedStudentClassId,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRatingClick = (value) => {
    setFormData((prev) => ({
      ...prev,
      studentId: selectedStudentId,
      classId: selectedStudentClassId,
      rating: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsSuccess(false);

    const {
      teacherId,
      classId,
      subjectId,
      feedbackFormId,
      categoryId,
      rating,
      comments,
    } = formData;

    if (
      !feedbackFormId ||
      !parentId ||
      !selectedStudentId ||
      !teacherId ||
      !classId ||
      !subjectId ||
      !categoryId ||
      !rating
    ) {
      setMessage("Please fill all required fields.");
      return;
    }

    if (Number(rating) < 1 || Number(rating) > 5) {
      setMessage("Rating must be between 1 and 5.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/feedback/submit", {
        feedbackFormId,
        parentId,
        studentId: selectedStudentId,
        teacherId,
        classId,
        subjectId,
        categoryId,
        rating,
        comments,
      });

      setIsSuccess(true);
      setMessage("Feedback submitted successfully.");

      setFormData((prev) => ({
        ...prev,
        studentId: selectedStudentId,
        teacherId: "",
        classId: selectedStudentClassId,
        subjectId: "",
        feedbackFormId: prev.feedbackFormId,
        categoryId: "",
        rating: "",
        comments: "",
      }));

      setHoverRating(0);

      await fetchDropdownData({
        studentId: selectedStudentId,
        classId: selectedStudentClassId,
        teacherId: "",
        subjectId: "",
        preserveFeedbackForm: true,
        clearMessage: false,
      });
    } catch (error) {
      setIsSuccess(false);
      setMessage(
        error.response?.data?.message || "Failed to submit feedback."
      );
    } finally {
      setLoading(false);
    }
  };

  const ratingLabel =
    {
      1: "Poor",
      2: "Fair",
      3: "Good",
      4: "Very Good",
      5: "Excellent",
    }[hoverRating || Number(formData.rating)] || "Click stars to rate";

  return (
    <div className="min-h-screen bg-[#f7f1e8]">
      <div className="mx-auto w-full max-w-7xl">
        <header className="border-b border-[#d6c2a8] bg-[#fffaf3]">
          <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-[#1a1a1a] sm:text-3xl">
                Submit Feedback
              </h1>
              <p className="mt-1 text-sm text-[#6b7280] sm:text-base">
                Share your feedback for the selected child
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap lg:w-auto lg:justify-end">
              <select
                value={selectedStudentId}
                onChange={handleStudentChange}
                className="w-full rounded-xl border border-[#d6c2a8] bg-[#e8dcc8] px-4 py-2.5 pr-10 font-semibold text-black shadow-sm outline-none transition hover:bg-[#ddcfb8] sm:w-auto sm:min-w-[220px]"
              >
                {students.map((student) => (
                  <option key={student.studentId} value={student.studentId}>
                    {student.studentName}
                    {student.class?.className
                      ? ` - ${student.class.className}${
                          student.class?.section ? `-${student.class.section}` : ""
                        }`
                      : ""}
                  </option>
                ))}
              </select>

              <button
                onClick={() => navigate(`/parent/dashboard/${parentId}`)}
                className="w-full rounded-xl bg-[#b08d57] px-5 py-2.5 font-semibold text-black shadow-sm transition hover:bg-[#c39a5f] sm:w-auto"
              >
                Back to Dashboard
              </button>

              <button
                onClick={() => navigate(`/parent/feedback-history/${parentId}`)}
                className="w-full rounded-xl bg-[#b08d57] px-5 py-2.5 font-semibold text-black shadow-sm transition hover:bg-[#c39a5f] sm:w-auto"
              >
                Feedback History
              </button>

              <button
                onClick={handleLogout}
                className="w-full rounded-xl bg-[#e8dcc8] px-5 py-2.5 font-semibold text-black shadow-sm transition hover:bg-[#d6c2a8] sm:w-auto"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 py-5 sm:px-6 lg:px-8">
          <section className="mb-5 rounded-3xl border border-[#d6c2a8] bg-[#fffaf3] p-4 shadow-lg sm:p-5 lg:p-6">
            <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-[#2f2418]/20 bg-gradient-to-br from-[#171311] via-[#2b2119] to-[#b08d57] p-5 text-white sm:p-6">
              <div className="flex flex-col gap-4">
                <div className="max-w-2xl">
                  <h2 className="text-2xl font-bold leading-tight sm:text-3xl">
                    Parent Feedback Form
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#f7f1e8]/90 sm:text-base">
                    Submit feedback for the selected child. Teacher and subject
                    fields will auto-filter based on your selection.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-[#d6c2a8] bg-[#fffaf3] p-4 shadow-md sm:p-6 lg:p-7">
            {dropdownLoading && (
              <div className="mb-4 rounded-2xl border border-[#eadfcf] bg-[#f8f3ea] px-4 py-3 text-sm font-medium text-[#5f5446]">
                Loading teacher, subject, and category data...
              </div>
            )}

            {message && (
              <div
                className={`mb-5 rounded-2xl px-4 py-3 text-sm font-medium ${
                  isSuccess
                    ? "border border-green-200 bg-green-50 text-green-700"
                    : "border border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                <div className="min-w-0">
                  <label className="mb-2 block text-sm font-semibold text-[#1a1a1a]">
                    Selected Child
                  </label>
                  <input
                    type="text"
                    value={selectedStudentName}
                    disabled
                    className="w-full rounded-2xl border border-[#d6c2a8] bg-[#eee6d8] px-4 py-3 text-sm text-[#5b5b5b] outline-none"
                  />
                </div>

                <div className="min-w-0">
                  <label className="mb-2 block text-sm font-semibold text-[#1a1a1a]">
                    Class
                  </label>
                  <input
                    type="text"
                    value={selectedStudentClass}
                    disabled
                    className="w-full rounded-2xl border border-[#d6c2a8] bg-[#eee6d8] px-4 py-3 text-sm text-[#5b5b5b] outline-none"
                  />
                </div>

                <div className="min-w-0">
                  <label className="mb-2 block text-sm font-semibold text-[#1a1a1a]">
                    Teacher <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="teacherId"
                    value={formData.teacherId}
                    onChange={handleTeacherChange}
                    disabled={dropdownLoading}
                    className="w-full rounded-2xl border border-[#d6c2a8] bg-[#f7f1e8] px-4 py-3 text-sm text-black outline-none transition focus:border-[#b08d57] focus:bg-white focus:ring-2 focus:ring-[#b08d57]/20 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <option value="">Select teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="min-w-0">
                  <label className="mb-2 block text-sm font-semibold text-[#1a1a1a]">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="subjectId"
                    value={formData.subjectId}
                    onChange={handleSubjectChange}
                    disabled={dropdownLoading}
                    className="w-full rounded-2xl border border-[#d6c2a8] bg-[#f7f1e8] px-4 py-3 text-sm text-black outline-none transition focus:border-[#b08d57] focus:bg-white focus:ring-2 focus:ring-[#b08d57]/20 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <option value="">Select subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="min-w-0">
                  <label className="mb-2 block text-sm font-semibold text-[#1a1a1a]">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    disabled={dropdownLoading}
                    className="w-full rounded-2xl border border-[#d6c2a8] bg-[#f7f1e8] px-4 py-3 text-sm text-black outline-none transition focus:border-[#b08d57] focus:bg-white focus:ring-2 focus:ring-[#b08d57]/20 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rounded-3xl border border-[#eadfcf] bg-[#fcf8f1] p-4 sm:p-5">
                <label className="mb-3 block text-sm font-semibold text-[#1a1a1a]">
                  Rating <span className="text-red-500">*</span>
                </label>

                <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                  {[1, 2, 3, 4, 5].map((value) => {
                    const activeValue = hoverRating || Number(formData.rating);

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleRatingClick(value)}
                        onMouseEnter={() => setHoverRating(value)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-transform duration-150 hover:scale-110"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill={value <= activeValue ? "#b08d57" : "#d8d2c7"}
                          className="h-10 w-10 drop-shadow-sm sm:h-11 sm:w-11 md:h-12 md:w-12"
                        >
                          <path d="M12 2.5l2.93 5.94 6.56.95-4.75 4.63 1.12 6.53L12 17.77l-5.86 3.08 1.12-6.53L2.5 9.39l6.56-.95L12 2.5z" />
                        </svg>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <span className="w-fit rounded-full bg-[#eee6d8] px-3 py-1 text-sm font-semibold text-[#1a1a1a]">
                    {formData.rating ? `${formData.rating}/5` : "Select rating"}
                  </span>

                  <span className="text-sm font-medium text-[#6b7280]">
                    {ratingLabel}
                  </span>
                </div>
              </div>

              <div className="min-w-0">
                <label className="mb-2 block text-sm font-semibold text-[#1a1a1a]">
                  Comments
                </label>
                <textarea
                  name="comments"
                  rows="4"
                  placeholder="Write your feedback here..."
                  value={formData.comments}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-[#d6c2a8] bg-[#f7f1e8] px-4 py-3 text-sm text-black outline-none transition focus:border-[#b08d57] focus:bg-white focus:ring-2 focus:ring-[#b08d57]/20"
                />
                <p className="mt-2 text-xs text-[#8a8175]">
                  Keep your feedback clear, respectful, and meaningful.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap">
                <button
                  type="submit"
                  disabled={loading || dropdownLoading}
                  className="w-full rounded-2xl bg-[#b08d57] px-6 py-3.5 font-semibold text-black shadow-sm transition hover:bg-[#c39a5f] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                >
                  {loading ? "Submitting..." : "Submit Feedback"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`/parent/dashboard/${parentId}`)}
                  className="w-full rounded-2xl bg-[#e8dcc8] px-6 py-3.5 font-semibold text-black shadow-sm transition hover:bg-[#d6c2a8] sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
};

export default SubmitFeedback;