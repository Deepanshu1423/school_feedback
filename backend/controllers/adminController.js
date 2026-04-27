const bcrypt = require("bcryptjs");
const adminModel = require("../models/adminModel");
const db = require("../config/db");

const getDuplicateFieldMessage = (error) => {
  if (!error || error.code !== "ER_DUP_ENTRY") return null;

  const msg = error.sqlMessage || "";

  if (msg.includes("Email")) return "Email already exists";
  if (msg.includes("AlternateMobile")) return "Alternate mobile number already exists";
  if (msg.includes("Mobile")) return "Mobile number already exists";
  if (msg.includes("ParentCode")) return "Parent code already exists";
  if (msg.includes("TeacherCode")) return "Teacher code already exists";
  if (msg.includes("AdminCode")) return "Admin code already exists";
  if (msg.includes("SubjectName")) return "Subject already exists";
  if (msg.includes("UQ_master_Classes")) return "This class already exists for the selected section and academic year";
  if (msg.includes("UQ_user_ParentStudentMapping")) return "This parent-student mapping already exists";
  if (msg.includes("UQ_user_ParentStudentMapping_StudentId")) return "This student is already mapped to another parent";
  if (msg.includes("UQ_user_TeacherClassSubjectMapping")) return "This teacher-class-subject mapping already exists";
  if (msg.includes("UQ_user_TeacherClassSubject_ClassSubject"))
    return "This class and subject is already mapped to another teacher";
  if (msg.includes("FormName")) return "Feedback form already exists";

  return "Duplicate record already exists";
};


const createTeacher = (req, res) => {
  const { fullName, email, mobile, password } = req.body;

  if (!fullName || !mobile || !password) {
    return res.status(400).json({
      success: false,
      message: "fullName, mobile and password are required",
    });
  }

  adminModel.getTeacherRole(async (roleErr, roleResults) => {
    if (roleErr) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch Teacher role",
        error: roleErr.message,
      });
    }

    if (roleResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Teacher role not found in master_Roles",
      });
    }

    const roleId = roleResults[0].RoleId;
    const passwordHash = await bcrypt.hash(password, 10);

    adminModel.createTeacherUser(
      {
        roleId,
        fullName,
        email,
        mobile,
        passwordHash,
      },
      (userErr, userResult) => {
        if (userErr) {
          const duplicateMessage = getDuplicateFieldMessage(userErr);

          return res.status(duplicateMessage ? 409 : 500).json({
            success: false,
            message: duplicateMessage || "Failed to create teacher user",
            error: duplicateMessage ? undefined : userErr.message,
          });
        }

        const teacherId = userResult.insertId;

        adminModel.getNextTeacherCode((codeErr, teacherCode) => {
          if (codeErr) {
            return res.status(500).json({
              success: false,
              message: "Failed to generate teacher code",
              error: codeErr.message,
            });
          }

          adminModel.createTeacherProfile(teacherId, teacherCode, (profileErr) => {
            if (profileErr) {
              const duplicateMessage = getDuplicateFieldMessage(profileErr);

              return res.status(duplicateMessage ? 409 : 500).json({
                success: false,
                message: duplicateMessage || "Failed to create teacher profile",
                error: duplicateMessage ? undefined : profileErr.message,
              });
            }

            return res.status(201).json({
              success: true,
              message: "Teacher created successfully",
              data: {
                teacherId,
                teacherCode,
              },
            });
          });
        });
      }
    );
  });
};

