import Redis from "ioredis";

const redisIO = createRedisInstance();

export default redisIO;

function getRedisConfiguration() {
  return {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT, // Optional. Default to "6379"
    username: process.env.REDIS_USERNAME, // Optional if not set on redis server
    password: process.env.REDIS_PASSWORD, // Optional if not set on redis server
    database: process.env.REDIS_DB, // Optional. Default to "0". Available 16 databases (0 - 15)
  };
}

export function createRedisInstance(config = getRedisConfiguration()) {
  try {
    const options = {
      host: config.host,

      // Koneksi lambat/diperlambat
      /*
                - Menunggu perintah pertama dipanggil sebelum menghubungkan.
            */
      // lazyConnect: true,

      // Mengoptimalkan tumpukan kesalahan
      /*
                -   Secara default, tumpukan kesalahan tidak masuk akal karena seluruh tumpukan terjadi di ioredis modul itu sendiri, bukan dalam kode Anda. 
                -   Jadi tidak mudah untuk mengetahui di mana kesalahan terjadi dalam kode Anda. ioredis menyediakan opsi untuk menyelesaikan masalah. 
                    Saat Anda mengaktifkan , ioredis akan mengoptimalkan tumpukan kesalahan untuk Anda: showFriendlyErrorStack
                -   Namun, itu akan menurunkan kinerja secara signifikan untuk mengoptimalkan tumpukan kesalahan.
                -   Jadi dengan default, opsi ini dinonaktifkan dan hanya dapat digunakan untuk tujuan debugging. Anda tidak boleh menggunakan fitur ini di lingkungan produksi.
            */
      showFriendlyErrorStack:
        process.env.NODE_ENV === "development" ? true : false,

      // Pipelinning otomatis
      /*
                -   Dalam mode standar, ketika Anda mengeluarkan beberapa perintah, ioredis mengirimkannya ke server satu per satu. 
                -   Seperti yang dijelaskan dalam dokumentasi pipa Redis, ini adalah penggunaan tautan jaringan yang kurang optimal, 
                    terutama ketika tautan tersebut tidak terlalu berkinerja.
                -   TCP dan overhead jaringan berdampak negatif pada kinerja. Perintah terjebak dalam antrian kirim sampai yang sebelumnya dikirim dengan benar ke server. 
                    Ini adalah masalah yang dikenal sebagai pemblokiran Head-Of-Line (HOL).
                
                -   Dalam mode perpipaan otomatis, semua perintah yang dikeluarkan selama loop peristiwa diantrekan dalam alur yang dikelola secara otomatis oleh ioredis. 
                    Pada akhir iterasi, alur dijalankan dan dengan demikian semua perintah dikirim ke server secara bersamaan.
                -   Fitur ini dapat secara dramatis meningkatkan throughput dan menghindari pemblokiran HOL. Dalam tolok ukur kami, peningkatannya antara 35% dan 50%.
                -   Saat alur otomatis dijalankan, semua perintah baru akan diantrekan dalam alur baru yang akan dijalankan segera setelah sebelumnya selesai.
            */
      // enableAutoPipelining: true,

      // Antrian Offline
      /*
                -   Ketika perintah tidak dapat diproses oleh Redis (dikirim sebelum acara), secara default, perintah tersebut 
                    ditambahkan ke antrean offline dan akan menjadi dieksekusi ketika dapat diproses.
                -   Anda dapat menonaktifkan fitur ini dengan mengatur opsi ke : readyenableOfflineQueue false
            */
      // enableOfflineQueue: false,

      // Sambungkan kembali secara otomatis
      /*
                -   Secara default, semua perintah yang tertunda akan dihapus dengan kesalahan setiap 20 upaya coba lagi. 
                    Itu memastikan perintah tidak akan menunggu selamanya saat koneksi mati.
                -   Anda dapat mengubah perilaku ini dengan mengatur: maxRetriesPerRequest
            */
      maxRetriesPerRequest: 1,
      /*  
                -   Secara default, ioredis akan mencoba menyambung kembali ketika koneksi ke Redis terputus 
                    kecuali ketika koneksi ditutup secara manual oleh atau .redis.disconnect() redis.quit()
                -   Sangat fleksibel untuk mengontrol berapa lama menunggu untuk terhubung kembali setelah pemutusan menggunakan opsi: retryStrategy
                -   retryStrategy adalah fungsi yang akan dipanggil ketika koneksi terputus.
            */
      retryStrategy: (times) => {
        if (times > options.maxRetriesPerRequest)
          throw new Error(`[Redis] Could not connect after ${times} attempts`);
        return Math.min(times * 200, 1000);
      },

      // Sambungkan kembali pada Kesalahan
      /*
                -   Selain koneksi ulang otomatis saat koneksi ditutup, ioredis mendukung penyambungan kembali 
                    pada kesalahan Redis tertentu menggunakan opsi tersebut.
            */
      reconnectOnError(err) {
        const targetError = "READONLY";
        if (err.message.includes(targetError)) return true;
      },

      // Konfigurasi lainnya: https://www.npmjs.com/package/ioredis
    };

    if (config.port) options.port = config.port;
    if (config.username) options.username = config.username;
    if (config.password) options.password = config.password;
    if (config.database) options.db = config.database;

    // const redis = new Redis(process.env.REDIS_URL);
    const redis = new Redis(options);

    redis.on("connect", () =>
      console.info(
        "[Redis] Connecting: connection is established to the Redis server."
      )
    );
    redis.on("ready", () =>
      console.info(
        "[Redis] Connected & Ready: Redis server reports that it is ready to receive commands."
      )
    );
    redis.on("error", (error) =>
      console.warn(
        "[Redis] Error Connecting: error occurs while connecting.",
        error
      )
    );
    redis.on("close", () =>
      console.info("[Redis] Disconnected: Redis server connection has closed.")
    );
    redis.on("reconnecting", () =>
      console.info("[Redis] Reconnecting: reconnection will be made.")
    );
    redis.on("end", () =>
      console.info(
        "[Redis] Ended: no more reconnections will be made, or the connection is failed to establish."
      )
    );

    return redis;
  } catch (err) {
    throw new Error("[Redis] Could not create a Redis instance");
  }
}
