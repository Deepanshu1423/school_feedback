import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import api from "../../api/axios";

// =========================================
// Clean localStorage value
// localStorage me kabhi "undefined" / "null" string aa jati hai,
// isliye usko empty string me convert karte hain.
// =========================================
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

// =========================================
// Reusable Searchable Dropdown Component
// - Normal dropdown jaisa look
// - Same box me search support
// - Clear selection option
// - Outside click par close
// =========================================
const SearchableDropdown = ({
  label,
  options = [],
  value = "",
  placeholder = "Select option",
  disabled = false,
  required = false,
  onSelect,
  onClear,
  helperText = "",
  noOptionsText = "No matching record found",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const selectedOption = options.find(
    (option) => String(option.id) === String(value),
  );

  const filteredOptions = options.filter((option) =>
    String(option.name || "")
      .toLowerCase()
      .includes(searchText.toLowerCase()),
  );

  // Dropdown close hone ke baad selected value wapas input me show hoti hai
  useEffect(() => {
    if (!isOpen) {
      setSearchText(selectedOption?.name || "");
    }
  }, [selectedOption, isOpen]);

  // Searchable dropdown ke bahar click karne par dropdown close hoga
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchText(selectedOption?.name || "");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedOption]);

  // Dropdown open hote hi search input focus hoga
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
    }
  }, [isOpen]);

  return (
    <div className="relative min-w-0" ref={wrapperRef}>
      <label className="mb-2 block text-sm font-semibold text-[#1a1a1a]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchText : selectedOption?.name || ""}
          readOnly={!isOpen}
          disabled={disabled}
          placeholder={placeholder}
          onClick={() => {
            if (!disabled) {
              setIsOpen(true);
              setSearchText("");
            }
          }}
          onChange={(e) => {
            setSearchText(e.target.value);
          }}
          className="w-full rounded-2xl border border-[#d6c2a8] bg-[#f7f1e8] px-4 py-3 pr-20 text-sm text-black outline-none transition focus:border-[#b08d57] focus:bg-white focus:ring-2 focus:ring-[#b08d57]/20 disabled:cursor-not-allowed disabled:opacity-70"
        />

        <div className="absolute inset-y-0 right-3 flex items-center gap-2">
          {value && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClear?.();
                setSearchText("");
                setIsOpen(false);
              }}
              className="text-lg font-semibold leading-none text-[#8a8175] transition hover:text-black"
              title="Clear selection"
            >
              ×
            </button>
          )}

          <button
            type="button"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();

              if (!disabled) {
                setIsOpen((prev) => {
                  const next = !prev;

                  if (next) {
                    setSearchText("");
                  }

                  return next;
                });
              }
            }}
            className="text-black disabled:opacity-50"
          >
            <svg
              className={`h-5 w-5 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-2xl border border-[#d6c2a8] bg-white shadow-xl">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => {
              const isSelected = String(option.id) === String(value);

              return (
                <button
                  key={option.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onSelect?.(String(option.id));
                    setSearchText(option.name);
                    setIsOpen(false);
                  }}
                  className={`block w-full px-4 py-3 text-left text-sm transition ${
                    isSelected
                      ? "bg-[#efe4d2] font-semibold text-black"
                      : "text-[#1a1a1a] hover:bg-[#f7f1e8]"
                  }`}
                >
                  {option.name}
                </button>
              );
            })
          ) : (
            <div className="px-4 py-3 text-sm text-[#6b7280]">
              {noOptionsText}
            </div>
          )}
        </div>
      )}

      {helperText && (
        <p className="mt-2 text-xs text-[#8a8175]">{helperText}</p>
      )}
    </div>
  );
};

const SubmitFeedback = () => {
  const navigate = useNavigate();
  const { parentId } = useParams();
  const [searchParams] = useSearchParams();

  const formIdFromQuery = searchParams.get("formId") || "";

  // =========================================
  // Selected child state from localStorage
  // Ye selected child ko parent pages ke across persist karta hai
  // =========================================
  const [selectedStudentId, setSelectedStudentId] = useState(
    cleanStorageValue(localStorage.getItem("selectedStudentId")),
  );
  const [selectedStudentName, setSelectedStudentName] = useState(
    cleanStorageValue(localStorage.getItem("selectedStudentName")),
  );
  const [selectedStudentClass, setSelectedStudentClass] = useState(
    cleanStorageValue(localStorage.getItem("selectedStudentClass")),
  );
  const [selectedStudentClassId, setSelectedStudentClassId] = useState(
    cleanStorageValue(localStorage.getItem("selectedStudentClassId")),
  );

  // =========================================
  // Mobile header menu state
  // Mobile me Profile / Back / History / Logout ek menu me rahenge
  // =========================================
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const headerMenuRef = useRef(null);

  // =========================================
  // Dropdown and form states
  // =========================================
  const [students, setStudents] = useState([]);
  const [feedbackForms, setFeedbackForms] = useState([]);

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

  // =========================================
  // Page loading and message states
  // =========================================
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropdownLoading, setDropdownLoading] = useState(false);

  // =========================================
  // Dependent dropdown data
  // Teacher/Subject/Category selected child ki class ke according aate hain
  // =========================================
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [hoverRating, setHoverRating] = useState(0);

  // =========================================
  // Close mobile header menu when clicked outside
  // =========================================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        headerMenuRef.current &&
        !headerMenuRef.current.contains(event.target)
      ) {
        setIsHeaderMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // =========================================
  // Header navigation helper
  // Mobile menu option click hone ke baad menu close hota hai
  // =========================================
  const handleHeaderNavigate = (path) => {
    setIsHeaderMenuOpen(false);
    navigate(path);
  };

  // =========================================
  // Logout handler
  // Login token + selected child data clear karta hai
  // =========================================
  const handleLogout = () => {
    setIsHeaderMenuOpen(false);

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("selectedStudentId");
    localStorage.removeItem("selectedStudentName");
    localStorage.removeItem("selectedStudentClass");
    localStorage.removeItem("selectedStudentClassId");

    navigate("/");
  };

  // =========================================
  // Fetch dropdown data
  // Backend teacher/subject/category ko selected student + class ke according filter karta hai
  // Agar teacher select ho to subjects filter hote hain
  // Agar subject select ho to teachers filter hote hain
  // =========================================
  const fetchDropdownData = async ({
    studentId,
    classId,
    teacherId = "",
    subjectId = "",
    preserveFeedbackForm = true,
    clearMessage = true,
    autoSelectSingleSubject = false,
    autoSelectSingleTeacher = false,
    resetCategory = false,
  }) => {
    try {
      setDropdownLoading(true);

      if (clearMessage) {
        setMessage("");
      }

      const response = await api.get(
        `/parent/dropdown-data/${parentId}?studentId=${studentId}&classId=${classId}&teacherId=${teacherId}&subjectId=${subjectId}`,
      );

      const data = response.data?.data || {};
      const forms = data.feedbackForms || [];
      const nextTeachers = data.teachers || [];
      const nextSubjects = data.subjects || [];
      const nextCategories = data.categories || [];

      setFeedbackForms(forms);
      setTeachers(nextTeachers);
      setSubjects(nextSubjects);
      setCategories(nextCategories);

      setFormData((prev) => {
        const requestedTeacherId = teacherId ?? prev.teacherId ?? "";
        const requestedSubjectId = subjectId ?? prev.subjectId ?? "";

        const teacherStillExists = requestedTeacherId
          ? nextTeachers.some(
              (teacher) => String(teacher.id) === String(requestedTeacherId),
            )
          : true;

        const subjectStillExists = requestedSubjectId
          ? nextSubjects.some(
              (subject) => String(subject.id) === String(requestedSubjectId),
            )
          : true;

        const currentFeedbackFormId = preserveFeedbackForm
          ? prev.feedbackFormId || formIdFromQuery || ""
          : formIdFromQuery || "";

        const feedbackFormStillExists = currentFeedbackFormId
          ? forms.some(
              (form) => String(form.id) === String(currentFeedbackFormId),
            )
          : false;

        let nextFeedbackFormId = "";

        if (feedbackFormStillExists) {
          nextFeedbackFormId = currentFeedbackFormId;
        } else if (forms.length === 1) {
          nextFeedbackFormId = String(forms[0].id);
        } else if (formIdFromQuery) {
          const queryFormExists = forms.some(
            (form) => String(form.id) === String(formIdFromQuery),
          );

          nextFeedbackFormId = queryFormExists ? String(formIdFromQuery) : "";
        } else {
          nextFeedbackFormId = "";
        }

        const nextTeacherId =
          autoSelectSingleTeacher && nextTeachers.length === 1
            ? String(nextTeachers[0].id)
            : requestedTeacherId && teacherStillExists
              ? String(requestedTeacherId)
              : "";

        const nextSubjectId =
          autoSelectSingleSubject && nextSubjects.length === 1
            ? String(nextSubjects[0].id)
            : requestedSubjectId && subjectStillExists
              ? String(requestedSubjectId)
              : "";

        return {
          ...prev,
          studentId,
          classId,
          teacherId: nextTeacherId,
          subjectId: nextSubjectId,
          feedbackFormId: nextFeedbackFormId,
          categoryId: resetCategory ? "" : prev.categoryId || "",
        };
      });
    } catch (error) {
      setFeedbackForms([]);
      setTeachers([]);
      setSubjects([]);
      setCategories([]);
      setIsSuccess(false);
      setMessage(
        error.response?.data?.message || "Failed to load dropdown data.",
      );
    } finally {
      setDropdownLoading(false);
    }
  };

  // =========================================
  // Load parent dashboard data and selected child
  // Agar localStorage child valid hai to wahi select rahega
  // Otherwise first child default select hoga
  // =========================================
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
            localStorage.getItem("selectedStudentId"),
          );

          const activeStudent = studentsData.some(
            (student) => String(student.studentId) === String(storedStudentId),
          )
            ? studentsData.find(
                (student) =>
                  String(student.studentId) === String(storedStudentId),
              )
            : studentsData[0];

          if (activeStudent) {
            const classId = String(activeStudent.class?.classId || "");
            const classText = `${activeStudent.class?.className || ""}${
              activeStudent.class?.section
                ? `-${activeStudent.class.section}`
                : ""
            }`;

            localStorage.setItem(
              "selectedStudentId",
              String(activeStudent.studentId),
            );
            localStorage.setItem(
              "selectedStudentName",
              activeStudent.studentName || "",
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
          error.response?.data?.message || "Failed to load parent dashboard.",
        );
      }
    };

    if (parentId) {
      fetchParentDashboard();
    }
  }, [parentId]);

  // =========================================
  // Load dependent dropdown data
  // Selected child/class change hone par teacher/subject/form/category reload hote hain
  // =========================================
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

  // =========================================
  // Top selected child change
  // Mobile menu ko close karta hai + selected child localStorage me update karta hai
  // =========================================
  const handleStudentChange = (e) => {
    const newStudentId = e.target.value;

    const selected = students.find(
      (student) => String(student.studentId) === String(newStudentId),
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

      setIsHeaderMenuOpen(false);
      setFeedbackForms([]);
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
        feedbackFormId: "",
        categoryId: "",
        rating: "",
        comments: "",
      }));
    }
  };

  // =========================================
  // Searchable dropdown handlers
  // =========================================
  const handleFeedbackFormSelect = (feedbackFormId) => {
    setFormData((prev) => ({
      ...prev,
      studentId: selectedStudentId,
      classId: selectedStudentClassId,
      feedbackFormId,
    }));
  };

  const handleFeedbackFormClear = () => {
    setFormData((prev) => ({
      ...prev,
      studentId: selectedStudentId,
      classId: selectedStudentClassId,
      feedbackFormId: "",
    }));
  };

  const handleTeacherSelect = async (teacherId) => {
    await fetchDropdownData({
      studentId: selectedStudentId,
      classId: selectedStudentClassId,
      teacherId,

      subjectId: "",

      preserveFeedbackForm: true,
      clearMessage: true,

      autoSelectSingleSubject: true,

      resetCategory: true,
    });
  };
  const handleTeacherClear = async () => {
    await fetchDropdownData({
      studentId: selectedStudentId,
      classId: selectedStudentClassId,
      teacherId: "",
      subjectId: "",
      preserveFeedbackForm: true,
      clearMessage: true,
    });

    setFormData((prev) => ({
      ...prev,
      studentId: selectedStudentId,
      classId: selectedStudentClassId,
      teacherId: "",
      subjectId: "",
      categoryId: "",
    }));
  };

  const handleSubjectSelect = async (subjectId) => {
    await fetchDropdownData({
      studentId: selectedStudentId,
      classId: selectedStudentClassId,

      // Subject change hone par old teacher backend ko mat bhejo.
      // Fresh teachers selected subject ke according aayenge.
      teacherId: "",

      subjectId,
      preserveFeedbackForm: true,
      clearMessage: true,

      // Agar selected subject ke liye sirf 1 teacher hai,
      // to teacher automatic select ho jayega.
      autoSelectSingleTeacher: true,

      // Teacher/subject change par category clear karna better hai.
      resetCategory: true,
    });
  };

  const handleSubjectClear = async () => {
    await fetchDropdownData({
      studentId: selectedStudentId,
      classId: selectedStudentClassId,
      teacherId: formData.teacherId || "",
      subjectId: "",
      preserveFeedbackForm: true,
      clearMessage: true,
    });

    setFormData((prev) => ({
      ...prev,
      studentId: selectedStudentId,
      classId: selectedStudentClassId,
      subjectId: "",
      categoryId: "",
    }));
  };

  const handleCategorySelect = (categoryId) => {
    setFormData((prev) => ({
      ...prev,
      studentId: selectedStudentId,
      classId: selectedStudentClassId,
      categoryId,
    }));
  };

  const handleCategoryClear = () => {
    setFormData((prev) => ({
      ...prev,
      studentId: selectedStudentId,
      classId: selectedStudentClassId,
      categoryId: "",
    }));
  };

  // =========================================
  // Normal input handler
  // Comments field etc. update karta hai
  // =========================================
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      studentId: selectedStudentId,
      classId: selectedStudentClassId,
      [e.target.name]: e.target.value,
    }));
  };

  // =========================================
  // Rating click handler
  // =========================================
  const handleRatingClick = (value) => {
    setFormData((prev) => ({
      ...prev,
      studentId: selectedStudentId,
      classId: selectedStudentClassId,
      rating: value,
    }));
  };

  // =========================================
  // Submit feedback
  // Backend me /feedback/submit API call hoti hai
  // =========================================
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
      setMessage(error.response?.data?.message || "Failed to submit feedback.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // Rating label
  // =========================================
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

            {/* =========================================
                Header controls
                Mobile: menu icon left + child dropdown right
                Desktop: child dropdown + normal buttons
               ========================================= */}
            <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center lg:justify-end">
              <div className="flex w-full items-center gap-3 lg:w-auto">
                {/* Mobile combined menu button */}
                <div
                  ref={headerMenuRef}
                  className="relative flex flex-shrink-0 justify-start lg:hidden"
                >
                  <button
                    type="button"
                    onClick={() => setIsHeaderMenuOpen((prev) => !prev)}
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#b08d57] font-semibold text-black shadow-sm transition hover:bg-[#c39a5f]"
                    aria-label="Open submit feedback menu"
                  >
                    <span className="text-2xl leading-none">
                      {isHeaderMenuOpen ? "×" : "☰"}
                    </span>
                  </button>

                  {isHeaderMenuOpen && (
                    <div className="absolute left-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-2xl border border-[#d6c2a8] bg-[#fffaf3] shadow-xl">
                      <button
                        type="button"
                        onClick={() =>
                          handleHeaderNavigate(`/parent/profile/${parentId}`)
                        }
                        className="block w-full px-4 py-3 text-left text-sm font-semibold text-[#1a1a1a] transition hover:bg-[#f1e7d7]"
                      >
                        Profile
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleHeaderNavigate(`/parent/dashboard/${parentId}`)
                        }
                        className="block w-full px-4 py-3 text-left text-sm font-semibold text-[#1a1a1a] transition hover:bg-[#f1e7d7]"
                      >
                        Back to Dashboard
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleHeaderNavigate(
                            `/parent/feedback-history/${parentId}`,
                          )
                        }
                        className="block w-full px-4 py-3 text-left text-sm font-semibold text-[#1a1a1a] transition hover:bg-[#f1e7d7]"
                      >
                        Feedback History
                      </button>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="block w-full border-t border-[#eadfcf] px-4 py-3 text-left text-sm font-semibold text-red-700 transition hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>

                {/* Selected child dropdown */}
                <select
                  value={selectedStudentId}
                  onChange={handleStudentChange}
                  className="min-w-0 flex-1 rounded-xl border border-[#d6c2a8] bg-[#e8dcc8] px-4 py-2.5 pr-10 font-semibold text-black shadow-sm outline-none transition hover:bg-[#ddcfb8] lg:w-auto lg:min-w-[220px] lg:flex-none"
                >
                  {students.map((student) => (
                    <option key={student.studentId} value={student.studentId}>
                      {student.studentName}
                      {student.class?.className
                        ? ` - ${student.class.className}${
                            student.class?.section
                              ? `-${student.class.section}`
                              : ""
                          }`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Desktop header buttons */}
              <div className="hidden flex-wrap gap-3 lg:flex">
                <button
                  onClick={() => navigate(`/parent/profile/${parentId}`)}
                  className="rounded-xl bg-[#b08d57] px-5 py-2.5 font-semibold text-black shadow-sm transition hover:bg-[#c39a5f]"
                >
                  Profile
                </button>

                <button
                  onClick={() => navigate(`/parent/dashboard/${parentId}`)}
                  className="rounded-xl bg-[#b08d57] px-5 py-2.5 font-semibold text-black shadow-sm transition hover:bg-[#c39a5f]"
                >
                  Back to Dashboard
                </button>

                <button
                  onClick={() =>
                    navigate(`/parent/feedback-history/${parentId}`)
                  }
                  className="rounded-xl bg-[#b08d57] px-5 py-2.5 font-semibold text-black shadow-sm transition hover:bg-[#c39a5f]"
                >
                  Feedback History
                </button>

                <button
                  onClick={handleLogout}
                  className="rounded-xl bg-[#e8dcc8] px-5 py-2.5 font-semibold text-black shadow-sm transition hover:bg-[#d6c2a8]"
                >
                  Logout
                </button>
              </div>
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
                    Submit feedback for the selected child. Teacher, subject,
                    and feedback form fields will auto-filter based on active
                    mappings and active forms.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-[#d6c2a8] bg-[#fffaf3] p-4 shadow-md sm:p-6 lg:p-7">
            {dropdownLoading && (
              <div className="mb-4 rounded-2xl border border-[#eadfcf] bg-[#f8f3ea] px-4 py-3 text-sm font-medium text-[#5f5446]">
                Loading teacher, subject, category, and feedback form data...
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

                <SearchableDropdown
                  label="Feedback Form"
                  required={true}
                  options={feedbackForms}
                  value={formData.feedbackFormId}
                  onSelect={handleFeedbackFormSelect}
                  onClear={handleFeedbackFormClear}
                  disabled={dropdownLoading || feedbackForms.length === 0}
                  placeholder={
                    feedbackForms.length === 0
                      ? "No active feedback form available"
                      : "Select feedback form"
                  }
                  helperText={
                    feedbackForms.length === 1
                      ? "Only one active feedback form is available, so it is selected automatically."
                      : ""
                  }
                  noOptionsText="No feedback form found"
                />

                <SearchableDropdown
                  label="Teacher"
                  required={true}
                  options={teachers}
                  value={formData.teacherId}
                  onSelect={handleTeacherSelect}
                  onClear={handleTeacherClear}
                  disabled={dropdownLoading}
                  placeholder="Select teacher"
                  noOptionsText="No teacher found"
                />

                <SearchableDropdown
                  label="Subject"
                  required={true}
                  options={subjects}
                  value={formData.subjectId}
                  onSelect={handleSubjectSelect}
                  onClear={handleSubjectClear}
                  disabled={dropdownLoading}
                  placeholder="Select subject"
                  noOptionsText="No subject found"
                />

                <SearchableDropdown
                  label="Category"
                  required={true}
                  options={categories}
                  value={formData.categoryId}
                  onSelect={handleCategorySelect}
                  onClear={handleCategoryClear}
                  disabled={dropdownLoading}
                  placeholder="Select category"
                  noOptionsText="No category found"
                />
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
                  disabled={
                    loading || dropdownLoading || feedbackForms.length === 0
                  }
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
