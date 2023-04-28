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
        case "reportinvoice":
          getReportInvoice(res, body);
          break;
      }
      break;
  }
}

async function getReportInvoice(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/Report/ReportInvoice`;
  const config = {
    headers: {
      Authorization: "Bearer " + accessToken,
      "Access-Control-Allow-Origin": "*",
    },
    params: params,
  };

  axios
    .post(url, params, config)
    .then((response) =>
      res.send({
        result: response.data.result,
      })
    )
    .catch((error) => {
      res.send({
        error: error.response.data,
      });
    });
}
