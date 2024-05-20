import { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import './App.css';
import Home from './pages/Home';
import Layout from './components/Layout';
import RequiredUser from './components/RequiredUser';
import Login from './pages/Login';
import Register from './pages/Register';
import 'react-toastify/dist/ReactToastify.css';
import { getUserData } from './utils/Utils';
import Statistics from './pages/Statistics';

const App = () => {
  const getHomeRoute = () => {
    const user = getUserData();
    if (user) {
      return <Navigate to="/home" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }
  return (
    <Suspense fallback={null}>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={getHomeRoute()} />
          <Route element={<RequiredUser />}>
            <Route path="home" element={<Home />} />
            <Route path="statistics" element={<Statistics />} />
          </Route>
        </Route>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Routes>
    </Suspense>
  )
}

export default App;
