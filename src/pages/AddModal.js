import React, { useState,useEffect } from "react";
import "./AddModal.css";

function AddProductModal({ isOpen, onClose, onAddProduct }) {
  const [formData, setFormData] = useState({
    item_name: "",
    category: "",
    supplier_name: "",
    purchase_rate: "",
    in_stock: "",
  });

  // Reset form data when the modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        item_name: "",
        category: "", 
        supplier_name: "",
        purchase_rate: "",
        in_stock: "",
      });
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Enforce numeric input for `purchase_rate` and `in_stock`
    if (name === "purchase_rate" || name === "in_stock") {
      if (!/^\d*\.?\d*$/.test(value)) return; // Allow only numbers and decimal
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    await onAddProduct(formData); // Call parent function to add product
    onClose(); // Close the current modal
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay">
        <div className="modal">
          <h2>Add New Product</h2>
          <div className="modal-form">
            <label>
              Item Name:
              <input
                type="text"
                name="item_name"
                value={formData.item_name}
                onChange={handleInputChange}
              />
            </label>
            <label>
            Category:
          </label>
          <div className="dropdown-container-product">
            <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              >
                <option value="">Select Category</option>
                <option value="Electronics">Electronics</option>
                <option value="Grooming Accessories">Grooming Accessories</option>
                <option value="Cutting Tools">Cutting Tools</option>
                <option value="Hair Care">Hair Care</option>
                <option value="Sanitation Essentials">Sanitation Essentials</option>
              </select>
              <span className="dropdown-icon">▼</span>
              </div>
            <label>
              Supplier Name:
              <input
                type="text"
                name="supplier_name"
                value={formData.supplier_name}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Purchase Rate:
              <input
                type="text"
                name="purchase_rate"
                value={formData.purchase_rate}
                onChange={handleInputChange}
              />
            </label>
            <label>
              In Stock:
              <input
                type="text"
                name="in_stock"
                value={formData.in_stock}
                onChange={handleInputChange}
              />
            </label>
          </div>
          <div className="modal-buttons">
            <button className="modal-close-button" onClick={onClose}>
              Cancel
            </button>
            <button className="modal-done-button" onClick={handleSubmit}>
              Done
            </button>
          </div>
        </div>
      </div>

      
    
    </>
  );
}

export default AddProductModal;
