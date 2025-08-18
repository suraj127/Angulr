import axios from 'axios';
import authService from './auth.service';

const API_URL = '/api/campaigns/';

const authHeader = () => {
  const user = authService.getCurrentUser();
  if (user && user.token) {
    return { Authorization: 'Bearer ' + user.token };
  } else {
    return {};
  }
};

const getCampaigns = () => {
  return axios.get(API_URL, { headers: authHeader() });
};

const getCampaignById = (id) => {
  return axios.get(API_URL + id, { headers: authHeader() });
};

const createCampaign = (data) => {
  return axios.post(API_URL, data, { headers: authHeader() });
};

const campaignService = {
  getCampaigns,
  getCampaignById,
  createCampaign,
};

export default campaignService;
