const twilio = require("twilio");
const authModel = require("../models/authModel");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const login = (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({
      success: false,
      message: "Identifier and password are required",
    });
  }

  authModel.findUserByEmailOrMobileOrParentCode(
    identifier,
    async (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Database error",
          error: err.message,
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const user = results[0];

      const isMatch = await bcrypt.compare(password, user.PasswordHash || "");

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid password",
        });
      }

      const token = jwt.sign(
        {
          userId: user.UserId,
          roleId: user.RoleId,
          roleName: user.RoleName,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: {
          userId: user.UserId,
          fullName: user.FullName,
          email: user.Email,
          mobile: user.Mobile,
          roleId: user.RoleId,
          roleName: user.RoleName,
          parentCode: user.ParentCode || null,
        },
      });
    }
  );
};

const registerParent = (req, res) => {
  const { fullName, email, mobile, password, address } = req.body;

  if (!fullName || !mobile || !password) {
    return res.status(400).json({
      success: false,
      message: "Full name, mobile and password are required",
    });
  }

  authModel.checkVerifiedRegisterOtp(mobile, (otpErr, otpResults) => {
    if (otpErr) {
      return res.status(500).json({
        success: false,
        message: "Failed to validate register OTP status",
        error: otpErr.message,
      });
    }

    if (otpResults.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Mobile OTP is not verified. Please verify OTP before registration",
      });
    }

    authModel.getParentRole(async (roleErr, roleResults) => {
      if (roleErr) {
        return res.status(500).json({
          success: false,
          message: "Role fetch failed",
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
      const hashedPassword = await bcrypt.hash(password, 10);

      authModel.createParentUser(
        {
          roleId,
          fullName,
          email,
          mobile,
          passwordHash: hashedPassword,
        },
        (userErr, userResult) => {
          if (userErr) {
            return res.status(500).json({
              success: false,
              message: "User creation failed",
              error: userErr.message,
            });
          }

          const parentId = userResult.insertId;

          authModel.getNextParentCode((codeErr, parentCode) => {
            if (codeErr) {
              return res.status(500).json({
                success: false,
                message: "Failed to generate parent code",
                error: codeErr.message,
              });
            }

            authModel.createParentProfile(
              parentId,
              parentCode,
              address || null,
              (parentErr) => {
                if (parentErr) {
                  return res.status(500).json({
                    success: false,
                    message: "Parent profile creation failed",
                    error: parentErr.message,
                  });
                }

                return res.status(201).json({
                  success: true,
                  message: "Parent registered successfully",
                  data: {
                    parentId,
                    parentCode,
                  },
                });
              }
            );
          });
        }
      );
    });
  });
};

const sendRegisterOtp = (req, res) => {
  const { mobile } = req.body;

  if (!mobile) {
    return res.status(400).json({
      success: false,
      message: "mobile is required",
    });
  }

  authModel.findUserByMobile(mobile, async (findErr, results) => {
    if (findErr) {
      return res.status(500).json({
        success: false,
        message: "Database error",
        error: findErr.message,
      });
    }

    if (results.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Mobile number already registered",
      });
    }

    try {
      const fullMobile = `${process.env.TWILIO_COUNTRY_CODE}${mobile}`;
      const verification = await client.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verifications.create({
          to: fullMobile,
          channel: "sms",
        });

      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      authModel.saveOtpLog(
        {
          userId: null,
          contactType: "Mobile",
          contactValue: mobile,
          purpose: "Register",
          expiresAt,
          providerRequestId: verification.sid,
        },
        (saveErr) => {
          if (saveErr) {
            return res.status(500).json({
              success: false,
              message: "OTP sent but log save failed",
              error: saveErr.message,
            });
          }

          return res.status(200).json({
            success: true,
            message: "Register OTP sent successfully",
            providerRequestId: verification.sid,
            status: verification.status,
          });
        }
      );
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP via Twilio",
        error: error.message,
      });
    }
  });
};

