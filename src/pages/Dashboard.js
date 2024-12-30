import React, { useState, useEffect } from 'react';
import NavbarStaff from '../components/navbarStaff';
import axios from 'axios';
import './Dashboard.css';

const handleLogout = () => {
  sessionStorage.removeItem('authToken');
  sessionStorage.removeItem('refreshToken');
  alert('You have been logged out.');
  window.location.href = '/staff';
};

function Dashboard() {
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [userName, setUserName] = useState('Admin');
  const [userInitial, setUserInitial] = useState('A');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const announcementsPerPage = 5;

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredAnnouncements = announcements.filter((announcement) =>
    announcement.text.toLowerCase().includes(searchTerm)
  );

  const indexOfLastAnnouncement = currentPage * announcementsPerPage;
  const indexOfFirstAnnouncement = indexOfLastAnnouncement - announcementsPerPage;
  const currentAnnouncements = filteredAnnouncements.slice(
    indexOfFirstAnnouncement,
    indexOfLastAnnouncement
  );

  const handleNextPage = () => {
    if (indexOfLastAnnouncement < filteredAnnouncements.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleInputChange = (e) => {
    setNewAnnouncement(e.target.value);
  };

  const handlePublish = async () => {
    if (newAnnouncement.trim() === '') return;

    try {
      const response = await axios.post('http://localhost:5000/announcements', {
        text: newAnnouncement,
      });

      setAnnouncements([response.data, ...announcements]);
      setNewAnnouncement('');
      setIsInputVisible(false);
    } catch (error) {
      console.error('Failed to save announcement:', error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get('http://localhost:5000/announcements');
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const token = sessionStorage.getItem('authToken');
      const response = await axios.get('http://localhost:5000/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { user } = response.data;
      setUserName(user.name);
      setUserInitial(user.name.charAt(0).toUpperCase());
    } catch (error) {
      console.error('Error fetching user info:', error.response?.data || error.message);
      alert('Failed to fetch user information.');
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    fetchUserInfo();
  }, []);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const timeString = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    return isToday ? `Today, ${timeString}` : `${date.toLocaleDateString()}, ${timeString}`;
  };

  return (
    <div className="dashboard-container">
      <NavbarStaff />
      <div className="dashboard-content">
        <div className="top-bar">
          <h1>Dashboard</h1>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
        <p>Welcome back, {userName}!</p>

        <div className="announcement-section">
          <h2>Announcement</h2>
          <div className="announcement-input">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
          <div className="announcement-input">
            {!isInputVisible ? (
              <div className="placeholder" onClick={() => setIsInputVisible(true)}>
                <span className="initial-icon">{userInitial}</span> What do you want to announce?
              </div>
            ) : (
              <div className="input-with-button">
                <input
                  type="text"
                  value={newAnnouncement}
                  onChange={handleInputChange}
                  placeholder="Type your announcement here"
                />
                <button onClick={handlePublish}>Publish</button>
                <button
                  className="cancel-button"
                  onClick={() => {
                    setNewAnnouncement('');
                    setIsInputVisible(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          {currentAnnouncements.length > 0 ? (
            <ul className="announcement-list">
              {currentAnnouncements.map((announcement) => (
                <li key={announcement.id}>
                  <span className="announcement-text">{announcement.text}</span>
                  <span className="announcement-time">
                    {formatTimestamp(announcement.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No announcements to display</p>
          )}
          <div className="pagination-controls">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={indexOfLastAnnouncement >= filteredAnnouncements.length}
              className="pagination-button"
            >
              Next
            </button>
          </div>
        </div>

        <div className="quick-access-section">
          <h2>Quick Access:</h2>
          <div className="quick-links">
            <div className="quick-link">
              <a href="/customer">Manage Customers</a>
              <p>Manage new customers and today’s bookings.</p>
            </div>
            <div className="quick-link">
              <a href="/product">Product</a>
              <p>Track product records and levels.</p>
            </div>
            <div className="quick-link">
              <a href="/supplier">Suppliers</a>
              <p>View and contact suppliers, and track orders.</p>
            </div>
            <div className="quick-link">
              <a href="/report">Generate Reports</a>
              <p>Create reports on sales, inventory, and more.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
