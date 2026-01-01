export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    // Validate URL
    const targetUrl = new URL(url);
    
    // Fetch the page content
    const response = await fetch(targetUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `Failed to fetch URL: ${response.statusText}` 
      });
    }

    const html = await response.text();
    
    // Extract main content using simple regex patterns
    // This works for most static pages, but Notion requires client-side rendering
    let content = extractContent(html);
    
    return res.status(200).json({
      success: true,
      url: url,
      title: extractTitle(html),
      content: content,
      rawHtml: html.substring(0, 5000) // First 5000 chars for debugging
    });

  } catch (error) {
    return res.status(500).json({ 
      error: `Failed to process URL: ${error.message}` 
    });
  }
}

function extractTitle(html) {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return titleMatch ? titleMatch[1].trim() : 'Untitled';
}

function extractContent(html) {
  // Remove script and style tags
  let content = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '');
  
  // Try to find main content areas
  const mainPatterns = [
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<main[^>]*>([\s\S]*?)<\/main>/i,
    /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*class="[^"]*article[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
  ];
  
  for (const pattern of mainPatterns) {
    const match = content.match(pattern);
    if (match) {
      content = match[1];
      break;
    }
  }
  
  // Convert HTML to simple text with line breaks
  content = content
    // Headers to markdown
    .replace(/<h1[^>]*>/gi, '\n## ')
    .replace(/<\/h1>/gi, '\n')
    .replace(/<h2[^>]*>/gi, '\n### ')
    .replace(/<\/h2>/gi, '\n')
    .replace(/<h3[^>]*>/gi, '\n#### ')
    .replace(/<\/h3>/gi, '\n')
    // Paragraphs
    .replace(/<p[^>]*>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    // Line breaks
    .replace(/<br\s*\/?>/gi, '\n')
    // Lists
    .replace(/<li[^>]*>/gi, '\n- ')
    .replace(/<\/li>/gi, '')
    // Links (keep text only)
    .replace(/<a[^>]*>([^<]*)<\/a>/gi, '$1')
    // Bold and italic
    .replace(/<strong[^>]*>([^<]*)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>([^<]*)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>([^<]*)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>([^<]*)<\/i>/gi, '*$1*')
    // Code
    .replace(/<code[^>]*>([^<]*)<\/code>/gi, '`$1`')
    // Remove all other tags
    .replace(/<[^>]+>/g, '')
    // Clean up whitespace
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
  
  return content;
}
