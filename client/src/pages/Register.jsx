import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import AuthLayout from '../components/auth/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { validateRegister } from '../utils/authValidation';

export default function Register() {
  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const found = validateRegister(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    // Real registration is wired to the backend in Phase 4.
    toast.info('Registration is not connected to the server yet. That arrives in Phase 4.');
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start splitting expenses with your people."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-accent-strong underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Input
          label="Full name"
          name="name"
          autoComplete="name"
          placeholder="Alex Sharma"
          value={values.name}
          onChange={handleChange}
          error={errors.name}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
        />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
        />
        <Input
          label="Confirm password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />

        <Button type="submit" size="lg" className="w-full">
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}