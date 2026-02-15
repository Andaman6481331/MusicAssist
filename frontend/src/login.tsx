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
    <div className="modern-container" style={{ justifyContent: 'center' }}>
      <div className={"login-box" + (leaving ? " leaving" : "")}>
        <div className="auth-header">
          <h2>Harmonic</h2>
          <p>Your creative journey continues here.</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onButtonClick(); }}>
          <div className="input-group">
            <label className="input-label" htmlFor="login-email">Email Address</label>
            <div className="input-wrap">
              <input
                id="login-email"
                value={email}
                placeholder="name@example.com"
                onChange={(ev) => setEmail(ev.target.value)}
                className="auth-input"
                type="email"
                autoComplete="email"
              />
            </div>
            {emailError ? <small className="errorLabel">{emailError}</small> : null}
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="login-password">Security Key</label>
            <div className="input-wrap">
              <input
                id="login-password"
                value={password}
                placeholder="••••••••"
                onChange={(ev) => setPassword(ev.target.value)}
                className="auth-input"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="reveal"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? 'Hide' : 'Reveal'}
              </button>
            </div>
            {passwordError ? <small className="errorLabel">{passwordError}</small> : null}
          </div>
          <input
            onClick={onButtonClick}
            className="inputButton"
            type="submit"
            value={submitting ? 'Authenticating...' : 'Sign In'}
            disabled={submitting}
          />
        </form>
        <div className="register-link">
          <p>
              New to Harmonic?
              <Link to="/register" className="register-link-text" onClick={gotoRegister}>
                 Create account
              </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
