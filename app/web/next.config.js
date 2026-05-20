// Configuración de Next.js para la web de Guadua.
const enDesarrollo = process.env.NODE_ENV === "development";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${enDesarrollo ? " 'unsafe-eval'" : ""} https://checkout.pagosya.example`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://cdn.guadua.example",
  "font-src 'self'",
  "connect-src 'self' https://api.guadua.example https://api.pagosya.example https://api.clientela.example https://api.envioscafeteros.example",
  "frame-src https://checkout.pagosya.example",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.pagosya.example",
  "frame-ancestors 'none'",
].join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "standalone",
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.guadua.example" }],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  async redirects() {
    return [{ source: "/tienda/:slug", destination: "/t/:slug", permanent: true }];
  },
};

module.exports = nextConfig;
