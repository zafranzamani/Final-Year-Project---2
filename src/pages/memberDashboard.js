import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MemberDashboard.css';

function MemberDashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: '',
    memberId: '',
    email: '',
    phone_number: '',
    username: '',
    membership: '',
    membership_start_date: '',
    membership_valid_until: '',
    discount_percentage: 0,
    booking_count: 0
  });

  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [tempValues, setTempValues] = useState({});
  const [currentPassword, setCurrentPassword] = useState('');
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);

  const handleVerifyPassword = async () => {
    try {
      const response = await axios.post('http://localhost:5000/verify-password', {
        id: userData.id,
        password: '1234' // This is your default password
      });
      
      if (response.data.valid) {
        setCurrentPassword('1234');
        setIsPasswordVerified(true);
      }
    } catch (error) {
      console.error('Error verifying password:', error);
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('memberData'));
    if (!storedUser) {
      navigate('/member');
      return;
    }

    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/user-details/${storedUser.id}`);
        const updatedUserData = {
          ...storedUser,
          ...response.data
        };
        
        if (!updatedUserData.name || updatedUserData.name.trim() === '') {
          setShowNamePrompt(true);
        }

        setUserData(updatedUserData);
        localStorage.setItem('memberData', JSON.stringify(updatedUserData));
      } catch (error) {
        console.error('Failed to fetch user details:', error);
      }
    };

    fetchUserDetails();
  }, [navigate]);

  useEffect(() => {
    if (showPassword && !isPasswordVerified) {
      handleVerifyPassword();
    } else if (!showPassword) {
      setCurrentPassword('');
      setIsPasswordVerified(false);
    }
  }, [showPassword]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const handleUpdateName = async () => {
    try {
      await axios.put('http://localhost:5000/update-user-name', {
        id: userData.id,
        name: tempValues.name
      });
      
      const updatedUserData = { ...userData, name: tempValues.name };
      setUserData(updatedUserData);
      setShowNamePrompt(false);
      localStorage.setItem('memberData', JSON.stringify(updatedUserData));
    } catch (error) {
      alert('Failed to update name');
    }
  };

  const handleEdit = (field) => {
    setTempValues({ ...tempValues, [field]: userData[field] });
    switch(field) {
      case 'phone_number':
        setIsEditingPhone(true);
        break;
      case 'username':
        setIsEditingUsername(true);
        break;
      case 'password':
        setIsEditingPassword(true);
        setTempValues(prev => ({ ...prev, password: '' }));
        break;
      default:
        break;
    }
  };

  const handleCancel = (field) => {
    switch(field) {
      case 'phone_number':
        setIsEditingPhone(false);
        break;
      case 'username':
        setIsEditingUsername(false);
        break;
      case 'password':
        setIsEditingPassword(false);
        break;
      default:
        break;
    }
    setTempValues({ ...tempValues, [field]: userData[field] });
  };

  const handleSave = async (field) => {
    try {
      if (field === 'phone_number' && !/^\d{10}$/.test(tempValues[field])) {
        alert('Please enter a valid 10-digit phone number');
        return;
      }
      
      if (field === 'password' && tempValues[field].length < 8) {
        alert('Password must be at least 8 characters long');
        return;
      }

      const response = await axios.put('http://localhost:5000/update-user-details', {
        id: userData.id,
        field,
        value: tempValues[field]
      });

      if (response.data.message) {
        const updatedUserData = { ...userData };
        if (field !== 'password') {
          updatedUserData[field] = tempValues[field];
        }
        setUserData(updatedUserData);
        localStorage.setItem('memberData', JSON.stringify(updatedUserData));
        alert(`${field.replace('_', ' ')} updated successfully`);
      }
      
      handleCancel(field);
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      alert(`Failed to update ${field}. Please try again.`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('memberToken');
    sessionStorage.removeItem('memberToken');
    localStorage.removeItem('memberData');
    navigate('/member');
  };

  const renderPasswordSection = () => (
    <div className="info-row">
      <label>Password:</label>
      {isEditingPassword ? (
        <div className="edit-field">
          <div className="password-input-group">
            <input
              type={showPassword ? "text" : "password"}
              value={tempValues.password || ''}
              onChange={(e) => setTempValues({ ...tempValues, password: e.target.value })}
              placeholder="Enter new password"
            />
            <button 
              type="button" 
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          <button className="save-button" onClick={() => handleSave('password')}>Save</button>
          <button className="cancel-button" onClick={() => handleCancel('password')}>Cancel</button>
        </div>
      ) : (
        <div className="password-field">
          <div className="password-display">
            <span>{showPassword && isPasswordVerified ? currentPassword : '••••••••'}</span>
            <button 
              type="button" 
              className="toggle-password-display"
              onClick={() => setShowPassword(!showPassword)}
              style={{ marginLeft: '10px' }}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          <button className="change-button-password" onClick={() => handleEdit('password')}>
            Change password
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="member-dashboard">
      {showNamePrompt && (
        <div className="name-prompt-overlay">
          <div className="name-prompt">
            <h2>Welcome!</h2>
            <p>Please enter your name to continue:</p>
            <input
              type="text"
              value={tempValues.name || ''}
              onChange={(e) => setTempValues({ ...tempValues, name: e.target.value })}
              placeholder="Your Name"
            />
            <button onClick={handleUpdateName}>Save</button>
          </div>
        </div>
      )}

      <h1>Member Dashboard</h1>
      <div className="dashboard-content">
        <div className="top-section">
          <div className="qr-section">
            <div className="qr-placeholder">
              QR Code Coming Soon
            </div>
          </div>

          <div className="membership-card">
            <h2>Membership Level</h2>
            <div className="card-content">
              <div className="level">{userData.membership || 'Silver'}</div>
              <div className="discount">{userData.discount_percentage || 15}%</div>
              <div className="expiry">
                Membership expires: {formatDate(userData.membership_valid_until)}
              </div>
            </div>
          </div>
        </div>

        <div className="member-info">
          <div className="info-row">
            <label>Name:</label>
            <span>{userData.name || 'Not set'}</span>
          </div>

          <div className="info-row">
            <label>Member ID:</label>
            <span>{userData.member_id || userData.memberId}</span>
          </div>

          <div className="info-row">
            <label>Email:</label>
            <span>{userData.email}</span>
          </div>

          <div className="info-row">
            <label>Phone no:</label>
            {isEditingPhone ? (
              <div className="edit-field">
                <input
                  type="text"
                  value={tempValues.phone_number || ''}
                  onChange={(e) => setTempValues({ ...tempValues, phone_number: e.target.value })}
                />
                <button className="save-button" onClick={() => handleSave('phone_number')}>Save</button>
                <button className="cancel-button" onClick={() => handleCancel('phone_number')}>Cancel</button>
              </div>
            ) : (
              <>
                <span>{userData.phone_number}</span>
                <button className="change-button" onClick={() => handleEdit('phone_number')}>
                  Change phone number
                </button>
              </>
            )}
          </div>

          <div className="info-row">
            <label>Username:</label>
            {isEditingUsername ? (
              <div className="edit-field">
                <input
                  type="text"
                  value={tempValues.username || ''}
                  onChange={(e) => setTempValues({ ...tempValues, username: e.target.value })}
                />
                <button className="save-button" onClick={() => handleSave('username')}>Save</button>
                <button className="cancel-button" onClick={() => handleCancel('username')}>Cancel</button>
              </div>
            ) : (
              <>
                <span>{userData.username}</span>
                <button className="change-button" onClick={() => handleEdit('username')}>
                  Change username
                </button>
              </>
            )}
          </div>

          {renderPasswordSection()}

        </div>
        
        <button className="logout-button-memberdashboard" onClick={handleLogout}>
          LOGOUT
        </button>
      </div>
    </div>
  );
}

export default MemberDashboard;