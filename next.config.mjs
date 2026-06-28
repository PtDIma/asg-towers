/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static export → produces an `out/` folder of plain HTML/JS/assets,
  // hostable on GitHub Pages (or any static host).
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
