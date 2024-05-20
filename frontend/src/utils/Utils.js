export const isUserLoggedIn = () => localStorage.getItem('userData');
export const getUserData = () => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
};
export const isObjEmpty = (obj) => Object.keys(obj).length === 0;

export const getToken = () => {
    return localStorage.getItem('accessToken');
};

export const removeToken = () => {
    localStorage.removeItem('accessToken');
};
export const setToken = (val) => {
    localStorage.setItem('accessToken', val);
};

export const removeUserData = () => {
    localStorage.removeItem('userData');
};
export const setUserData = (val) => {
    localStorage.setItem('userData', val);
};