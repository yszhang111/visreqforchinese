"""Serve the local preview with fresh, content-versioned app scripts."""

from functools import partial
from hashlib import sha256
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import re
from urllib.parse import urlsplit

DIST = Path(__file__).resolve().parents[1] / "dist"
ASSET_REFERENCE = re.compile(r'((?:src|href)=")([^"?#]+\.(?:js|css))(?:\?[^"#]*)?(" ?)')


def fresh_index():
    def version(match):
        asset = DIST / match[2]
        if not asset.is_file():
            return match[0]
        digest = sha256(asset.read_bytes()).hexdigest()[:12]
        return f'{match[1]}{match[2]}?v={digest}{match[3]}'

    return ASSET_REFERENCE.sub(version, (DIST / "index.html").read_text(encoding="utf-8")).encode("utf-8")


class PreviewHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        super().end_headers()

    def send_head(self):
        if urlsplit(self.path).path in ("/", "/index.html"):
            body = fresh_index()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            from io import BytesIO
            return BytesIO(body)
        return super().send_head()


if __name__ == "__main__":
    handler = partial(PreviewHandler, directory=str(DIST))
    server = ThreadingHTTPServer(("127.0.0.1", 4173), handler)
    print("Local preview: http://127.0.0.1:4173/ (cache disabled)", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
