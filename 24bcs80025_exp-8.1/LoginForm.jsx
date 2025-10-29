import { useState } from 'react';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submittedData, setSubmittedData] = useState(null);

  const handleSubmit = () => {
    // Validation
    if (!username || !password) {
      setError('Please enter both username and password.');
      console.log('Validation failed: Missing username or password');
      return;
    }
    
    // Clear error if validation passes
    setError('');
    
    // Log to console
    console.log('Login submitted:');
    console.log('Username:', username);
    console.log('Password:', password);
    
    // Display submitted data on screen
    setSubmittedData({ username, password });
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    console.log('Username updated:', e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    console.log('Password updated:', e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
        
        <div className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={handleUsernameChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors font-medium"
          >
            Login
          </button>
        </div>

        {/* Display submitted data */}
        {submittedData && (
          <div className="mt-6 p-4 bg-gray-900 text-white rounded">
            <p className="font-mono text-sm">Username: {submittedData.username}</p>
            <p className="font-mono text-sm">Password: {submittedData.password}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded text-sm text-gray-700">
          <p className="font-semibold mb-2">Instructions:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Type in the username and password fields</li>
            <li>Check the browser console to see real-time updates</li>
            <li>Click Login to submit (validates empty fields)</li>
            <li>Submitted data appears below the form</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
