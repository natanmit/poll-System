/* eslint-disable react-hooks/exhaustive-deps */
import { Form, Label, Button, Card, CardBody } from 'reactstrap';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import classnames from 'classnames';
import { toast } from 'react-toastify';
import logo1Img from '../assets/images/side-img.png';
import { useRegisterUserMutation } from '../redux/api/authAPI';

const Register = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    // 👇 Calling the Register Mutation
    const [registerUser, { isLoading, isSuccess, error, isError, data }] = useRegisterUserMutation();

    const navigate = useNavigate();

    const onSubmit = (data) => {
        registerUser(data);
    };

    useEffect(() => {
        if (isSuccess) {
            toast.success(data?.message);
            navigate('/login');
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
                        <div className="row">
                            <div className="col-12">
                                <p className="body-2 md-vertical-spacing">
                                    Already have an account?{' '}
                                    <a href="/login" className="primary-link">
                                        Log in
                                    </a>
                                </p>
                            </div>
                        </div>
                        <Form onSubmit={handleSubmit(onSubmit)}>
                            <div className='mb-2'>
                                <Label>First Name</Label>
                                <input
                                    className={`form-control ${classnames({ 'is-invalid': errors.firstname })}`}
                                    type="text"
                                    id="firstname"
                                    {...register('firstname', { required: true })}
                                />
                                {errors.firstname && <span className="text-danger"><small>First Name is required.</small></span>}
                            </div>
                            <div className='mb-2'>
                                <Label>Last Name</Label>
                                <input
                                    className={`form-control ${classnames({ 'is-invalid': errors.lastname })}`}
                                    type="text"
                                    id="lastname"
                                    {...register('lastname', { required: true })}
                                />
                                {errors.lastname && <span className="text-danger"><small>Last Name is required.</small></span>}
                            </div>
                            <div className='mb-2'>
                                <Label>Email</Label>
                                <input
                                    className={`form-control ${classnames({ 'is-invalid': errors.email })}`}
                                    type="email"
                                    id="email"
                                    {...register('email', { required: true })}
                                />
                                {errors.email && <span className="text-danger"><small>Email is required.</small></span>}
                            </div>
                            <div className='mb-2'>
                                <Label>BirthDay</Label>
                                <input
                                    className={`form-control ${classnames({ 'is-invalid': errors.birthday })}`}
                                    type="date"
                                    id="birthday"
                                    {...register('birthday', { required: true })}
                                />
                                {errors.birthday && <span className="text-danger"><small>BirthDay is required.</small></span>}
                            </div>
                            <div className='mb-2'>
                                <Label>Address</Label>
                                <input
                                    className={`form-control ${classnames({ 'is-invalid': errors.address })}`}
                                    type="text"
                                    id="address"
                                    {...register('address', { required: true })}
                                />
                                {errors.address && <span className="text-danger"><small>Address is required.</small></span>}
                            </div>
                            <div className='mb-2'>
                                <Label>Password</Label>
                                <input
                                    className={`form-control ${classnames({ 'is-invalid': errors.password })}`}
                                    type="password"
                                    id="password"
                                    {...register('password', { required: true })}
                                />
                                {errors.password && <span className="text-danger"><small>Password is required.</small></span>}
                            </div>
                            <div className="mt-4">
                                <Button color="primary" className="btn-block w-100" type="submit">
                                    Register
                                </Button>
                            </div>
                        </Form>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
};

export default Register;
