import React, { useState, useEffect } from 'react';
import campaignService from './campaign.service';
import contactService from './contact.service';

const CreateCampaign = () => {
  const [form, setForm] = useState({
    campaignName: '',
    messageBody: '',
    imageUrl: '',
    contactListId: '',
    delayInSeconds: 30,
  });
  const [contactLists, setContactLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    contactService.getContactLists().then((response) => {
      setContactLists(response.data);
      if (response.data.length > 0) {
        setForm((prevForm) => ({
          ...prevForm,
          contactListId: response.data[0]._id,
        }));
      }
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleCreateCampaign = (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    campaignService.createCampaign(form).then(
      (response) => {
        setLoading(false);
        setMessage('Campaign created successfully!');
      },
      (error) => {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
        setLoading(false);
        setMessage(resMessage);
      }
    );
  };

  return (
    <div>
      <h2>Create New Campaign</h2>
      <form onSubmit={handleCreateCampaign}>
        <div>
          <label>Campaign Name</label>
          <input
            type="text"
            name="campaignName"
            value={form.campaignName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Message Body</label>
          <textarea
            name="messageBody"
            value={form.messageBody}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Image URL (Optional)</label>
          <input
            type="text"
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Contact List</label>
          <select
            name="contactListId"
            value={form.contactListId}
            onChange={handleChange}
            required
          >
            {contactLists.map((list) => (
              <option key={list._id} value={list._id}>
                {list.listName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Delay (seconds)</label>
          <input
            type="number"
            name="delayInSeconds"
            value={form.delayInSeconds}
            onChange={handleChange}
            required
            min="1"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Campaign'}
        </button>
        {message && <p>{message}</p>}
      </form>
    </div>
  );
};

export default CreateCampaign;
