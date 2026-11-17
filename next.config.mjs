/** NEXUS intentionally runs on Node.js, never Edge, for hardened server-side secrets. */
export default {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    const sensitive = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'no-referrer' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'" }
    ];
    return [{source:'/:path*',headers:sensitive}];
  }
};
