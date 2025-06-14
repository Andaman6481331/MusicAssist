// https://reactconf.org/create-a-login-form-in-react-typescript/
import { useState } from 'react';
import './SignIn.css';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Home from './HomePage.tsx';
//import { useNavigate } from 'react-router-dom';

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const onButtonClick = () => {
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

    // Navigate to Home if all validation passes
    if (email) {
      return (
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </Router>
      );
    } else {
      return <Navigate to="/Component/SignIn/SignIn" />;
    }
  };

  return (
    <div className="signin-box">
      <h2>Register</h2>
      <form>
        <div className="user-box">
          <input
            value={email}
            placeholder="Enter email address here"
            onChange={(ev) => setEmail(ev.target.value)}
            className="user-box"
          />
          <label className="errorLabel">{emailError}</label>
        </div>
        <div className="user-box">
          <input
            value={password}
            placeholder="Enter password here"
            onChange={(ev) => setPassword(ev.target.value)}
            className="user-box"
            type="password"
          />
          <label className="errorLabel">{passwordError}</label>
        </div>
        <input
          onClick={onButtonClick}
          className="inputButton"
          type="button"
          value="Submit"
        />
      </form>
      <div className="login-link">
        <p>
            Already have an account?{' '}
            <Link to="/login" className="login-link-text">
               Login here
            </Link>
        </p>
      </div>

    </div>
  );
}

export default SignIn;
