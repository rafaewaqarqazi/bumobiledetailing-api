import axios from 'axios';
const API_URL = 'https://voip.ms/api/v1/rest.php';
export interface ISMSParams {
  api_username: string;
  api_password: string;
  method: string;
  did: number;
  dst: number;
  message: string;
}
export const sendSMSAPI = (params: ISMSParams) =>
  axios.get(API_URL, { params });
export const getSMSAPI = (params) => axios.get(API_URL, { params });
