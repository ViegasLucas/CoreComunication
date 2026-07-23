async function testPdfDocument() {
  try {
    console.log('Testing GET http://localhost:3001/api/reports/documents/1784685935040/pdf...');
    const res = await fetch('http://localhost:3001/api/reports/documents/1784685935040/pdf', {
      headers: { 'Authorization': 'Bearer user-mock-123' }
    });
    console.log('Status Code:', res.status);
    console.log('Content-Type:', res.headers.get('content-type'));
    const text = await res.text();
    console.log('Body Preview (first 600 chars):');
    console.log(text.substring(0, 600));
  } catch (err) {
    console.error('Error connecting to dev server:', err);
  }
}

testPdfDocument();
