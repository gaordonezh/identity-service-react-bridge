import { createRoot } from 'react-dom/client';
import App from './demo/App.tsx';

import './assets/index.css';

createRoot(document.getElementById('identity-service-react-bridge')!).render(<App />);
