"use strict";

import axios from "axios";
import config from "../config/index.js";

async function sendWelcomeWhatsapp({ phone }) {
  let configOpt = {
    method: "get",
    maxBodyLength: Infinity,
    url: `https://app.wafly.in/api/sendtemplate.php?LicenseNumber=${config.waffly_license_no}&APIKey=${config.waffly_api_key}&Contact=${phone}&Template=${config.waffly_template_welcome}`,
    headers: {},
  };

  try {
    const { data } = await axios.request(configOpt);
    console.log("Waffly welcome message response: ", data);
    return data;
  } catch (error) {
    console.log("Error sending welcome message: ", error);
  }
}

export default {
  sendWelcomeWhatsapp: sendWelcomeWhatsapp,
};
