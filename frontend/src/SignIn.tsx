// https://reactconf.org/create-a-login-form-in-react-typescript/
import { useState } from 'react';
import './SignIn.css';
import { Link, useNavigate } from 'react-router-dom';
import { signupWithEmail } from './auth';

function SignIn() {
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
      await signupWithEmail(email, password);
      navigate('/');
    } catch (err: any) {
      const message = err?.message || 'Registration failed';
      setPasswordError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const gotoLogin = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (leaving) return;
    setLeaving(true);
    setTimeout(() => navigate('/login'), 250);
  };

  return (
    <div className="modern-container" style={{ justifyContent: 'center' }}>
      <div className={"signin-box" + (leaving ? " leaving" : "")}>
        <div className="auth-header">
          <h2>Join Harmonic</h2>
          <p>Begin your AI-powered musical evolution.</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onButtonClick(); }}>
          <div className="input-group">
            <label className="input-label" htmlFor="register-email">Email Address</label>
            <div className="input-wrap">
              <input
                id="register-email"
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
            <label className="input-label" htmlFor="register-password">Create Password</label>
            <div className="input-wrap">
              <input
                id="register-password"
                value={password}
                placeholder="8+ characters"
                onChange={(ev) => setPassword(ev.target.value)}
                className="auth-input"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
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
            value={submitting ? 'Provisioning...' : 'Create Account'}
            disabled={submitting}
          />
        </form>
        <div className="login-link">
          <p>
              Already a member?
              <Link to="/login" className="login-link-text" onClick={gotoLogin}>
                 Log in here
              </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
