const axios = require("axios");

const sendFast2Sms = async ({ mobile, otp }) => {
  const message = `Your OTP for School Feedback System is ${otp}. It is valid for 5 minutes.`;

  try {
    const response = await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        route: "q",
        message,
        language: "english",
        flash: 0,
        numbers: mobile,
      },
      {
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Fast2SMS Error:", error.response?.data || error.message);

    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to send SMS via Fast2SMS"
    );
  }
};

module.exports = { sendFast2Sms };