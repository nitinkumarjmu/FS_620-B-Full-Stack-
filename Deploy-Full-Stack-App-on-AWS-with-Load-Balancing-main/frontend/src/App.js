import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [data, setData] = useState([]);
  const [serverInfo, setServerInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newItem, setNewItem] = useState({ name: '', description: '' });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/data`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result.data);
      setServerInfo(result.server);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data. Please check your API connection.');
    }
    setLoading(false);
  };

  const addItem = async (e) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;

    try {
      const response = await fetch(`${API_URL}/api/data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setNewItem({ name: '', description: '' });
      fetchData();
    } catch (error) {
      console.error('Error adding item:', error);
      setError('Failed to add item. Please try again.');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 AWS Full Stack App</h1>
        <p className="subtitle">React + Node.js + AWS Load Balancer</p>

        {serverInfo && (
          <div className="server-info">
            <span className="server-badge">Server: {serverInfo}</span>
          </div>
        )}

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        <div className="actions">
          <button 
            onClick={fetchData} 
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? '⏳ Loading...' : '🔄 Refresh Data'}
          </button>
        </div>

        <div className="form-container">
          <h2>Add New Item</h2>
          <form onSubmit={addItem}>
            <input
              type="text"
              placeholder="Item name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="input"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              className="input"
            />
            <button type="submit" className="btn btn-success">
              ➕ Add Item
            </button>
          </form>
        </div>

        <div className="data-container">
          <h2>📦 Data Items</h2>
          {data.length === 0 ? (
            <p className="no-data">No data available. Click refresh or add an item!</p>
          ) : (
            <div className="data-grid">
              {data.map((item) => (
                <div key={item.id} className="data-card">
                  <h3>{item.name}</h3>
                  {item.description && <p>{item.description}</p>}
                  <span className="item-id">ID: {item.id}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <footer className="footer">
          <p>Deployed on AWS with Application Load Balancer</p>
          <p className="api-url">API: {API_URL}</p>
        </footer>
      </header>
    </div>
  );
}

export default App;
