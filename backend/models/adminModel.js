const db = require("../config/db");
const bcrypt = require("bcryptjs");

const getTeacherRole = (callback) => {
  const query = `SELECT RoleId FROM master_Roles WHERE RoleName = 'Teacher' LIMIT 1`;
  db.query(query, callback);
};

const createTeacherUser = (userData, callback) => {
  const { roleId, fullName, email, mobile, passwordHash } = userData;

  const query = `
    INSERT INTO user_Details (RoleId, FullName, Email, Mobile, PasswordHash)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(query, [roleId, fullName, email, mobile, passwordHash], callback);
};

const createTeacherProfile = (teacherId, teacherCode, callback) => {
  const query = `
    INSERT INTO user_Teachers (TeacherId, TeacherCode)
    VALUES (?, ?)
  `;

  db.query(query, [teacherId, teacherCode], callback);
};

const createClass = (classData, callback) => {
  const { className, section, academicYear } = classData;

  const query = `
    INSERT INTO master_Classes (ClassName, Section, AcademicYear)
    VALUES (?, ?, ?)
  `;

  db.query(query, [className, section, academicYear], callback);
};

const createSubject = (subjectName, callback) => {
  const query = `
    INSERT INTO master_Subjects (SubjectName)
    VALUES (?)
  `;

  db.query(query, [subjectName], callback);
};

const createTeacherClassSubjectMapping = (mappingData, callback) => {
  const { teacherId, classId, subjectId } = mappingData;

  const query = `
    INSERT INTO user_TeacherClassSubjectMapping
    (TeacherId, ClassId, SubjectId)
    VALUES (?, ?, ?)
  `;

  db.query(query, [teacherId, classId, subjectId], callback);
};

const checkClassSubjectAlreadyMapped = (classId, subjectId, callback) => {
  const query = `
    SELECT MappingId, TeacherId, ClassId, SubjectId
    FROM user_TeacherClassSubjectMapping
    WHERE ClassId = ? AND SubjectId = ?
    LIMIT 1
  `;

  db.query(query, [classId, subjectId], callback);
};

const checkClassSubjectAlreadyMappedForUpdate = (
  mappingId,
  classId,
  subjectId,
  callback
) => {
  const query = `
    SELECT MappingId, TeacherId, ClassId, SubjectId
    FROM user_TeacherClassSubjectMapping
    WHERE ClassId = ? AND SubjectId = ? AND MappingId != ?
    LIMIT 1
  `;

  db.query(query, [classId, subjectId, mappingId], callback);
};


const checkStudentAlreadyMapped = (studentId, callback) => {
  const query = `
    SELECT MappingId, ParentId, StudentId
    FROM user_ParentStudentMapping
    WHERE StudentId = ?
    LIMIT 1
  `;

  db.query(query, [studentId], callback);
};

const checkStudentAlreadyMappedForUpdate = (mappingId, studentId, callback) => {
  const query = `
    SELECT MappingId, ParentId, StudentId
    FROM user_ParentStudentMapping
    WHERE StudentId = ?
      AND MappingId != ?
    LIMIT 1
  `;

  db.query(query, [studentId, mappingId], callback);
};

const createParentStudentMapping = (mappingData, callback) => {
  const { parentId, studentId } = mappingData;

  const query = `
    INSERT INTO user_ParentStudentMapping
    (ParentId, StudentId)
    VALUES (?, ?)
  `;

  db.query(query, [parentId, studentId], callback);
};

const createStudent = (studentData, callback) => {
  const { studentName, classId, rollNumber } = studentData;

  const query = `
    INSERT INTO user_Students (StudentName, ClassId, RollNumber)
    VALUES (?, ?, ?)
  `;

  db.query(query, [studentName, classId, rollNumber], callback);
};
const getParentRole = (callback) => {
  const query = `SELECT RoleId FROM master_Roles WHERE RoleName = 'Parent' LIMIT 1`;
  db.query(query, callback);
};

const createParentUser = (userData, callback) => {
  const { roleId, fullName, email, mobile, alternateMobile, passwordHash } = userData;

  const query = `
    INSERT INTO user_Details
    (RoleId, FullName, Email, Mobile, AlternateMobile, PasswordHash)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [roleId, fullName, email || null, mobile, alternateMobile || null, passwordHash],
    callback
  );
};

