export const endpoints = {
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    signup: "/auth/signup",
    refresh: "/auth/refresh",
    username: "/auth/username",
  },
  profile: "/users/me",
  files: {
    upload: "/upload/files",
    getFiles: "/upload",
    deleteKey: "/upload/s3",
    preSignedUrl: "/upload/presigned-url",
    preSignedUrls: "/upload/presigned-urls",
  },
  users: { getAll: "/users" },
  vehicles: { getAll: "/vehicles" },
  dealers: { getAll: "/dealers", inventory: "/dealers/inventory" },
  inventories: {
    getAll: "/inventories",
    getByVehicle: "/inventories/by-vehicle",
  },
  enquiries: { getAll: "/enquiries" },
  queries: { getAll: "/queries" },
  financers: { getAll: "/financers" },
  orders: { getAll: "/orders", dealers: "/dealer-orders" },
};
