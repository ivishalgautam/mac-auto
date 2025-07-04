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

const auth = {
  loginRequest: loginRequest,
  loginVerify: loginVerify,
};

export default auth;
