import { Suspense, lazy } from 'react';
import { BrowserRouter } from 'react-router-dom';
import ReactDOM from 'react-dom/client';

// ** Redux Imports
import { store } from './redux/store';
import { Provider } from 'react-redux';
import reportWebVitals from './reportWebVitals';
import FullScreenLoader from './components/FullScreenLoader';

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import './assets/scss/app-loader.scss';


// ** Lazy load app
const LazyApp = lazy(() => import('./App'));

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Provider store={store}>
      <Suspense fallback={<FullScreenLoader />}>
        <LazyApp />
      </Suspense>
    </Provider>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
