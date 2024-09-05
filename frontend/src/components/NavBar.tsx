import React from 'react';
import { useNavigate } from 'react-router-dom';

const NavBar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav className="bg-[#0B0C10] p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-[#66FCF1] text-2xl font-bold">My App</div>
        <button
          onClick={handleLogout}
          className="bg-[#66FCF1] text-[#0B0C10] px-4 py-2 rounded-lg hover:bg-[#45A29E] transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
