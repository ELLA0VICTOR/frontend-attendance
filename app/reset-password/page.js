"use client"

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation'; // Import useRouter
import api from '@/utils/api'; 

// We wrap the main component in Suspense
// because useSearchParams must be used inside it.
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter(); // Get router instance for redirect
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Get token and email from URL when component mounts
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    const emailFromUrl = searchParams.get('email');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
    if (!tokenFromUrl || !emailFromUrl) {
      setError('Invalid or missing password reset link.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 1. Validation
    if (!password || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!token || !email) {
      setError('Invalid or expired link. Please request a new one.');
      return;
    }

    // 2. API Call
    setLoading(true);
    try {
      const body = {
        token: token,
        email: email,
        newPassword: password
      };

      // Hit the backend route we fixed/added
      // POST /api/auth/reset-password
      const res = await api.post('/auth/reset-password', body);

      // Set success message
      setSuccess(res.data.message || 'Password reset successfully! Redirecting to login...');
      setPassword('');
      setConfirmPassword('');

      // Redirect to AdminLogin after 3 seconds
      setTimeout(() => {
        router.push('/AdminLogin');
      }, 3000); 

    } catch (err) {
      const message = err.response?.data?.message || 'An error occurred. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formBox}>
        <h1 style={styles.title}>Reset Your Password</h1>
        
        {!success && (
          <form onSubmit={handleSubmit}>
            <p style={styles.instructions}>
              Enter a new password for your account.
            </p>
            
            <div style={styles.inputGroup}>
              <label htmlFor="password" style={styles.label}>New Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                placeholder="Min. 6 characters"
                disabled={loading}
              />
            </div>

            <div style={styles.inputGroup}>
              <label htmlFor="confirmPassword" style={styles.label}>Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={styles.input}
                placeholder="Re-type your password"
                disabled={loading}
              />
            </div>

            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        {error && <div style={styles.messageError}>{error}</div>}
        {success && <div style={styles.messageSuccess}>{success}</div>}
      </div>
    </div>
  );
}

// Simple styling for the page
const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    padding: '20px',
  },
  formBox: {
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    width: '100%',
    maxWidth: '450px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: '12px',
    color: '#111827',
  },
  instructions: {
    fontSize: '14px',
    textAlign: 'center',
    marginBottom: '28px',
    color: '#4b5563',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    boxSizing: 'border-box',
    color: '#111827', // <-- ADDED: Input text color
  },
  button: {
    width: '100%',
    padding: '12px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: '#7741C3', // Your theme color
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  messageError: {
    marginTop: '20px',
    padding: '12px',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    textAlign: 'center',
    fontSize: '14px',
  },
  messageSuccess: {
    marginTop: '20px',
    padding: '12px',
    backgroundColor: '#f0fdf4',
    color: '#16a34a',
    border: '1px solid #bbf7d0',
    borderRadius: '6px',
    textAlign: 'center',
    fontSize: '14px',
  },
};