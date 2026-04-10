import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import api from "../../api/axios";

const QuickSubmitFeedback = () => {
  const navigate = useNavigate();
  const { parentId } = useParams();
  const [searchParams] = useSearchParams();

  const formIdFromQuery = searchParams.get("formId") || "";

  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [selectedStudentClass, setSelectedStudentClass] = useState("");
  const [selectedStudentClassId, setSelectedStudentClassId] = useState("");

  const [students, setStudents] = useState([]);

  const [formData, setFormData] = useState({
    studentId: "",
    teacherId: "",
    classId: "",
    subjectId: "",
    feedbackFormId: formIdFromQuery || "",
    categoryId: "",
    rating: "",
    comments: "",
  });

  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropdownLoading, setDropdownLoading] = useState(true);

  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    const fetchParentDashboard = async () => {
      try {
        const response = await api.get(`/parent/dashboard/${parentId}`);
        const studentsData = response.data?.data?.students || [];
        setStudents(studentsData);

        if (studentsData.length > 0) {
          const firstStudent = studentsData[0];
          const classText = `${firstStudent.class?.className || ""}${
            firstStudent.class?.section ? `-${firstStudent.class.section}` : ""
          }`;

          setSelectedStudentId(String(firstStudent.studentId));
          setSelectedStudentName(firstStudent.studentName || "");
          setSelectedStudentClass(classText);
          setSelectedStudentClassId(String(firstStudent.class?.classId || ""));

          setFormData((prev) => ({
            ...prev,
            studentId: String(firstStudent.studentId),
            classId: String(firstStudent.class?.classId || ""),
          }));
        }
      } catch (error) {
        setMessage(
          error.response?.data?.message || "Failed to load mapped children."
        );
        setIsSuccess(false);
      }
    };

    if (parentId) {
      fetchParentDashboard();
    }
  }, [parentId]);

  useEffect(() => {
    if (!selectedStudentId) return;

    const fetchDropdownData = async () => {
      try {
        setDropdownLoading(true);
        setMessage("");
        setIsSuccess(false);

        const response = await api.get(`/parent/dropdown-data/${parentId}`);
        const data = response.data?.data || {};

        const forms = data.feedbackForms || [];
        setTeachers(data.teachers || []);
        setSubjects(data.subjects || []);
        setCategories(data.categories || []);

        const finalFormId =
          formIdFromQuery || (forms.length > 0 ? String(forms[0].id) : "");

        setFormData((prev) => ({
          ...prev,
          feedbackFormId: finalFormId,
          studentId: selectedStudentId,
          classId: selectedStudentClassId,
        }));
      } catch (error) {
        setMessage(
          error.response?.data?.message || "Failed to load dropdown data."
        );
        setIsSuccess(false);
      } finally {
        setDropdownLoading(false);
      }
    };

    fetchDropdownData();
  }, [parentId, selectedStudentId, selectedStudentClassId, formIdFromQuery]);

  const handleStudentChange = (e) => {
    const newStudentId = e.target.value;

    const selected = students.find(
      (student) => String(student.studentId) === String(newStudentId)
    );

    if (selected) {
      const classText = `${selected.class?.className || ""}${
        selected.class?.section ? `-${selected.class.section}` : ""
      }`;

      setSelectedStudentId(String(selected.studentId));
      setSelectedStudentName(selected.studentName || "");
      setSelectedStudentClass(classText);
      setSelectedStudentClassId(String(selected.class?.classId || ""));

      setFormData((prev) => ({
        ...prev,
        studentId: String(selected.studentId),
        classId: String(selected.class?.classId || ""),
        teacherId: "",
        subjectId: "",
        categoryId: "",
        rating: "",
        comments: "",
      }));

      setHoverRating(0);
    }
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

      navigate("/feedback-thank-you");
    } catch (error) {
      setIsSuccess(false);
      setMessage(
        error.response?.data?.message || "Failed to submit feedback."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f1e8]">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:py-10">
        <section className="mb-6 overflow-hidden rounded-3xl border border-[#d6c2a8] bg-[#fffaf3] shadow-lg">
          <div className="bg-gradient-to-br from-[#1a1a1a] via-[#2d241a] to-[#b08d57] p-6 text-white sm:p-8">
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
              Parent Meeting Feedback
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#f7f1e8]/90 sm:text-base">
              Please submit your feedback using this quick form. Your mapped child
              list is shown below, and your session will end after successful
              submission.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3 sm:p-6">
            <div className="rounded-2xl border border-[#d6c2a8] bg-[#f7f1e8] p-4">
              <p className="text-sm font-semibold text-[#1a1a1a]">Flow</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                QR Login → OTP Verify → Feedback Submit
              </p>
            </div>

            <div className="rounded-2xl border border-[#d6c2a8] bg-[#f7f1e8] p-4">
              <p className="text-sm font-semibold text-[#1a1a1a]">Child Mapping</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                Only your mapped children are shown
              </p>
            </div>

            <div className="rounded-2xl border border-[#d6c2a8] bg-[#f7f1e8] p-4">
              <p className="text-sm font-semibold text-[#1a1a1a]">Security</p>
              <p className="mt-1 text-sm text-[#6b7280]">
                Session will close after submission
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-[#d6c2a8] bg-[#fffaf3] p-5 shadow-md sm:p-6">
          {dropdownLoading && (
            <div className="mb-4 rounded-2xl border border-[#d6c2a8] bg-[#f7f1e8] p-4 text-sm text-[#1a1a1a]">
              Loading form data...
            </div>
          )}

          {message && (
            <div
              className={`mb-4 rounded-2xl px-4 py-3 text-sm font-medium ${
                isSuccess
                  ? "border border-green-200 bg-green-50 text-green-700"
                  : "border border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="rounded-2xl border border-[#d6c2a8] bg-[#f7f1e8] p-4">
              <p className="mb-3 text-sm font-semibold text-[#1a1a1a]">
                Select Child
              </p>
              <select
                value={selectedStudentId}
                onChange={handleStudentChange}
                className="w-full rounded-xl border border-[#d6c2a8] bg-white px-4 py-3 text-sm text-black outline-none focus:border-[#b08d57] focus:ring-2 focus:ring-[#b08d57]/20"
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
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#1a1a1a]">
                  Child Name
                </label>
                <input
                  type="text"
                  value={selectedStudentName}
                  disabled
                  className="w-full rounded-xl border border-[#d6c2a8] bg-[#eee6d8] px-4 py-3 text-sm text-[#5b5b5b] outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#1a1a1a]">
                  Class
                </label>
                <input
                  type="text"
                  value={selectedStudentClass}
                  disabled
                  className="w-full rounded-xl border border-[#d6c2a8] bg-[#eee6d8] px-4 py-3 text-sm text-[#5b5b5b] outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#1a1a1a]">
                  Teacher
                </label>
                <select
                  name="teacherId"
                  value={formData.teacherId}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#d6c2a8] bg-[#f7f1e8] px-4 py-3 text-sm text-black outline-none focus:border-[#b08d57] focus:bg-white focus:ring-2 focus:ring-[#b08d57]/20"
                >
                  <option value="">Select teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#1a1a1a]">
                  Subject
                </label>
                <select
                  name="subjectId"
                  value={formData.subjectId}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#d6c2a8] bg-[#f7f1e8] px-4 py-3 text-sm text-black outline-none focus:border-[#b08d57] focus:bg-white focus:ring-2 focus:ring-[#b08d57]/20"
                >
                  <option value="">Select subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-[#1a1a1a]">
                  Category
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#d6c2a8] bg-[#f7f1e8] px-4 py-3 text-sm text-black outline-none focus:border-[#b08d57] focus:bg-white focus:ring-2 focus:ring-[#b08d57]/20"
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

            <div className="rounded-2xl border border-[#d6c2a8] bg-[#f7f1e8] p-4">
              <label className="mb-3 block text-sm font-semibold text-[#1a1a1a]">
                Rating
              </label>

              <div className="flex flex-wrap items-center gap-2">
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
                        className="h-11 w-11 drop-shadow-sm sm:h-12 sm:w-12"
                      >
                        <path d="M12 2.5l2.93 5.94 6.56.95-4.75 4.63 1.12 6.53L12 17.77l-5.86 3.08 1.12-6.53L2.5 9.39l6.56-.95L12 2.5z" />
                      </svg>
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-[#1a1a1a]">
                  {formData.rating ? `${formData.rating}/5` : "Select rating"}
                </span>

                <span className="text-sm font-medium text-[#6b7280]">
                  {{
                    1: "Poor",
                    2: "Fair",
                    3: "Good",
                    4: "Very Good",
                    5: "Excellent",
                  }[hoverRating || Number(formData.rating)] ||
                    "Tap stars to rate"}
                </span>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#1a1a1a]">
                Comments
              </label>
              <textarea
                name="comments"
                rows="5"
                placeholder="Write your feedback here..."
                value={formData.comments}
                onChange={handleChange}
                className="w-full rounded-2xl border border-[#d6c2a8] bg-[#f7f1e8] px-4 py-3 text-sm text-black outline-none focus:border-[#b08d57] focus:bg-white focus:ring-2 focus:ring-[#b08d57]/20"
              />
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                type="submit"
                disabled={loading || dropdownLoading}
                className="w-full rounded-2xl bg-[#b08d57] px-6 py-3.5 font-semibold text-black shadow-sm transition hover:bg-[#c39a5f] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Submitting..." : "Submit Feedback"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/")}
                className="w-full rounded-2xl bg-[#e8dcc8] px-6 py-3.5 font-semibold text-black shadow-sm transition hover:bg-[#d6c2a8]"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default QuickSubmitFeedback;