const db = require("../config/db");

const getTeacherFeedbackList = (teacherId, callback) => {
  const query = `
    SELECT
      uf.FeedbackId,
      uf.TeacherId,
      uf.Rating,
      uf.Comments,
      uf.TeacherResponse,
      uf.TeacherRespondedAt,
      uf.SubmittedAt,

      upd.FullName AS ParentName,
      us.StudentName,
      us.RollNumber,

      mc.ClassName,
      mc.Section,
      mc.AcademicYear,

      ms.SubjectName,
      mfc.CategoryName,
      mff.FormName

    FROM user_Feedback uf

    INNER JOIN user_Parents up
      ON uf.ParentId = up.ParentId
    INNER JOIN user_Details upd
      ON up.ParentId = upd.UserId

    INNER JOIN user_Students us
      ON uf.StudentId = us.StudentId

    INNER JOIN master_Classes mc
      ON uf.ClassId = mc.ClassId

    INNER JOIN master_Subjects ms
      ON uf.SubjectId = ms.SubjectId

    INNER JOIN master_FeedbackCategories mfc
      ON uf.CategoryId = mfc.CategoryId

    INNER JOIN master_FeedbackForms mff
      ON uf.FeedbackFormId = mff.FeedbackFormId

    WHERE uf.TeacherId = ?
    ORDER BY uf.SubmittedAt DESC
  `;

  db.query(query, [teacherId], callback);
};
const addTeacherResponse = (
  feedbackId,
  teacherId,
  teacherResponse,
  callback,
) => {
  const query = `
    UPDATE user_Feedback
    SET
      TeacherResponse = ?,
      TeacherRespondedAt = NOW()
    WHERE FeedbackId = ?
      AND TeacherId = ?
      AND (TeacherResponse IS NULL OR TeacherResponse = '')
  `;

  db.query(query, [teacherResponse, feedbackId, teacherId], callback);
};
const getTeacherDashboardSummary = (teacherId, callback) => {
  const query = `
    SELECT
      uf.TeacherId,
      ROUND(AVG(uf.Rating), 2) AS AverageRating,
      COUNT(uf.FeedbackId) AS TotalFeedbacks
    FROM user_Feedback uf
    WHERE uf.TeacherId = ?
    GROUP BY uf.TeacherId
  `;

  db.query(query, [teacherId], callback);
};

const getTeacherSubjectWiseSummary = (teacherId, callback) => {
  const query = `
    SELECT
      ms.SubjectId,
      ms.SubjectName,
      ROUND(AVG(uf.Rating), 2) AS AverageRating,
      COUNT(uf.FeedbackId) AS TotalFeedbacks
    FROM user_Feedback uf
    INNER JOIN master_Subjects ms
      ON uf.SubjectId = ms.SubjectId
    WHERE uf.TeacherId = ?
    GROUP BY ms.SubjectId, ms.SubjectName
    ORDER BY ms.SubjectName ASC
  `;

  db.query(query, [teacherId], callback);
};

const getTeacherRecentComments = (teacherId, callback) => {
  const query = `
    SELECT
      uf.FeedbackId,
      uf.Rating,
      uf.Comments,
      uf.TeacherResponse,
      uf.TeacherRespondedAt,
      uf.SubmittedAt,
      us.StudentName,
      ms.SubjectName,
      mfc.CategoryName
    FROM user_Feedback uf
    INNER JOIN user_Students us
      ON uf.StudentId = us.StudentId
    INNER JOIN master_Subjects ms
      ON uf.SubjectId = ms.SubjectId
    INNER JOIN master_FeedbackCategories mfc
      ON uf.CategoryId = mfc.CategoryId
    WHERE uf.TeacherId = ?
      AND uf.Comments IS NOT NULL
      AND uf.Comments <> ''
    ORDER BY uf.SubmittedAt DESC
    LIMIT 10
  `;

  db.query(query, [teacherId], callback);
};

const getFeedbackForResponse = (feedbackId, teacherId, callback) => {
  const query = `
    SELECT
      FeedbackId,
      TeacherId,
      TeacherResponse
    FROM user_Feedback
    WHERE FeedbackId = ?
      AND TeacherId = ?
    LIMIT 1
  `;

  db.query(query, [feedbackId, teacherId], callback);
};

module.exports = {
  getTeacherFeedbackList,
  addTeacherResponse,
  getTeacherDashboardSummary,
  getTeacherSubjectWiseSummary,
  getTeacherRecentComments,
  getFeedbackForResponse,
};
