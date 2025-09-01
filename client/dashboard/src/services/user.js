const { endpoints } = require("@/utils/endpoints");
const { default: http } = require("@/utils/http");

const create = async (data) => {
  return await http().post(endpoints.users.getAll, data);
};

const update = async (id, data) => {
  return await http().put(`${endpoints.users.getAll}/${id}`, data);
};

const deleteById = async (id) => {
  return await http().delete(`${endpoints.users.getAll}/${id}`);
};

const getById = async (id) => {
  return await http().get(`${endpoints.users.getAll}/${id}`);
};

const getByPhone = async (phone) => {
  return await http().get(`${endpoints.users.getAll}/by-phone/${phone}`);
};

const get = async (searchParams = "") => {
  const { data } = await http().get(
    `${endpoints.users.getAll}?${searchParams}`,
  );
  return data;
};

const getUserCompanyProfile = async (id) => {
  const { data } = await http().get(
    `${endpoints.companyProfiles.getAll}/get-by-user/${id}`,
  );
  return data;
};

const getUserContacts = async (id) => {
  const { data } = await http().get(
    `${endpoints.userKeyContacts.getAll}/get-by-user/${id}`,
  );
  return data;
};

const user = {
  create: create,
  update: update,
  deleteById: deleteById,
  getById: getById,
  getByPhone: getByPhone,
  get: get,
  getUserCompanyProfile: getUserCompanyProfile,
  getUserContacts: getUserContacts,
};

export default user;
