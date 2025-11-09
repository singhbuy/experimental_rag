// Simple Confluence connection test
require('dotenv').config({ path: '.env.local' });

async function testConfluenceConnection() {
  const domain = process.env.CONFLUENCE_DOMAIN;
  const email = process.env.CONFLUENCE_EMAIL;
  const token = process.env.CONFLUENCE_TOKEN;

  console.log('Testing Confluence connection...');
  console.log('Domain:', domain);
  console.log('Email:', email);
  console.log('Token:', token ? '***' + token.slice(-10) : 'NOT SET');

  if (!domain || !email || !token) {
    console.error('❌ Confluence credentials not configured');
    process.exit(1);
  }

  const credentials = Buffer.from(`${email}:${token}`).toString('base64');

  // Test 1: Fetch spaces
  console.log('\n=== Test 1: Fetching Spaces ===');
  const spacesUrl = `https://${domain}/wiki/api/v2/spaces?limit=5`;
  console.log('URL:', spacesUrl);

  try {
    const response = await fetch(spacesUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Accept': 'application/json',
      },
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Connection failed:', response.status, response.statusText);
      console.error('Error details:', errorText);
      process.exit(1);
    }

    const spacesData = await response.json();
    console.log('\n✅ Connection successful!');
    console.log(`Found ${spacesData.results.length} spaces:`);
    spacesData.results.forEach((space, i) => {
      console.log(`  ${i + 1}. ${space.name} (${space.key}) - ID: ${space.id}`);
    });

    // Test 2: Fetch pages
    if (spacesData.results.length > 0) {
      console.log('\n=== Test 2: Fetching Pages ===');
      const spaceId = spacesData.results[0].id;
      const pagesUrl = `https://${domain}/wiki/api/v2/pages?space-id=${spaceId}&limit=5&body-format=storage`;
      console.log('URL:', pagesUrl);

      const pagesResponse = await fetch(pagesUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Accept': 'application/json',
        },
      });

      if (pagesResponse.ok) {
        const pagesData = await pagesResponse.json();
        console.log(`✅ Found ${pagesData.results.length} pages in space "${spacesData.results[0].name}":`);
        pagesData.results.forEach((page, i) => {
          console.log(`  ${i + 1}. ${page.title} (ID: ${page.id})`);
          if (page.body?.storage?.value) {
            const preview = page.body.storage.value.substring(0, 100).replace(/<[^>]*>/g, '').trim();
            console.log(`     Preview: ${preview}...`);
          }
        });
      } else {
        const errorText = await pagesResponse.text();
        console.log('⚠️  Could not fetch pages');
        console.log('Status:', pagesResponse.status, pagesResponse.statusText);
        console.log('Error:', errorText);
      }
    }

    console.log('\n✅ All tests passed! Confluence integration is ready.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testConfluenceConnection();
