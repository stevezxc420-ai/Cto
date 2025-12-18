import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import InlineAlert from '../components/InlineAlert';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../lib/api';
import { setToken } from '../lib/token';
import type { LoginRequest, LoginResponse } from '../types/api';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const reason = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('reason');
  }, [location.search]);

  const [form, setForm] = useState<LoginRequest>({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.email || !form.password) {
      setError('Email and password are required.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post<LoginResponse, LoginRequest>('/auth/login', form);
      setToken(response);
      navigate('/dashboard', { replace: true });
    } catch {
      setError('Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout showSidebar={false}>
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sign in</h1>

        {reason === 'expired' ? (
          <div className="mt-4">
            <InlineAlert
              variant="info"
              title="Your session has expired"
              description="Please sign in again to continue."
            />
          </div>
        ) : null}

        {error ? (
          <div className="mt-4">
            <InlineAlert variant="error" title={error} />
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="card p-6 mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="input"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              autoComplete="email"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-gray-900 dark:text-white mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              className="input"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              autoComplete="current-password"
              disabled={isLoading}
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <button className="btn-primary" type="submit" disabled={isLoading}>
              {isLoading ? <LoadingSpinner label="Signing in…" /> : 'Sign in'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/', { replace: true })}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default Login;
