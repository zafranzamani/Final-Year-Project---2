import React, { useState } from "react";
import NavbarStaff from "../components/navbarStaff"; // Correct path for NavbarStaff
import "./Product.css";
import AddModal from "./AddModal"; // Import modal component

const handleLogout = () => {
  sessionStorage.removeItem("authToken");
  sessionStorage.removeItem("refreshToken");
  alert("You have been logged out.");
  window.location.href = "/staff";
};

function Product() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [products, setProducts] = useState([
    {
      id: 1,
      itemname: "Shaver VX364",
      category: "Electronics",
      supplier: "ABC Supplies",
      purchaseRate: "RM 85.45",
      inStock: 8,
    },
    {
      id: 2,
      itemname: "Trimmer X212",
      category: "Electronics",
      supplier: "XYZ Traders",
      purchaseRate: "RM 50.99",
      inStock: 9,
    },
    // Add more products as needed
  ]);

  const handleAddProduct = async (newProduct) => {
    try {
      const response = await fetch("/api/add-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });

      if (response.ok) {
        alert("Product added successfully!");
        // Update product list here by fetching new data
      } else {
        alert("Failed to add product.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred.");
    }
  };

  const [itemsToShow, setItemsToShow] = useState(10); // Dropdown value
  const [editingProduct, setEditingProduct] = useState(null); // Currently editing product

  const handleEdit = (id, field, value) => {
    const updatedProducts = products.map((product) =>
      product.id === id ? { ...product, [field]: value } : product
    );
    setProducts(updatedProducts);
  };

  const handleDropdownChange = (e) => {
    setItemsToShow(Number(e.target.value));
  };

  const handlePrint = () => {
    const printContent = products.slice(0, itemsToShow);
    const printableContent = printContent
      .map(
        (product) =>
          `Item Name: ${product.itemname}, Category: ${product.category}, Supplier: ${product.supplier}, Purchase Rate: ${product.purchaseRate}, In Stock: ${product.inStock}`
      )
      .join("\n");
    console.log("Printing:\n" + printableContent);
    alert("Print content logged to console for testing!");
    // Optionally implement window.print() for actual printing
  };

  return (
    <div className="product-container">
      <NavbarStaff />
      <div className="product-content">
        <h1>Product</h1>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>

        <div className="product-list-section">
          {/* Header Section */}
          <div className="product-list-header">
            <h2>Product List</h2>
            <button className="add-new-button" onClick={() => setModalOpen(true)}
                >Add New +</button>
                <AddModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onAddProduct={handleAddProduct}
      />
          </div>

          {/* Controls Section */}
          <div className="product-list-controls">
            <label className="show-label">Show:</label>
            <select
              className="show-dropdown"
              value={itemsToShow}
              onChange={handleDropdownChange}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
          </div>

          {/* Product Table */}
          <div className="product-list">
            <div className="product-list-header-row">
              <span>Item Name</span>
              <span>Category</span>
              <span>Supplier Name</span>
              <span>Purchase Rate</span>
              <span>In Stock</span>
              <span>Action</span>
            </div>
            <div className="product-table">
              {products.slice(0, itemsToShow).map((product) => (
                <div className="product-row" key={product.id}>
                  <div className="product-cell">{product.itemname}</div>
                  <div className="product-cell">{product.category}</div>
                  <div className="product-cell">{product.supplier}</div>
                  <div className="product-cell">
                    {editingProduct === product.id ? (
                      <input
                        className="input-product"
                        type="text"
                        value={product.purchaseRate}
                        onChange={(e) =>
                          handleEdit(
                            product.id,
                            "purchaseRate",
                            `RM ${e.target.value.replace(/[^0-9.]/g, "")}`
                          )
                        }
                        onKeyPress={(e) => {
                          if (!/[0-9.]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                      />
                    ) : (
                      product.purchaseRate
                    )}
                  </div>
                  <div className="product-cell">
                    {editingProduct === product.id ? (
                      <input
                        className="input-product"
                        type="text"
                        value={product.inStock}
                        onChange={(e) =>
                          handleEdit(
                            product.id,
                            "inStock",
                            e.target.value.replace(/[^0-9]/g, "")
                          )
                        }
                        onKeyPress={(e) => {
                          if (!/[0-9]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                      />
                    ) : (
                      product.inStock
                    )}
                  </div>
                  <div className="product-cell">
                    {editingProduct === product.id ? (
                      <button
                        className="save-button"
                        onClick={() => setEditingProduct(null)}
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        className="edit-button"
                        onClick={() => setEditingProduct(product.id)}
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Print Button Section */}
          <div className="print-section">
            <button className="print-button" onClick={handlePrint}>
              Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Product;
