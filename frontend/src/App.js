import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Footer from './components/Layout/Footer';

import Dashboard from './pages/Dashboard';
import Vendors from './pages/Vendors';
import Buyers from './pages/Buyers';
import Products from './pages/Products';
import Purchases from './pages/Purchases';
import Sales from './pages/Sales';
import Inventory from './pages/Inventory';

function App() {
  return (
    <Router>
      <div className="App">
        <div className="container-fluid">
          <div className="row">
            <Sidebar />
            <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
              <Header />
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/vendors" element={<Vendors />} />
                <Route path="/buyers" element={<Buyers />} />
                <Route path="/products" element={<Products />} />
                <Route path="/purchases" element={<Purchases />} />
                <Route path="/sales" element={<Sales />} />
                <Route path="/inventory" element={<Inventory />} />
              </Routes>
            </main>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;