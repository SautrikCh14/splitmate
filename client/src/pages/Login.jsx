import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { validateLogin } from '../utils/authValidation';
import { getErrorMessage, getFieldErrors } from '../utils/apiError';

export default function Login() {
  const { login } = useAuth();
  const [values, setValues] = useState({ email: '', password: '' });
  const [remember, setRemember] = useState(false);
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

    const found = validateLogin(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      // On success the AuthProvider stores the user and the route guard moves us onward.
      await login({ email: values.email, password: values.password, remember });
    } catch (error) {
      const fieldErrors = getFieldErrors(error);
      if (Object.keys(fieldErrors).length > 0) setErrors(fieldErrors);
      else setFormError(getErrorMessage(error));
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to see your groups and balances."
      footer={
        <>
          New to SplitMate?{' '}
          <Link to="/register" className="font-medium text-accent-strong underline">
            Create an account
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
          autoComplete="current-password"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="h-4 w-4 accent-accent"
            />
            Remember me
          </label>
          <Link to="/forgot-password" className="font-medium text-accent-strong underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" size="lg" className="w-full" loading={submitting}>
          Log in
        </Button>
      </form>
    </AuthLayout>
  );
}