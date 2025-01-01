import React, { useState, useEffect } from "react";
import NavbarStaff from "../components/navbarStaff";
import "./Product.css";
import AddModal from "./AddModal";

const handleLogout = () => {
  sessionStorage.removeItem("authToken");
  sessionStorage.removeItem("refreshToken");
  alert("You have been logged out.");
  window.location.href = "/staff";
};

function Product() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [itemsToShow, setItemsToShow] = useState(10); // Dropdown value
  const [editingProduct, setEditingProduct] = useState(null); // Currently editing product
  const [confirmationModal, setConfirmationModal] = useState(false); // Confirmation modal state
  const [addedProductName, setAddedProductName] = useState(""); // Name of the recently added product
  const [searchTerm, setSearchTerm] = useState(''); 
  const [showSearchInput, setShowSearchInput] = useState(false); // Toggle search input visibility
  // // Fetch products from the backend
  

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:5000/product");
      if (!response.ok) throw new Error("Failed to fetch product");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error.message);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle adding a new product
  const handleAddProduct = async (newProduct) => {
    try {
      const response = await fetch("http://localhost:5000/add-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });
  
      if (response.ok) {
        await response.json();
        setAddedProductName(newProduct.item_name); // Set the added product name
        setConfirmationModal(true); // Show confirmation modal
        
        // Refresh product list
        await fetchProducts(); // Use the fetchProducts function to update the product list
        setTimeout(() => setConfirmationModal(false), 1500); // Auto-close confirmation modal after 2 seconds
      } else {
        const errorData = await response.json();
        alert(`Failed to add product: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while adding the product.");
    }
  };


  // Handle dropdown selection change
  const handleDropdownChange = (e) => {
    setItemsToShow(Number(e.target.value));
  };

  const handleEdit = (id, field, value) => {
    const updatedProducts = products.map((product) =>
      product.id === id ? { ...product, [field]: value } : product
    );
    setProducts(updatedProducts);
  };

  // Print selected products
  const handlePrint = () => {
    const printContent = products.slice(0, itemsToShow);
    const printableContent = printContent
      .map(
        (product) =>
          `Item Name: ${product.item_name}, Category: ${product.category}, Supplier: ${product.supplier_name}, Purchase Rate: ${product.purchase_rate}, In Stock: ${product.in_stock}`
      )
      .join("\n");
    console.log("Printing:\n" + printableContent);
    alert("Print content logged to console for testing!");
  };

  // Filter products based on search term
  const filteredProducts = products.filter((product) =>
    product.item_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async (id) => {
    const productToSave = products.find((product) => product.id === id);
    const originalProduct = await fetch(`http://localhost:5000/get-product/${id}`)
    .then((res) => res.json())
    .catch((error) => {
      console.error("Error fetching original product:", error);
      alert("An error occurred while fetching the original product.");
      return null;
    });
  
    if (!originalProduct) return; // Exit if fetching the original product fails
    // Compare the updated product with the original product
  if (
    productToSave.purchase_rate === originalProduct.purchase_rate &&
    productToSave.in_stock === originalProduct.in_stock
  ) {
    setEditingProduct(null); // Exit edit mode
    return;
  }

  console.log("Saving product:", productToSave);

    try {
      const response = await fetch(`http://localhost:5000/update-product/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purchase_rate: productToSave.purchase_rate,
          in_stock: productToSave.in_stock,
        }),
      });
  
      if (response.ok) {
        alert("Product updated successfully!");
        setEditingProduct(null); // Exit edit mode
        await fetchProducts(); // Refresh the product list from the database
      } else {
        const errorData = await response.json();
        alert("Failed to update product.");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert("An error occurred while updating the product.");
    }
  };
  

  const [deleteConfirmation, setDeleteConfirmation] = useState({
    show: false,
    id: null,
    itemName: "",
  });
  
  const handleDeleteConfirmation = (id, itemName) => {
    setDeleteConfirmation({ show: true, id, itemName });
  };
  
  const handleDeleteCancel = () => {
    setDeleteConfirmation({ show: false, id: null, itemName: "" });
  };
  
const handleDelete = async () => {
  const { id } = deleteConfirmation;
  try {
    const response = await fetch(`http://localhost:5000/delete-product/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setDeleteConfirmation({ show: false, id: null, itemName: "" });
      await fetchProducts(); // Refresh the product list
    } else {
      alert("Failed to delete product.");
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    alert("An error occurred while deleting the product.");
  }
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
            <button className="add-new-button" onClick={() => setModalOpen(true)}>
              Add New +
            </button>
            {showSearchInput ? (
            <div className="product-list-controls-search">
            <label htmlFor="search"></label>
            <input
              type="text"
              className="search-input-product"
              placeholder="Search by item name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
                    className="close-search-button"
                    onClick={() => {
                      setSearchTerm("");
                      setShowSearchInput(false);
                    }}
                  >
                    ✖
              </button>
          </div>
        ) : (
                <button
                  className="search-button"
                  onClick={() => setShowSearchInput(true)}
                >
                🔍 Search
                </button>
              )}
            
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
              {filteredProducts.slice(0, itemsToShow).map((product) => (
                <div className="product-row" key={product.id}>
                  <div className="product-cell">{product.item_name}</div>
                  <div className="product-cell">{product.category}</div>
                  <div className="product-cell">{product.supplier_name}</div>
                  <div className="product-cell">
                    {editingProduct === product.id ? (
                      <input
                        className="input-product"
                        type="text"
                        step="0.01"
                        value={product.purchase_rate}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Allow only numbers and one decimal point
                            if (/^\d*\.?\d*$/.test(value)) {
                              handleEdit(product.id, "purchase_rate", value);
                            } else {
                              alert("Number only. Please enter a valid number.");
                            }
                          }}
                        />
                      ) : (
                        `RM ${parseFloat(product.purchase_rate).toFixed(2)}`
                      )}
                  </div>
                  <div className="product-cell">
                    {editingProduct === product.id ? (
                      <input
                        className="input-product"
                        type="text"
                        value={product.in_stock}
                        onChange={(e) =>
                          handleEdit(product.id, "in_stock", e.target.value)
                        }
                      />
                    ) : (
                      product.in_stock
                    )}
                  </div>

                  <div className="product-cell">
                    {editingProduct === product.id ? (
                      <>
                      <button
                     className="save-button"
                      onClick={() => handleSave(product.id)} // Ensure the product ID is passed correctly
                      >
                      Save
                      </button>
                      <button
                             className="delete-button"
                          onClick={() => handleDeleteConfirmation(product.id, product.item_name)}
                            >
                             Delete
                        </button>
                       </>
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

          {deleteConfirmation.show && (
  <div className="modal-overlay-delete">
    <div className="modal-delete">
      <h2>Delete Product</h2>
      <p>Do you want to delete "{deleteConfirmation.itemName}"?</p>
      <div className="modal-buttons"> 
        <button
          className="modal-delete-cancel"
          onClick={handleDeleteCancel}
        >
          Cancel
        </button>
        <button
          className="modal-delete-confirm"
          onClick={handleDelete}
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
)}


          {/* Print Button Section */}
          <div className="print-section">
            <button className="print-button" onClick={handlePrint}>
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      <AddModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onAddProduct={handleAddProduct}
      />
      {/* Confirmation Modal */}
      {confirmationModal && (
        <div className="modal-overlay-comfirmation">
          <div className="modal-comfirmation">
            <h2>Success!</h2>
            <p>
              Product <strong>{addedProductName}</strong> has been added successfully.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}

export default Product;
