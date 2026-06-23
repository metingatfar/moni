async function testTts() {
  console.log('=== Testing TTS Endpoint ===');
  try {
    const res = await fetch('http://localhost:5000/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Merhaba, ben Moni.'
      })
    });

    console.log('Status:', res.status);
    if (!res.ok) {
      const err = await res.text();
      console.log('Error details:', err);
      return;
    }
    console.log('TTS response content-type:', res.headers.get('content-type'));
    const blob = await res.blob();
    console.log('Received audio blob size:', blob.size);
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

testTts();
