import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { SmartApp } from './app/SmartApp';
import { Router } from '@reach/router';

// Root
const root = document.getElementById('root')!;

// App
SmartApp.setup();

// Notifier provider
const NotifierProvider = SmartApp.notifierProvider;

// Language provider
const LanguageStateContext = SmartApp.languageState.context;
const LanguageStateProvider = SmartApp.languageState.provider;

// User state
const UserStateProvider = SmartApp.userState.provider;

ReactDOM.render(
  <React.Fragment>
    <LanguageStateProvider>
      <LanguageStateContext.Consumer>
        {(value) => <NotifierProvider labels={value.state.labels} />}
      </LanguageStateContext.Consumer>
      <UserStateProvider>
        <Router>
          <App path="/" default />
        </Router>
      </UserStateProvider>
    </LanguageStateProvider>
  </React.Fragment>,
  root
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);