const createClass = (req, res) => {
  const { className, section, academicYear } = req.body;

  if (!className || !section || !academicYear) {
    return res.status(400).json({
      success: false,
      message: "className, section and academicYear are required",
    });
  }

  adminModel.createClass(
    {
      className,
      section,
      academicYear,
    },
    (err, result) => {
      if (err) {
        const duplicateMessage = getDuplicateFieldMessage(err);

        return res.status(duplicateMessage ? 409 : 500).json({
          success: false,
          message: duplicateMessage || "Failed to create class",
          error: duplicateMessage ? undefined : err.message,
        });
      }

      return res.status(201).json({
        success: true,
        message: "Class created successfully",
        data: {
          classId: result.insertId,
          className,
          section,
          academicYear,
        },
      });
    }
  );
};
const createSubject = (req, res) => {
  const { subjectName } = req.body;

  if (!subjectName) {
    return res.status(400).json({
      success: false,
      message: "subjectName is required",
    });
  }

  adminModel.createSubject(subjectName, (err, result) => {
    if (err) {
      const duplicateMessage = getDuplicateFieldMessage(err);

      return res.status(duplicateMessage ? 409 : 500).json({
        success: false,
        message: duplicateMessage || "Failed to create subject",
        error: duplicateMessage ? undefined : err.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Subject created successfully",
      data: {
        subjectId: result.insertId,
        subjectName,
      },
    });
  });
};

const createTeacherClassSubjectMapping = (req, res) => {
  const { teacherId, classId, subjectId } = req.body;

  if (!teacherId || !classId || !subjectId) {
    return res.status(400).json({
      success: false,
      message: "teacherId, classId and subjectId are required",
    });
  }

  adminModel.checkClassSubjectAlreadyMapped(
    classId,
    subjectId,
    (checkErr, existingRows) => {
      if (checkErr) {
        return res.status(500).json({
          success: false,
          message: "Failed to validate class-subject mapping",
          error: checkErr.message,
        });
      }

      if (existingRows.length > 0) {
        return res.status(409).json({
          success: false,
          message: "This class and subject is already mapped to another teacher",
        });
      }

      adminModel.createTeacherClassSubjectMapping(
        {
          teacherId,
          classId,
          subjectId,
        },
        (err, result) => {
          if (err) {
            const duplicateMessage = getDuplicateFieldMessage(err);

            return res.status(duplicateMessage ? 409 : 500).json({
              success: false,
              message:
                duplicateMessage ||
                "Failed to create teacher-class-subject mapping",
              error: duplicateMessage ? undefined : err.message,
            });
          }

          return res.status(201).json({
            success: true,
            message: "Teacher-Class-Subject mapping created successfully",
            data: {
              mappingId: result.insertId,
              teacherId,
              classId,
              subjectId,
            },
          });
        }
      );
    }
  );
};

const createParentStudentMapping = (req, res) => {
  const { parentId, studentId } = req.body;

  if (!parentId || !studentId) {
    return res.status(400).json({
      success: false,
      message: "parentId and studentId are required",
    });
  }

  adminModel.checkStudentAlreadyMapped(studentId, (checkErr, existingRows) => {
    if (checkErr) {
      return res.status(500).json({
        success: false,
        message: "Failed to validate student mapping",
        error: checkErr.message,
      });
    }

    if (existingRows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "This student is already mapped to another parent",
      });
    }

    adminModel.createParentStudentMapping(
      {
        parentId,
        studentId,
      },
      (err, result) => {
        if (err) {
          const duplicateMessage = getDuplicateFieldMessage(err);

          return res.status(duplicateMessage ? 409 : 500).json({
            success: false,
            message: duplicateMessage || "Failed to create parent-student mapping",
            error: duplicateMessage ? undefined : err.message,
          });
        }

        return res.status(201).json({
          success: true,
          message: "Parent-Student mapping created successfully",
          data: {
            mappingId: result.insertId,
            parentId,
            studentId,
          },
        });
      }
    );
  });
};
const createStudent = (req, res) => {
  const { studentName, classId, rollNumber } = req.body;

  if (!studentName || !classId) {
    return res.status(400).json({
      success: false,
      message: "studentName and classId are required",
    });
  }

  adminModel.createStudent(
    {
      studentName,
      classId,
      rollNumber: rollNumber || null,
    },
    (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Failed to create student",
          error: err.message,
        });
      }

      return res.status(201).json({
        success: true,
        message: "Student created successfully",
        data: {
          studentId: result.insertId,
          studentName,
          classId,
          rollNumber: rollNumber || null,
        },
      });
    }
  );
};

