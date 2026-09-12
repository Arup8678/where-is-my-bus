import app from '../../../../../backend/src/app';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handle(req: NextRequest) {
  return new Promise<Response>((resolve) => {
    const url = new URL(req.url);
    
    let reqBody: any = undefined;

    const runExpress = (parsedBody?: any) => {
      let statusCode = 200;
      const resHeaders = new Headers();
      let bodyChunks: Uint8Array[] = [];

      const expressReq: any = {
        url: url.pathname + url.search,
        method: req.method,
        headers: Object.fromEntries(req.headers.entries()),
        query: Object.fromEntries(url.searchParams.entries()),
        body: parsedBody ?? {},
      };

      const expressRes: any = {
        statusCode: 200,
        status(code: number) {
          statusCode = code;
          this.statusCode = code;
          return this;
        },
        setHeader(name: string, value: string) {
          resHeaders.set(name, value);
          return this;
        },
        getHeader(name: string) {
          return resHeaders.get(name);
        },
        json(data: any) {
          if (!resHeaders.has('Content-Type')) {
            resHeaders.set('Content-Type', 'application/json');
          }
          bodyChunks.push(Buffer.from(JSON.stringify(data)));
          finish();
        },
        send(data: any) {
          if (typeof data === 'string') {
            bodyChunks.push(Buffer.from(data));
          } else if (Buffer.isBuffer(data)) {
            bodyChunks.push(data);
          } else {
            if (!resHeaders.has('Content-Type')) {
              resHeaders.set('Content-Type', 'application/json');
            }
            bodyChunks.push(Buffer.from(JSON.stringify(data)));
          }
          finish();
        },
        end(data?: any) {
          if (data) this.send(data);
          else finish();
        }
      };

      function finish() {
        const combined = Buffer.concat(bodyChunks);
        resolve(new Response(combined, { status: statusCode, headers: resHeaders }));
      }

      try {
        app(expressReq, expressRes);
      } catch (err: any) {
        resolve(new Response(JSON.stringify({ success: false, error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }));
      }
    };

    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      req.json().then(b => runExpress(b)).catch(() => runExpress({}));
    } else {
      runExpress();
    }
  });
}

export { handle as GET, handle as POST, handle as PUT, handle as DELETE, handle as PATCH };
