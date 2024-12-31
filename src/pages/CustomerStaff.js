import React, { useState } from "react";
import NavbarStaff from "../components/navbarStaff"; // Correct path
import "./CustomerStaff.css";

const handleLogout = () => {
  sessionStorage.removeItem("authToken");
  sessionStorage.removeItem("refreshToken");
  alert("You have been logged out.");
  window.location.href = "/staff";
};

function CustomerStaff() {
  const [typeOfCut, setTypeOfCut] = useState("");
  const [membershipMode, setMembershipMode] = useState(""); // Either 'Scan Member QR' or 'Input Member ID'
  const [memberId, setMemberId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [sales, setSales] = useState([]);

  const handleMembershipSelection = (mode) => {
    if (membershipMode === mode) {
      setMembershipMode(""); // Deselect if clicking the same button
      setMemberId(""); // Clear the input field when switching or deselecting
    } else {
      setMembershipMode(mode);
    }
  };

  const handlePaymentSelection = (method) => {
    setPaymentMethod(paymentMethod === method ? "" : method); // Toggle payment method
  };

  const handleDone = () => {
    if (
      !typeOfCut ||
      !membershipMode ||
      (membershipMode === "Input Member ID" && !memberId) ||
      !paymentMethod
    ) {
      alert("Please fill in all fields.");
      return;
    }

    const newSale = {
      typeOfCut,
      membership:
        membershipMode === "Input Member ID" ? `ID: ${memberId}` : membershipMode,
      paymentMethod,
    };
    setSales([...sales, newSale]);

    // Reset fields
    setTypeOfCut("");
    setMembershipMode("");
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
        <div className="manage-sale-section">
          <h2>Manage Sale</h2>
          <div className="sale-form">
            <label>
              Type of Cut:
              <select
                value={typeOfCut}
                onChange={(e) => setTypeOfCut(e.target.value)}
              >
                <option value="">-Select-</option>
                <option value="Basic Cut">Basic Cut</option>
                <option value="Premium Cut">Premium Cut</option>
                <option value="Hair Wash">Hair Wash</option>
              </select>
            </label>
            <label>
              Membership:
              <div className="membership-options">
                {membershipMode === "Input Member ID" ? (
                  <div className="member-id-input-wrapper">
                    <input
                      type="text"
                      className="member-id-input"
                      placeholder="Enter Member ID"
                      value={memberId}
                      onChange={(e) => setMemberId(e.target.value)}
                    />
                    <button
                      className="close-button-member"
                      onClick={() => handleMembershipSelection("")}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      className={`membership-button ${
                        membershipMode === "Scan Member QR" ? "active" : ""
                      }`}
                      onClick={() => handleMembershipSelection("Scan Member QR")}
                    >
                      Scan Member QR
                    </button>
                    <button
                      className={`membership-button ${
                        membershipMode === "Input Member ID" ? "active" : ""
                      }`}
                      onClick={() => handleMembershipSelection("Input Member ID")}
                    >
                      Input Member ID
                    </button>
                  </>
                )}
              </div>
            </label>
            <label>
              Type of Payment:
              <div className="payment-options">
                <button
                  className={`payment-button ${
                    paymentMethod === "Cash" ? "active" : ""
                  }`}
                  onClick={() => handlePaymentSelection("Cash")}
                >
                  Cash
                </button>
                <button
                  className={`payment-button ${
                    paymentMethod === "Debit/PayWave" ? "active" : ""
                  }`}
                  onClick={() => handlePaymentSelection("Debit/PayWave")}
                >
                  Debit/PayWave
                </button>
                <button
                  className={`payment-button ${
                    paymentMethod === "QR Payment" ? "active" : ""
                  }`}
                  onClick={() => handlePaymentSelection("QR Payment")}
                >
                  QR Payment
                </button>
              </div>
            </label>
            <button onClick={handleDone} className="done-button">
              Done
            </button>
          </div>
        </div>

        <div className="sales-record-section">
          <h2>Sales Record</h2>
          {sales.length > 0 ? (
            <ul className="sales-list">
              {sales.map((sale, index) => (
                <li key={index}>
                  <span>{`Type of Cut: ${sale.typeOfCut}, Membership: ${sale.membership}, Payment Method: ${sale.paymentMethod}`}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No sales recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomerStaff;
