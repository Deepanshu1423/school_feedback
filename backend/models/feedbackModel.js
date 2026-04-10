const db = require("../config/db");

const createFeedback = (feedbackData, callback) => {
  const {
    feedbackFormId,
    parentId,
    studentId,
    teacherId,
    classId,
    subjectId,
    categoryId,
    rating,
    comments,
  } = feedbackData;

  const query = `
    INSERT INTO user_Feedback
    (
      FeedbackFormId,
      ParentId,
      StudentId,
      TeacherId,
      ClassId,
      SubjectId,
      CategoryId,
      Rating,
      Comments
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [
      feedbackFormId,
      parentId,
      studentId,
      teacherId,
      classId,
      subjectId,
      categoryId,
      rating,
      comments,
    ],
    callback
  );
};


const checkParentStudentMapping = (parentId, studentId, callback) => {
  const query = `
    SELECT MappingId
    FROM user_ParentStudentMapping
    WHERE ParentId = ? AND StudentId = ?
    LIMIT 1
  `;

  db.query(query, [parentId, studentId], callback);
};

const checkTeacherClassSubjectMapping = (teacherId, classId, subjectId, callback) => {
  const query = `
    SELECT MappingId
    FROM user_TeacherClassSubjectMapping
    WHERE TeacherId = ? AND ClassId = ? AND SubjectId = ?
    LIMIT 1
  `;

  db.query(query, [teacherId, classId, subjectId], callback);
};

module.exports = {
  createFeedback,
  checkParentStudentMapping,
checkTeacherClassSubjectMapping,
};