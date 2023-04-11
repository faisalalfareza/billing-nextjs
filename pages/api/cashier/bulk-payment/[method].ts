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
    case "listPaymentMethod":
      getDropdownPaymentMethod(res, body);
      break;
    
    case "uploadBulkPayment":
      uploadBulkPayment(res, body);
      break;
  }
}

async function getDropdownPaymentMethod(res: any, body: any) {
  const { accessToken } = body;
  
  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/CashierSystem/GetDropdownPaymentMethod`;
  const config = {
    headers: {
      "Authorization": "Bearer " + accessToken,
      "Access-Control-Allow-Origin": "*",
    },
  };

  axios
    .get(url, config)
    .then((response) => res.send(response.data.result))
    .catch((error) => res.send({ error: error }));
}

async function uploadBulkPayment(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/CashierSystem/UploadBulkPayment`;
  const config = {
    headers: {
      "Authorization": "Bearer " + accessToken,
      "Access-Control-Allow-Origin": "*",
    },
    params: params,
  };

  axios
    .post(url, params, config)
    .then((response) => res.send(response.data.success))
    .catch((error) => res.send({ error: error }));
}
