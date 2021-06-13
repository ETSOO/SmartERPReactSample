import { RouteComponentProps } from '@reach/router';

function LoginHistory(props: RouteComponentProps) {
  return <div>Login history: {props.path}</div>;
}

export default LoginHistory;