const verifyRegisterOtp = async (req, res) => {
  const { mobile, otp } = req.body;

  if (!mobile || !otp) {
    return res.status(400).json({
      success: false,
      message: "mobile and otp are required",
    });
  }

  try {
    const fullMobile = `${process.env.TWILIO_COUNTRY_CODE}${mobile}`;

    const verificationCheck = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({
        to: fullMobile,
        code: otp,
      });

    if (verificationCheck.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
        status: verificationCheck.status,
      });
    }

    authModel.markRegisterOtpVerified(mobile, (updateErr, updateResult) => {
      if (updateErr) {
        return res.status(500).json({
          success: false,
          message: "OTP verified but database update failed",
          error: updateErr.message,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Register OTP verified successfully",
        updatedRows: updateResult.affectedRows,
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to verify OTP via Twilio",
      error: error.message,
    });
  }
};

const sendForgotPasswordOtp = (req, res) => {
  const { identifier } = req.body;

  if (!identifier) {
    return res.status(400).json({
      success: false,
      message: "identifier is required",
    });
  }

  authModel.findUserByEmailOrMobileOrParentCode(
    identifier,
    async (findErr, results) => {
      if (findErr) {
        return res.status(500).json({
          success: false,
          message: "Database error",
          error: findErr.message,
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const user = results[0];

      if (!user.Mobile) {
        return res.status(400).json({
          success: false,
          message: "No mobile number found for this user",
        });
      }

      try {
        const fullMobile = `${process.env.TWILIO_COUNTRY_CODE}${user.Mobile}`;

        const verification = await client.verify.v2
          .services(process.env.TWILIO_VERIFY_SERVICE_SID)
          .verifications.create({
            to: fullMobile,
            channel: "sms",
          });

        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        authModel.saveForgotPasswordOtpLog(
          {
            userId: user.UserId,
            contactType: "Mobile",
            contactValue: user.Mobile,
            purpose: "ForgotPassword",
            expiresAt,
            providerRequestId: verification.sid,
          },
          (saveErr) => {
            if (saveErr) {
              return res.status(500).json({
                success: false,
                message: "OTP sent but log save failed",
                error: saveErr.message,
              });
            }

            return res.status(200).json({
              success: true,
              message: "Forgot password OTP sent successfully",
              providerRequestId: verification.sid,
              status: verification.status,
            });
          }
        );
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: "Failed to send forgot password OTP via Twilio",
          error: error.message,
        });
      }
    }
  );
};

const verifyForgotPasswordOtp = (req, res) => {
  const { identifier, otp } = req.body;

  if (!identifier || !otp) {
    return res.status(400).json({
      success: false,
      message: "identifier and otp are required",
    });
  }

  authModel.findUserByEmailOrMobileOrParentCode(
    identifier,
    async (findErr, results) => {
      if (findErr) {
        return res.status(500).json({
          success: false,
          message: "Database error",
          error: findErr.message,
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const user = results[0];

      if (!user.Mobile) {
        return res.status(400).json({
          success: false,
          message: "No mobile number found for this user",
        });
      }

      try {
        const fullMobile = `${process.env.TWILIO_COUNTRY_CODE}${user.Mobile}`;

        const verificationCheck = await client.verify.v2
          .services(process.env.TWILIO_VERIFY_SERVICE_SID)
          .verificationChecks.create({
            to: fullMobile,
            code: otp,
          });

        if (verificationCheck.status !== "approved") {
          return res.status(400).json({
            success: false,
            message: "Invalid or expired OTP",
            status: verificationCheck.status,
          });
        }

        authModel.markForgotPasswordOtpVerified(
          user.Mobile,
          (updateErr, updateResult) => {
            if (updateErr) {
              return res.status(500).json({
                success: false,
                message: "OTP verified but database update failed",
                error: updateErr.message,
              });
            }

            return res.status(200).json({
              success: true,
              message: "Forgot password OTP verified successfully",
              updatedRows: updateResult.affectedRows,
            });
          }
        );
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: "Failed to verify forgot password OTP via Twilio",
          error: error.message,
        });
      }
    }
  );
};

const resetPassword = (req, res) => {
  const { identifier, newPassword } = req.body;

  if (!identifier || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "identifier and newPassword are required",
    });
  }

  authModel.findUserByEmailOrMobileOrParentCode(
    identifier,
    async (findErr, results) => {
      if (findErr) {
        return res.status(500).json({
          success: false,
          message: "Database error",
          error: findErr.message,
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const user = results[0];

      if (!user.Mobile) {
        return res.status(400).json({
          success: false,
          message: "No mobile number found for this user",
        });
      }

      authModel.checkVerifiedForgotPasswordOtp(
        user.Mobile,
        async (otpErr, otpResults) => {
          if (otpErr) {
            return res.status(500).json({
              success: false,
              message: "Failed to validate forgot password OTP status",
              error: otpErr.message,
            });
          }

          if (otpResults.length === 0) {
            return res.status(400).json({
              success: false,
              message:
                "Forgot password OTP is not verified. Please verify OTP before resetting password",
            });
          }

          try {
            const passwordHash = await bcrypt.hash(newPassword, 10);

            authModel.updateUserPasswordByUserId(
              user.UserId,
              passwordHash,
              (updateErr, updateResult) => {
                if (updateErr) {
                  return res.status(500).json({
                    success: false,
                    message: "Failed to reset password",
                    error: updateErr.message,
                  });
                }

                return res.status(200).json({
                  success: true,
                  message: "Password reset successfully",
                  updatedRows: updateResult.affectedRows,
                });
              }
            );
          } catch (error) {
            return res.status(500).json({
              success: false,
              message: "Failed to hash new password",
              error: error.message,
            });
          }
        }
      );
    }
  );
};

const sendQuickParentLoginOtp = (req, res) => {
  const { mobile } = req.body;

  if (!mobile) {
    return res.status(400).json({
      success: false,
      message: "mobile is required",
    });
  }

  authModel.findActiveParentByMobile(mobile, async (findErr, results) => {
    if (findErr) {
      return res.status(500).json({
        success: false,
        message: "Database error",
        error: findErr.message,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Parent not found or inactive",
      });
    }

    const parent = results[0];

    try {
      const fullMobile = `${process.env.TWILIO_COUNTRY_CODE}${mobile}`;

      const verification = await client.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verifications.create({
          to: fullMobile,
          channel: "sms",
        });

      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      authModel.saveOtpLog(
        {
          userId: parent.UserId,
          contactType: "Mobile",
          contactValue: mobile,
          purpose: "QuickLogin",
          expiresAt,
          providerRequestId: verification.sid,
        },
        (saveErr) => {
          if (saveErr) {
            return res.status(500).json({
              success: false,
              message: "OTP sent but log save failed",
              error: saveErr.message,
            });
          }

          return res.status(200).json({
            success: true,
            message: "Quick login OTP sent successfully",
            providerRequestId: verification.sid,
            status: verification.status,
          });
        }
      );
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP via Twilio",
        error: error.message,
      });
    }
  });
};

const verifyQuickParentLoginOtp = (req, res) => {
  const { mobile, otp } = req.body;

  if (!mobile || !otp) {
    return res.status(400).json({
      success: false,
      message: "mobile and otp are required",
    });
  }

  authModel.findActiveParentByMobile(mobile, async (findErr, results) => {
    if (findErr) {
      return res.status(500).json({
        success: false,
        message: "Database error",
        error: findErr.message,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Parent not found or inactive",
      });
    }

    const parent = results[0];

    try {
      const fullMobile = `${process.env.TWILIO_COUNTRY_CODE}${mobile}`;

      const verificationCheck = await client.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verificationChecks.create({
          to: fullMobile,
          code: otp,
        });

      if (verificationCheck.status !== "approved") {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired OTP",
          status: verificationCheck.status,
        });
      }

      authModel.markQuickLoginOtpVerified(mobile, (updateErr) => {
        if (updateErr) {
          return res.status(500).json({
            success: false,
            message: "OTP verified but database update failed",
            error: updateErr.message,
          });
        }

        const token = jwt.sign(
          {
            userId: parent.UserId,
            roleId: parent.RoleId,
            roleName: parent.RoleName,
          },
          process.env.JWT_SECRET,
          { expiresIn: "1d" }
        );

        return res.status(200).json({
          success: true,
          message: "Quick login successful",
          token,
          user: {
            userId: parent.UserId,
            fullName: parent.FullName,
            email: parent.Email,
            mobile: parent.Mobile,
            roleId: parent.RoleId,
            roleName: parent.RoleName,
            parentCode: parent.ParentCode || null,
          },
        });
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to verify OTP via Twilio",
        error: error.message,
      });
    }
  });
};

