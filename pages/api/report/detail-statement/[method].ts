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
        case "getdropdownprojectbysiteid":
          getDropdownProject(res, body);
          break;
        case "getdropdownclusterbyproject":
          getDropdownCluster(res, body);
          break;
        case "getdropdownunitcodebyclusterid":
          getDropdownUnitCodeByClusterID(res, body);
          break;
        case "getdropdownunitnobycluster":
          getDropdownUnitNoByCluster(res, body);
          break;
        case "getdropdownperiodmonth":
          getDropdownPeriodMonth(res, body);
          break;
        case "getdropdownperiodyear":
          getDropdownPeriodYear(res, body);
          break;
        case "reportdetailstatement":
          reportDetailStatement(res, body);
          break;
        case "reportpdfdetailstatement":
          reportPDFDetailStatement(res, body);
          break;
      }
      break;
  }
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

async function getDropdownUnitCodeByClusterID(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/Report/GetDropdownUnitCodeByClusterID`;
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
        result: response.data.result,
      })
    )
    .catch((error) =>
      res.send({
        error: error,
      })
    );
}

async function getDropdownUnitNoByCluster(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/Report/GetDropdownUnitNoByCluster`;
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
        result: response.data.result,
      })
    )
    .catch((error) =>
      res.send({
        error: error,
      })
    );
}

async function getDropdownPeriodMonth(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/Report/GetDropdownPeriodMonth`;
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
        result: response.data.result,
      })
    )
    .catch((error) =>
      res.send({
        error: error,
      })
    );
}

async function getDropdownPeriodYear(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/Report/GetDropdownPeriodYear`;
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
        result: response.data.result,
      })
    )
    .catch((error) =>
      res.send({
        error: error,
      })
    );
}

async function reportDetailStatement(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/Report/ReportDetailStatement`;
  const config = {
    headers: {
      Authorization: "Bearer " + accessToken,
      "Access-Control-Allow-Origin": "*",
    },
    params: params,
  };
  console.log("config----", config);
  console.log("params----", config);

  axios
    .post(url, params, config)
    .then((response) =>
      res.send({
        result: response.data.result,
      })
    )
    .catch((error) =>
      res.send({
        error: error.response.data,
      })
    );
}

async function reportPDFDetailStatement(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/Report/ReportPDFDetailStatement`;
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
        result: response.data.result,
      });
    })
    .catch((error) => {
      console.log("err-----", error.response);
      res.send({
        error: error.response.data,
      });
    });
}
