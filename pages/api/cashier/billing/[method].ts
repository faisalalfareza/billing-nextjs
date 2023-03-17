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
        case "list":
          getList(res, body);
          break;

        case "detail":
          getDetail(res, body);
          break;

        case "dropdownpayment":
          getDropdownPayment(res, body);
          break;

        case "dropdownbank":
          getDropdownBank(res, body);
          break;
        case "create":
          create(res, body);
          break;
        case "update":
          update(res, body);
          break;
      }
      break;

    case "GET":
      switch (query.method) {
      }
      break;
      break;
  }
}

async function getList(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/CashierSystem/GetCustomerList`;
  const config = {
    headers: {
      Authorization: "Bearer " + accessToken,
      "Access-Control-Allow-Origin": "*",
    },
    params: params,
  };
  console.log("config----", config);

  axios
    .get(url, config)
    .then((response) =>
      res.send({
        isCached: false,
        result: response.data.result.items,
      })
    )
    .catch((error) =>
      res.send({
        isCached: false,
        error: error,
      })
    );
}

async function getDetail(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/CashierSystem/GetPaymentDetailByPsCode`;
  const config = {
    headers: {
      Authorization: "Bearer " + accessToken,
      "Access-Control-Allow-Origin": "*",
    },
    params: params,
  };
  console.log("config----", config);

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
async function getDropdownPayment(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/CashierSystem/GetDropdownPaymentMethod`;
  const config = {
    headers: {
      Authorization: "Bearer " + accessToken,
      "Access-Control-Allow-Origin": "*",
    },
  };
  console.log("upil----", config);

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

async function getDropdownBank(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/CashierSystem/GetDropdownBank`;
  const config = {
    headers: {
      Authorization: "Bearer " + accessToken,
      "Access-Control-Allow-Origin": "*",
    },
  };
  console.log("upil----", config);

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

async function getPeriodNo(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/CashierSystem/GetLastPeriodNo`;
  const config = {
    headers: {
      Authorization: "Bearer " + accessToken,
      "Access-Control-Allow-Origin": "*",
    },
    params: params,
  };
  console.log("config----", config);

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

async function create(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/CashierSystem/CreateMasterPeriod`;
  const config = {
    headers: {
      Authorization: "Bearer " + accessToken,
      "Access-Control-Allow-Origin": "*",
    },
  };
  console.log("config----", config);

  console.log("body---", params);

  axios
    .post(url, params, config)
    .then((response) => {
      console.log("response-----", response);
      res.send({
        isCached: false,
        result: response.data.result,
      });
    })
    .catch((error) => {
      console.log("err-----", error.response);
      res.send({
        isCached: false,
        error: error,
      });
    });
}

async function update(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/CashierSystem/UpdateMasterPeriod`;
  const config = {
    headers: {
      Authorization: "Bearer " + accessToken,
      "Access-Control-Allow-Origin": "*",
    },
    params: params,
  };
  console.log("config----", config);

  axios
    .put(url, params, config)
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
