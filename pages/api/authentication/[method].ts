import { NextApiRequest, NextApiResponse } from "next";
import getConfig from "next/config";
import axios from "axios";
import redisIO, { isRedis } from "../../../libraries/redis";
import { typeNormalization } from "../../../helpers/utils";

const { publicRuntimeConfig } = getConfig();
const isRedisForSpecificAPI = {
  authenticate: isRedis && true,
  informations: isRedis && true,
  profiles: isRedis && true
}
export const config = {
  api: {
    // Penyelesai Eksternal (External Resolver)
    // https://nextjs.org/docs/api-routes/request-helpers#custom-config
    // externalResolver adalah bendera eksplisit yang memberi tahu server bahwa rute ini sedang ditangani oleh penyelesai eksternal seperti Express atau Connect. Mengaktifkan opsi ini akan menonaktifkan peringatan untuk permintaan yang belum terselesaikan.
    // Ini adalah peringatan palsu karena dalam kode yang diberikan Anda selalu mengembalikan respons. Hanya saja Next.js tidak mengetahuinya. (NOTA: Jika Anda yakin bahwa Anda mengembalikan respons dalam setiap kasus, Anda dapat menonaktifkan peringatan untuk permintaan yang belum terselesaikan.)
    externalResolver: true
  },
}

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
          gatewayOfAuthentication(res, parsedBody);
          break;

        case "informations":
          gatewayOfUserInformations(res, parsedBody);
          break;
        
        case "permissions":
          gatewayOfUserPermissions(res, parsedBody);
          break;
        
        case "profiles":
          gatewayOfUserProfile(res, parsedBody);
          break;
      }
      break;

    case "GET":
      break;
  }
}

async function gatewayOfAuthentication(res: NextApiResponse, body: any) {
  // Using Back-end & Database (Normal Flow)
  if (!isRedis) authenticate(res, body);
  // Using Redis (Remote Dictionary Server) OR Back-end & Database (Normal Flow)
  else {
    const { userNameOrEmailAddress, password } = body;

    const key = `USER{${userNameOrEmailAddress}}-tokens`;
    const isCached = redisIO && await redisIO.exists(key);
    
    if (isRedisForSpecificAPI.authenticate && isCached) {
      const getLoggedInUser = redisIO && await redisIO.get(key);
      return res.send({
        isCached: [true, undefined],
        result: typeNormalization(getLoggedInUser)
      });
    } else authenticate(res, body, key);
  }
}
function authenticate(res: NextApiResponse, body: any, key?: any) {
  const { userNameOrEmailAddress, password } = body;

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
        fromOwnSetting: (authenticateResult.expireInSeconds * 3) // Expires in how many days? Second Per Day * Day
      }

      if (isRedisForSpecificAPI.authenticate) {
        redisIO && redisIO.setex(
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
        result: authenticateResult
      });
    })
    .catch((error) =>
      res.send({
        isCached: [false, undefined],
        error: error
      })
    );
}

async function gatewayOfUserInformations(res: NextApiResponse, body: any) {
  // Using Back-end & Database (Normal Flow)
  if (!isRedis) getCurrentLoginInformations(res, body);
  // Using Redis (Remote Dictionary Server) OR Back-end & Database (Normal Flow)
  else { 
    const { userId } = body;

    const key = `USERID{${userId}}-informations`;
    const isCached = redisIO && await redisIO.exists(key);
  
    if ((isRedis && isRedisForSpecificAPI.informations) && isCached) {
      const getInformations = redisIO && await redisIO.get(key);
      return res.send({
        isCached: true,
        result: typeNormalization(getInformations)
      });
    } else getCurrentLoginInformations(res, body, key);
  }
}
function getCurrentLoginInformations(res: NextApiResponse, body: any, key?: any) {
  const { accessToken, expireInSeconds } = body;

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

      if (isRedisForSpecificAPI.informations) {
        redisIO && redisIO.setex(
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
        result: informationsResult
      })
    })
    .catch((error) => 
      res.send({
        isCached: false,
        error: error
      })
    );
}

function gatewayOfUserPermissions(res: NextApiResponse, body: any) {
  getUserPermissions(res, body);
}
function getUserPermissions(res: NextApiResponse, body: any) {
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
        result: response.data.result.auth
      })
    )
    .catch((error) => 
      res.send({
        isCached: false,
        error: error
      })
    );
}

async function gatewayOfUserProfile(res: NextApiResponse, body: any) {
  // Using Back-end & Database (Normal Flow)
  if (!isRedis) getUserProfilePicture(res, body);
  // Using Redis (Remote Dictionary Server) OR Back-end & Database (Normal Flow)
  else { 
    const { userId } = body;

    const key = `USERID{${userId}}-profiles`;
    const isCached = redisIO && await redisIO.exists(key);
  
    if (isRedisForSpecificAPI.profiles && isCached) {
      const getProfiles = redisIO && await redisIO.get(key);
      return res.send({
        isCached: true,
        result: typeNormalization(getProfiles)
      });
    }
    else getUserProfilePicture(res, body, key);
  }
}
function getUserProfilePicture(res: NextApiResponse, body: any, key?: any) {
  const { accessToken, expireInSeconds } = body;

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
        redisIO && redisIO.setex(
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
        result: profilesResult
      })
    })
    .catch((error) => 
      res.send({
        isCached: false,
        error: error
      })
    );
}