const createParent = (req, res) => {
  const { fullName, email, mobile, alternateMobile, password, address } = req.body;

  if (!fullName || !mobile || !password) {
    return res.status(400).json({
      success: false,
      message: "fullName, mobile and password are required",
    });
  }

  if (!/^\d{10}$/.test(mobile)) {
    return res.status(400).json({
      success: false,
      message: "Mobile number must be exactly 10 digits",
    });
  }

  if (alternateMobile && !/^\d{10}$/.test(alternateMobile)) {
    return res.status(400).json({
      success: false,
      message: "Alternate mobile number must be exactly 10 digits",
    });
  }

  if (alternateMobile && alternateMobile === mobile) {
    return res.status(400).json({
      success: false,
      message: "Mobile and alternate mobile cannot be same",
    });
  }

  adminModel.getParentRole(async (roleErr, roleResults) => {
    if (roleErr) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch Parent role",
        error: roleErr.message,
      });
    }

    if (roleResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Parent role not found in master_Roles",
      });
    }

    const roleId = roleResults[0].RoleId;
    const passwordHash = await bcrypt.hash(password, 10);

    adminModel.createParentUser(
      {
        roleId,
        fullName,
        email,
        mobile,
        alternateMobile: alternateMobile || null,
        passwordHash,
      },
      (userErr, userResult) => {
        if (userErr) {
          const duplicateMessage = getDuplicateFieldMessage(userErr);

          return res.status(duplicateMessage ? 409 : 500).json({
            success: false,
            message: duplicateMessage || "Failed to create parent user",
            error: duplicateMessage ? undefined : userErr.message,
          });
        }

        const parentId = userResult.insertId;

        adminModel.getNextParentCode((codeErr, parentCode) => {
          if (codeErr) {
            return res.status(500).json({
              success: false,
              message: "Failed to generate parent code",
              error: codeErr.message,
            });
          }

          adminModel.createParentProfile(
            parentId,
            parentCode,
            address || null,
            (profileErr) => {
              if (profileErr) {
                const duplicateMessage = getDuplicateFieldMessage(profileErr);

                return res.status(duplicateMessage ? 409 : 500).json({
                  success: false,
                  message: duplicateMessage || "Failed to create parent profile",
                  error: duplicateMessage ? undefined : profileErr.message,
                });
              }

              return res.status(201).json({
                success: true,
                message: "Parent created successfully",
                data: {
                  parentId,
                  parentCode,
                },
              });
            });
        });
      }
    );
  });
};
const createAdmin = (req, res) => {
  const { fullName, email, mobile, password, adminCode } = req.body;

  if (!fullName || !mobile || !password || !adminCode) {
    return res.status(400).json({
      success: false,
      message: "fullName, mobile, password and adminCode are required",
    });
  }

  adminModel.getAdminRole(async (roleErr, roleResults) => {
    if (roleErr) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch Admin role",
        error: roleErr.message,
      });
    }

    if (roleResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Admin role not found in master_Roles",
      });
    }

    const roleId = roleResults[0].RoleId;
    const passwordHash = await bcrypt.hash(password, 10);

    adminModel.createAdminUser(
      {
        roleId,
        fullName,
        email,
        mobile,
        passwordHash,
      },
      (userErr, userResult) => {
        if (userErr) {
          const duplicateMessage = getDuplicateFieldMessage(userErr);

          return res.status(duplicateMessage ? 409 : 500).json({
            success: false,
            message: duplicateMessage || "Failed to create admin user",
            error: duplicateMessage ? undefined : userErr.message,
          });
        }

        const adminId = userResult.insertId;

        adminModel.createAdminProfile(adminId, adminCode, (profileErr) => {
          if (profileErr) {
            const duplicateMessage = getDuplicateFieldMessage(profileErr);

            return res.status(duplicateMessage ? 409 : 500).json({
              success: false,
              message: duplicateMessage || "Failed to create admin profile",
              error: duplicateMessage ? undefined : profileErr.message,
            });
          }

          return res.status(201).json({
            success: true,
            message: "Admin created successfully",
            data: {
              adminId,
              adminCode,
            },
          });
        });
      }
    );
  });
};

