import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { BACKEND_URL } from '../util';

const SignupForm: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [role, setRole] = useState<string>('user'); // Default role is 'user'
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/signup`, { name, email, password, role });
      localStorage.setItem('token', response.data.token);
      setLoading(false);
      if (response.data.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/user-dashboard');
      }
    } catch (error: any) {
      setLoading(false);
      setError('Error signing up. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#C5C6C7] flex items-center justify-center">
      <div className="max-w-md w-full bg-[#1F2833] p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-[#66FCF1] mb-6 text-center">Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-lg mb-2">Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 bg-[#0B0C10] text-[#C5C6C7] border border-gray-600 rounded-lg focus:ring-[#66FCF1] focus:border-[#66FCF1]"
            />
          </div>

          <div className="mb-4">
            <label className="block text-lg mb-2">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-[#0B0C10] text-[#C5C6C7] border border-gray-600 rounded-lg focus:ring-[#66FCF1] focus:border-[#66FCF1]"
            />
          </div>

          <div className="mb-4">
            <label className="block text-lg mb-2">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-[#0B0C10] text-[#C5C6C7] border border-gray-600 rounded-lg focus:ring-[#66FCF1] focus:border-[#66FCF1]"
            />
          </div>

          <div className="mb-4">
            <label className="block text-lg mb-2">Confirm Password:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-[#0B0C10] text-[#C5C6C7] border border-gray-600 rounded-lg focus:ring-[#66FCF1] focus:border-[#66FCF1]"
            />
          </div>

          {/* Role selection */}
          <div className="mb-4">
            <label className="block text-lg mb-2">Role:</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 bg-[#0B0C10] text-[#C5C6C7] border border-gray-600 rounded-lg focus:ring-[#66FCF1] focus:border-[#66FCF1]"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <button
            type="submit"
            className={`w-full px-4 py-2 bg-[#66FCF1] text-[#0B0C10] font-medium rounded-lg hover:bg-[#45A29E] transition ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-4 text-center">
          Already have an account?{' '}
          <Link to="/" className="text-[#66FCF1] hover:underline">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupForm;
