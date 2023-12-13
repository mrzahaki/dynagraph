import React from 'react';
import { createRoot } from 'react-dom/client'; // import from react-dom/client
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import './index.css'; 
import App from './App';

const rootElement = document.getElementById('root');

createRoot(rootElement).render( // use createRoot without ReactDOM
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
    <footer className='app-footer'>
      <p>© 2023 Hussein Zahaki. All rights reserved.</p>
    </footer>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
