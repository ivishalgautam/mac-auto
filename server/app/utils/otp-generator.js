import crypto from "crypto";
import config from "../config/index.js";

export const otpGenerator = () => {
  let otp = null;
  if (config.node_env === "development") {
    otp = 111111;
  } else {
    otp = crypto.randomInt(100000, 999999);
  }
  console.log({ otp });
  return otp;
};
