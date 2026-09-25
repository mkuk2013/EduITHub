/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Uploaded files are served from /public/uploads at runtime.
  // Keep the default image config; remote thumbnails can be added later.
};

export default nextConfig;
