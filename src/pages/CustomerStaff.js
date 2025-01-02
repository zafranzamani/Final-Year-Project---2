import React, { useState } from "react";
import NavbarStaff from "../components/navbarStaff"; // Correct path
import "./CustomerStaff.css";

function CustomerStaff() {
  const [typeOfCut, setTypeOfCut] = useState("");
  const [isInputActive, setIsInputActive] = useState(false);
  const [isScanActive, setIsScanActive] = useState(false);
  const [memberId, setMemberId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [sales, setSales] = useState([]);

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("refreshToken");
    alert("You have been logged out.");
    window.location.href = "/staff";
  };

  const handleShowInput = () => {
    setIsInputActive(true);
    setIsScanActive(false);
  };

  const handleCloseInput = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsInputActive(false);
    setMemberId("");
  };

  const handleScanQR = () => {
    if (isInputActive) return;
    setIsScanActive(!isScanActive);
  };

  const handlePaymentSelection = (method) => {
    setPaymentMethod(paymentMethod === method ? "" : method);
  };

  const handleDone = () => {
    if (!typeOfCut || (!isScanActive && !memberId) || !paymentMethod) {
      alert("Please fill in all fields.");
      return;
    }

    const newSale = {
      typeOfCut,
      membership: memberId ? `ID: ${memberId}` : "Scan Member QR",
      paymentMethod,
    };
    setSales([...sales, newSale]);

    // Reset fields
    setTypeOfCut("");
    setIsInputActive(false);
    setIsScanActive(false);
    setMemberId("");
    setPaymentMethod("");
  };

  return (
    <div className="customer-staff-container">
      <NavbarStaff />
        <div className="customer-staff-content">
        <h1>Customer</h1>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
        {/* Manage Sale Card */}
        <div className="manage-sale-section">
            <h2>Manage Sale</h2>
          <div className="card-body">
            {/* Type of Cut */}
            <div className="sale-form">
              <label>Type of Cut: </label>
              <select
                value={typeOfCut}
                onChange={(e) => setTypeOfCut(e.target.value)}
              >
                <option value="">-Select-</option>
                <option value="Haircut">Haircut</option>
                <option value="Wash and Haircut">Wash and Haircut</option>
                <option value="Hot Towel Clean Shave">Hot Towel Clean Shave</option>
                <option value="Junior Haircut">Junior Haircut</option>
              </select>
              <span className="dropdown-icon-customer">▼</span>
            </div>

            {/* Membership */}
            <div className="sale-form">
              <label>Membership:</label>
              <div className="membership-options">
                <button
                  className={`membership-button ${isScanActive ? 'active' : ''}`}
                  onClick={handleScanQR}
                  disabled={isInputActive}
                >
                  Scan Member QR
                </button>

                <div className="member-id-input-wrapper">
                  {isInputActive ? (
                    <div className="input-group">
                      <input
                        type="text"
                        className="member-id-input-customer"
                        placeholder="Enter Member ID"
                        value={memberId}
                        onChange={(e) => setMemberId(e.target.value)}
                      />
                        <button
                        className="close-button-member"
                        onClick={handleCloseInput}
                      >
                       cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      className="membership-button"
                      onClick={handleShowInput}
                    >
                      Input Member ID
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="sale-form">
              <label>Type of Payment:</label>
              <div className="payment-options">
                {["Cash", "Debit/PayWave", "QR Payment"].map((method) => (
                  <button
                    key={method}
                    className={`payment-button ${
                      paymentMethod === method ? 'active' : ''
                    }`}
                    onClick={() => handlePaymentSelection(method)}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleDone} className="done-button">
              Done
            </button>
          </div>



        {/* Sales Record Card */}
            <h2>Sales Record</h2>
            {sales.length > 0 ? (
              <ul className="sales-list">
                {sales.map((sale, index) => (
                  <li key={index}>
                    <div className="sale-info">
                      <span>Type of Cut: {sale.typeOfCut}</span>
                      <span>Membership: {sale.membership}</span>
                      <span>Payment: {sale.paymentMethod}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-sales">No sales recorded yet.</p>
            )}
      </div>
      </div>
    </div>
  );
}

export default CustomerStaff;