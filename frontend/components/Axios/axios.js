import Axios from 'axios'
import { getUserToken, isLoggedIn } from '../Token/tokenAction';

export const internal_server_url = "http://127.0.0.1:8000"

export const axios = Axios.create({
    baseURL: internal_server_url,
});


axios.interceptors.request.use(
    config => {
        if (isLoggedIn()) {
            const token = getUserToken();
            config.headers['Authorization'] = 'Bearer ' + token
        }
        return config
    }
);
