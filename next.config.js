/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa");

const withTM = require("next-transpile-modules")([
  "next-pwa",
  "@fullcalendar/common",
  "@babel/preset-react",
  "@fullcalendar/common",
  "@fullcalendar/daygrid",
  "@fullcalendar/interaction",
  "@fullcalendar/react",
  "@fullcalendar/timegrid",
  "react-github-btn",
]);
const runtimeCaching = require("next-pwa/cache");

module.exports = withTM({
  pwa: {
    dest: "public",
    runtimeCaching,
  },
  reactStrictMode: false,
  async redirects() {
    return [
      {
        source: "/",
        destination: "/authentication/sign-in",
        permanent: true,
      },
    ];
  },
  serverRuntimeConfig: {
    secret:
      "THIS IS USED TO SIGN AND VERIFY JWT TOKENS, REPLACE IT WITH YOUR OWN SECRET, IT CAN BE ANY STRING",
  },
  publicRuntimeConfig: {
    apiUrl:
      process.env.NODE_ENV === "development"
        ? "http://18.140.60.145:1010" // development api 'http://18.141.209.135:1010/api'
        : "http://18.140.60.145:1010", // production api 'http://localhost:3000'
  },
});
