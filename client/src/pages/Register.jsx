import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import AuthLayout from '../components/auth/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { validateRegister } from '../utils/authValidation';
import { getErrorMessage, getFieldErrors } from '../utils/apiError';

export default function Register() {
  const { register } = useAuth();
  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');

    const found = validateRegister(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      await register(values);
      toast.success('Account created. Welcome to SplitMate!');
    } catch (error) {
      const fieldErrors = getFieldErrors(error);
      if (Object.keys(fieldErrors).length > 0) setErrors(fieldErrors);
      else setFormError(getErrorMessage(error));
      setSubmitting(false);
    }
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
        {formError && (
          <p role="alert" className="rounded-control border border-negative px-4 py-3 text-sm text-negative">
            {formError}
          </p>
        )}

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

        <Button type="submit" size="lg" className="w-full" loading={submitting}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}