const sendChangeMobileOtp = (req, res) => {
  const { parentId } = req.params;
  const { newMobile } = req.body;

  if (!parentId || !newMobile) {
    return res.status(400).json({
      success: false,
      message: "parentId and newMobile are required",
    });
  }

  if (!/^\d{10}$/.test(newMobile)) {
    return res.status(400).json({
      success: false,
      message: "New mobile number must be exactly 10 digits",
    });
  }

  authModel.getParentMobileProfileById(parentId, (profileErr, profileResults) => {
    if (profileErr) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch parent profile",
        error: profileErr.message,
      });
    }

    if (profileResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Parent profile not found",
      });
    }

    const parent = profileResults[0];

    if (!parent.IsActive) {
      return res.status(400).json({
        success: false,
        message: "Inactive parent account cannot change mobile number",
      });
    }

    if (newMobile === parent.Mobile) {
      return res.status(400).json({
        success: false,
        message: "New mobile number cannot be same as current mobile number",
      });
    }

    if (parent.AlternateMobile && newMobile === parent.AlternateMobile) {
      return res.status(400).json({
        success: false,
        message: "New mobile number cannot be same as alternate mobile number",
      });
    }

    authModel.findOtherUserByMobileOrAlternateMobile(
      parent.UserId,
      newMobile,
      async (duplicateErr, duplicateResults) => {
        if (duplicateErr) {
          return res.status(500).json({
            success: false,
            message: "Failed to validate mobile number",
            error: duplicateErr.message,
          });
        }

        if (duplicateResults.length > 0) {
          return res.status(409).json({
            success: false,
            message: "Mobile number already exists for another user",
          });
        }

        try {
          const fullMobile = `${process.env.TWILIO_COUNTRY_CODE}${newMobile}`;

          const verification = await client.verify.v2
            .services(process.env.TWILIO_VERIFY_SERVICE_SID)
            .verifications.create({
              to: fullMobile,
              channel: "sms",
            });

          const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

          authModel.saveOtpLog(
            {
              userId: parent.UserId,
              contactType: "Mobile",
              contactValue: newMobile,
              purpose: "ChangeMobile",
              expiresAt,
              providerRequestId: verification.sid,
            },
            (saveErr) => {
              if (saveErr) {
                return res.status(500).json({
                  success: false,
                  message: "OTP sent but log save failed",
                  error: saveErr.message,
                });
              }

              return res.status(200).json({
                success: true,
                message: "OTP sent successfully to new mobile number",
                providerRequestId: verification.sid,
                status: verification.status,
              });
            }
          );
        } catch (error) {
          return res.status(500).json({
            success: false,
            message: "Failed to send OTP via Twilio",
            error: error.message,
          });
        }
      }
    );
  });
};