const getAllClasses = (req, res) => {
  adminModel.getAllClasses((err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch classes",
        error: err.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Classes fetched successfully",
      count: results.length,
      data: results,
    });
  });
};
const getAllSubjects = (req, res) => {
  adminModel.getAllSubjects((err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch subjects",
        error: err.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Subjects fetched successfully",
      count: results.length,
      data: results,
    });
  });
};

const getAllTeachers = (req, res) => {
  adminModel.getAllTeachers((err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch teachers",
        error: err.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Teachers fetched successfully",
      count: results.length,
      data: results,
    });
  });
};


const getActiveTeachers = (req, res) => {
  adminModel.getActiveTeachers((err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch active teachers",
        error: err.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Active teachers fetched successfully",
      count: results.length,
      data: results,
    });
  });
};

const getAllParents = (req, res) => {
  adminModel.getAllParents((err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch parents",
        error: err.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Parents fetched successfully",
      count: results.length,
      data: results,
    });
  });
};

const getAllStudents = (req, res) => {
  adminModel.getAllStudents((err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch students",
        error: err.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Students fetched successfully",
      count: results.length,
      data: results,
    });
  });
};

const getTeacherPerformanceReport = (req, res) => {
  adminModel.getTeacherPerformanceReport((err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch teacher performance report",
        error: err.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Teacher performance report fetched successfully",
      count: results.length,
      data: results,
    });
  });
};

const getClassFeedbackSummaryReport = (req, res) => {
  adminModel.getClassFeedbackSummaryReport((err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch class feedback summary report",
        error: err.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Class feedback summary report fetched successfully",
      count: results.length,
      data: results,
    });
  });
};

const getMonthlyFeedbackReport = (req, res) => {
  adminModel.getMonthlyFeedbackReport((err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch monthly feedback report",
        error: err.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Monthly feedback report fetched successfully",
      count: results.length,
      data: results,
    });
  });
};


const createFeedbackForm = (req, res) => {
  const { formName, description } = req.body;

  if (!formName) {
    return res.status(400).json({
      success: false,
      message: "formName is required",
    });
  }

  adminModel.createFeedbackForm(
    {
      formName,
      description: description || null,
    },
    (err, result) => {
      if (err) {
        const duplicateMessage = getDuplicateFieldMessage(err);

        return res.status(duplicateMessage ? 409 : 500).json({
          success: false,
          message: duplicateMessage || "Failed to create feedback form",
          error: duplicateMessage ? undefined : err.message,
        });
      }

      return res.status(201).json({
        success: true,
        message: "Feedback form created successfully",
        data: {
          feedbackFormId: result.insertId,
          formName,
          description: description || null,
        },
      });
    }
  );
};

const getAllFeedbackForms = (req, res) => {
  adminModel.getAllFeedbackForms((err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch feedback forms",
        error: err.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Feedback forms fetched successfully",
      count: results.length,
      data: results,
    });
  });
};


