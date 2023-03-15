import Redis, { RedisOptions } from "ioredis";

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
            showFriendlyErrorStack: (process.env.NODE_ENV === "development" ? true : false),

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
                if (times > 3) {
                    throw new Error("[Redis] Could not connect after ${times} attempts");
                } return Math.min(times * 200, 1000);
            },

            // Sambungkan kembali pada Kesalahan
            /*
                -   Selain koneksi ulang otomatis saat koneksi ditutup, ioredis mendukung penyambungan kembali 
                    pada kesalahan Redis tertentu menggunakan opsi tersebut.
            */
            reconnectOnError(err) {
                const targetError = "READONLY";
                if (err.message.includes(targetError)) {
                    // Only reconnect when the error contains "READONLY"
                    return true; // or `return 1;`
                }
            },

            // Konfigurasi lainnya: https://www.npmjs.com/package/ioredis
        };
        
        if (config.port) options.port = config.port;
        if (config.username) options.username = config.username;
        if (config.password) options.password = config.password;
        if (config.database) options.db = config.database;

        // const redis = new Redis(process.env.REDIS_URL);
        const redis = new Redis(options);

        redis.on('connect', () => console.info('[Redis] Connecting: connection is established to the Redis server.'));
        redis.on('ready', () => console.info('[Redis] Connected & Ready: Redis server reports that it is ready to receive commands.'));
        redis.on('error', (error) => console.warn('[Redis] Error Connecting: error occurs while connecting.', error));
        redis.on('close', () => console.info("[Redis] Disconnected: Redis server connection has closed."));
        redis.on('reconnecting', () => console.info("[Redis] Reconnecting: reconnection will be made."));
        redis.on('end', () => console.info("[Redis] Ended: no more reconnections will be made, or the connection is failed to establish."));

        return redis;
    } catch (err) {
        throw new Error("[Redis] Could not create a Redis instance");
    }
}

// async function executeRedisIO() {
//   console.clear();
//   console.log(
//     "\nREDIS (REMOTE DICTIONARY SERVER)\n" +
//       "  MEMORY-BASED/RAM KEY-VALUE DATABASE MODEL, USED FOR CACHING)\n" +
//       "  TESTING BY FAISAL A USING IOREDIS (REDIS CLIENT FOR NODEJS): \n"
//   );

//   console.log("✅ CONNECTION / KONEKSI,\nConnection between redis client and server.");
//     const testPing = await redisIO.ping();
//     if (testPing != "PONG") {
//       await redisIO.connect();
//     } console.log("————TESTING CONNECTION TO REDIS (PING) =", testPing + (testPing == "PONG" ? " (CONNECTED)" : "(NOT-CONNECTED)"));

//   console.log("\n✅ BASIC COMMANDS / PERINTAH DASAR,\nThe most frequently used command.");
//   var selectedKeys = ["user3", "userFaisal"];
//   var selectedKeyToView = selectedKeys[selectedKeys.unshift() - 1].toString();

//   const isSelectedKeyToViewExist = await redisIO.exists(selectedKeyToView);
//   console.log("————CHECKING KEY (EXIST) " + selectedKeyToView + " =", isSelectedKeyToViewExist + (isSelectedKeyToViewExist == 0 ? " (NOT EXIST)" : " (ALREADY SETTED)"));
//   if (isSelectedKeyToViewExist == 0) {
//     redisIO
//       .set(selectedKeyToView, JSON.stringify({ username: "admin", password: "drowssap1!" }))
//       .then((result_set) => console.log("————CREATING KEY " + selectedKeyToView + " =", result_set));
//   }

//   // await redisIO.del("keyB");
//   // await redisIO.mset({ keyA: "Value of A", keyB: "Value of B" });

//   const getKeys = await redisIO.keys("*");
//   console.log("————GETTING ALL KEYS (KEYS PATTERN *) =", getKeys);

//   redisIO
//     .mget(selectedKeys)
//     .then((result_mget) => console.log("————SELECTING MULTIPLE KEY (MGET) " + selectedKeys.toString() + " =", result_mget));

//   redisIO
//     .get(selectedKeyToView)
//     .then((result_get) => {
//       console.log("————SELECTING SINGLE KEY (GET) " + selectedKeyToView + " =", result_get);

