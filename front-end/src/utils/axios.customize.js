import axios from "axios";

const instance = axios.create();

instance.interceptors.request.use(
  function (config) {
    config.headers.Authorization = `Bearer ${
      localStorage.getItem("access_token") || ""
    }`;

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  function (response) {
    return response?.data ?? response;
  },
  function (error) {
    if (error?.response?.data) return error?.response?.data;
    return Promise.reject(error);
  }
);

export default instance;
