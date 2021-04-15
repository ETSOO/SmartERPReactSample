import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { SmartApp } from './app/SmartApp';
import { Router } from '@reach/router';
import About from './login/About';
import Register from './login/Register';
import Terms from './login/Terms';
import { NotFound } from './NotFound';
import Password from './login/Password';
import { CssBaseline } from '@material-ui/core';

// Root
const root = document.getElementById('root')!;

// App
SmartApp.setup();

// Notifier provider
const NotifierProvider = SmartApp.notifierProvider;

// Culture provider
const CultureStateContext = SmartApp.cultureState.context;
const CultureStateProvider = SmartApp.cultureState.provider;

// User state
const UserStateProvider = SmartApp.userState.provider;

ReactDOM.render(
  <React.Fragment>
    <CssBaseline />
    <CultureStateProvider>
      <CultureStateContext.Consumer>
        {(value) => <NotifierProvider labels={value.state.resources} />}
      </CultureStateContext.Consumer>
      <UserStateProvider>
        <Router basepath={SmartApp.instance.settings.homepage}>
          <App path="/" />

          <About path="/login/about" />
          <Register path="/login/register" />
          <Password path="/login/password/:username" />
          <Terms path="/login/terms" />

          <NotFound default />
        </Router>
      </UserStateProvider>
    </CultureStateProvider>
  </React.Fragment>,
  root
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
if (process.env.NODE_ENV !== 'production') {
  reportWebVitals(console.log);
}