const verifyChangeMobileOtp = (req, res) => {
  const { parentId } = req.params;
  const { newMobile, otp } = req.body;

  if (!parentId || !newMobile || !otp) {
    return res.status(400).json({
      success: false,
      message: "parentId, newMobile and otp are required",
    });
  }

  authModel.getParentMobileProfileById(parentId, async (profileErr, profileResults) => {
    if (profileErr) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch parent profile",
        error: profileErr.message,
      });
    }

    if (profileResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Parent profile not found",
      });
    }

    const parent = profileResults[0];

    if (newMobile === parent.Mobile) {
      return res.status(400).json({
        success: false,
        message: "New mobile number cannot be same as current mobile number",
      });
    }

    if (parent.AlternateMobile && newMobile === parent.AlternateMobile) {
      return res.status(400).json({
        success: false,
        message: "New mobile number cannot be same as alternate mobile number",
      });
    }

    authModel.findOtherUserByMobileOrAlternateMobile(
      parent.UserId,
      newMobile,
      async (duplicateErr, duplicateResults) => {
        if (duplicateErr) {
          return res.status(500).json({
            success: false,
            message: "Failed to validate mobile number",
            error: duplicateErr.message,
          });
        }

        if (duplicateResults.length > 0) {
          return res.status(409).json({
            success: false,
            message: "Mobile number already exists for another user",
          });
        }

        try {
          const fullMobile = `${process.env.TWILIO_COUNTRY_CODE}${newMobile}`;

          const verificationCheck = await client.verify.v2
            .services(process.env.TWILIO_VERIFY_SERVICE_SID)
            .verificationChecks.create({
              to: fullMobile,
              code: otp,
            });

          if (verificationCheck.status !== "approved") {
            return res.status(400).json({
              success: false,
              message: "Invalid or expired OTP",
              status: verificationCheck.status,
            });
          }

          authModel.markChangeMobileOtpVerified(newMobile, (markErr) => {
            if (markErr) {
              return res.status(500).json({
                success: false,
                message: "OTP verified but database update failed",
                error: markErr.message,
              });
            }

            authModel.updateUserMobileByUserId(parent.UserId, newMobile, (updateErr, updateResult) => {
              if (updateErr) {
                return res.status(500).json({
                  success: false,
                  message: "Failed to update mobile number",
                  error: updateErr.message,
                });
              }

              return res.status(200).json({
                success: true,
                message: "Mobile number updated successfully",
                updatedRows: updateResult.affectedRows,
                data: {
                  mobile: newMobile,
                },
              });
            });
          });
        } catch (error) {
          return res.status(500).json({
            success: false,
            message: "Failed to verify OTP via Twilio",
            error: error.message,
          });
        }
      }
    );
  });
};

