const db = require("../config/db");

const findUserByEmailOrMobileOrParentCode = (identifier, callback) => {
  const query = `
    SELECT 
      ud.UserId,
      ud.RoleId,
      ud.FullName,
      ud.Email,
      ud.Mobile,
      ud.PasswordHash,
      mr.RoleName,
      up.ParentCode
    FROM user_Details ud
    LEFT JOIN master_Roles mr ON ud.RoleId = mr.RoleId
    LEFT JOIN user_Parents up ON ud.UserId = up.ParentId
    WHERE ud.Email = ? OR ud.Mobile = ? OR up.ParentCode = ?
    LIMIT 1
  `;

  db.query(query, [identifier, identifier, identifier], callback);
};

const createParentUser = (userData, callback) => {
  const { roleId, fullName, email, mobile, passwordHash } = userData;

  const query = `
    INSERT INTO user_Details (RoleId, FullName, Email, Mobile, PasswordHash)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(query, [roleId, fullName, email, mobile, passwordHash], callback);
};

const createParentProfile = (parentId, parentCode, address, callback) => {
  const query = `
    INSERT INTO user_Parents (ParentId, ParentCode, Address)
    VALUES (?, ?, ?)
  `;

  db.query(query, [parentId, parentCode, address || null], callback);
};

const getParentRole = (callback) => {
  const query = `SELECT RoleId FROM master_Roles WHERE RoleName = 'Parent' LIMIT 1`;
  db.query(query, callback);
};

const saveOtpLog = (otpData, callback) => {
  const {
    userId,
    contactType,
    contactValue,
    purpose,
    expiresAt,
    providerRequestId,
  } = otpData;

  const query = `
    INSERT INTO user_OtpDetails
    (UserId, ContactType, ContactValue, OtpCode, Purpose, ExpiresAt, IsVerified, VerifiedAt, ProviderRequestId)
    VALUES (?, ?, ?, NULL, ?, ?, FALSE, NULL, ?)
  `;

  db.query(
    query,
    [
      userId || null,
      contactType,
      contactValue,
      purpose,
      expiresAt,
      providerRequestId || null,
    ],
    callback
  );
};

const findUserByMobile = (mobile, callback) => {
  const query = `
    SELECT UserId, FullName, Email, Mobile
    FROM user_Details
    WHERE Mobile = ?
    LIMIT 1
  `;

  db.query(query, [mobile], callback);
};

const markRegisterOtpVerified = (mobile, callback) => {
  const query = `
    UPDATE user_OtpDetails
    SET IsVerified = TRUE,
        VerifiedAt = NOW()
    WHERE ContactValue = ?
      AND Purpose = 'Register'
    ORDER BY OtpId DESC
    LIMIT 1
  `;

  db.query(query, [mobile], callback);
};

const checkVerifiedRegisterOtp = (mobile, callback) => {
  const query = `
    SELECT OtpId, ContactValue, Purpose, IsVerified, VerifiedAt
    FROM user_OtpDetails
    WHERE ContactValue = ?
      AND Purpose = 'Register'
      AND IsVerified = TRUE
    ORDER BY OtpId DESC
    LIMIT 1
  `;

  db.query(query, [mobile], callback);
};

const saveForgotPasswordOtpLog = (otpData, callback) => {
  const {
    userId,
    contactType,
    contactValue,
    purpose,
    expiresAt,
    providerRequestId,
  } = otpData;

  const query = `
    INSERT INTO user_OtpDetails
    (UserId, ContactType, ContactValue, OtpCode, Purpose, ExpiresAt, IsVerified, VerifiedAt, ProviderRequestId)
    VALUES (?, ?, ?, NULL, ?, ?, FALSE, NULL, ?)
  `;

  db.query(
    query,
    [
      userId || null,
      contactType,
      contactValue,
      purpose,
      expiresAt,
      providerRequestId || null,
    ],
    callback
  );
};

const markForgotPasswordOtpVerified = (mobile, callback) => {
  const query = `
    UPDATE user_OtpDetails
    SET IsVerified = TRUE,
        VerifiedAt = NOW()
    WHERE ContactValue = ?
      AND Purpose = 'ForgotPassword'
    ORDER BY OtpId DESC
    LIMIT 1
  `;

  db.query(query, [mobile], callback);
};

const checkVerifiedForgotPasswordOtp = (mobile, callback) => {
  const query = `
    SELECT OtpId, ContactValue, Purpose, IsVerified, VerifiedAt
    FROM user_OtpDetails
    WHERE ContactValue = ?
      AND Purpose = 'ForgotPassword'
      AND IsVerified = TRUE
    ORDER BY OtpId DESC
    LIMIT 1
  `;

  db.query(query, [mobile], callback);
};

const updateUserPasswordByUserId = (userId, passwordHash, callback) => {
  const query = `
    UPDATE user_Details
    SET PasswordHash = ?
    WHERE UserId = ?
  `;

  db.query(query, [passwordHash, userId], callback);
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

const findActiveParentByMobile = (mobile, callback) => {
  const query = `
    SELECT 
      ud.UserId,
      ud.RoleId,
      ud.FullName,
      ud.Email,
      ud.Mobile,
      ud.AlternateMobile,
      ud.IsActive,
      mr.RoleName,
      up.ParentCode
    FROM user_Details ud
    INNER JOIN master_Roles mr ON ud.RoleId = mr.RoleId
    INNER JOIN user_Parents up ON ud.UserId = up.ParentId
    WHERE (ud.Mobile = ? OR ud.AlternateMobile = ?)
      AND mr.RoleName = 'Parent'
      AND ud.IsActive = 1
    LIMIT 1
  `;

  db.query(query, [mobile, mobile], callback);
};

const markQuickLoginOtpVerified = (mobile, callback) => {
  const query = `
    UPDATE user_OtpDetails
    SET IsVerified = TRUE,
        VerifiedAt = NOW()
    WHERE ContactValue = ?
      AND Purpose = 'QuickLogin'
    ORDER BY OtpId DESC
    LIMIT 1
  `;

  db.query(query, [mobile], callback);
};

const getParentMobileProfileById = (parentId, callback) => {
  const query = `
    SELECT
      ud.UserId,
      ud.FullName,
      ud.Email,
      ud.Mobile,
      ud.AlternateMobile,
      ud.IsActive
    FROM user_Parents up
    INNER JOIN user_Details ud
      ON up.ParentId = ud.UserId
    WHERE up.ParentId = ?
    LIMIT 1
  `;

  db.query(query, [parentId], callback);
};

const findOtherUserByMobileOrAlternateMobile = (userId, mobile, callback) => {
  const query = `
    SELECT UserId, FullName, Mobile, AlternateMobile
    FROM user_Details
    WHERE UserId != ?
      AND (Mobile = ? OR AlternateMobile = ?)
    LIMIT 1
  `;

  db.query(query, [userId, mobile, mobile], callback);
};

const markChangeMobileOtpVerified = (mobile, callback) => {
  const query = `
    UPDATE user_OtpDetails
    SET IsVerified = TRUE,
        VerifiedAt = NOW()
    WHERE ContactValue = ?
      AND Purpose = 'ChangeMobile'
    ORDER BY OtpId DESC
    LIMIT 1
  `;

  db.query(query, [mobile], callback);
};

const updateUserMobileByUserId = (userId, mobile, callback) => {
  const query = `
    UPDATE user_Details
    SET Mobile = ?
    WHERE UserId = ?
  `;

  db.query(query, [mobile, userId], callback);
};

const findOtherUserByEmail = (userId, email, callback) => {
  const query = `
    SELECT UserId, FullName, Email
    FROM user_Details
    WHERE UserId != ?
      AND Email = ?
    LIMIT 1
  `;

  db.query(query, [userId, email], callback);
};

const markChangeEmailOtpVerified = (mobile, callback) => {
  const query = `
    UPDATE user_OtpDetails
    SET IsVerified = TRUE,
        VerifiedAt = NOW()
    WHERE ContactValue = ?
      AND Purpose = 'ChangeEmail'
    ORDER BY OtpId DESC
    LIMIT 1
  `;

  db.query(query, [mobile], callback);
};

const updateUserEmailByUserId = (userId, email, callback) => {
  const query = `
    UPDATE user_Details
    SET Email = ?
    WHERE UserId = ?
  `;

  db.query(query, [email, userId], callback);
};

module.exports = {
  findUserByEmailOrMobileOrParentCode,
  createParentUser,
  createParentProfile,
  getParentRole,
  saveOtpLog,
  findUserByMobile,
  markRegisterOtpVerified,
  checkVerifiedRegisterOtp,
  saveForgotPasswordOtpLog,
  markForgotPasswordOtpVerified,
  checkVerifiedForgotPasswordOtp,
  updateUserPasswordByUserId,
  getNextParentCode,
  findActiveParentByMobile,
  markQuickLoginOtpVerified,
  getParentMobileProfileById,
  findOtherUserByMobileOrAlternateMobile,
  markChangeMobileOtpVerified,
  updateUserMobileByUserId,
  findOtherUserByEmail,
  markChangeEmailOtpVerified,
  updateUserEmailByUserId,
};