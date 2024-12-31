import React, { useState } from "react";

function AddProductModal({ isOpen, onClose, onAddProduct }) {
  const [formData, setFormData] = useState({
    item_name: "",
    category: "",
    supplier_name: "",
    purchase_rate: "",
    in_stock: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    onAddProduct(formData);
    onClose(); // Close the modal after submission
  };

  if (!isOpen) return null;

  return (
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
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
            />
          </label>
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
              type="number"
              name="purchase_rate"
              value={formData.purchase_rate}
              onChange={handleInputChange}
            />
          </label>
          <label>
            In Stock:
            <input
              type="number"
              name="in_stock"
              value={formData.in_stock}
              onChange={handleInputChange}
            />
          </label>
        </div>
        <button className="modal-done-button" onClick={handleSubmit}>
          Done
        </button>
        <button className="modal-close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default AddProductModal;
