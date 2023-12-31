import { NextApiRequest, NextApiResponse } from "next";
import getConfig from "next/config";
import axios from "axios";

const { publicRuntimeConfig } = getConfig();

export const config = {
  api: {
    // Penyelesai Eksternal (External Resolver)
    // https://nextjs.org/docs/api-routes/request-helpers#custom-config
    // externalResolver adalah bendera eksplisit yang memberi tahu server bahwa rute ini sedang ditangani oleh penyelesai eksternal seperti Express atau Connect. Mengaktifkan opsi ini akan menonaktifkan peringatan untuk permintaan yang belum terselesaikan.
    // Ini adalah peringatan palsu karena dalam kode yang diberikan Anda selalu mengembalikan respons. Hanya saja Next.js tidak mengetahuinya. (NOTA: Jika Anda yakin bahwa Anda mengembalikan respons dalam setiap kasus, Anda dapat menonaktifkan peringatan untuk permintaan yang belum terselesaikan.)
    externalResolver: true,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let { query, body } = req;
  body = JSON.parse(body);

  switch (query.method) {
    case "getcustomerlist":
      getCustomerList(res, body);
      break;

    case "getlistcancelpayment":
      getListCancelPayment(res, body);
      break;

    case "getdetailcancelpayment":
      getDetailCancelPayment(res, body);
      break;

    case "cancelpayment":
      cancelPayment(res, body);
      break;
  }
}

async function getCustomerList(res: any, body: any) {
  const { params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/CashierSystem/GetCustomerList`;
  const config = {
    headers: { "Access-Control-Allow-Origin": "*" },
    params: params,
  };

  axios
    .get(url, config)
    .then((response) => res.send(response.data.result))
    .catch((error) => res.send({ error: error }));
}
async function getListCancelPayment(res: any, body: any) {
  const { params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/CashierSystem/GetListCancelPayment`;
  const config = {
    headers: { "Access-Control-Allow-Origin": "*" },
    params: params,
  };

  axios
    .get(url, config)
    .then((response) => res.send(response.data.result))
    .catch((error) => res.send({ error: error.response.data }));
}
async function getDetailCancelPayment(res: any, body: any) {
  const { params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/CashierSystem/GetDetailCancelPayment`;
  const config = {
    headers: { "Access-Control-Allow-Origin": "*" },
    params: params,
  };
  axios
    .get(url, config)
    .then((response) => res.send(response.data.result))
    .catch((error) => res.send({ error: error.response.data }));
}

async function cancelPayment(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/CashierSystem/CancelPayment`;
  const config = {
    headers: {
      Authorization: "Bearer " + accessToken,
      "Access-Control-Allow-Origin": "*",
    },
    params: params,
  };

  axios
    .post(url, params, config)
    .then((response) => res.send(response.data.success))
    .catch((error) => res.send({ error: error }));
}
