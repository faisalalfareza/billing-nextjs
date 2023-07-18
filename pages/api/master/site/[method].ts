import { NextApiRequest, NextApiResponse } from "next";
import getConfig from "next/config";
import axios from "axios";

const { publicRuntimeConfig } = getConfig();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let { method, query, body } = req;
  body = JSON.parse(body);
  switch (method) {
    case "POST":
      switch (query.method) {
        case "getlistmastersite":
          getList(res, body);
          break;

        case "getdropdownproject":
          getDropdownProject(res, body);
          break;

        case "getdropdownclusterbyproject":
          getDropdownCluster(res, body);
          break;
        case "creatmastersite":
          create(res, body);
          break;
        case "getdropdownclusterbyprojectengine3":
          getDropdownClusterByProjectEngine3(res, body);
          break;
      }
      break;
  }
}

async function getList(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/MasterBilling/GetListMasterSite`;
  const config = {
    headers: {
      Authorization: "Bearer " + accessToken,
      "Access-Control-Allow-Origin": "*",
    },
    params: params,
  };

  axios
    .get(url, config)
    .then((response) =>
      res.send({
        result: response.data.result.items,
      })
    )
    .catch((error) =>
      res.send({
        error: error,
      })
    );
}
async function getDropdownProject(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/BillingSystems/GetDropdownProject`;
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
        result: response.data.result,
      })
    )
    .catch((error) =>
      res.send({
        error: error,
      })
    );
}

async function getDropdownCluster(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/BillingSystems/GetDropdownClusterByProject`;
  const config = {
    headers: {
      Authorization: "Bearer " + accessToken,
      "Access-Control-Allow-Origin": "*",
    },
    params: params,
  };

  axios
    .get(url, config)
    .then((response) =>
      res.send({
        result: response.data.result,
      })
    )
    .catch((error) =>
      res.send({
        error: error,
      })
    );
}

async function create(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/MasterBilling/CreatMasterSite`;
  const config = {
    headers: {
      Authorization: "Bearer " + accessToken,
      "Access-Control-Allow-Origin": "*",
    },
  };

  axios
    .post(url, params, config)
    .then((response) => {
      res.send({
        result: response.data.result,
      });
    })
    .catch((error) => {
      res.send({
        error: error,
      });
    });
}
async function getDropdownClusterByProjectEngine3(res: any, body: any) {
  const { accessToken, params } = body;
  // const url = `${publicRuntimeConfig.apiUrl}/api/services/app/BillingSystems/GetDropdownClusterByProjectEngine3`;
  const url = `${
    publicRuntimeConfig.apiUrl
  }/api/services/app/BillingSystems/GetDropdownClusterByProjectEngine3?ProjectId=${params.ProjectId.join(
    "&ProjectId="
  )}`;
  const config = {
    headers: {
      Authorization: "Bearer " + accessToken,
      "Access-Control-Allow-Origin": "*",
    },
    // params: params,
  };
  console.log("config----", config);
  axios
    .get(url, config)
    .then((response) =>
      res.send({
        result: response.data.result,
      })
    )
    .catch((error) =>
      res.send({
        error: error,
      })
    );
}

function parseParams(params: { [x: string]: any[] }) {
  const keys = Object.keys(params);
  let options = "";

  keys.forEach((key) => {
    const isParamTypeObject = typeof params[key] === "object";
    const isParamTypeArray = isParamTypeObject && params[key].length >= 0;

    if (!isParamTypeObject) {
      options += `${key}=${params[key]}&`;
    }

    if (isParamTypeObject && isParamTypeArray) {
      params[key].forEach((element) => {
        options += `${key}=${element}&`;
      });
    }
  });

  return options ? options.slice(0, -1) : options;
}
