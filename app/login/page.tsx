'use client';

import { useState } from 'react';
import { login, register } from '@/lib/actions';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const action = isLogin ? login : register;
    
    const result = await action(formData);
    
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>{isLogin ? 'התחברות למערכת' : 'הרשמה למערכת'}</h1>
        <p>פלטפורמת פיקוח ובקרה - צוות שלדור</p>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name">שם מלא</label>
              <input type="text" id="name" name="name" required />
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email">כתובת אימייל</label>
            <input type="email" id="email" name="email" required />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">סיסמה</label>
            <input type="password" id="password" name="password" required />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn" style={{ width: '100%', padding: '12px', fontSize: '16px' }}>
            {isLogin ? 'היכנס' : 'הירשם'}
          </button>
        </form>

        <div style={{ marginTop: '24px' }}>
          <button 
            className="btn-outline" 
            style={{ border: 'none', width: '100%' }}
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
          >
            {isLogin ? 'אין לך משתמש? הירשם כאן' : 'כבר רשום? התחבר כאן'}
          </button>
        </div>
      </div>
    </div>
  );
}
