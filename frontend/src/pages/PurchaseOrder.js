"use client";

import { useState, useEffect } from "react";

function PurchaseOrder({ vendors = [], items = [] }) {
    // Declare hooks only once at the top
    const [selectedVendorId, setSelectedVendorId] = useState("");
    const [selectedItemId, setSelectedItemId] = useState("");
    const [formData, setFormData] = useState({
        companyName: "VelpaariEnterprises",
        streetAddress: "kanakkampalayam",
        cityStateZip: "erode tamilnadu",
        phone: "9876543210",
        date: new Date().toLocaleDateString(),
        poNumber: "",
        vendorCompany: "",
        vendorContact: "",
        vendorAddress: "",
        vendorCityStateZip: "",
        vendorPhone: "",
        vendorEmail: "",
        vendorGstNo: "",
        vendorAccountNo: "",
        shipToName: "",
        shipToCompany: "",
        shipToAddress: "",
        shipToCityStateZip: "",
        shipToPhone: "",
        items: [],
        subtotal: 0,
        tax: 0,
        taxAmount: 0,
        shipping: 0,
        other: 0,
        total: 0,
        comments: "",
        contactName: "",
        contactPhone: "",
        contactEmail: "",
    });

    const [newItem, setNewItem] = useState({
        itemId: "",
        description: "",
        quantity: 1,
        unitPrice: 0,
        total: 0,
    });

    useEffect(() => {
        const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
        const taxPercent = Number(formData.tax) || 0;
        const taxAmount = subtotal * (taxPercent / 100);
        const total = subtotal + taxAmount + Number(formData.shipping) + Number(formData.other);
        setFormData((prev) => ({
            ...prev,
            subtotal,
            taxAmount,
            total,
        }));
    }, [formData.items, formData.tax, formData.shipping, formData.other]);

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleVendorSelect = (vendorId) => {
        setSelectedVendorId(vendorId);
        const vendor = vendors.find((v) => v._id === vendorId);
        if (vendor) {
            setFormData((prev) => ({
                ...prev,
                vendorCompany: vendor.name,
                vendorContact: vendor.contactPerson,
                vendorAddress: vendor.address,
                vendorPhone: vendor.phone,
                vendorEmail: vendor.email,
                vendorGstNo: vendor.gstNo,
                vendorAccountNo: vendor.accountNo,
            }));
        }
    };

    const handleItemSelect = (itemId) => {
        setSelectedItemId(itemId);
        const item = items.find((i) => i._id === itemId);
        if (item) {
            setNewItem((prev) => ({
                ...prev,
                itemId: item._id,
                description: item.name,
                unitPrice: item.cost || item.price || 0,
            }));
        }
    };

    const calculateItemTotal = () => {
        const total = newItem.quantity * newItem.unitPrice;
        setNewItem((prev) => ({ ...prev, total }));
    };

    const addItem = () => {
        if (newItem.itemId && newItem.description) {
            const itemWithTotal = { ...newItem, total: newItem.quantity * newItem.unitPrice };
            setFormData((prev) => ({
                ...prev,
                items: [...prev.items, itemWithTotal],
            }));
            setNewItem({
                itemId: "",
                description: "",
                quantity: 1,
                unitPrice: 0,
                total: 0,
            });
            setSelectedItemId("");
        }
    };

    const removeItem = (index) => {
        setFormData((prev) => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index),
        }));
    };

    const downloadPurchaseOrder = () => {
        const printWindow = window.open("", "_blank");
        if (printWindow) {
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Purchase Order - ${formData.poNumber}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                        .logo { width: 60px; height: 60px; border-radius: 50%; }
                        .title { color: red; font-size: 24px; font-weight: bold; text-align: center; }
                        .info-section { display: flex; justify-content: space-between; margin: 20px 0; }
                        .info-box { border: 2px solid red; padding: 10px; width: 45%; }
                        .info-header { background: red; color: white; padding: 5px; margin: -10px -10px 10px -10px; font-weight: bold; }
                        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        .table th, .table td { border: 1px solid red; padding: 8px; text-align: left; }
                        .table th { background: red; color: white; }
                        .totals { text-align: right; margin: 20px 0; }
                        .total-row { font-weight: bold; background: #ffeb3b; }
                        .comments { border: 2px solid red; padding: 10px; margin: 20px 0; }
                        .comments-header { background: red; color: white; padding: 5px; margin: -10px -10px 10px -10px; }
                        .footer { text-align: center; margin-top: 30px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div>
                            <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-26%20at%2016.24.35_73b41c5c.jpg-tq6856nTO6zEuyIbXvyCOvIGhUuO11.jpeg" alt="Logo" class="logo">
                            <div><strong>${formData.companyName}</strong></div>
                            <div>${formData.streetAddress}</div>
                            <div>${formData.cityStateZip}</div>
                            <div>Phone: ${formData.phone}</div>
                        </div>
                        <div>
                            <div class="title">PURCHASE ORDER</div>
                            <div style="text-align: right; margin-top: 10px;">
                                <div>DATE: ${formData.date}</div>
                                <div>PO #: ${formData.poNumber}</div>
                            </div>
                        </div>
                    </div>

                    <div class="info-section">
                        <div class="info-box">
                            <div class="info-header">VENDOR</div>
                            <div>${formData.vendorCompany}</div>
                            <div>Contact: ${formData.vendorContact}</div>
                            <div>${formData.vendorAddress}</div>
                            <div>Phone: ${formData.vendorPhone}</div>
                            <div>Email: ${formData.vendorEmail}</div>
                            <div>GST: ${formData.vendorGstNo}</div>
                            <div>Account: ${formData.vendorAccountNo}</div>
                        </div>
                        <div class="info-box">
                            <div class="info-header">SHIP TO</div>
                            <div>${formData.shipToName}</div>
                            <div>${formData.shipToCompany}</div>
                            <div>${formData.shipToAddress}</div>
                            <div>${formData.shipToCityStateZip}</div>
                            <div>Phone: ${formData.shipToPhone}</div>
                        </div>
                    </div>

                    <table class="table">
                        <tr>
                            <th>ITEM #</th>
                            <th>DESCRIPTION</th>
                            <th>QTY</th>
                            <th>UNIT PRICE</th>
                            <th>TOTAL</th>
                        </tr>
                        ${formData.items
                            .map(
                                (item) => `
                            <tr>
                                <td>${item.itemId}</td>
                                <td>${item.description}</td>
                                <td>${item.quantity}</td>
                                <td>${item.unitPrice.toFixed(2)}</td>
                                <td>${item.total.toFixed(2)}</td>
                            </tr>
                        `
                            )
                            .join("")}
                    </table>

                    <div class="comments">
                        <div class="comments-header">Comments or Special Instructions</div>
                        <div>${formData.comments}</div>
                    </div>

                    <div class="totals">
                        <div>SUBTOTAL: ${formData.subtotal.toFixed(2)}</div>
                        <div>TAX (${formData.tax}%): ₹ ${(formData.taxAmount ? formData.taxAmount.toFixed(2) : "0.00")}</div>
                        <div>SHIPPING: ${formData.shipping.toFixed(2)}</div>
                        <div>OTHER: ${formData.other.toFixed(2)}</div>
                        <div class="total-row">TOTAL: ₹ ${formData.total.toFixed(2)}</div>
                    </div>

                    <div class="footer">
                        <p>If you have any questions about this purchase order, please contact</p>
                        <p>${formData.contactName}, ${formData.contactPhone}, ${formData.contactEmail}</p>
                    </div>
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    return (
        <>
            <style jsx>{`
                /* Purchase Order Styles */
                .purchase-order {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    color: #333;
                    background-color: #f9f9f9;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }

                .purchase-order h2 {
                    text-align: center;
                    color: #2c3e50;
                    margin-bottom: 30px;
                    padding-bottom: 15px;
                    border-bottom: 2px solid #e74c3c;
                    font-size: 28px;
                }

                .purchase-order h3 {
                    color: #2c3e50;
                    margin: 25px 0 15px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid #ddd;
                    font-size: 20px;
                }

                /* Form Sections */
                .form-section {
                    background: white;
                    padding: 20px;
                    border-radius: 6px;
                    margin-bottom: 20px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }

                .form-row {
                    display: flex;
                    gap: 15px;
                    margin-bottom: 15px;
                    flex-wrap: wrap;
                }

                .form-row input,
                .form-row select {
                    flex: 1;
                    min-width: 200px;
                }

                /* Input Fields */
                input, select, textarea {
                    padding: 10px 12px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 14px;
                    transition: border-color 0.3s;
                }

                input:focus, select:focus, textarea:focus {
                    outline: none;
                    border-color: #3498db;
                    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
                }

                /* Item Form */
                .item-form {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 15px;
                    align-items: end;
                    margin-bottom: 20px;
                }

                .add-item-btn {
                    background: #27ae60;
                    color: white;
                    border: none;
                    padding: 10px 15px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: background 0.3s;
                }

                .add-item-btn:hover {
                    background: #219653;
                }

                /* Items Table */
                .items-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                    background: white;
                    border-radius: 6px;
                    overflow: hidden;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }

                .items-table th {
                    background: #2c3e50;
                    color: white;
                    padding: 12px 15px;
                    text-align: left;
                }

                .items-table td {
                    padding: 12px 15px;
                    border-bottom: 1px solid #ddd;
                }

                .items-table tr:last-child td {
                    border-bottom: none;
                }

                .items-table tr:hover {
                    background-color: #f5f5f5;
                }

                .remove-btn {
                    background: #e74c3c;
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                }

                .remove-btn:hover {
                    background: #c0392b;
                }

                /* Totals Section */
                .totals-form {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 6px;
                    border: 1px solid #e9ecef;
                }

                .total-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                    padding: 8px 0;
                    border-bottom: 1px dashed #ddd;
                }

                .total-row:last-child {
                    border-bottom: none;
                }

                .total-row label {
                    font-weight: bold;
                }

                .total-final {
                    font-size: 18px;
                    color: #2c3e50;
                    font-weight: bold;
                    margin-top: 10px;
                    padding-top: 10px;
                    border-top: 2px solid #2c3e50;
                }

                /* Download Button */
                .download-section {
                    text-align: center;
                    margin: 30px 0;
                }

                .download-btn {
                    background: #3498db;
                    color: white;
                    border: none;
                    padding: 12px 25px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: bold;
                    transition: all 0.3s ease;
                }

                .download-btn:hover {
                    background: #2980b9;
                }

                /* Debug Info */
                .debug-info {
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    border-radius: 4px;
                    padding: 10px;
                    margin-bottom: 20px;
                    font-size: 14px;
                }

                /* Responsive Design */
                @media (max-width: 768px) {
                    .form-row {
                        flex-direction: column;
                        gap: 10px;
                    }
                    
                    .form-row input,
                    .form-row select {
                        width: 100%;
                        min-width: auto;
                    }
                    
                    .item-form {
                        grid-template-columns: 1fr;
                    }
                    
                    .items-table {
                        font-size: 14px;
                    }
                    
                    .items-table th,
                    .items-table td {
                        padding: 8px 10px;
                    }
                }

                /* Print Styles */
                @media print {
                    .purchase-order {
                        box-shadow: none;
                        padding: 0;
                    }
                    
                    .download-section {
                        display: none;
                    }
                    
                    .remove-btn {
                        display: none;
                    }
                    
                    .debug-info {
                        display: none;
                    }
                }
            `}</style>

            <div className="purchase-order">
                <h2>Purchase Order Generator</h2>
                
                <div className="form-section">
                    <h3>Company Information</h3>
                    <div className="form-row">
                        <input
                            type="text"
                            placeholder="Company Name"
                            value={formData.companyName}
                            onChange={(e) => handleInputChange("companyName", e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Street Address"
                            value={formData.streetAddress}
                            onChange={(e) => handleInputChange("streetAddress", e.target.value)}
                        />
                    </div>
                    <div className="form-row">
                        <input
                            type="text"
                            placeholder="City, State ZIP"
                            value={formData.cityStateZip}
                            onChange={(e) => handleInputChange("cityStateZip", e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Phone"
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h3>Order Information</h3>
                    <div className="form-row">
                        <input type="date" value={formData.date} onChange={(e) => handleInputChange("date", e.target.value)} />
                        <input
                            type="text"
                            placeholder="PO Number (Manual Entry)"
                            value={formData.poNumber}
                            onChange={(e) => handleInputChange("poNumber", e.target.value)}
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h3>Vendor Information</h3>
                    <div className="form-row">
                        <select
                            value={selectedVendorId}
                            onChange={(e) => handleVendorSelect(e.target.value)}
                        >
                            <option value="">Select Vendor</option>
                            {vendors && vendors.map((vendor) => (
                                <option key={vendor._id} value={vendor._id}>
                                    {vendor.name}
                                </option>
                            ))}
                        </select>
                        <input
                            type="text"
                            placeholder="Contact Person"
                            value={formData.vendorContact}
                            onChange={(e) => handleInputChange("vendorContact", e.target.value)}
                        />
                    </div>
                    <div className="form-row">
                        <input
                            type="text"
                            placeholder="Vendor Address"
                            value={formData.vendorAddress}
                            onChange={(e) => handleInputChange("vendorAddress", e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Phone"
                            value={formData.vendorPhone}
                            onChange={(e) => handleInputChange("vendorPhone", e.target.value)}
                        />
                    </div>
                    <div className="form-row">
                        <input
                            type="email"
                            placeholder="Email"
                            value={formData.vendorEmail}
                            onChange={(e) => handleInputChange("vendorEmail", e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="GST No"
                            value={formData.vendorGstNo}
                            onChange={(e) => handleInputChange("vendorGstNo", e.target.value)}
                        />
                    </div>
                    <input
                        type="text"
                        placeholder="Account No"
                        value={formData.vendorAccountNo}
                        onChange={(e) => handleInputChange("vendorAccountNo", e.target.value)}
                    />
                </div>

                <div className="form-section">
                    <h3>Ship To Information</h3>
                    <div className="form-row">
                        <input
                            type="text"
                            placeholder="Name"
                            value={formData.shipToName}
                            onChange={(e) => handleInputChange("shipToName", e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Company Name"
                            value={formData.shipToCompany}
                            onChange={(e) => handleInputChange("shipToCompany", e.target.value)}
                        />
                    </div>
                    <div className="form-row">
                        <input
                            type="text"
                            placeholder="Street Address"
                            value={formData.shipToAddress}
                            onChange={(e) => handleInputChange("shipToAddress", e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="City, State ZIP"
                            value={formData.shipToCityStateZip}
                            onChange={(e) => handleInputChange("shipToCityStateZip", e.target.value)}
                        />
                    </div>
                    <input
                        type="text"
                        placeholder="Phone"
                        value={formData.shipToPhone}
                        onChange={(e) => handleInputChange("shipToPhone", e.target.value)}
                    />
                </div>

                <div className="form-section">
                    <h3>Add Items</h3>
                    <div className="item-form">
                        <select
                            value={selectedItemId}
                            onChange={(e) => handleItemSelect(e.target.value)}
                        >
                            <option value="">Select Product</option>
                            {items && items.map((item) => (
                                <option key={item._id} value={item._id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                        <input
                            type="text"
                            placeholder="Description"
                            value={newItem.description}
                            onChange={(e) => setNewItem((prev) => ({ ...prev, description: e.target.value }))}
                        />
                        <input
                            type="number"
                            placeholder="Quantity"
                            value={newItem.quantity}
                            onChange={(e) => {
                                setNewItem((prev) => ({ ...prev, quantity: Number.parseInt(e.target.value) || 1 }));
                                calculateItemTotal();
                            }}
                        />
                        <input
                            type="number"
                            step="0.01"
                            placeholder="Unit Price"
                            value={newItem.unitPrice}
                            onChange={(e) => {
                                setNewItem((prev) => ({ ...prev, unitPrice: Number.parseFloat(e.target.value) || 0 }));
                                calculateItemTotal();
                            }}
                        />
                        <span>Total: {(newItem.quantity * newItem.unitPrice).toFixed(2)}</span>
                        <button onClick={addItem} className="add-item-btn">
                            Add Item
                        </button>
                    </div>
                </div>

                <div className="items-list">
                    <h3>Items in Purchase Order</h3>
                    {formData.items.length === 0 ? (
                        <p>No items added yet.</p>
                    ) : (
                        <table className="items-table">
                            <thead>
                                <tr>
                                    <th>Item #</th>
                                    <th>Description</th>
                                    <th>Quantity</th>
                                    <th>Unit Price</th>
                                    <th>Total</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {formData.items.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.itemId}</td>
                                        <td>{item.description}</td>
                                        <td>{item.quantity}</td>
                                        <td>{item.unitPrice.toFixed(2)}</td>
                                        <td>{item.total.toFixed(2)}</td>
                                        <td>
                                            <button onClick={() => removeItem(index)} className="remove-btn">
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="form-section">
                    <h3>Totals</h3>
                    <div className="totals-form">
                        <div className="total-row">
                            <label>Subtotal:</label>
                            <span>{formData.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="total-row">
                            <label>Tax:</label>
                                <input
                                    type="text"
                                    value={formData.tax}
                                    onChange={(e) => {
                                        const value = Number(e.target.value);
                                        handleInputChange("tax", isNaN(value)  ?0 : value);
                                    }}
                                    placeholder="Tax (%)"
                                />
                            <span style={{ marginLeft: "1em", color: "#007bff" }}>
                                Tax Amount: ₹ {formData.taxAmount !== undefined ? formData.taxAmount.toFixed(2) : "0.00"}
                            </span>
                        </div>
                        <div className="total-row">
                            <label>Shipping:</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.shipping}
                                    onChange={(e) => {
                                        handleInputChange("shipping", Number.parseFloat(e.target.value) || 0);
                                    }}
                                />
                        </div>
                        <div className="total-row">
                            <label>Other:</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.other}
                                    onChange={(e) => {
                                        handleInputChange("other", Number.parseFloat(e.target.value) || 0);
                                    }}
                                />
                        </div>
                        <div className="total-row total-final">
                            <label>Total:</label>
                            <span>₹ {formData.total.toFixed(2)}</span>
                        </div>
                        </div>
                </div>

                <div className="form-section">
                    <h3>Comments</h3>
                    <textarea
                        placeholder="Comments or Special Instructions"
                        value={formData.comments}
                        onChange={(e) => handleInputChange("comments", e.target.value)}
                        rows={4}
                    />
                </div>

                <div className="form-section">
                    <h3>Contact Information</h3>
                    <div className="form-row">
                        <input
                            type="text"
                            placeholder="Contact Name"
                            value={formData.contactName}
                            onChange={(e) => handleInputChange("contactName", e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Contact Phone"
                            value={formData.contactPhone}
                            onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                        />
                    </div>
                    <input
                        type="email"
                        placeholder="Contact Email"
                        value={formData.contactEmail}
                        onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                    />
                </div>

                <div className="download-section">
                    <button onClick={downloadPurchaseOrder} className="download-btn">
                        Download Purchase Order
                    </button>
                </div>
            </div>
        </>
    );
}

export default PurchaseOrder;