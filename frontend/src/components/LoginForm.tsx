import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { BACKEND_URL } from '../util';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/login`, { email, password });
      localStorage.setItem('token', response.data.token);
      setLoading(false);
      if (response.data.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/user-dashboard');
      }
    } catch (error: any) {
      setLoading(false);
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#C5C6C7] flex items-center justify-center">
      <div className="max-w-md w-full bg-[#1F2833] p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-[#66FCF1] mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit}>
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

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <button
            type="submit"
            className={`w-full px-4 py-2 bg-[#66FCF1] text-[#0B0C10] font-medium rounded-lg hover:bg-[#45A29E] transition ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-center">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#66FCF1] hover:underline">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
