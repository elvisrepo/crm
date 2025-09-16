import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AccountsPage from './pages/AccountsPage';
import AccountPage from './pages/AccountPage';
import ContactPage from './pages/ContactPage';
import EditAccountPage from './pages/EditAccountPage'; // Import the new page
import ContactsPage from './pages/ContactsPage';
import EditContactPage from './pages/EditContactPage';
import OpportunitiesPage from './pages/OpportunitiesPage';
import EditOpportunityPage from './pages/EditOpportunityPage';
import OpportunityPage from './pages/OpportunityPage';
import LeadPage from './pages/LeadPage';
import LeadsPage from './pages/LeadsPage';
import EditLeadPage from './pages/EditLeadPage';
import ConvertLeadPage from './pages/ConvertLeadPage';
import ProductsPage from './pages/ProductsPage';
import EditProductPage from './pages/EditProductPage';
import ProductPage from './pages/ProductPage';
import OrdersPage from './pages/OrdersPage';
import OrderPage from './pages/OrderPage';
import EditOrderPage from './pages/EditOrderPage';
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
              <Route path="contacts/:id" element={<ContactPage />}/>
              <Route path="contacts/:id/edit" element={<EditContactPage />} />
              <Route path="opportunities" element={< OpportunitiesPage />}   />
              <Route path="opportunities/:id" element={<OpportunityPage />} />
              <Route path="opportunities/:id/edit" element={<EditOpportunityPage />} />
              <Route path="leads" element={<LeadsPage />}/>
              <Route path="leads/:id" element={<LeadPage/>}/>
              <Route path="leads/:id/edit" element={<EditLeadPage />} />
              <Route path="leads/:id/convert" element={<ConvertLeadPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="products/:id" element={<ProductPage />} />
              <Route path="products/:id/edit" element={<EditProductPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/:id" element={<OrderPage />} />
              <Route path="orders/:id/edit" element={<EditOrderPage />} />
            </Route>
          </Route>
        </Routes>
      </Router>
      </QueryClientProvider>
    </AuthProvider>
  );
};

export default App;


