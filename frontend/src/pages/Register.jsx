import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { setAuthToken } from '../services/api';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', { name, email, password, avatar });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setAuthToken(token);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white dark:bg-gray-900 p-6 rounded shadow">
        <h1 className="text-2xl font-semibold mb-4">ChatSphere — Register</h1>
        <input className="w-full p-2 border rounded mb-3" placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} />
        <input className="w-full p-2 border rounded mb-3" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" className="w-full p-2 border rounded mb-3" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <input className="w-full p-2 border rounded mb-3" placeholder="Avatar URL (optional)" value={avatar} onChange={e=>setAvatar(e.target.value)} />
        <button className="w-full py-2 bg-green-600 text-white rounded mb-2">Register</button>
        <div className="text-sm text-center">
          Already registered? <Link to="/login" className="text-green-600">Login</Link>
        </div>
      </form>
    </div>
  );
}
