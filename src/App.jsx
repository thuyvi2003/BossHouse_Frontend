import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/DashboardScreen.jsx';
import Cart from './pages/CartScreen.jsx';
import Navbar from './components/Layout/Navbar.jsx';
import Footer from './components/Layout/Footer.jsx';
import BlogScreen from './pages/BlogScreen.jsx';
import PostDetail from './pages/PostDetail.jsx';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow">
        <Routes>
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/post" element={<BlogScreen />} />
          <Route path="/post/:id" element={<PostDetail />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
