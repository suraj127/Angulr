import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from './Login.page.jsx';
import Register from './Register.page.jsx';
import Dashboard from './Dashboard.page.jsx';
import ContactLists from './ContactLists.page.jsx';
import ContactListDetails from './ContactListDetails.page.jsx';
import CreateCampaign from './CreateCampaign.page.jsx';
import CampaignDetails from './CampaignDetails.page.jsx';
import PrivateRoute from './PrivateRoute.component.jsx';
import authService from './auth.service';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(undefined);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const logOut = () => {
    authService.logout();
    setCurrentUser(undefined);
  };

  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            {currentUser ? (
              <>
                <li>
                  <Link to="/dashboard">Dashboard</Link>
                </li>
                <li>
                  <Link to="/contact-lists">Contact Lists</Link>
                </li>
                <li>
                  <Link to="/create-campaign">Create Campaign</Link>
                </li>
                <li>
                  <a href="/login" onClick={logOut}>
                    Logout
                  </a>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login">Login</Link>
                </li>
                <li>
                  <Link to="/register">Register</Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        <hr />

        <Routes>
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/contact-lists"
            element={
              <PrivateRoute>
                <ContactLists />
              </PrivateRoute>
            }
          />
          <Route
            path="/contact-lists/:id"
            element={
              <PrivateRoute>
                <ContactListDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/create-campaign"
            element={
              <PrivateRoute>
                <CreateCampaign />
              </PrivateRoute>
            }
          />
          <Route
            path="/campaigns/:id"
            element={
              <PrivateRoute>
                <CampaignDetails />
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

const Home = () => {
  const currentUser = authService.getCurrentUser();
  if (currentUser) {
    return <Navigate to="/dashboard" />;
  }
  return <h2>Home Page</h2>;
};

export default App;
