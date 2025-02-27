import { useState } from 'react';
import axios from 'axios';

const BirthTimeForm = () => {
  const [formData, setFormData] = useState({
    birthDateTime: '',
    location: '',
    sex: 'Male',
    moonStarLord: '',
    lagnaType: ''
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/rectify', formData);
      setResult(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
      setResult(null);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Birth Time Rectification</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Birth Date and Time</label>
          <input
            type="datetime-local"
            name="birthDateTime"
            value={formData.birthDateTime}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="City name"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Sex</label>
          <select
            name="sex"
            value={formData.sex}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Moon Star Lord</label>
          <select
            name="moonStarLord"
            value={formData.moonStarLord}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select Moon Star Lord</option>
            <option value="Ashwini">Ashwini</option>
            <option value="Bharani">Bharani</option>
            <option value="Krittika">Krittika</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Lagna Type</label>
          <select
            name="lagnaType"
            value={formData.lagnaType}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select Lagna Type</option>
            <option value="Movable">Movable</option>
            <option value="Fixed">Fixed</option>
            <option value="Dual">Dual</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Calculate
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="text-lg font-medium text-green-800 mb-2">Results</h3>
          <div className="space-y-2 text-sm text-green-700">
            <p><strong>Rectified Time:</strong> {result.rectifiedTime}</p>
            <p><strong>Tatwa:</strong> {result.tatwa}</p>
            <p><strong>Antar Tatwa:</strong> {result.antarTatwa}</p>
            <p><strong>Cycle Type:</strong> {result.cycleType}</p>
            <p><strong>Adjustment:</strong> {result.adjustment}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BirthTimeForm;