import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import AuthLayout from '../components/auth/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { validateLogin } from '../utils/authValidation';

export default function Login() {
  const [values, setValues] = useState({ email: '', password: '' });
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const found = validateLogin(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    // Real sign-in is wired to the backend in Phase 4.
    toast.info('Sign-in is not connected to the server yet. That arrives in Phase 4.');
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

        <Button type="submit" size="lg" className="w-full">
          Log in
        </Button>
      </form>
    </AuthLayout>
  );
}