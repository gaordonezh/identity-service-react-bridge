import TestComponent from './components/TestComponent';
import AuthenticationProvider from './context/AuthenticationProvider';
import { AuthClient } from './utils/auth';

function App() {
  const authClient = new AuthClient({
    clientId: 'napfood-web',
    identityUrl: 'http://localhost:3000',
    redirectUri: 'http://localhost:4000/callback',
    logoutRedirectUri: 'http://localhost:4000/login',
  });

  return (
    <AuthenticationProvider client={authClient} expireDate={new Date(2026, 4, 30, 23, 59, 59)}>
      <TestComponent />
    </AuthenticationProvider>
  );
}

export default App;
