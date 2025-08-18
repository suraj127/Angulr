import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import campaignService from './campaign.service';

const Dashboard = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    campaignService.getCampaigns().then(
      (response) => {
        setCampaigns(response.data);
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
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      {loading && <p>Loading campaigns...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {campaigns.map((campaign) => (
          <li key={campaign._id}>
            <Link to={`/campaigns/${campaign._id}`}>
              <strong>{campaign.campaignName}</strong> - {campaign.status}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
