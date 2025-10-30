import React from 'react';

function App() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
    }}>
      <div style={{ maxWidth: '1000px', width: '100%' }}>
        <h1 style={{
          fontSize: '3.5rem',
          color: 'white',
          marginBottom: '10px',
          textAlign: 'center',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
        }}>
          🐳 React Docker App
        </h1>
        <p style={{
          fontSize: '1.3rem',
          color: 'rgba(255, 255, 255, 0.9)',
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          Multi-Stage Build Demo
        </p>
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
          textAlign: 'center'
        }}>
          <h2 style={{
            color: '#667eea',
            marginBottom: '15px',
            fontSize: '2rem'
          }}>
            ✅ Successfully Dockerized!
          </h2>
          <p style={{
            color: '#555',
            fontSize: '1.1rem',
            lineHeight: '1.6'
          }}>
            This React application is running in a production-ready Docker container.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
