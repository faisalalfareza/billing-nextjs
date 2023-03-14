import { NextApiRequest, NextApiResponse } from "next";
import getConfig from "next/config";
import axios from "axios";

import redisIO from "../../../libraries/redis";

const { publicRuntimeConfig } = getConfig();

const isRedis: boolean = false;
const isRedisForSpecificAPI = {
  authenticate: true,
  informations: true,
  profiles: true,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let { method, query, body } = req;
  switch (method) {
    case "POST":
      body = JSON.parse(body);

      switch (query.method) {
        case "authenticate":
          authenticate(res, body);
          break;

        case "informations":
          getCurrentLoginInformations(res, body);
          break;

        case "permissions":
          getUserPermissions(res, body);
          break;

        case "profiles":
          getUserProfilePicture(res, body);
          break;
      }
      break;

    case "GET":
      break;
  }
}

async function authenticate(res, body) {
  const { userNameOrEmailAddress, password } = body;

  const key = `USER{${userNameOrEmailAddress}}-tokens`;
  // const isCached = await redisIO.exists(key);
  // if (isRedis && isRedisForSpecificAPI.authenticate && isCached) {
  //   // Using Redis (Remote Dictionary Server)
  //   const getLoggedInUser = await redisIO.get(key);
  //   // const getTTL = await redisIO.ttl(key);
  //   return res.send({
  //     isCached: [true, undefined],
  //     result: JSON.parse(getLoggedInUser),
  //   });
  // } else {
  // Using Back-end & Database (Normal Flow)
  const url = `${publicRuntimeConfig.apiUrl}/api/TokenAuth/Authenticate`;
  const config = {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    auth: {
      username: userNameOrEmailAddress,
      password: password,
    },
    xsrfCookieName: "XSRF-TOKEN",
    xsrfHeaderName: "X-XSRF-TOKEN",
  };

  axios
    .post(url, body, config)
    .then((response) => {
      const authenticateResult = response.data.result;
      const setTTL = {
        fromJWTTokenSetting: authenticateResult.expireInSeconds, // 86400 Second = 1440 Minute = 24 Hour = 1 Day
        fromOwnSetting: authenticateResult.expireInSeconds * 3, // Expires in how many days? Second Per Day * Day
      };

      // if (isRedis && isRedisForSpecificAPI.authenticate) {
      //   const saveToRedis = JSON.stringify({
      //     userNameOrEmailAddress: userNameOrEmailAddress,
      //     authenticateResult: authenticateResult,
      //   });
      //   redisIO.setex(
      //     key,
      //     setTTL.fromJWTTokenSetting,
      //     saveToRedis,
      //     (err, res_setex) => {
      //       if (err) throw new Error(`Error: ${err.message}`);
      //       else {
      //         // Successfully saved in Redis
      //       }
      //     }
      //   );
      // }

      return res.send({
        isCached: [false, setTTL],
        result: authenticateResult,
      });
    })
    .catch((error) =>
      res.send({
        isCached: [false, undefined],
        error: error,
      })
    );
  // }
}

async function getCurrentLoginInformations(res, body) {
  const { accessToken, expireInSeconds, userId } = body;

  const key = `USERID{${userId}}-informations`;
  // const isCached = await redisIO.exists(key);
  // if (isRedis && isRedisForSpecificAPI.informations && isCached) {
  //   // Using Redis (Remote Dictionary Server)
  //   const getInformations = await redisIO.get(key);
  //   return res.send({
  //     isCached: true,
  //     result: JSON.parse(getInformations),
  //   });
  // } else {
  // Using Back-end & Database (Normal Flow)
  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/Session/GetCurrentLoginInformations`;
  const config = {
    headers: {
      Authorization: "Bearer " + accessToken,
      "Access-Control-Allow-Origin": "*",
    },
  };

  axios
    .get(url, config)
    .then((response) => {
      const informationsResult = response.data.result;

      // if (isRedis && isRedisForSpecificAPI.authenticate) {
      //   const saveToRedis = JSON.stringify(informationsResult);
      //   redisIO.setex(key, expireInSeconds, saveToRedis, (err, res_setex) => {
      //     if (err) throw new Error(`Error: ${err.message}`);
      //     else {
      //       // Successfully saved in Redis
      //     }
      //   });
      // }

      res.send({
        isCached: false,
        result: informationsResult,
      });
    })
    .catch((error) =>
      res.send({
        isCached: false,
        error: error,
      })
    );
  // }
}
async function getUserPermissions(res, body) {
  const { accessToken, expireInSeconds } = body;

  const url = `${publicRuntimeConfig.apiUrl}/AbpUserConfiguration/GetAll`;
  const config = {
    headers: {
      Authorization: "Bearer " + accessToken,
      "Access-Control-Allow-Origin": "*",
    },
  };

  axios
    .get(url, config)
    .then((response) =>
      res.send({
        isCached: false,
        result: response.data.result.auth,
      })
    )
    .catch((error) =>
      res.send({
        isCached: false,
        error: error,
      })
    );
}
async function getUserProfilePicture(res, body) {
  const { accessToken, expireInSeconds, userId } = body;

  const key = `USERID{${userId}}-profiles`;
  const isCached = await redisIO.exists(key);
  if (isRedis && isRedisForSpecificAPI.profiles && isCached) {
    // Using Redis (Remote Dictionary Server)
    const getProfiles = await redisIO.get(key);
    return res.send({
      isCached: true,
      result: JSON.parse(getProfiles),
    });
  } else {
    // Using Back-end & Database (Normal Flow)
    const url = `${publicRuntimeConfig.apiUrl}/api/services/app/Profile/GetProfilePicture`;
    const config = {
      headers: {
        Authorization: "Bearer " + accessToken,
        "Access-Control-Allow-Origin": "*",
      },
    };

    axios
      .get(url, config)
      .then((response) => {
        const profilesResult = response.data.result;

        if (isRedis && isRedisForSpecificAPI.profiles) {
          const saveToRedis = JSON.stringify(profilesResult);
          redisIO.setex(key, expireInSeconds, saveToRedis, (err, res_setex) => {
            if (err) throw new Error(`Error: ${err.message}`);
            else {
              // Successfully saved in Redis
            }
          });
        }

        res.send({
          isCached: false,
          result: profilesResult,
        });
      })
      .catch((error) =>
        res.send({
          isCached: false,
          error: error,
        })
      );
  }
}
