import { NextApiRequest, NextApiResponse } from "next";
import getConfig from "next/config";
import axios from "axios";

import redisIO from "../../../libraries/redis";

const { publicRuntimeConfig } = getConfig();
const isRedis = true;

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
          getCurrentLoginInformations(res, body.accessToken);
          break;

        case "permissions":
          getUserPermissions(res, body.accessToken);
          break;

        case "profiles":
          getUserProfilePicture(res, body.accessToken);
          break;
      }
      break;

    case "GET":
      break;
  }
}

async function authenticate(res, credential) {
  console.log("rene------");
  const key = `${credential.userNameOrEmailAddress}-tokens`;
  // const isUserCached = await redisIO.exists(key);
  // if (isRedis && isUserCached) {
  //   // Using Redis (Remote Dictionary Server)
  //   const getLoggedInUser = await redisIO.get(
  //     credential.userNameOrEmailAddress
  //   );
  //   return res.send({
  //     isCached: true,
  //     result: JSON.parse(getLoggedInUser),
  //   });
  // } else {
  // Using Back-end & Database (Normal Flow)
  const url = `${publicRuntimeConfig.apiUrl}/api/TokenAuth/Authenticate`;
  console.log("url----", url);
  const config = {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    auth: {
      username: credential.userNameOrEmailAddress,
      password: credential.password,
    },
    xsrfCookieName: "XSRF-TOKEN",
    xsrfHeaderName: "X-XSRF-TOKEN",
  };

  axios
    .post(url, credential, config)
    .then((response) => {
      const authenticateResult = response.data.result;

      // if (isRedis) {
      //   const saveToRedis = JSON.stringify({
      //     userNameOrEmailAddress: credential.userNameOrEmailAddress,
      //     authenticateResult: authenticateResult,
      //   });
      //   redisIO.setex(
      //     key,
      //     authenticateResult.expireInSeconds, // 86400 * 3,
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
        isCached: false,
        result: authenticateResult,
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

async function getCurrentLoginInformations(res, accessToken) {
  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/Session/GetCurrentLoginInformations`;
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
        result: response.data.result,
      })
    )
    .catch((error) =>
      res.send({
        isCached: false,
        error: error,
      })
    );
}
async function getUserPermissions(res, accessToken) {
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
async function getUserProfilePicture(res, accessToken) {
  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/Profile/GetProfilePicture`;
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
        result: response.data.result,
      })
    )
    .catch((error) =>
      res.send({
        isCached: false,
        error: error,
      })
    );
}
