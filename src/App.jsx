import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/DashboardScreen.jsx';
import Cart from './pages/CartScreen.jsx';
import HomePage from './pages/HomePage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import Navbar from './components/Layout/Navbar.jsx';
import Footer from './components/Layout/Footer.jsx';
import BlogScreen from './pages/BlogScreen.jsx';
import PostDetail from './pages/PostDetail.jsx';
import Services from './pages/Services.jsx';           
import UserBookingForm from './pages/UserBookingForm.jsx'; 

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/post" element={<BlogScreen />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/services" element={<Services />} />
          <Route path="/user-booking" element={<UserBookingForm />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
