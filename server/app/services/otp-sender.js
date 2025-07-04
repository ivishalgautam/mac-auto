import axios from "axios";
import config from "../config/index.js";

export async function sendOtp({ phone, otp }) {
  if (config.node_env === "development") return true;

  let axiosConfig = {
    method: "get",
    maxBodyLength: Infinity,
    url: `https://pgapi.smartping.ai/fe/api/v1/multiSend?username=${config.smartping_username}&password=${config.smartping_password}&unicode=false&from=BHASKT&to=${phone}&dltContentId=${config.smartping_content_id}&dltPrincipalEntityId=${config.smartping_principal_entity_id}&text=Your%20OTP%20for%20Registration%20on%20https://bharatshaktitenders.com/%20is%20${otp}.%20It%20is%20valid%20for%205%20minutes.%20Please%20do%20not%20share%20this%20OTP%20with%20anyone`,
    headers: {},
  };

  try {
    const { data } = await axios.request(axiosConfig);
    console.log("OTP sent response: ", data);
    return data;
  } catch (error) {
    console.log("Error sending OTP: ", error);
  }
}