const updateFeedbackFormStatus = (req, res) => {
  const { feedbackFormId } = req.params;
  const { isActive } = req.body;

  if (isActive === undefined) {
    return res.status(400).json({
      success: false,
      message: "isActive is required",
    });
  }

  adminModel.updateFeedbackFormStatus(feedbackFormId, isActive, (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to update feedback form status",
        error: err.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Feedback form not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Feedback form ${isActive ? "activated" : "deactivated"} successfully`,
      data: {
        feedbackFormId: Number(feedbackFormId),
        isActive,
      },
    });
  });
};


const updateTeacherStatus = (req, res) => {
  const { teacherId } = req.params;
  const { isActive } = req.body;

  if (isActive === undefined) {
    return res.status(400).json({
      success: false,
      message: "isActive is required",
    });
  }

  adminModel.updateTeacherStatus(teacherId, isActive, (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to update teacher status",
        error: err.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Teacher ${isActive ? "activated" : "deactivated"} successfully`,
      data: {
        teacherId: Number(teacherId),
        isActive,
      },
    });
  });
};



const updateParentStatus = (req, res) => {
  const { parentId } = req.params;
  const { isActive } = req.body;

  if (isActive === undefined) {
    return res.status(400).json({
      success: false,
      message: "isActive is required",
    });
  }

  adminModel.updateParentStatus(parentId, isActive, (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to update parent status",
        error: err.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Parent not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Parent ${isActive ? "activated" : "deactivated"} successfully`,
      data: {
        parentId: Number(parentId),
        isActive,
      },
    });
  });
};



const updateClass = (req, res) => {
  const { classId } = req.params;
  const { className, section, academicYear } = req.body;

  if (!className || !section || !academicYear) {
    return res.status(400).json({
      success: false,
      message: "className, section and academicYear are required",
    });
  }

  adminModel.updateClass(
    classId,
    {
      className,
      section,
      academicYear,
    },
    (err, result) => {
      if (err) {
        const duplicateMessage = getDuplicateFieldMessage(err);

        return res.status(duplicateMessage ? 409 : 500).json({
          success: false,
          message: duplicateMessage || "Failed to update class",
          error: duplicateMessage ? undefined : err.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Class not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Class updated successfully",
        data: {
          classId: Number(classId),
          className,
          section,
          academicYear,
        },
      });
    }
  );
};

const updateClassStatus = (req, res) => {
  const { classId } = req.params;
  const { isActive } = req.body;

  if (isActive === undefined) {
    return res.status(400).json({
      success: false,
      message: "isActive is required",
    });
  }

  adminModel.updateClassStatus(classId, isActive, (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to update class status",
        error: err.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Class ${isActive ? "activated" : "deactivated"} successfully`,
      data: {
        classId: Number(classId),
        isActive,
      },
    });
  });
};


