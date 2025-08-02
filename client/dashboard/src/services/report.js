const { endpoints } = require("@/utils/endpoints");
const { default: http } = require("@/utils/http");

const getReport = async () => {
  const { data } = await http().get(endpoints.reports.getAll);
  return data;
};

const report = {
  getReport: getReport,
};

export default report;
