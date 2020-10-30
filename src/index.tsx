import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';

const render = (Component: React.FC) => {
  return ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('root')
  );
}

render(App)

if (module.hot) {
  console.warn('HMR activated');
  module.hot.accept('./App', () => {
    const NextApp = require('./App').default;
    render(NextApp);
  });
}