//       console.log("\n✅ EXPIRATION / KADALUWARSA,\nDelete data in redis automatically after a certain time/use expiration date.");
//       redisIO
//         .ttl("userForExpiration")
//         .then((result_ttl) => {
//           if ((result_ttl == -1) || result_ttl == -2) {
//             console.log("————KEY userForExpiration HAS EXPIRED, CREATING NEW AGAIN");
//             redisIO
//               .setex("userForExpiration", 30, "Created to expire after 30 seconds/half a minute using setex(), and modified to 60 seconds/a minute using expire()")
//               .then((result_setex) => {
//                 redisIO.expire("userForExpiration", 60);
//                 console.log("————CREATING KEY userForExpiration WITH EXPIRATION =", 60 + " second");
//                 redisIO
//                   .get("userForExpiration")
//                   .then((result_get) => {
//                     console.log("————SELECTING EXPIRATION KEY (GET) userForExpiration =", result_get);
//                     redisIO
//                       .ttl("userForExpiration")
//                       .then((result_ttl_new) => console.log("————GETTING TIME TO LIVE OF KEY userForExpiration (TTL) =", result_ttl_new));
//                   });
//               });
//           } else {
//             console.log("————KEY userForExpiration NOTYET EXPIRED, CHECK TTL");
//             redisIO
//               .get("userForExpiration")
//               .then((result_get) => {
//                 console.log("————SELECTING EXPIRATION KEY (GET) userForExpiration =", result_get);
//                 console.log("————GETTING TIME TO LIVE OF KEY userForExpiration (TTL) =", result_ttl);

                // console.log("\n✴️ FLUSH, Database clean-up.");
                // // redisIO.flushdb(); redisIO.flushall();

                // redisIO
                //     .pipeline()
                //     .set("userForPipeline", "Created to test the pipeline.")
                //     .get("userForPipeline", (err, result_get_pipeline) => {})
                //     .del("userForPipeline")
                //     .exec((err, result_exec_pipeline) => {});
                
                // const promise = redisIO
                //     .pipeline()
                //     .set("userForPipeline", "Created to test the pipeline.")
                //     .get("userForPipeline")
                //     .del("userForPipeline")
                //     .exec();
                // promise.then((result_exec_pipeline) => {});
                
                // redisIO
                //     .pipeline([
                //         ["set", "userForPipeline", "Created to test the pipeline."],
                //         ["get", "userForPipeline"]
                //     ])
                //     .exec(() => {});

//                 const pipeline = redisIO.pipeline(); // redisIO.pipeline({ pipeline: false });
//                 pipeline.set("userForPipeline", "Created to test the pipeline.");
//                 pipeline.get("userForPipeline"), pipeline.del("userForPipeline");
//                 pipeline
//                   .exec()
//                   .then((result_exec_pipeline) => {
//                     console.log("✅ PIPELINE, Multiple commands in one request (bulk/batch).");

                    // redis
                    // .pipeline()
                    // .get("foo")
                    // .multi()
                    // .set("foo", "bar")
                    // .get("foo")
                    // .exec()
                    // .get("foo")
                    // .exec();

//                     const transaction = redisIO.multi();
//                     transaction.set("userForTransaction", "Created to test the transaction.");
//                     transaction.get("userForTransaction"), transaction.del("userForTransaction");
//                     transaction
//                       .exec((err, result_exec_transaction) => {
//                         if (err) transaction.discard();
//                         else {
//                           console.log("✅ TRANSACTION, Multiple commands are considered successfull if the whole command is successfull. Otherwise, then the whole is declared as failure.");

//                           console.log("✴️ PERSISTANCE, Save/back up data from memory/RAM/temporary storage to hard drive/main storage, this is only for certain needs.");
//                           // redisIO.save(); redisIO.bgsave();

//                           console.log("✴️ EVICTION, Automatically delete rarely used data, preventing failed saves due to full memory.");
//                         }
//                       })
//                   });
//               });
//           }
//         });
//   });
// }

// import { Client, Entity, Schema, Repository } from "redis-om";
// const redisOM = new Client();

// async function connect() {
//   if (!redisOM.isOpen()) {
//     await redisOM.open(process.env.REDIS_URL);
//     const testPing = await redisOM.execute(['PING']); console.log("REDIS TEST PING = ", testPing);
//     const testGet = await redisOM.execute(['GET', 'user1']); console.log("REDIS TEST GET = ", testGet);
//   }
// }
