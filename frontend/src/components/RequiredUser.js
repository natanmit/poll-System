import { Navigate, Outlet, useLocation } from 'react-router-dom';
import FullScreenLoader from './FullScreenLoader';
import { getUserData } from '../utils/Utils';

const RequiredUser = () => {
    const accessToken = localStorage.getItem('accessToken');
    const location = useLocation();
    const user = getUserData();

    if (accessToken && !user) {
        return <FullScreenLoader />;
    }

    return accessToken && user ? (
        <Outlet />
    ) : (
        <Navigate to='/login' state={{ from: location }} replace />
    );
};

export default RequiredUser;
