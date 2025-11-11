import axios from "axios";

const loginRequest = async (data) => {
  return await axios.post("/api/login-request", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

const loginVerify = async (data) => {
  return await axios.post("/api/login-verify", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

const forgotPassword = async (data) => {
  return await axios.post("/api/forgot-password", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

const resetPassword = async (data) => {
  return await axios.post("/api/reset-password", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

const auth = {
  loginRequest: loginRequest,
  loginVerify: loginVerify,
  forgotPassword: forgotPassword,
  resetPassword: resetPassword,
};

export default auth;
