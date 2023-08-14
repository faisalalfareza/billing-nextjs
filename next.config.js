/** @type {import('next').NextConfig} */

// const withPWA = require("next-pwa");
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

const {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} = require('next/constants');

const nextConfig = (phase) => {
  // When started in development mode `next dev` or `npm run dev` regardless of the value of STAGING environment variable
  // Dev adalah tempat di mana kode berjalan yang belum tentu lokal / di mesin Anda tetapi juga belum tentu akan keluar ke situs web produksi.
  const isDev = (phase === PHASE_DEVELOPMENT_SERVER);
  // When `next build` or `npm run build` is used
  // Staging adalah saat Anda pada dasarnya menguji kode sebelum akan masuk ke prod.
  const isStaging = (phase === PHASE_PRODUCTION_BUILD && process.env.STAGING == 1);
  // Production berarti kode produksi yang benar-benar dilihat pengguna akhir. 
  const isProd = (phase === PHASE_PRODUCTION_BUILD && process.env.STAGING != 1);

  // NOTE: .env is for client & server side
  const env = {
    CURRENT_ENV: (() => {
      if (process.env.NODE_ENV) return process.env.NODE_ENV;
      else {
        if (isDev) return "development";
        if (isStaging) return "staging";
        if (isProd) return "production";
      }
      return 'CURRENT_ENV:not (isDev,isProd && isStaging,isProd && !isStaging)';
    })(),
    API_URL: (() => {
      if (process.env.HARD_URL) return process.env.HARD_URL;
      else {
        if (isDev || isStaging) return process.env.BE_DEV_URL;
        if (isProd) return process.env.BE_PROD_URL;
      }
      return 'API_URL:not (isDev || (isProd && isStaging),isProd && !isStaging)';
    })()
  }

  console.log(`\nDEVELOPMENT${isDev ? ' ✅' : ''} | STAGING${isStaging ? ' ✅' : ''} | PRODUCTION${isProd ? ' ✅' : ''}`);
  console.log("API_URL", env.API_URL+"\n");


  // next.config.js object
  return withTM({
    // KONFIGURASI DALAM (INTERNAL CONFIGURATION)
  
    // Variabel Lingkungan (Environment Variables)
    // https://nextjs.org/docs/api-reference/next.config.js/environment-variables
    env,
  
    // Jalur Dasar (Base Path)
    // https://nextjs.org/docs/api-reference/next.config.js/basepath
    // Untuk menyebarkan aplikasi Berikutnya.js di bawah sub-jalur domain, memungkinkan Anda mengatur awalan jalur untuk aplikasi (Nota: nilai ini harus ditetapkan pada waktu build dan tidak dapat diubah tanpa membangun kembali karena nilainya digariskan dalam bundel sisi klien.).
    // basePath: '/docs', // <a href="/docs/about">About Page</a> to <a href="/about">About Page</a>
  
    // Pengalihan (Redirects)
    // https://nextjs.org/docs/api-reference/next.config.js/redirects
    // Pengalihan memungkinkan Anda mengalihkan jalur permintaan masuk ke jalur tujuan yang berbeda.
    async redirects() {
      return [
        {
          source: "/",
          destination: "/authentication/sign-in",
          permanent: true,
        },
      ];
    },
  
    // Ekstensi Halaman Kustom (Custom Page Extensions)
    // https://nextjs.org/docs/api-reference/next.config.js/custom-page-extensions
    // Anda dapat memperluas ekstensi Halaman default (, , , ) yang digunakan oleh Next.js.
    pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"], // ['page.tsx', 'page.ts', 'page.jsx', 'page.js'],
  
    // Konfigurasi Webpack Kustom (Custom Webpack Config)
    // https://nextjs.org/docs/api-reference/next.config.js/custom-webpack-config
    // Fungsi ini dijalankan dua kali, sekali untuk server dan sekali untuk klien. Ini memungkinkan Anda untuk membedakan antara konfigurasi klien dan server menggunakan properti.webpackisServer
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve.fallback.dns = false;
        config.resolve.fallback.net = false;
        config.resolve.fallback.tls = false;
        config.resolve.fallback.dgram = false;
        config.resolve.fallback.fs = false;
      }
  
      return config;
    },
  
    // Konfigurasi Runtime (Runtime Configuration)
    // https://nextjs.org/docs/api-reference/next.config.js/runtime-configuration
    serverRuntimeConfig: {
      // Konfigurasi runtime khusus server, dan hanya akan tersedia di sisi server.
      secret: "THIS IS USED TO SIGN AND VERIFY JWT TOKENS, REPLACE IT WITH YOUR OWN SECRET, IT CAN BE ANY STRING",
    }, publicRuntimeConfig: {
      // Apa pun yang dapat diakses oleh kode klien dan sisi server, dan Akan tersedia di sisi server dan sisi klien
      apiUrl: env.API_URL
    },

    // Mengabaikan Kesalahan (Ignoring)

    // Mengabaikan Kesalahan TypeScript (Ignoring TypeScript Errors)
    // https://nextjs.org/docs/api-reference/next.config.js/ignoring-typescript-errors
    // Gagal build produksi Anda ketika kesalahan TypeScript ada dalam proyek Anda. Jika Anda ingin Next.js menghasilkan kode produksi secara berbahaya bahkan ketika aplikasi Anda memiliki kesalahan, Anda dapat menonaktifkan langkah pemeriksaan tipe bawaan. Jika dinonaktifkan, pastikan Anda menjalankan pemeriksaan tipe sebagai bagian dari proses build atau deploy Anda, jika tidak, ini bisa sangat berbahaya.
    typescript: {
      // !! WARN !!
      // Dangerously allow production builds to successfully complete even if
      // your project has type errors.
      // !! WARN !!
      ignoreBuildErrors: false,
    },

    // Mengabaikan Kesalahan ESLint (Ignoring ESLint Errors)
    // https://nextjs.org/docs/api-reference/next.config.js/ignoring-eslint
    // Konsepnya sama seperti pengabaian kesalahan Typescript. Ini tidak disarankan kecuali Anda sudah memiliki ESLint yang dikonfigurasi untuk berjalan di bagian terpisah dari alur kerja Anda (misalnya, di CI atau hook pra-komit).
    eslint: {
      // Warning: This allows production builds to successfully complete even if
      // your project has ESLint errors.
      ignoreDuringBuilds: false,
    },
  
    // Garis miring di belakang (Trailing Slash)
    // https://nextjs.org/docs/api-reference/next.config.js/trailing-slash
    // Secara default Next.js akan mengalihkan url dengan trailing slash ke rekannya tanpa trailing slash. Misalnya akan dialihkan ke . Anda dapat mengonfigurasi perilaku ini untuk bertindak sebaliknya, di mana url tanpa garis miring berikutnya dialihkan ke rekan-rekan mereka dengan garis miring berikutnya.
    trailingSlash: false, // Default tp false
  
    // Mode Ketat React (React Strict Mode)
    // https://nextjs.org/docs/api-reference/next.config.js/react-strict-mode
    // Mode Ketat React adalah fitur mode pengembangan saja untuk menyoroti potensi masalah dalam aplikasi. Ini membantu mengidentifikasi siklus hidup yang tidak aman, penggunaan API lama, dan sejumlah fitur lainnya. Runtime Next.js sesuai dengan Mode Ketat. Untuk ikut serta dalam Mode Ketat, konfigurasikan opsi berikut di :next.config.js
    reactStrictMode: true, // Default tp false
  
    // Impor URL (URL Imports)
    // https://nextjs.org/docs/api-reference/next.config.js/url-imports
    // Impor URL adalah fitur eksperimental yang memungkinkan Anda mengimpor modul langsung dari server eksternal (bukan dari disk lokal).
    // experimental: {
    //   urlImports: ['https://example.com/assets/', 'https://cdn.skypack.dev'],
    // },
  
    // Membangun Indikator (Build Indicator)
    // https://nextjs.org/docs/api-reference/next.config.js/build-indicator
    // Saat Anda mengedit kode Anda, dan Berikutnya.js sedang mengkompilasi aplikasi, indikator kompilasi muncul di sudut kanan bawah halaman (Saat Anda mengedit kode Anda, dan Berikutnya.js sedang mengkompilasi aplikasi, indikator kompilasi muncul di sudut kanan bawah halaman).
    devIndicators: {
      buildActivity: isDev, // Default tp false
      buildActivityPosition: "bottom-right"
    },

    // Memaksa menggunakan SWC (Speedy Web Compiler) saat Babel terinstal
    // https://nextjs.org/docs/messages/swc-disabled
    // Ketika sebuah aplikasi memiliki konfigurasi Babel kustom Next.js akan secara otomatis memilih untuk tidak menggunakan SWC untuk mengkompilasi JavaScript/Typescript dan akan kembali menggunakan Babel dengan cara yang sama seperti yang digunakan di Next.js 11. Jika Anda ingin menggunakan SWC meskipun ada file, Anda dapat memaksanya di file Anda.
    experimental: {
      forceSwcTransforms: false,
    },
    
  
    // KONFIGURASI LUAR (EXTERNAL CONFIGURATION)
  
    // PWA (Progressive Web Apps)
    // https://www.npmjs.com/package/next-pwa
    // https://dev.to/sabbirzzaman/pwa-with-next-js-13-194l
    // Progressive Web Applications (PWA) adalah aplikasi yang dibangun dengan teknologi web yang mungkin kita semua tahu dan sukai, seperti HTML, CSS, dan JavaScript. Tetapi mereka memiliki nuansa dan fungsionalitas dari aplikasi asli yang sebenarnya.
    // pwa: {
    //   dest: "public",
    //   register:true,
    //   skipWaiting:true,
    //   disable:process.env.NODE_ENV === 'development'
    // },
  });
};

module.exports = nextConfig;