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
        case "dropdownproject":
          getDropdownProject(res, body);
          break;
        case "update":
          update(res, body);
          break;
        case "export":
          exportExcel(res, body);
          break;
        case "activePeriod":
          getActivePeriod(res, body);
          break;
        case "upload":
          uploadExcel(res, body);
          break;
      }
      break;
  }
}

async function getList(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/BillingSystems/GetWaterReadingList`;
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

async function getDropdownProject(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/BillingSystems/GetDropdownProjectBySiteId`;
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

async function update(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/BillingSystems/UpdateDetailWaterReading`;
  const config = {
    headers: {
      Authorization: "Bearer " + accessToken,
      "Access-Control-Allow-Origin": "*",
    },
  };

  axios
    .put(url, params, config)
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

async function exportExcel(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/BillingSystems/ExportToExcelWaterReading`;
  const config = {
    headers: {
      Authorization: "Bearer " + accessToken,
      "Access-Control-Allow-Origin": "*",
    },
    params: params,
  };

  axios
    .post(url, params, config)
    .then((response) => {
      res.send({
        result: response.data.result,
      });
    })
    .catch((error) =>
      res.send({
        error: error,
      })
    );
}

async function getActivePeriod(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/BillingSystems/GetActivePeriod`;
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

async function uploadExcel(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/BillingSystems/UploadExcelWaterReading`;
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