const sendChangeEmailOtp = (req, res) => {
  const { parentId } = req.params;
  const { newEmail } = req.body;

  if (!parentId || !newEmail) {
    return res.status(400).json({
      success: false,
      message: "parentId and newEmail are required",
    });
  }

  if (!/^\S+@\S+\.\S+$/.test(newEmail)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email address",
    });
  }

  authModel.getParentMobileProfileById(parentId, (profileErr, profileResults) => {
    if (profileErr) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch parent profile",
        error: profileErr.message,
      });
    }

    if (profileResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Parent profile not found",
      });
    }

    const parent = profileResults[0];

    if (!parent.IsActive) {
      return res.status(400).json({
        success: false,
        message: "Inactive parent account cannot change email",
      });
    }

    if ((parent.Email || "").toLowerCase() === newEmail.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: "New email cannot be same as current email",
      });
    }

    authModel.findOtherUserByEmail(
      parent.UserId,
      newEmail,
      async (duplicateErr, duplicateResults) => {
        if (duplicateErr) {
          return res.status(500).json({
            success: false,
            message: "Failed to validate email address",
            error: duplicateErr.message,
          });
        }

        if (duplicateResults.length > 0) {
          return res.status(409).json({
            success: false,
            message: "Email already exists for another user",
          });
        }

        try {
          const fullMobile = `${process.env.TWILIO_COUNTRY_CODE}${parent.Mobile}`;

          const verification = await client.verify.v2
            .services(process.env.TWILIO_VERIFY_SERVICE_SID)
            .verifications.create({
              to: fullMobile,
              channel: "sms",
            });

          const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

          authModel.saveOtpLog(
            {
              userId: parent.UserId,
              contactType: "Mobile",
              contactValue: parent.Mobile,
              purpose: "ChangeEmail",
              expiresAt,
              providerRequestId: verification.sid,
            },
            (saveErr) => {
              if (saveErr) {
                return res.status(500).json({
                  success: false,
                  message: "OTP sent but log save failed",
                  error: saveErr.message,
                });
              }

              return res.status(200).json({
                success: true,
                message: "OTP sent successfully to current mobile number",
                providerRequestId: verification.sid,
                status: verification.status,
              });
            }
          );
        } catch (error) {
          return res.status(500).json({
            success: false,
            message: "Failed to send OTP via Twilio",
            error: error.message,
          });
        }
      }
    );
  });
};