const updateSubject = (req, res) => {
  const { subjectId } = req.params;
  const { subjectName } = req.body;

  if (!subjectName) {
    return res.status(400).json({
      success: false,
      message: "subjectName is required",
    });
  }

  adminModel.updateSubject(subjectId, subjectName, (err, result) => {
    if (err) {
      const duplicateMessage = getDuplicateFieldMessage(err);

      return res.status(duplicateMessage ? 409 : 500).json({
        success: false,
        message: duplicateMessage || "Failed to update subject",
        error: duplicateMessage ? undefined : err.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Subject updated successfully",
      data: {
        subjectId: Number(subjectId),
        subjectName,
      },
    });
  });
};

const updateSubjectStatus = (req, res) => {
  const { subjectId } = req.params;
  const { isActive } = req.body;

  if (isActive === undefined) {
    return res.status(400).json({
      success: false,
      message: "isActive is required",
    });
  }

  adminModel.updateSubjectStatus(subjectId, isActive, (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to update subject status",
        error: err.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Subject ${isActive ? "activated" : "deactivated"} successfully`,
      data: {
        subjectId: Number(subjectId),
        isActive,
      },
    });
  });
};

const deleteSubject = (req, res) => {
  const { subjectId } = req.params;

  adminModel.deleteSubject(subjectId, (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete subject",
        error: err.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Subject deleted successfully",
      data: {
        subjectId: Number(subjectId),
      },
    });
  });
};


const getTeacherClassSubjectMappings = (req, res) => {
  adminModel.getTeacherClassSubjectMappings((err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch teacher-class-subject mappings",
        error: err.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Teacher-class-subject mappings fetched successfully",
      count: results.length,
      data: results,
    });
  });
};

const getParentStudentMappings = (req, res) => {
  adminModel.getParentStudentMappings((err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch parent-student mappings",
        error: err.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Parent-student mappings fetched successfully",
      count: results.length,
      data: results,
    });
  });
};


const updateTeacherClassSubjectMapping = (req, res) => {
  const { mappingId } = req.params;
  const { teacherId, classId, subjectId } = req.body;

  if (!teacherId || !classId || !subjectId) {
    return res.status(400).json({
      success: false,
      message: "teacherId, classId and subjectId are required",
    });
  }

  adminModel.checkClassSubjectAlreadyMappedForUpdate(
    mappingId,
    classId,
    subjectId,
    (checkErr, existingRows) => {
      if (checkErr) {
        return res.status(500).json({
          success: false,
          message: "Failed to validate class-subject mapping",
          error: checkErr.message,
        });
      }

      if (existingRows.length > 0) {
        return res.status(409).json({
          success: false,
          message: "This class and subject is already mapped to another teacher",
        });
      }

      adminModel.updateTeacherClassSubjectMapping(
        mappingId,
        { teacherId, classId, subjectId },
        (err, result) => {
          if (err) {
            const duplicateMessage = getDuplicateFieldMessage(err);

            return res.status(duplicateMessage ? 409 : 500).json({
              success: false,
              message:
                duplicateMessage ||
                "Failed to update teacher-class-subject mapping",
              error: duplicateMessage ? undefined : err.message,
            });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({
              success: false,
              message: "Mapping not found",
            });
          }

          return res.status(200).json({
            success: true,
            message: "Teacher-Class-Subject mapping updated successfully",
            data: {
              mappingId: Number(mappingId),
              teacherId,
              classId,
              subjectId,
            },
          });
        }
      );
    }
  );
};

const deleteTeacherClassSubjectMapping = (req, res) => {
  const { mappingId } = req.params;

  adminModel.deleteTeacherClassSubjectMapping(mappingId, (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete teacher-class-subject mapping",
        error: err.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Mapping not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Teacher-Class-Subject mapping deleted successfully",
      data: {
        mappingId: Number(mappingId),
      },
    });
  });
};

const updateParentStudentMapping = (req, res) => {
  const { mappingId } = req.params;
  const { parentId, studentId } = req.body;

  if (!parentId || !studentId) {
    return res.status(400).json({
      success: false,
      message: "parentId and studentId are required",
    });
  }

  adminModel.checkStudentAlreadyMappedForUpdate(
    mappingId,
    studentId,
    (checkErr, existingRows) => {
      if (checkErr) {
        return res.status(500).json({
          success: false,
          message: "Failed to validate student mapping",
          error: checkErr.message,
        });
      }

      if (existingRows.length > 0) {
        return res.status(409).json({
          success: false,
          message: "This student is already mapped to another parent",
        });
      }

      adminModel.updateParentStudentMapping(
        mappingId,
        { parentId, studentId },
        (err, result) => {
          if (err) {
            const duplicateMessage = getDuplicateFieldMessage(err);

            return res.status(duplicateMessage ? 409 : 500).json({
              success: false,
              message:
                duplicateMessage || "Failed to update parent-student mapping",
              error: duplicateMessage ? undefined : err.message,
            });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({
              success: false,
              message: "Mapping not found",
            });
          }

          return res.status(200).json({
            success: true,
            message: "Parent-Student mapping updated successfully",
            data: {
              mappingId: Number(mappingId),
              parentId,
              studentId,
            },
          });
        }
      );
    }
  );
};

const deleteParentStudentMapping = (req, res) => {
  const { mappingId } = req.params;

  adminModel.deleteParentStudentMapping(mappingId, (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete parent-student mapping",
        error: err.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Mapping not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Parent-Student mapping deleted successfully",
      data: {
        mappingId: Number(mappingId),
      },
    });
  });
};



const updateStudent = (req, res) => {
  const { studentId } = req.params;
  const { studentName, classId, rollNumber } = req.body;

  if (!studentName || !classId) {
    return res.status(400).json({
      success: false,
      message: "studentName and classId are required",
    });
  }

  adminModel.updateStudent(
    studentId,
    {
      studentName,
      classId,
      rollNumber: rollNumber || null,
    },
    (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Failed to update student",
          error: err.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Student updated successfully",
        data: {
          studentId: Number(studentId),
          studentName,
          classId,
          rollNumber: rollNumber || null,
        },
      });
    }
  );
};

const updateStudentStatus = (req, res) => {
  const { studentId } = req.params;
  const { isActive } = req.body;

  if (isActive === undefined) {
    return res.status(400).json({
      success: false,
      message: "isActive is required",
    });
  }

  adminModel.updateStudentStatus(studentId, isActive, (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to update student status",
        error: err.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Student ${isActive ? "activated" : "deactivated"} successfully`,
      data: {
        studentId: Number(studentId),
        isActive,
      },
    });
  });
};

