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
  let { method, query, body } = req;
  body = JSON.parse(body);
  switch (method) {
    case "POST":
      switch (query.method) {
        case "getlistmasterperiod":
          getList(res, body);
          break;

        case "getdropdownproject":
          getDropdownProject(res, body);
          break;

        case "getdropdownsite":
          getDropdownSite(res, body);
          break;

        case "getlastperiodno":
          getPeriodNo(res, body);
          break;
        case "createmasterperiod":
          create(res, body);
          break;
        case "prosesupdatemasterperiod":
          update(res, body);
          break;
      }
      break;
  }
}

async function getList(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/MasterBilling/GetListMasterPeriod`;
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
        result: response.data.result.items,
      })
    )
    .catch((error) =>
      res.send({
        error: error,
      })
    );
}
async function getDropdownSite(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/BillingSystems/GetDropdownSite`;
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

async function getPeriodNo(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/MasterBilling/GetLastPeriodNo`;
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

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/MasterBilling/CreateMasterPeriod`;
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
      console.log("error-----", error.response.data);
      res.send({
        error: error.response.data,
      });
    });
}

async function update(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/MasterBilling/ProsesUpdateMasterPeriod`;
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
    .catch((error) => {
      console.log("error----", error);
      res.send({
        error: error,
      });
    });
}
