import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import './assets/css/fontello.css'
import moment from  'moment'
import 'moment/locale/pt-br'
import App from './App'
import { Provider } from 'react-redux'
import store from './store'

moment.locale('pt-br')

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
