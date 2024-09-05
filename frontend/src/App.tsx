import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';  // Import the Layout component

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />

          {/* Protected routes */}
          <Route
            path="/admin-dashboard"
            element={<PrivateRoute component={AdminDashboard} requiredRole="admin" />}
          />
          <Route
            path="/user-dashboard"
            element={<PrivateRoute component={UserDashboard} />}
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
