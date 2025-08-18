import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import campaignService from './campaign.service';

const CampaignDetails = () => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    campaignService.getCampaignById(id).then(
      (response) => {
        setCampaign(response.data.campaign);
        setMessages(response.data.messages);
        setLoading(false);
      },
      (error) => {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
        setError(resMessage);
        setLoading(false);
      }
    );
  }, [id]);

  return (
    <div>
      {loading && <p>Loading campaign details...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {campaign && (
        <>
          <h2>Campaign: {campaign.campaignName}</h2>
          <p>Status: {campaign.status}</p>
          <p>Message: {campaign.messageBody}</p>
          <hr />
          <h3>Message Statuses</h3>
          <table>
            <thead>
              <tr>
                <th>Contact Name</th>
                <th>Phone Number</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((message) => (
                <tr key={message._id}>
                  <td>{message.contact.name}</td>
                  <td>{message.contact.phoneNumber}</td>
                  <td>{message.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default CampaignDetails;
