import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import contactService from './contact.service';

const ContactLists = () => {
  const [lists, setLists] = useState([]);
  const [listName, setListName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = () => {
    setLoading(true);
    contactService.getContactLists().then(
      (response) => {
        setLists(response.data);
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
  };

  const handleCreateList = (e) => {
    e.preventDefault();
    contactService.createContactList(listName).then(
      () => {
        fetchLists(); // Refresh the list after creating a new one
        setListName('');
      },
      (error) => {
        // Handle error
        console.error(error);
      }
    );
  };

  return (
    <div>
      <h2>Contact Lists</h2>
      <form onSubmit={handleCreateList}>
        <input
          type="text"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
          placeholder="New list name"
          required
        />
        <button type="submit">Create List</button>
      </form>
      <hr />
      {loading && <p>Loading lists...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {lists.map((list) => (
          <li key={list._id}>
            <Link to={`/contact-lists/${list._id}`}>{list.listName}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContactLists;
