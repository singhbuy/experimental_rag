/**
 * Confluence API Client
 * Fetches pages from Confluence Cloud using REST API v2
 */

export interface ConfluencePage {
  id: string;
  status: string;
  title: string;
  spaceId: string;
  parentId?: string;
  authorId: string;
  createdAt: string;
  version: {
    number: number;
    message: string;
    createdAt: string;
  };
  body?: {
    storage?: {
      value: string;
      representation: string;
    };
    atlas_doc_format?: {
      value: string;
    };
  };
  _links: {
    webui: string;
  };
}

export interface ConfluenceSpace {
  id: string;
  key: string;
  name: string;
  type: string;
  status: string;
  authorId: string;
  createdAt: string;
  homepageId?: string;
  description?: {
    plain: {
      value: string;
    };
  };
  _links: {
    webui: string;
  };
}

export interface ConfluenceConfig {
  domain: string;
  email: string;
  token: string;
}

/**
 * Get Confluence configuration from environment variables
 */
export function getConfluenceConfig(): ConfluenceConfig {
  const domain = process.env.CONFLUENCE_DOMAIN;
  const email = process.env.CONFLUENCE_EMAIL;
  const token = process.env.CONFLUENCE_TOKEN;

  if (!domain || !email || !token) {
    throw new Error(
      'Confluence credentials not configured. Please set CONFLUENCE_DOMAIN, CONFLUENCE_EMAIL, and CONFLUENCE_TOKEN'
    );
  }

  return { domain, email, token };
}

/**
 * Create Basic Auth header for Confluence API
 */
function getAuthHeader(config: ConfluenceConfig): string {
  const credentials = Buffer.from(`${config.email}:${config.token}`).toString('base64');
  return `Basic ${credentials}`;
}

/**
 * Strip HTML tags from content
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Fetch spaces from Confluence
 */
export async function fetchConfluenceSpaces(options: {
  limit?: number;
  cursor?: string;
} = {}): Promise<{ results: ConfluenceSpace[]; _links: any }> {
  const config = getConfluenceConfig();
  const { limit = 25 } = options;

  const url = new URL(`https://${config.domain}/wiki/api/v2/spaces`);
  url.searchParams.append('limit', limit.toString());
  if (options.cursor) {
    url.searchParams.append('cursor', options.cursor);
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: getAuthHeader(config),
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Confluence API error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

/**
 * Fetch pages from Confluence
 */
export async function fetchConfluencePages(options: {
  spaceId?: string;
  limit?: number;
  cursor?: string;
  status?: string;
} = {}): Promise<{ results: ConfluencePage[]; _links: any }> {
  const config = getConfluenceConfig();
  const { limit = 25, status = 'current' } = options;

  const url = new URL(`https://${config.domain}/wiki/api/v2/pages`);
  url.searchParams.append('limit', limit.toString());
  url.searchParams.append('status', status);
  url.searchParams.append('body-format', 'storage');

  if (options.spaceId) {
    url.searchParams.append('space-id', options.spaceId);
  }
  if (options.cursor) {
    url.searchParams.append('cursor', options.cursor);
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: getAuthHeader(config),
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Confluence API error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

/**
 * Fetch a specific Confluence page with body content
 */
export async function fetchConfluencePage(pageId: string): Promise<ConfluencePage> {
  const config = getConfluenceConfig();

  const url = `https://${config.domain}/wiki/api/v2/pages/${pageId}?body-format=storage`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: getAuthHeader(config),
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Confluence page ${pageId}: ${response.statusText}`
    );
  }

  return await response.json();
}

/**
 * Convert Confluence page to searchable document text
 */
export function confluencePageToDocument(page: ConfluencePage, space?: ConfluenceSpace): {
  title: string;
  content: string;
  metadata: Record<string, any>;
} {
  const { id, title, status, createdAt, version, body, _links } = page;

  // Extract and clean content
  let bodyText = '';
  if (body?.storage?.value) {
    bodyText = stripHtml(body.storage.value);
  } else if (body?.atlas_doc_format?.value) {
    // For newer Confluence Cloud pages
    try {
      const docFormat = JSON.parse(body.atlas_doc_format.value);
      bodyText = extractTextFromAtlasDoc(docFormat);
    } catch (e) {
      bodyText = body.atlas_doc_format.value;
    }
  }

  // Build comprehensive searchable content
  const contentParts = [
    `Page Title: ${title}`,
    bodyText ? `Content: ${bodyText}` : '',
    `Status: ${status}`,
    space ? `Space: ${space.name} (${space.key})` : '',
    `Version: ${version.number}`,
  ];

  const content = contentParts.filter(Boolean).join('\n\n');

  const config = getConfluenceConfig();

  return {
    title: title,
    content,
    metadata: {
      confluenceId: id,
      confluencePageId: id,
      status,
      spaceId: page.spaceId,
      spaceName: space?.name,
      spaceKey: space?.key,
      version: version.number,
      created: createdAt,
      updated: version.createdAt,
      url: `https://${config.domain}/wiki${_links.webui}`,
    },
  };
}

/**
 * Extract text from Atlassian Document Format (ADF)
 */
function extractTextFromAtlasDoc(doc: any): string {
  if (!doc || typeof doc !== 'object') {
    return '';
  }

  let text = '';

  if (doc.text) {
    text += doc.text + ' ';
  }

  if (doc.content && Array.isArray(doc.content)) {
    doc.content.forEach((child: any) => {
      text += extractTextFromAtlasDoc(child) + ' ';
    });
  }

  return text.trim();
}

/**
 * Test Confluence connection
 */
export async function testConfluenceConnection(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const config = getConfluenceConfig();

    // Try to fetch spaces to test connection
    const url = `https://${config.domain}/wiki/api/v2/spaces?limit=1`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: getAuthHeader(config),
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        message: `Connection failed: ${response.status} ${response.statusText} - ${errorText}`,
      };
    }

    const data = await response.json();
    const spaceCount = data.results?.length || 0;

    return {
      success: true,
      message: `Connected to Confluence at ${config.domain}. Found ${spaceCount} space(s).`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
}
