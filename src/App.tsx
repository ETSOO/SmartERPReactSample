import { Container, Stack, Typography } from '@material-ui/core';
import { RouteComponentProps } from '@reach/router';
import './App.css';
import logo from './images/etsoo.png';

function App(props: RouteComponentProps) {
  return (
    <div className="App">
      <img src={logo} alt="ETSOO" className="Logo" />
      <Container className="Container" maxWidth="xl">
        <Typography>登录 - System Admin</Typography>
      </Container>
    </div>
  );
}

export default App;
