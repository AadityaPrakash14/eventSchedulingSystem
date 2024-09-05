import React from 'react';
import { useLocation } from 'react-router-dom';
import NavBar from './NavBar';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const shouldShowNavBar = !(location.pathname === '/' || location.pathname === '/signup');

  return (
    <div className="bg-[#0B0C10] text-[#C5C6C7] min-h-screen">
      {shouldShowNavBar && <NavBar />}
      <div>{children}</div>
    </div>
  );
};

export default Layout;
