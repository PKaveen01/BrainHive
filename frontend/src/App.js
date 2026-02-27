import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Test backend connection
    fetch('http://localhost:8080/api/test/hello')
      .then(response => response.text())
      .then(data => setMessage(data))
      .catch(error => console.log('Backend not running:', error));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>BrainHive Platform</h1>
        {message && <p>Backend says: {message}</p>}
        <p>
          Frontend is working! Start building your modules.
        </p>
      </header>
    </div>
  );
}

export default App;