const createParentProfile = (parentId, parentCode, address, callback) => {
  const query = `
    INSERT INTO user_Parents (ParentId, ParentCode, Address)
    VALUES (?, ?)
  `;

  db.query(query, [parentId, parentCode, address || null], callback);
};
const getAdminRole = (callback) => {
  const query = `SELECT RoleId FROM master_Roles WHERE RoleName = 'Admin' LIMIT 1`;
  db.query(query, callback);
};

const createAdminUser = (userData, callback) => {
  const { roleId, fullName, email, mobile, passwordHash } = userData;

  const query = `
    INSERT INTO user_Details (RoleId, FullName, Email, Mobile, PasswordHash)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(query, [roleId, fullName, email, mobile, passwordHash], callback);
};

const createAdminProfile = (adminId, adminCode, callback) => {
  const query = `
    INSERT INTO user_Admins (AdminId, AdminCode)
    VALUES (?, ?)
  `;

  db.query(query, [adminId, adminCode], callback);
};
const getAllClasses = (callback) => {
  const query = `
    SELECT
      ClassId,
      ClassName,
      Section,
      AcademicYear,
      IsActive,
      CreatedAt
    FROM master_Classes
    ORDER BY ClassId DESC
  `;

  db.query(query, callback);
};
const getAllSubjects = (callback) => {
  const query = `
    SELECT
      SubjectId,
      SubjectName,
      IsActive,
      CreatedAt
    FROM master_Subjects
    ORDER BY SubjectId DESC
  `;

  db.query(query, callback);
};
const getAllTeachers = (callback) => {
  const query = `
    SELECT
      ut.TeacherId,
      ut.TeacherCode,
      ud.FullName,
      ud.Email,
      ud.Mobile,
      ud.IsActive,
      ud.CreatedAt
    FROM user_Teachers ut
    INNER JOIN user_Details ud
      ON ut.TeacherId = ud.UserId
    ORDER BY ut.TeacherId DESC
  `;

  db.query(query, callback);
};

const getActiveTeachers = (callback) => {
  const query = `
    SELECT
      ut.TeacherId,
      ut.TeacherCode,
      ud.FullName,
      ud.Email,
      ud.Mobile,
      ud.IsActive,
      ud.CreatedAt
    FROM user_Teachers ut
    INNER JOIN user_Details ud
      ON ut.TeacherId = ud.UserId
    WHERE ud.IsActive = 1
    ORDER BY ut.TeacherId DESC
  `;

  db.query(query, callback);
};

const getAllParents = (callback) => {
  const query = `
    SELECT
      up.ParentId,
      up.ParentCode,
      up.Address,
      ud.FullName,
      ud.Email,
      ud.Mobile,
      ud.AlternateMobile,
      ud.IsActive,
      ud.CreatedAt
    FROM user_Parents up
    INNER JOIN user_Details ud
      ON up.ParentId = ud.UserId
    ORDER BY up.ParentId DESC
  `;

  db.query(query, callback);
};
const getAllStudents = (callback) => {
  const query = `
    SELECT
      us.StudentId,
      us.StudentName,
      us.RollNumber,
      us.IsActive,
      us.CreatedAt,
      mc.ClassId,
      mc.ClassName,
      mc.Section,
      mc.AcademicYear
    FROM user_Students us
    INNER JOIN master_Classes mc
      ON us.ClassId = mc.ClassId
    ORDER BY us.StudentId DESC
  `;

  db.query(query, callback);
};

const getTeacherPerformanceReport = (callback) => {
  const query = `
    SELECT
      ut.TeacherId,
      ut.TeacherCode,
      ud.FullName AS TeacherName,
      ud.Email,
      ud.Mobile,
      ROUND(AVG(uf.Rating), 2) AS AverageRating,
      COUNT(uf.FeedbackId) AS TotalFeedbacks,
      COUNT(DISTINCT uf.SubjectId) AS TotalSubjectsCovered
    FROM user_Teachers ut
    INNER JOIN user_Details ud
      ON ut.TeacherId = ud.UserId
    LEFT JOIN user_Feedback uf
      ON ut.TeacherId = uf.TeacherId
    GROUP BY ut.TeacherId, ut.TeacherCode, ud.FullName, ud.Email, ud.Mobile
    ORDER BY AverageRating DESC, TotalFeedbacks DESC
  `;

  db.query(query, callback);
};


const getClassFeedbackSummaryReport = (callback) => {
  const query = `
    SELECT
      mc.ClassId,
      mc.ClassName,
      mc.Section,
      mc.AcademicYear,
      ROUND(AVG(uf.Rating), 2) AS AverageRating,
      COUNT(uf.FeedbackId) AS TotalFeedbacks,
      COUNT(DISTINCT uf.TeacherId) AS TotalTeachers,
      COUNT(DISTINCT uf.StudentId) AS TotalStudents
    FROM master_Classes mc
    LEFT JOIN user_Feedback uf
      ON mc.ClassId = uf.ClassId
    GROUP BY mc.ClassId, mc.ClassName, mc.Section, mc.AcademicYear
    ORDER BY mc.ClassName ASC, mc.Section ASC
  `;

  db.query(query, callback);
};

const getMonthlyFeedbackReport = (callback) => {
  const query = `
    SELECT
      DATE_FORMAT(uf.SubmittedAt, '%Y-%m') AS ReportMonth,
      COUNT(uf.FeedbackId) AS TotalFeedbacks,
      ROUND(AVG(uf.Rating), 2) AS AverageRating
    FROM user_Feedback uf
    GROUP BY DATE_FORMAT(uf.SubmittedAt, '%Y-%m')
    ORDER BY ReportMonth DESC
  `;

  db.query(query, callback);
};

const createFeedbackForm = (formData, callback) => {
  const { formName, description } = formData;

  const query = `
    INSERT INTO master_FeedbackForms (FormName, Description)
    VALUES (?, ?)
  `;

  db.query(query, [formName, description || null], callback);
};


const getAllFeedbackForms = (callback) => {
  const query = `
    SELECT
      FeedbackFormId,
      FormName,
      Description,
      IsActive,
      CreatedAt
    FROM master_FeedbackForms
    ORDER BY FeedbackFormId DESC
  `;

  db.query(query, callback);
};


const updateFeedbackFormStatus = (feedbackFormId, isActive, callback) => {
  const query = `
    UPDATE master_FeedbackForms
    SET IsActive = ?
    WHERE FeedbackFormId = ?
  `;

  db.query(query, [isActive, feedbackFormId], callback);
};


const getNextTeacherCode = (callback) => {
  const query = `
    SELECT TeacherCode
    FROM user_Teachers
    ORDER BY TeacherId DESC
    LIMIT 1
  `;

  db.query(query, (err, results) => {
    if (err) return callback(err);

    let nextCode = "TEACHER001";

    if (results.length > 0 && results[0].TeacherCode) {
      const lastCode = results[0].TeacherCode;
      const lastNumber = parseInt(lastCode.replace("TEACHER", ""), 10);

      if (!isNaN(lastNumber)) {
        const newNumber = lastNumber + 1;
        nextCode = `TEACHER${String(newNumber).padStart(3, "0")}`;
      }
    }

    callback(null, nextCode);
  });
};

const updateTeacherStatus = (teacherId, isActive, callback) => {
  const query = `
    UPDATE user_Details
    SET IsActive = ?
    WHERE UserId = ?
  `;

  db.query(query, [isActive, teacherId], callback);
};


const getNextParentCode = (callback) => {
  const query = `
    SELECT ParentCode
    FROM user_Parents
    ORDER BY ParentId DESC
    LIMIT 1
  `;

  db.query(query, (err, results) => {
    if (err) return callback(err);

    let nextCode = "PARENT001";

    if (results.length > 0 && results[0].ParentCode) {
      const lastCode = results[0].ParentCode;
      const lastNumber = parseInt(lastCode.replace("PARENT", ""), 10);

      if (!isNaN(lastNumber)) {
        const newNumber = lastNumber + 1;
        nextCode = `PARENT${String(newNumber).padStart(3, "0")}`;
      }
    }

    callback(null, nextCode);
  });
};


const updateParentStatus = (parentId, isActive, callback) => {
  const query = `
    UPDATE user_Details
    SET IsActive = ?
    WHERE UserId = ?
  `;

  db.query(query, [isActive, parentId], callback);
};


const updateClass = (classId, classData, callback) => {
  const { className, section, academicYear } = classData;

  const query = `
    UPDATE master_Classes
    SET ClassName = ?, Section = ?, AcademicYear = ?
    WHERE ClassId = ?
  `;

  db.query(query, [className, section, academicYear, classId], callback);
};

const updateClassStatus = (classId, isActive, callback) => {
  const query = `
    UPDATE master_Classes
    SET IsActive = ?
    WHERE ClassId = ?
  `;

  db.query(query, [isActive, classId], callback);
};

const updateSubject = (subjectId, subjectName, callback) => {
  const query = `
    UPDATE master_Subjects
    SET SubjectName = ?
    WHERE SubjectId = ?
  `;

  db.query(query, [subjectName, subjectId], callback);
};

const updateSubjectStatus = (subjectId, isActive, callback) => {
  const query = `
    UPDATE master_Subjects
    SET IsActive = ?
    WHERE SubjectId = ?
  `;

  db.query(query, [isActive, subjectId], callback);
};

const deleteSubject = (subjectId, callback) => {
  const query = `
    DELETE FROM master_Subjects
    WHERE SubjectId = ?
  `;

  db.query(query, [subjectId], callback);
};


const getTeacherClassSubjectMappings = (callback) => {
  const query = `
    SELECT
      utcsm.MappingId,
      ut.TeacherId,
      ut.TeacherCode,
      ud.FullName AS TeacherName,
      mc.ClassId,
      mc.ClassName,
      mc.Section,
      mc.AcademicYear,
      ms.SubjectId,
      ms.SubjectName
    FROM user_TeacherClassSubjectMapping utcsm
    INNER JOIN user_Teachers ut
      ON utcsm.TeacherId = ut.TeacherId
    INNER JOIN user_Details ud
      ON ut.TeacherId = ud.UserId
    INNER JOIN master_Classes mc
      ON utcsm.ClassId = mc.ClassId
    INNER JOIN master_Subjects ms
      ON utcsm.SubjectId = ms.SubjectId
    ORDER BY utcsm.MappingId DESC
  `;

  db.query(query, callback);
};

const getParentStudentMappings = (callback) => {
  const query = `
    SELECT
      upsm.MappingId,
      up.ParentId,
      up.ParentCode,
      pud.FullName AS ParentName,
      us.StudentId,
      us.StudentName,
      us.RollNumber,
      mc.ClassName,
      mc.Section,
      mc.AcademicYear
    FROM user_ParentStudentMapping upsm
    INNER JOIN user_Parents up
      ON upsm.ParentId = up.ParentId
    INNER JOIN user_Details pud
      ON up.ParentId = pud.UserId
    INNER JOIN user_Students us
      ON upsm.StudentId = us.StudentId
    INNER JOIN master_Classes mc
      ON us.ClassId = mc.ClassId
    ORDER BY upsm.MappingId DESC
  `;

  db.query(query, callback);
};

const updateTeacherClassSubjectMapping = (mappingId, mappingData, callback) => {
  const { teacherId, classId, subjectId } = mappingData;

  const query = `
    UPDATE user_TeacherClassSubjectMapping
    SET TeacherId = ?, ClassId = ?, SubjectId = ?
    WHERE MappingId = ?
  `;

  db.query(query, [teacherId, classId, subjectId, mappingId], callback);
};

const deleteTeacherClassSubjectMapping = (mappingId, callback) => {
  const query = `
    DELETE FROM user_TeacherClassSubjectMapping
    WHERE MappingId = ?
  `;

  db.query(query, [mappingId], callback);
};

const updateParentStudentMapping = (mappingId, mappingData, callback) => {
  const { parentId, studentId } = mappingData;

  const query = `
    UPDATE user_ParentStudentMapping
    SET ParentId = ?, StudentId = ?
    WHERE MappingId = ?
  `;

  db.query(query, [parentId, studentId, mappingId], callback);
};

const deleteParentStudentMapping = (mappingId, callback) => {
  const query = `
    DELETE FROM user_ParentStudentMapping
    WHERE MappingId = ?
  `;

  db.query(query, [mappingId], callback);
};

const updateStudent = (studentId, studentData, callback) => {
  const { studentName, classId, rollNumber } = studentData;

  const query = `
    UPDATE user_Students
    SET StudentName = ?, ClassId = ?, RollNumber = ?
    WHERE StudentId = ?
  `;

  db.query(query, [studentName, classId, rollNumber, studentId], callback);
};

const updateStudentStatus = (studentId, isActive, callback) => {
  const query = `
    UPDATE user_Students
    SET IsActive = ?
    WHERE StudentId = ?
  `;

  db.query(query, [isActive, studentId], callback);
};

const checkStudentUsageBeforeDelete = (studentId, callback) => {
  const query = `
    SELECT
      (SELECT COUNT(*) FROM user_ParentStudentMapping WHERE StudentId = ?) AS ParentMappings,
      (SELECT COUNT(*) FROM user_Feedback WHERE StudentId = ?) AS FeedbackCount
  `;

  db.query(query, [studentId, studentId], callback);
};

const deleteStudent = (studentId, callback) => {
  const query = `
    DELETE FROM user_Students
    WHERE StudentId = ?
  `;

  db.query(query, [studentId], callback);
};


const checkClassUsageBeforeDelete = (classId, callback) => {
  const query = `
    SELECT
      (SELECT COUNT(*) FROM user_Students WHERE ClassId = ?) AS StudentCount,
      (SELECT COUNT(*) FROM user_TeacherClassSubjectMapping WHERE ClassId = ?) AS TeacherMappingCount,
      (SELECT COUNT(*) FROM user_Feedback WHERE ClassId = ?) AS FeedbackCount
  `;

  db.query(query, [classId, classId, classId], callback);
};

const deleteClass = (classId, callback) => {
  const query = `
    DELETE FROM master_Classes
    WHERE ClassId = ?
  `;

  db.query(query, [classId], callback);
};


const getAllFeedbacks = (callback) => {
  const query = `
    SELECT
      uf.FeedbackId,
      uf.Rating,
      uf.Comments,
      uf.TeacherResponse,
      uf.TeacherRespondedAt,
      uf.SubmittedAt,
      uf.ParentId,
      uf.StudentId,
      uf.TeacherId,
      uf.ClassId,
      uf.SubjectId,
      uf.FeedbackFormId,

      up.ParentCode,
      pud.FullName AS ParentName,

      us.StudentName,
      us.RollNumber,

      mc.ClassName,
      mc.Section,
      mc.AcademicYear,

      ut.TeacherCode,
      tud.FullName AS TeacherName,

      ms.SubjectName,

      mff.FormName

    FROM user_feedback uf

    LEFT JOIN user_parents up
      ON uf.ParentId = up.ParentId
    LEFT JOIN user_details pud
      ON up.ParentId = pud.UserId

    LEFT JOIN user_students us
      ON uf.StudentId = us.StudentId

    LEFT JOIN master_classes mc
      ON uf.ClassId = mc.ClassId

    LEFT JOIN user_teachers ut
      ON uf.TeacherId = ut.TeacherId
    LEFT JOIN user_details tud
      ON ut.TeacherId = tud.UserId

    LEFT JOIN master_subjects ms
      ON uf.SubjectId = ms.SubjectId

    LEFT JOIN master_feedbackforms mff
      ON uf.FeedbackFormId = mff.FeedbackFormId

    ORDER BY uf.SubmittedAt DESC
  `;

  db.query(query, callback);
};





const checkTeacherMobileEmailExistsForUpdate = (teacherId, mobile, email, callback) => {
  const query = `
    SELECT ud.UserId
    FROM user_Details ud
    INNER JOIN master_Roles mr ON mr.RoleId = ud.RoleId
    WHERE mr.RoleName = 'Teacher'
      AND ud.UserId != ?
      AND (
        ud.Mobile = ?
        OR (? IS NOT NULL AND ? != '' AND ud.Email = ?)
      )
  `;

  db.query(query, [teacherId, mobile, email, email, email], callback);
};

const updateTeacher = (teacherId, teacherData, callback) => {
  const { fullName, email, mobile, password } = teacherData;

  if (password) {
    const query = `
      UPDATE user_Details
      SET FullName = ?, Email = ?, Mobile = ?, PasswordHash = ?
      WHERE UserId = ?
    `;
    db.query(query, [fullName, email, mobile, password, teacherId], callback);
  } else {
    const query = `
      UPDATE user_Details
      SET FullName = ?, Email = ?, Mobile = ?
      WHERE UserId = ?
    `;
    db.query(query, [fullName, email, mobile, teacherId], callback);
  }
};





const updateParent = async (parentId, parentData) => {
  const { fullName, email, mobile, alternateMobile, password, address } = parentData;

  const userId = parentId;

  const [parentRows] = await db.promise().query(
    `
    SELECT ParentId
    FROM user_Parents
    WHERE ParentId = ?
    `,
    [parentId]
  );

  if (parentRows.length === 0) {
    throw new Error("Parent not found");
  }

  const [duplicateRows] = await db.promise().query(
    `
    SELECT UserId
    FROM user_Details
    WHERE UserId != ?
      AND (
        Email = ?
        OR Mobile = ?
        OR AlternateMobile = ?
        OR Mobile = ?
        OR AlternateMobile = ?
      )
    `,
    [
      userId,
      email || null,
      mobile,
      mobile,
      alternateMobile || null,
      alternateMobile || null,
    ]
  );

  if (duplicateRows.length > 0) {
    throw new Error("Email, mobile or alternate mobile already exists for another user");
  }

  if (password && password.trim() !== "") {
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.promise().query(
      `
      UPDATE user_Details
      SET FullName = ?, Email = ?, Mobile = ?, AlternateMobile = ?, PasswordHash = ?
      WHERE UserId = ?
      `,
      [fullName, email || null, mobile, alternateMobile || null, hashedPassword, userId]
    );
  } else {
    await db.promise().query(
      `
      UPDATE user_Details
      SET FullName = ?, Email = ?, Mobile = ?, AlternateMobile = ?
      WHERE UserId = ?
      `,
      [fullName, email || null, mobile, alternateMobile || null, userId]
    );
  }

  await db.promise().query(
    `
    UPDATE user_Parents
    SET Address = ?
    WHERE ParentId = ?
    `,
    [address?.trim() || null, parentId]
  );

  return { success: true };
};


const updateFeedbackForm = (feedbackFormId, formData, callback) => {
  const { formName, description } = formData;

  const query = `
    UPDATE master_FeedbackForms
    SET FormName = ?, Description = ?
    WHERE FeedbackFormId = ?
  `;

  db.query(query, [formName, description || null, feedbackFormId], callback);
};








module.exports = {
  getTeacherRole,
  createTeacherUser,
  createTeacherProfile,
  createClass,
  createSubject,
  createTeacherClassSubjectMapping,
  createParentStudentMapping,
  createStudent,
  getParentRole,
  createParentUser,
  createParentProfile,
  getAdminRole,
  createAdminUser,
  createAdminProfile,
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
  getNextTeacherCode,
  updateTeacherStatus,
  getNextParentCode,
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
  checkStudentUsageBeforeDelete,
  deleteStudent,
  checkClassUsageBeforeDelete,
  deleteClass,
  getAllFeedbacks,
  checkTeacherMobileEmailExistsForUpdate,
  updateTeacher,
  updateParent,
  updateFeedbackForm,
  getActiveTeachers,
  checkStudentAlreadyMapped,
  checkStudentAlreadyMappedForUpdate,
  checkClassSubjectAlreadyMapped,
  checkClassSubjectAlreadyMappedForUpdate,


};