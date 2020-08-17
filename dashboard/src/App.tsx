import React from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import { ApolloProvider } from '@apollo/react-hooks';
import client from './apollo'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Action from './pages/Action'
import NotificationLog from './pages/NotificationLog'

function App() {
  return (
    <ApolloProvider client={ client }>
      <Router>
        <Switch>
          <Route path="/" exact>
            <Login></Login>
          </Route>
          <Route path="/dashboard" exact>
            <Dashboard></Dashboard>
          </Route>
          <Route path="/dashboard/acao/:kind" exact>
            <Action></Action>
          </Route>
          <Route path="/dashboard/notificacoes" exact>
            <NotificationLog></NotificationLog>
          </Route>
        </Switch>
      </Router>
    </ApolloProvider>
  );
}

export default App;
