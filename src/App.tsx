import TestComponent from './components/TestComponent';
import AuthenticationProvider from './context/AuthenticationProvider';
import type { AuthClientOptions } from './types/global';

function App() {
  const options: AuthClientOptions = {
    clientId: 'napfood-web',
    identityUrl: 'http://localhost:3000',
    redirectUri: 'http://localhost:4000/callback',
    logoutRedirectUri: 'http://localhost:4000/login',
  };

  return (
    <AuthenticationProvider options={options} expireDate={new Date(2026, 4, 30, 23, 59, 59)}>
      <TestComponent />
    </AuthenticationProvider>
  );
}

export default App;