const verifyChangeEmailOtp = (req, res) => {
  const { parentId } = req.params;
  const { newEmail, otp } = req.body;

  if (!parentId || !newEmail || !otp) {
    return res.status(400).json({
      success: false,
      message: "parentId, newEmail and otp are required",
    });
  }

  if (!/^\S+@\S+\.\S+$/.test(newEmail)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email address",
    });
  }

  authModel.getParentMobileProfileById(parentId, async (profileErr, profileResults) => {
    if (profileErr) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch parent profile",
        error: profileErr.message,
      });
    }

    if (profileResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Parent profile not found",
      });
    }

    const parent = profileResults[0];

    if ((parent.Email || "").toLowerCase() === newEmail.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: "New email cannot be same as current email",
      });
    }

    authModel.findOtherUserByEmail(
      parent.UserId,
      newEmail,
      async (duplicateErr, duplicateResults) => {
        if (duplicateErr) {
          return res.status(500).json({
            success: false,
            message: "Failed to validate email address",
            error: duplicateErr.message,
          });
        }

        if (duplicateResults.length > 0) {
          return res.status(409).json({
            success: false,
            message: "Email already exists for another user",
          });
        }

        try {
          const fullMobile = `${process.env.TWILIO_COUNTRY_CODE}${parent.Mobile}`;

          const verificationCheck = await client.verify.v2
            .services(process.env.TWILIO_VERIFY_SERVICE_SID)
            .verificationChecks.create({
              to: fullMobile,
              code: otp,
            });

          if (verificationCheck.status !== "approved") {
            return res.status(400).json({
              success: false,
              message: "Invalid or expired OTP",
              status: verificationCheck.status,
            });
          }

          authModel.markChangeEmailOtpVerified(parent.Mobile, (markErr) => {
            if (markErr) {
              return res.status(500).json({
                success: false,
                message: "OTP verified but database update failed",
                error: markErr.message,
              });
            }

            authModel.updateUserEmailByUserId(parent.UserId, newEmail, (updateErr, updateResult) => {
              if (updateErr) {
                return res.status(500).json({
                  success: false,
                  message: "Failed to update email address",
                  error: updateErr.message,
                });
              }

              return res.status(200).json({
                success: true,
                message: "Email updated successfully",
                updatedRows: updateResult.affectedRows,
                data: {
                  email: newEmail,
                },
              });
            });
          });
        } catch (error) {
          return res.status(500).json({
            success: false,
            message: "Failed to verify OTP via Twilio",
            error: error.message,
          });
        }
      }
    );
  });
};

module.exports = {
  login,
  registerParent,
  resetPassword,
  sendRegisterOtp,
  verifyRegisterOtp,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  sendQuickParentLoginOtp,
  verifyQuickParentLoginOtp,
  sendChangeMobileOtp,
  verifyChangeMobileOtp,
  sendChangeEmailOtp,
  verifyChangeEmailOtp,
};