import { createRoot } from 'react-dom/client'
import App from './App'

// createRoot(document.getElementById('root')).render(<App />)  
// avoids crashes if root is absent 
const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}