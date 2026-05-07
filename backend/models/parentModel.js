const db = require("../config/db");

const getParentDashboardData = (parentId, callback) => {
  const query = `
    SELECT 
      up.ParentId,
      ud.FullName AS ParentName,

      us.StudentId,
      us.StudentName,
      us.RollNumber,

      mc.ClassId,
      mc.ClassName,
      mc.Section,
      mc.AcademicYear,

      ut.TeacherId,
      utd.FullName AS TeacherName,

      ms.SubjectId,
      ms.SubjectName

    FROM user_Parents up
    INNER JOIN user_Details ud 
      ON up.ParentId = ud.UserId

    INNER JOIN user_ParentStudentMapping ups 
      ON up.ParentId = ups.ParentId AND ups.IsActive = TRUE

    INNER JOIN user_Students us 
      ON ups.StudentId = us.StudentId AND us.IsActive = TRUE

    INNER JOIN master_Classes mc 
      ON us.ClassId = mc.ClassId AND mc.IsActive = TRUE

    LEFT JOIN user_TeacherClassSubjectMapping utcsm 
      ON mc.ClassId = utcsm.ClassId AND utcsm.IsActive = TRUE

    LEFT JOIN user_Teachers ut 
      ON utcsm.TeacherId = ut.TeacherId

    LEFT JOIN user_Details utd 
      ON ut.TeacherId = utd.UserId

    LEFT JOIN master_Subjects ms 
      ON utcsm.SubjectId = ms.SubjectId AND ms.IsActive = TRUE

    WHERE up.ParentId = ?
    ORDER BY us.StudentId, ms.SubjectName;
  `;

  db.query(query, [parentId], callback);
};
const getParentProfile = (parentId, callback) => {
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
    WHERE up.ParentId = ?
    LIMIT 1
  `;

  db.query(query, [parentId], callback);
};

const updateParentProfile = async (parentId, profileData) => {
  const { fullName, email, alternateMobile, address } = profileData;

  const cleanFullName = fullName?.trim();
  const cleanEmail = email?.trim().toLowerCase();
  const cleanAlternateMobile = alternateMobile || null;
  const cleanAddress = address?.trim() || null;

  const [rows] = await db.promise().query(
    `
    SELECT
      up.ParentId,
      ud.Mobile
    FROM user_Parents up
    INNER JOIN user_Details ud
      ON up.ParentId = ud.UserId
    WHERE up.ParentId = ?
    LIMIT 1
    `,
    [parentId],
  );

  if (rows.length === 0) {
    throw new Error("Parent profile not found");
  }

  const currentMobile = rows[0].Mobile || "";

  if (cleanAlternateMobile && cleanAlternateMobile === currentMobile) {
    throw new Error("Mobile and alternate mobile cannot be same");
  }

  await db.promise().query(
    `
    UPDATE user_Details
    SET
      FullName = ?,
      Email = ?,
      AlternateMobile = ?
    WHERE UserId = ?
    `,
    [cleanFullName, cleanEmail, cleanAlternateMobile, parentId],
  );

  await db.promise().query(
    `
    UPDATE user_Parents
    SET Address = ?
    WHERE ParentId = ?
    `,
    [cleanAddress, parentId],
  );

  return { success: true };
};
const getParentFeedbackHistory = (parentId, callback) => {
  const query = `
    SELECT
      uf.FeedbackId,
      uf.Rating,
      uf.Comments,
      uf.TeacherResponse,
      uf.TeacherRespondedAt,
      uf.SubmittedAt,

      us.StudentId,
      us.StudentName,
      us.RollNumber,

      utd.FullName AS TeacherName,

      mc.ClassName,
      mc.Section,
      mc.AcademicYear,

      ms.SubjectName,
      mfc.CategoryName,
      mff.FormName

    FROM user_Feedback uf

    INNER JOIN user_Students us
      ON uf.StudentId = us.StudentId

    INNER JOIN user_Teachers ut
      ON uf.TeacherId = ut.TeacherId
    INNER JOIN user_Details utd
      ON ut.TeacherId = utd.UserId

    INNER JOIN master_Classes mc
      ON uf.ClassId = mc.ClassId

    INNER JOIN master_Subjects ms
      ON uf.SubjectId = ms.SubjectId

    INNER JOIN master_FeedbackCategories mfc
      ON uf.CategoryId = mfc.CategoryId

    INNER JOIN master_FeedbackForms mff
      ON uf.FeedbackFormId = mff.FeedbackFormId

    WHERE uf.ParentId = ?
    ORDER BY uf.SubmittedAt DESC
  `;

  db.query(query, [parentId], callback);
};

const getParentDropdownData = (parentId, callback) => {
  const query = `
    SELECT DISTINCT
      us.StudentId,
      us.StudentName,

      mc.ClassId,
      mc.ClassName,
      mc.Section,

      ut.TeacherId,
      utd.FullName AS TeacherName,

      ms.SubjectId,
      ms.SubjectName,

      mff.FeedbackFormId,
      mff.FormName,

      mfc.CategoryId,
      mfc.CategoryName

    FROM user_Parents up

    INNER JOIN user_ParentStudentMapping ups
      ON up.ParentId = ups.ParentId AND ups.IsActive = TRUE

    INNER JOIN user_Students us
      ON ups.StudentId = us.StudentId AND us.IsActive = TRUE

    INNER JOIN master_Classes mc
      ON us.ClassId = mc.ClassId AND mc.IsActive = TRUE

    LEFT JOIN user_TeacherClassSubjectMapping utcsm
      ON mc.ClassId = utcsm.ClassId AND utcsm.IsActive = TRUE

    LEFT JOIN user_Teachers ut
      ON utcsm.TeacherId = ut.TeacherId

    LEFT JOIN user_Details utd
      ON ut.TeacherId = utd.UserId

    LEFT JOIN master_Subjects ms
      ON utcsm.SubjectId = ms.SubjectId AND ms.IsActive = TRUE

    LEFT JOIN master_FeedbackForms mff
      ON mff.IsActive = TRUE

    LEFT JOIN master_FeedbackCategories mfc
      ON mfc.IsActive = TRUE

    WHERE up.ParentId = ?
    ORDER BY us.StudentName, utd.FullName, ms.SubjectName;
  `;

  db.query(query, [parentId], callback);
};

const getParentFeedbackStats = (parentId, callback) => {
  const query = `
    SELECT
      COUNT(*) AS totalFeedbackSubmitted,
      SUM(CASE WHEN TeacherResponse IS NULL OR TeacherResponse = '' THEN 1 ELSE 0 END) AS pendingResponses,
      SUM(CASE WHEN TeacherResponse IS NOT NULL AND TeacherResponse != '' THEN 1 ELSE 0 END) AS respondedFeedback
    FROM user_Feedback
    WHERE ParentId = ?
  `;

  db.query(query, [parentId], callback);
};

const getParentRecentFeedback = (parentId, callback) => {
  const query = `
    SELECT
      uf.FeedbackId,
      uf.Rating,
      uf.SubmittedAt,
      uf.TeacherResponse,
      utd.FullName AS TeacherName,
      ms.SubjectName
    FROM user_Feedback uf
    INNER JOIN user_Teachers ut
      ON uf.TeacherId = ut.TeacherId
    INNER JOIN user_Details utd
      ON ut.TeacherId = utd.UserId
    INNER JOIN master_Subjects ms
      ON uf.SubjectId = ms.SubjectId
    WHERE uf.ParentId = ?
    ORDER BY uf.SubmittedAt DESC
    LIMIT 5
  `;

  db.query(query, [parentId], callback);
};

const getParentStudentFeedbackStats = (parentId, studentId, callback) => {
  const query = `
    SELECT
      COUNT(*) AS totalFeedbackSubmitted,
      SUM(CASE WHEN TeacherResponse IS NULL OR TeacherResponse = '' THEN 1 ELSE 0 END) AS pendingResponses,
      SUM(CASE WHEN TeacherResponse IS NOT NULL AND TeacherResponse != '' THEN 1 ELSE 0 END) AS respondedFeedback
    FROM user_Feedback
    WHERE ParentId = ? AND StudentId = ?
  `;

  db.query(query, [parentId, studentId], callback);
};

const getParentStudentRecentFeedback = (parentId, studentId, callback) => {
  const query = `
    SELECT
      uf.FeedbackId,
      uf.Rating,
      uf.SubmittedAt,
      uf.TeacherResponse,
      utd.FullName AS TeacherName,
      ms.SubjectName
    FROM user_Feedback uf
    INNER JOIN user_Teachers ut
      ON uf.TeacherId = ut.TeacherId
    INNER JOIN user_Details utd
      ON ut.TeacherId = utd.UserId
    INNER JOIN master_Subjects ms
      ON uf.SubjectId = ms.SubjectId
    WHERE uf.ParentId = ? AND uf.StudentId = ?
    ORDER BY uf.SubmittedAt DESC
    LIMIT 5
  `;

  db.query(query, [parentId, studentId], callback);
};

const getMappedTeachersAndSubjectsByClassFilters = (
  classId,
  teacherId,
  subjectId,
  callback,
) => {
  let query = `
    SELECT DISTINCT
      tcsm.TeacherId,
      utd.FullName AS TeacherName,
      tcsm.SubjectId,
      ms.SubjectName
    FROM user_TeacherClassSubjectMapping tcsm
    INNER JOIN user_Details utd
      ON utd.UserId = tcsm.TeacherId
    INNER JOIN master_Subjects ms
      ON ms.SubjectId = tcsm.SubjectId
    WHERE tcsm.ClassId = ?
      AND tcsm.IsActive = 1
      AND utd.IsActive = 1
      AND ms.IsActive = 1
  `;

  const params = [classId];

  if (teacherId) {
    query += ` AND tcsm.TeacherId = ?`;
    params.push(teacherId);
  }

  if (subjectId) {
    query += ` AND tcsm.SubjectId = ?`;
    params.push(subjectId);
  }

  query += ` ORDER BY utd.FullName ASC, ms.SubjectName ASC`;

  db.query(query, params, callback);
};

module.exports = {
  getParentProfile,
  getParentDashboardData,
  getParentFeedbackHistory,
  getParentDropdownData,
  getParentFeedbackStats,
  getParentRecentFeedback,
  getParentStudentFeedbackStats,
  getParentStudentRecentFeedback,
  getMappedTeachersAndSubjectsByClassFilters,
  updateParentProfile,
};
