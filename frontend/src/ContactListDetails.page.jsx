import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import contactService from './contact.service';

const ContactListDetails = () => {
  const { id } = useParams();
  const [listDetails, setListDetails] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = () => {
    setLoading(true);
    contactService.getContactListById(id).then(
      (response) => {
        setListDetails(response.data.contactList);
        setContacts(response.data.contacts);
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

  const handleFileUpload = (e) => {
    e.preventDefault();
    contactService.uploadContacts(id, file).then(
      () => {
        fetchDetails(); // Refresh details after upload
      },
      (error) => {
        console.error(error);
      }
    );
  };

  return (
    <div>
      {loading && <p>Loading details...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {listDetails && (
        <>
          <h2>{listDetails.listName}</h2>
          <hr />
          <h3>Upload Contacts (CSV)</h3>
          <form onSubmit={handleFileUpload}>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files[0])}
              required
            />
            <button type="submit">Upload</button>
          </form>
          <hr />
          <h3>Contacts</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone Number</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact._id}>
                  <td>{contact.name}</td>
                  <td>{contact.phoneNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default ContactListDetails;
