#!/usr/bin/env python3
"""HTTP server with correct MIME types for ES6 modules"""
import http.server
import socketserver
import os

PORT = 8080

class ES6ModuleHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Force correct MIME type for JS modules
        if self.path.endswith('.js') or self.path.endswith('.mjs'):
            self.send_header('Content-Type', 'application/javascript; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

    def guess_type(self, path):
        # Explicitly return JavaScript MIME type
        if path.endswith('.js') or path.endswith('.mjs'):
            return 'application/javascript'
        if path.endswith('.css'):
            return 'text/css'
        if path.endswith('.html'):
            return 'text/html'
        return super().guess_type(path)

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)) if os.path.dirname(__file__) else '.')

    with socketserver.TCPServer(("", PORT), ES6ModuleHandler) as httpd:
        print(f"Server running at http://localhost:{PORT}")
        print("Press Ctrl+C to stop")
        print("")
        print("IMPORTANT: Open browser in Incognito/Private mode")
        print("or press Ctrl+Shift+R to hard refresh")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped")