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
    case "getdropdownpaymentmethod":
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
      Authorization: "Bearer " + accessToken,
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
      Authorization: "Bearer " + accessToken,
      "Access-Control-Allow-Origin": "*",
    },
    params: params,
  };

  axios
    .post(url, params, config)
    .then((response) => res.send(response.data))
    .catch((error) => res.send({ error: error.response.data }));
}
