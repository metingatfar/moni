

async function runTests() {
  console.log('=== STARTING BACKEND PROVIDERS TEST ===');
  
  // 1. Health test
  try {
    const res = await fetch('http://localhost:5000/api/health');
    console.log('Health Status:', res.status);
    const data = await res.json();
    console.log('Health Response:', data);
  } catch (err) {
    console.error('Health request failed:', err.message);
  }

  // 2. Providers test
  try {
    const res = await fetch('http://localhost:5000/api/providers');
    console.log('Providers Status:', res.status);
    const data = await res.json();
    console.log('Providers Response:', data);
  } catch (err) {
    console.error('Providers request failed:', err.message);
  }

  // 3. Gemini Chat Complete test
  try {
    console.log('Sending chat request to Gemini...');
    const res = await fetch('http://localhost:5000/api/chat/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Nasılsın? Çok kısa bir cevap ver.',
        provider: 'gemini'
      })
    });
    console.log('Gemini Chat Complete Status:', res.status);
    const data = await res.json();
    console.log('Gemini Response:', data);
  } catch (err) {
    console.error('Gemini chat request failed:', err.message);
  }

  // 4. Groq Chat Complete test
  try {
    console.log('Sending chat request to Groq...');
    const res = await fetch('http://localhost:5000/api/chat/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Nasılsın? Çok kısa bir cevap ver.',
        provider: 'groq'
      })
    });
    console.log('Groq Chat Complete Status:', res.status);
    const data = await res.json();
    console.log('Groq Response:', data);
  } catch (err) {
    console.error('Groq chat request failed:', err.message);
  }

  console.log('=== TESTS FINISHED ===');
}

runTests();
