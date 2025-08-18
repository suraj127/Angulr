import axios from 'axios';
import authService from './auth.service';

const API_URL = '/api/lists/';

const authHeader = () => {
  const user = authService.getCurrentUser();
  if (user && user.token) {
    return { Authorization: 'Bearer ' + user.token };
  } else {
    return {};
  }
};

const getContactLists = () => {
  return axios.get(API_URL, { headers: authHeader() });
};

const createContactList = (listName) => {
  return axios.post(API_URL, { listName }, { headers: authHeader() });
};

const uploadContacts = (listId, file) => {
  const formData = new FormData();
  formData.append('file', file);

  return axios.post(API_URL + listId + '/contacts', formData, {
    headers: {
      ...authHeader(),
      'Content-Type': 'multipart/form-data',
    },
  });
};

const getContactListById = (id) => {
  return axios.get(API_URL + id, { headers: authHeader() });
};

const contactService = {
  getContactLists,
  createContactList,
  uploadContacts,
  getContactListById,
};

export default contactService;
