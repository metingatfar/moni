async function testStream(provider) {
  console.log(`\n=== Testing Stream for: ${provider} ===`);
  try {
    const res = await fetch('http://localhost:5000/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Merhaba, nasılsın? Birkaç kelimeyle cevap ver.',
        provider
      })
    });
    
    console.log('Status:', res.status);
    if (!res.ok) {
      const err = await res.text();
      console.log('Error:', err);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      console.log('Chunk received:', decoder.decode(value));
    }
    console.log('Stream ended');
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

async function run() {
  await testStream('gemini');
  await testStream('groq');
}

run();
