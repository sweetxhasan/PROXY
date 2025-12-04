import { NextRequest, NextResponse } from 'next/server';

// List of user agents for rotation
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (iPad; CPU OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.43 Mobile Safari/537.36',
];

// Common video, audio, and document MIME types
const MIME_TYPES: Record<string, string> = {
  // Video
  '.mp4': 'video/mp4',
  '.m4v': 'video/mp4',
  '.avi': 'video/x-msvideo',
  '.mov': 'video/quicktime',
  '.wmv': 'video/x-ms-wmv',
  '.flv': 'video/x-flv',
  '.webm': 'video/webm',
  '.mkv': 'video/x-matroska',
  '.3gp': 'video/3gpp',
  '.mpeg': 'video/mpeg',
  '.mpg': 'video/mpeg',
  
  // Audio
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.m4a': 'audio/mp4',
  '.aac': 'audio/aac',
  '.flac': 'audio/flac',
  '.wma': 'audio/x-ms-wma',
  
  // Documents
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.txt': 'text/plain',
  '.rtf': 'application/rtf',
  
  // Images
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.bmp': 'image/bmp',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  
  // Archives
  '.zip': 'application/zip',
  '.rar': 'application/x-rar-compressed',
  '.7z': 'application/x-7z-compressed',
  '.tar': 'application/x-tar',
  '.gz': 'application/gzip',
};

// Supported domains (can be extended)
const ALLOWED_DOMAINS = [
  '.*' // Allow all domains
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fileUrl = searchParams.get('url');
    
    if (!fileUrl) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing file URL parameter' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(fileUrl);
    } catch (error) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid URL format' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    // Check if domain is allowed (currently allows all)
    const isAllowed = ALLOWED_DOMAINS.some(pattern => {
      const regex = new RegPattern(`^${pattern}$`);
      return regex.test(parsedUrl.hostname);
    });

    if (!isAllowed) {
      return new NextResponse(
        JSON.stringify({ error: 'Domain not allowed' }),
        { 
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    // Get filename from URL or generate one
    const urlPath = parsedUrl.pathname;
    const filename = urlPath.split('/').pop() || 'download';
    
    // Determine MIME type from extension
    const extension = urlPath.substring(urlPath.lastIndexOf('.')).toLowerCase();
    const mimeType = MIME_TYPES[extension] || 'application/octet-stream';

    // Select random user agent
    const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

    // Headers for the request
    const headers: HeadersInit = {
      'User-Agent': userAgent,
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
    };

    // Add referer if available
    const referer = parsedUrl.origin;
    if (referer) {
      headers['Referer'] = referer;
    }

    // Make the request to the target file
    const response = await fetch(fileUrl, {
      headers,
      redirect: 'follow',
      // Add timeout
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
    }

    // Get the response body as a stream
    const fileStream = response.body;

    // Get content type from response or use our detection
    const contentType = response.headers.get('content-type') || mimeType;
    const contentLength = response.headers.get('content-length') || 'unknown';
    const contentDisposition = response.headers.get('content-disposition') || `attachment; filename="${filename}"`;

    // Return the file stream with appropriate headers
    return new NextResponse(fileStream, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': contentLength,
        'Content-Disposition': contentDisposition,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': '*',
        'Cache-Control': 'public, max-age=31536000',
        'Cross-Origin-Resource-Policy': 'cross-origin',
        'Accept-Ranges': 'bytes',
        'X-Proxy-Server': 'ProxyDownloader/1.0',
        'X-Original-URL': fileUrl,
      },
    });

  } catch (error: any) {
    console.error('Proxy error:', error);

    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to proxy file',
        message: error.message,
        details: error.toString() 
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
  }
