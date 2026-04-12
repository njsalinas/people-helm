/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@react-pdf/renderer'],
  },
  /* typescript: {
    // !! ADVERTENCIA !!
    // Esto permitirá que el build termine aunque haya errores de tipo.
    // Úsalo solo para desatascar el deploy ahora y arregla los tipos después.
    ignoreBuildErrors: true,
  }, */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
}

module.exports = nextConfig
