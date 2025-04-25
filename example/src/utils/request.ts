import axios from 'axios';
import { message } from 'ant-design-vue';
import { globalLoading } from '@/utils/share';

const request = axios.create({
  baseURL: `${import.meta.env.VITE_AMAP_BACKEND}/geofence`,
});

request.interceptors.request.use((config) => {
  globalLoading.value = true;
  return config;
});

request.interceptors.response.use(
  ({ data }) => {
    globalLoading.value = false;
    const { errmsg, errdetail } = data;
    if (errmsg === 'OK') {
      return Promise.resolve(data.data);
    }
    message.error(errdetail);
    return Promise.reject(new Error(errdetail));
  },
  (error) => {
    globalLoading.value = false;
    message.error(error.message);
    return Promise.reject(error);
  },
);

export default request;
