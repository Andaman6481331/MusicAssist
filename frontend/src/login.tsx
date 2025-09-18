import { useState } from 'react';
import './login.css';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { loginWithEmail } from './auth';


function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const navigate = useNavigate();

  const onButtonClick = async () => {
    setEmailError('');
    setPasswordError('');

    if (email === '') {
      setEmailError('Please enter your email');
      return;
    }

    if (password === '') {
      setPasswordError('Please enter a password');
      return;
    }

    if (password.length < 8) {
      setPasswordError('Password must be 8 characters or longer');
      return;
    }

    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    try {
      setSubmitting(true);
      await loginWithEmail(email, password);
      navigate('/');
    } catch (err: any) {
      const message = err?.message || 'Login failed';
      setPasswordError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const gotoRegister = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (leaving) return;
    setLeaving(true);
    setTimeout(() => navigate('/register'), 250);
  };

  return (
    <div className={"login-box" + (leaving ? " leaving" : "")}>
      <div className="auth-header">
        <h2>Login</h2>
        <p>Welcome back. Please sign in to continue.</p>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); onButtonClick(); }}>
        <div className="input-group">
          <label className="input-label" htmlFor="login-email">Email</label>
          <div className="input-wrap">
            <input
              id="login-email"
              value={email}
              placeholder="Enter email address here"
              onChange={(ev) => setEmail(ev.target.value)}
              className="auth-input"
              type="email"
              autoComplete="email"
            />
          </div>
          {emailError ? <small className="errorLabel">{emailError}</small> : null}
        </div>
        <div className="input-group">
          <label className="input-label" htmlFor="login-password">Password</label>
          <div className="input-wrap">
            <input
              id="login-password"
              value={password}
              placeholder="Enter password here"
              onChange={(ev) => setPassword(ev.target.value)}
              className="auth-input"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="reveal"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {passwordError ? <small className="errorLabel">{passwordError}</small> : null}
        </div>
        <input
          onClick={onButtonClick}
          className="inputButton"
          type="submit"
          value={submitting ? 'Signing in...' : 'Submit'}
          disabled={submitting}
        />
      </form>
      <div className="register-link">
        <p>
            Don't have an account?{' '}
            <Link to="/register" className="register-link-text" onClick={gotoRegister}>
               Register here
            </Link>
        </p>
      </div>

    </div>
  );
}

export default Login;
