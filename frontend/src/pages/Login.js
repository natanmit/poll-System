/* eslint-disable react-hooks/exhaustive-deps */
import { Form, FormGroup, Label, Button, Card, CardBody } from 'reactstrap';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import classnames from 'classnames';
import logo1Img from '../assets/images/side-img.png';
import { toast } from 'react-toastify';
import { useLoginUserMutation } from '../redux/api/authAPI';
import { useEffect } from 'react';

const Login = () => {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm();

    const [loginUser, { isLoading, isError, error, isSuccess, data }] = useLoginUserMutation();

    const navigate = useNavigate();

    const onSubmit = (data) => {
        loginUser(data);
    };

    useEffect(() => {
        if (isSuccess) {
            toast.success(data?.message);
            navigate('/home');
        }

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
    }, [isLoading]);

    return (
        <div className="auth-wrapper auth-v1 px-2 auth-background">
            <div className="auth-inner py-2">
                <div className="mb-4 d-flex justify-content-center">
                    <img className="logo-image" src={logo1Img} alt="Poll" />
                </div>
                <Card className="mb-0">
                    <CardBody>
                        <Form onSubmit={handleSubmit(onSubmit)}>
                            <FormGroup>
                                <Label>Email</Label>
                                <input
                                    className={`form-control ${classnames({ 'is-invalid': errors.email })}`}
                                    type="email"
                                    id="email"
                                    {...register('email', { required: true })}
                                />
                                {errors.email && <span className="text-danger">
                                    <small>Email is required.</small></span>}
                            </FormGroup>
                            <FormGroup>
                                <Label>Password</Label>
                                <input
                                    className={`form-control ${classnames({ 'is-invalid': errors.password })}`}
                                    type="password"
                                    id="password"
                                    {...register('password', { required: true })}
                                />
                                {errors.password && <span className="text-danger"><small>Password is required.</small></span>}
                            </FormGroup>
                            <div className="mt-4">
                                <Button color="primary" className="btn-block w-100" type="submit">
                                    LOGIN
                                </Button>
                            </div>
                            <div className="mt-4 d-flex justify-content-center">
                                <p>
                                    Not a member? {' '}
                                    <Link to="/register" className="primary-link">
                                        <span>Register</span>
                                    </Link>{' '}
                                </p>
                            </div>
                        </Form>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
};

export default Login;
