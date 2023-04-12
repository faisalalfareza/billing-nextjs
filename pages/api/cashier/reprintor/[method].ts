import { NextApiRequest, NextApiResponse } from "next";
import getConfig from "next/config";
import axios from "axios";

const { publicRuntimeConfig } = getConfig();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let { query, body } = req;
  body = JSON.parse(body);

  switch (query.method) {
    case "listCustomer":
      getCustomerList(res, body);
      break;

    case "listOR":
      getListOfficialReceipt(res, body);
      break;

    case "reprintOR":
      reprintOfficialReceipt(res, body);
      break;
  }
}

async function getCustomerList(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/CashierSystem/GetCustomerList`;
  const config = {
    headers: {
      Authorization: "Bearer " + accessToken,
      "Access-Control-Allow-Origin": "*",
    },
    params: params,
  };

  axios
    .get(url, config)
    .then((response) => res.send(response.data.result))
    .catch((error) => res.send({ error: error }));
}

async function getListOfficialReceipt(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/CashierSystem/GetListOfficialReceipt`;
  const config = {
    headers: {
      Authorization: "Bearer " + accessToken,
      "Access-Control-Allow-Origin": "*",
    },
    params: params,
  };

  axios
    .get(url, config)
    .then((response) => res.send(response.data.result))
    .catch((error) => res.send({ error: error.response.data }));
}
async function reprintOfficialReceipt(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/CashierSystem/ReprintOfficialReceipt`;
  const config = {
    headers: {
      Authorization: "Bearer " + accessToken,
      "Access-Control-Allow-Origin": "*",
    },
    params: params,
  };

  axios
    .post(url, params, config)
    .then((response) => res.send(response.data.result))
    .catch((error) => res.send({ error: error }));
}