const deleteStudent = (req, res) => {
  const { studentId } = req.params;

  adminModel.checkStudentUsageBeforeDelete(studentId, (checkErr, checkResults) => {
    if (checkErr) {
      return res.status(500).json({
        success: false,
        message: "Failed to validate student usage",
        error: checkErr.message,
      });
    }

    const usage = checkResults[0];

    if ((usage.ParentMappings || 0) > 0 || (usage.FeedbackCount || 0) > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Student cannot be deleted because it is already used in mappings or feedback records. Deactivate it instead.",
      });
    }

    adminModel.deleteStudent(studentId, (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Failed to delete student",
          error: err.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Student deleted successfully",
        data: {
          studentId: Number(studentId),
        },
      });
    });
  });
};

const deleteClass = (req, res) => {
  const { classId } = req.params;

  adminModel.checkClassUsageBeforeDelete(classId, (checkErr, checkResults) => {
    if (checkErr) {
      return res.status(500).json({
        success: false,
        message: "Failed to validate class usage",
        error: checkErr.message,
      });
    }

    const usage = checkResults[0];

    if (
      (usage.StudentCount || 0) > 0 ||
      (usage.TeacherMappingCount || 0) > 0 ||
      (usage.FeedbackCount || 0) > 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Class cannot be deleted because it is already used. Deactivate it instead.",
      });
    }

    adminModel.deleteClass(classId, (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Failed to delete class",
          error: err.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Class not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Class deleted successfully",
        data: {
          classId: Number(classId),
        },
      });
    });
  });
};

const getAllFeedbacks = (req, res) => {
  adminModel.getAllFeedbacks((err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch feedback records",
        error: err.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "All feedbacks fetched successfully",
      count: results.length,
      data: results,
    });
  });
};



const updateTeacher = async (req, res) => {
  const { teacherId } = req.params;
  const { fullName, email, mobile, password } = req.body;

  if (!teacherId) {
    return res.status(400).json({
      success: false,
      message: "TeacherId is required",
    });
  }

  if (!fullName || !mobile) {
    return res.status(400).json({
      success: false,
      message: "Full name and mobile are required",
    });
  }

  adminModel.checkTeacherMobileEmailExistsForUpdate(
    teacherId,
    mobile,
    email || null,
    async (checkErr, existingRows) => {
      if (checkErr) {
        return res.status(500).json({
          success: false,
          message: "Database error",
          error: checkErr.message,
        });
      }

      if (existingRows.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Another teacher already exists with this mobile or email",
        });
      }

      try {
        let hashedPassword = null;

        if (password && password.trim() !== "") {
          console.log("Plain password received:", password);
          hashedPassword = await bcrypt.hash(String(password).trim(), 10);
          console.log("Password hashed successfully");
        }

        adminModel.updateTeacher(
          teacherId,
          {
            fullName,
            email: email || null,
            mobile,
            password: hashedPassword,
          },
          (updateErr) => {
            if (updateErr) {
              return res.status(500).json({
                success: false,
                message: "Failed to update teacher",
                error: updateErr.message,
              });
            }

            return res.status(200).json({
              success: true,
              message: "Teacher updated successfully",
              data: { teacherId },
            });
          }
        );
      } catch (hashErr) {
        console.error("Hash error:", hashErr);
        return res.status(500).json({
          success: false,
          message: "Password hashing failed",
          error: hashErr.message,
        });
      }
    }
  );
};








