import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // CRITICAL. Ensure it is here!

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App /> {/* No Router here! Router is handled inside App.tsx */}
  </React.StrictMode>,
);