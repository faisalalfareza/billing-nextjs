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
        case "getall":
          getList(res, body);
          break;

        case "upload":
          uploadImage(res, body);
          break;

        case "getdropdownmastertemplate":
          getDropdownMasterTemplate(res, body);
          break;
        case "uploadexcelnewunititem":
          create(res, body);
          break;
        case "prosesupdatemasterunititem":
          update(res, body);
          break;
        case "getdetaillistmsunititem":
          getDetailListMsUnitItem(res, body);
          break;
        case "geturlcontent":
          getUrlContent(res, body);
          break;
      }
      break;
  }
}

async function getList(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/User/GetAll`;
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
async function uploadImage(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/Temp/Downloads/LogoSite`;
  const config = {
    headers: {
      Authorization: "Bearer " + accessToken,
      "Access-Control-Allow-Origin": "*",
    },
  };

  axios
    .post(url, params, config)
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

async function getDropdownMasterTemplate(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/MasterBilling/GetDropdownMasterTemplate`;
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

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/MasterBilling/UploadExcelNewUnitItem`;
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
        error: error.response.data,
      });
    });
}

async function update(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/MasterBilling/ProsesUpdateMasterUnitItem`;
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
        error: error.response.data,
      });
    });
}

async function getDetailListMsUnitItem(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/MasterBilling/GetDetailListMsUnitItem`;
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

async function getUrlContent(res: any, body: any) {
  const { accessToken, params, urlFile } = body;
  const url = urlFile.replace(/\\/g, "/");

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
        result: response.data,
      })
    )
    .catch((error) =>
      res.send({
        error: error.response.data,
      })
    );
}
