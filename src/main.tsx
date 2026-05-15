import { createRoot } from 'react-dom/client';
import App from './demo/App.tsx';

import './assets/main.css';

createRoot(document.getElementById('identity-service-react-bridge')!).render(<App />);
