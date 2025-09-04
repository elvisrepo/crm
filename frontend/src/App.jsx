import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AccountsPage from './pages/AccountsPage';
import AccountPage from './pages/AccountPage';
import EditAccountPage from './pages/EditAccountPage'; // Import the new page
import ContactsPage from './pages/ContactsPage';
import Layout from './components/Layout';
import { AuthProvider } from './auth/AuthProvider';
import RequireAuth from './auth/RequireAuth';

const queryClient = new QueryClient();


const App = () => {
  return (
    <AuthProvider>
      {/*  Provide the client to your App  */}
      <QueryClientProvider   client={queryClient}>
        <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<RequireAuth />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<DashboardPage />} />
              <Route path="accounts" element={<AccountsPage />} />
              <Route path="accounts/:id" element={<AccountPage />} />
              <Route path="accounts/:id/edit" element={<EditAccountPage />} /> 
              <Route path="contacts" element={<ContactsPage />} />
            </Route>
          </Route>
        </Routes>
      </Router>
      </QueryClientProvider>
    </AuthProvider>
  );
};

export default App;
