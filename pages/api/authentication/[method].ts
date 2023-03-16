import { NextApiRequest, NextApiResponse } from "next";
import getConfig from "next/config";
import axios from "axios";
import redisIO from "../../../libraries/redis";
import { typeNormalization } from "../../../helpers/utils";

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
  const { method, query, body } = req;

  switch (method) {
    case "POST":
      const parsedBody = JSON.parse(body);

      switch (query.method) {
        case "authenticate":
          authenticate(res, parsedBody);
          break;

        case "informations":
          getCurrentLoginInformations(res, parsedBody);
          break;

        case "permissions":
          getUserPermissions(res, parsedBody);
          break;

        case "profiles":
          getUserProfilePicture(res, parsedBody);
          break;
      }
      break;

    case "GET":
      break;
  }
}

async function authenticate(res: NextApiResponse, body: any) {
  const { userNameOrEmailAddress, password } = body;

  const key = `USER{${userNameOrEmailAddress}}-tokens`;
  const isCached = await redisIO.exists(key);

  // Using Redis (Remote Dictionary Server)
  if (isRedis && isRedisForSpecificAPI.authenticate && isCached) {
    const getLoggedInUser = await redisIO.get(key);
    return res.send({
      isCached: [true, undefined],
      result: typeNormalization(getLoggedInUser)
    });
  }
  // Using Back-end & Database (Normal Flow)
  else {
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

        if (isRedis && isRedisForSpecificAPI.authenticate) {
          redisIO.setex(
            key,
            setTTL.fromJWTTokenSetting,
            JSON.stringify({
              userNameOrEmailAddress: userNameOrEmailAddress,
              authenticateResult: authenticateResult,
            }),
            (err, res_setex) => {
              if (err) throw new Error(`Error: ${err.message}`);
            }
          );
        }

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
  }
}

async function getCurrentLoginInformations(res: NextApiResponse, body) {
  const { accessToken, expireInSeconds, userId } = body;

  const key = `USERID{${userId}}-informations`;
  const isCached = await redisIO.exists(key);

  // Using Redis (Remote Dictionary Server)
  if (isRedis && isRedisForSpecificAPI.informations && isCached) {
    const getInformations = await redisIO.get(key);
    return res.send({
      isCached: true,
      result: typeNormalization(getInformations),
    });
  }
  // Using Back-end & Database (Normal Flow)
  else {
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

        if (isRedis && isRedisForSpecificAPI.informations) {
          redisIO.setex(
            key,
            expireInSeconds,
            JSON.stringify(informationsResult),
            (err, res_setex) => {
              if (err) throw new Error(`Error: ${err.message}`);
              else {
                // Successfully saved in Redis
              }
            }
          );
        }

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
  }
}
async function getUserPermissions(res: NextApiResponse, body: any) {
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
async function getUserProfilePicture(res: NextApiResponse, body: any) {
  const { accessToken, expireInSeconds, userId } = body;

  const key = `USERID{${userId}}-profiles`;
  const isCached = await redisIO.exists(key);

  // Using Redis (Remote Dictionary Server)
  if (isRedis && isRedisForSpecificAPI.profiles && isCached) {
    const getProfiles = await redisIO.get(key);
    return res.send({
      isCached: true,
      result: typeNormalization(getProfiles),
    });
  }
  // Using Back-end & Database (Normal Flow)
  else {
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
          redisIO.setex(
            key,
            expireInSeconds,
            JSON.stringify(profilesResult),
            (err, res_setex) => {
              if (err) throw new Error(`Error: ${err.message}`);
              else {
                // Successfully saved in Redis
              }
            }
          );
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
