import { useEffect, useState } from 'react';
import axios from 'axios';

export default function App() {
  const [status, setStatus] = useState('Checking API...');

  useEffect(() => {
    axios
      .get('/api/health')
      .then((res) => setStatus(`API says: ${res.data.status}`))
      .catch(() => setStatus('Could not reach the API'));
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-stone-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-violet-700">SplitMate</h1>
        <p className="mt-2 text-stone-600">Split expenses. Not friendships.</p>
        <p className="mt-6 text-sm text-stone-500">{status}</p>
      </div>
    </main>
  );
}