const updateParent = async (req, res) => {
  try {
    const { parentId } = req.params;
    const { fullName, email, mobile, alternateMobile, password, address } = req.body;

    if (!fullName || !mobile) {
      return res.status(400).json({
        success: false,
        message: "Full name and mobile are required",
      });
    }

    if (!/^\d{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: "Mobile number must be exactly 10 digits",
      });
    }

    if (alternateMobile && !/^\d{10}$/.test(alternateMobile)) {
      return res.status(400).json({
        success: false,
        message: "Alternate mobile number must be exactly 10 digits",
      });
    }

    if (alternateMobile && alternateMobile === mobile) {
      return res.status(400).json({
        success: false,
        message: "Mobile and alternate mobile cannot be same",
      });
    }

    await adminModel.updateParent(parentId, {
      fullName,
      email,
      mobile,
      alternateMobile: alternateMobile || null,
      password,
      address: address || "",
    });

    return res.status(200).json({
      success: true,
      message: "Parent updated successfully",
    });
  } catch (error) {
    console.error("Update parent error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update parent",
    });
  }
};

const updateFeedbackForm = (req, res) => {
  const { feedbackFormId } = req.params;
  const { formName, description } = req.body;

  if (!formName) {
    return res.status(400).json({
      success: false,
      message: "formName is required",
    });
  }

  adminModel.updateFeedbackForm(
    feedbackFormId,
    {
      formName,
      description: description || null,
    },
    (err, result) => {
      if (err) {
        const duplicateMessage = getDuplicateFieldMessage(err);

        return res.status(duplicateMessage ? 409 : 500).json({
          success: false,
          message: duplicateMessage || "Failed to update feedback form",
          error: duplicateMessage ? undefined : err.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Feedback form not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Feedback form updated successfully",
        data: {
          feedbackFormId: Number(feedbackFormId),
          formName,
          description: description || null,
        },
      });
    }
  );
};






module.exports = {
  createTeacher,
  createClass,
  createSubject,
  createTeacherClassSubjectMapping,
  createParentStudentMapping,
  createStudent,
  createParent,
  createAdmin,
  getAllClasses,
  getAllSubjects,
  getAllTeachers,
  getAllParents,
  getAllStudents,
  getTeacherPerformanceReport,
  getClassFeedbackSummaryReport,
  getMonthlyFeedbackReport,
  createFeedbackForm,
  getAllFeedbackForms,
  updateFeedbackFormStatus,
  updateTeacherStatus,
  updateParentStatus,
  updateClass,
  updateClassStatus,
  updateSubject,
  updateSubjectStatus,
  deleteSubject,
  getTeacherClassSubjectMappings,
  getParentStudentMappings,
  updateTeacherClassSubjectMapping,
  deleteTeacherClassSubjectMapping,
  updateParentStudentMapping,
  deleteParentStudentMapping,
  updateStudent,
  updateStudentStatus,
  deleteStudent,
  deleteClass,
  getAllFeedbacks,
  updateTeacher,
  updateParent,
  updateFeedbackForm,
  getActiveTeachers,


};