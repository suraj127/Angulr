import React, { useState } from 'react';
import authService from './auth.service';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();

    setMessage('');
    setLoading(true);

    authService.login(email, password).then(
      () => {
        // On successful login, you would typically redirect the user
        // For now, we'll just show a success message
        // window.location.reload(); // Or use React Router to navigate
        setMessage('Login successful!');
        setLoading(false);
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
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <button type="submit" disabled={loading}>
            {loading && <span></span>}
            <span>Login</span>
          </button>
        </div>
        {message && <div>{message}</div>}
      </form>
    </div>
  );
};

export default Login;
