/* eslint-disable react-hooks/exhaustive-deps */
import { Collapse, DropdownItem, DropdownMenu, DropdownToggle, Nav, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink, UncontrolledDropdown } from "reactstrap";
import { useAppSelector } from "../redux/store";
import { useState, useEffect } from 'react';
import logoImg from '../assets/images/logo.png';
import userImg from '../assets/images/user.png';
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from 'react-toastify';
import { useLogoutUserMutation } from "../redux/api/getMeAPI";

const Header = () => {
    const user = useAppSelector((state) => state.userState.user);
    const [logoutUser, { isLoading, isSuccess, error, isError, data }] = useLogoutUserMutation();
    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => setIsOpen(!isOpen);
    const navigate = useNavigate();
    const location = useLocation();

    const currentRoute = location.pathname;
    useEffect(() => {
        if (isSuccess) {
            window.location.href = '/login';
        }

        if (isError) {
            if (isError) {
                if (isSuccess && data?.message) {
                    toast.success(data.message);
                } else if (isError && error?.data) {
                    const errorMessage = typeof error.data === 'string' ? error.data : error.data?.message;
                    toast.error(errorMessage || 'An unknown error occurred', {
                        position: 'top-right',
                    });
                    console.error('Error:', errorMessage);
                }
            }
        }
    }, [isLoading]);
    const onLogoutHandler = () => {
        logoutUser();
    }
    return (
        <header>
            <div className="container">
                <Navbar expand="md">
                    <NavbarBrand
                        href='/home'>
                        <img
                            src={logoImg}
                            alt="Poll"
                            className="logo-image"
                        />
                    </NavbarBrand>
                    <NavbarToggler onClick={toggle} className="ms-auto" />
                    <Collapse isOpen={isOpen} navbar>
                        {!user && (
                            <Nav className="ms-auto" navbar>
                                <UncontrolledDropdown nav inNavbar>
                                    <DropdownToggle nav caret>
                                        <img src={userImg} alt="user" className="user-img" />
                                    </DropdownToggle>
                                    <DropdownMenu end>
                                        <DropdownItem onClick={() => navigate('/login')}>Login</DropdownItem>
                                        <DropdownItem onClick={() => navigate('/register')}>Register</DropdownItem>
                                    </DropdownMenu>
                                </UncontrolledDropdown>
                            </Nav>
                        )}
                        {user && (
                            <>
                                <Nav className="ms-auto" navbar>
                                    <NavItem className="nav-item-responsive">
                                        <NavLink className={currentRoute.includes('statistics') ? 'active' : ''} onClick={() => navigate('/statistics')}>
                                            Statistics
                                        </NavLink>
                                    </NavItem>
                                    <UncontrolledDropdown nav inNavbar>
                                        <DropdownToggle nav caret>
                                            <img src={userImg} alt="user" className="user-img" />
                                        </DropdownToggle>
                                        <DropdownMenu end>
                                            <DropdownItem onClick={onLogoutHandler}>LOG OUT</DropdownItem>
                                        </DropdownMenu>
                                    </UncontrolledDropdown>
                                </Nav>
                            </>
                        )}
                    </Collapse>
                </Navbar>
            </div>

        </header>
    )
}

export default Header;