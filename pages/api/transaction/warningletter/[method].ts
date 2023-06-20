import { NextApiRequest, NextApiResponse } from "next";
import getConfig from "next/config";
import axios from "axios";

const { publicRuntimeConfig } = getConfig();
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
){
    let { method, query, body } = req;
    body = JSON.parse(body);
    switch (method) {
        case "POST":
          switch (query.method) {
            case "GetWarningLetterList":
              getList(res, body);
              break;
            case "GetDropdownPeriodBySiteId":
              getDropdownPeriod(res, body);
              break;
            case "GetDropdownProjectBySiteId":
              getDropdownProject(res, body);
              break;
            case "GetDropdownClusterByProject":
              getDropdownCluster(res, body);
              break;
            case "GetDropdownUnitCodeByCluster":
              getDropdownUnitCode(res, body);
              break;
            /* case "GetDropdownUnitInvoice":
              getDropdownUnitNo(res, body);
              break; */
            case "GetDropdownUnitNoByCluster":
              getDropdownUnitNo(res, body);
              break;
            case "GetDropdownSPWarLett":
              getDropdownSP(res, body);
              break;
            case "GetDropdownInvoiceNameWarLett":
              getDropdownInvoiceName(res, body);
              break;
            case "viewDetailWarLett":
              getViewDetailWarLett(res, body);
              break;
            case "SendEmailWarningLetter":
              SendEmailWarningLetter(res, body);
              break;
            case "ExportToExcelWarningLetter":
              getExportToExcelWarningLetter(res, body);
              break;
          }
          break;

        /* case "GET":
          switch (query.method) {
            case "list":
              getList(res, body);
              break;
            }
          break; */
      }
}

async function getList(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/BillingSystems/GetWarningLetterList`;
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

async function getDropdownPeriod(res: any, body: any) {
    const { accessToken, params } = body;
  
    const url = `${publicRuntimeConfig.apiUrl}/api/services/app/Report/GetDropdownPeriodBySiteId`;
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

  async function getDropdownUnitCode(res: any, body: any) {
    const { accessToken, params } = body;
  
    const url = `${publicRuntimeConfig.apiUrl}/api/services/app/BillingSystems/GetDropdownUnitCodeByCluster`;
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

  async function getDropdownUnitNo(res: any, body: any) {
    const { accessToken, params } = body;
  
    const url = `${publicRuntimeConfig.apiUrl}/api/services/app/Report/GetDropdownUnitNoByCluster`;
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

  async function getDropdownSP(res: any, body: any) {
    const { accessToken } = body;
  
    const url = `${publicRuntimeConfig.apiUrl}/api/services/app/BillingSystems/GetDropdownSPWarLett`;
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

  async function getDropdownInvoiceName(res: any, body: any) {
    const { accessToken, params } = body;
  
    const url = `${publicRuntimeConfig.apiUrl}/api/services/app/BillingSystems/GetDropdownInvoiceNameWarLett`;
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
  
  async function getViewDetailWarLett(res: any, body: any) {
    const { accessToken, params } = body;
  
    const url = `${publicRuntimeConfig.apiUrl}/api/services/app/BillingSystems/viewDetailWarLett`;
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
      .catch((error) =>
        res.send({
          error: error,
        })

      );
      /* .catch(function (error) {
        if (error.response) {
          console.log('err1 ',error.response.data);
          console.log('err2 ',error.response.status);
          console.log('err3 ',error.response.headers);
        }
      }); */
  }

  async function getExportToExcelWarningLetter(res: any, body: any) {
    const { accessToken, params } = body;
  
    const url = `${publicRuntimeConfig.apiUrl}/api/services/app/BillingSystems/ExportToExcelWarningLetter`;
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
      .catch((error) =>
        res.send({
          error: error,
        })

      );
      /* .catch(function (error) {
        if (error.response) {
          console.log('err1 ',error.response.data);
          console.log('err2 ',error.response.status);
          console.log('err3 ',error.response.headers);
        }
      }); */
  }

  async function SendEmailWarningLetter(res: any, body: any) {
    const { accessToken, params } = body;
  
    const url = `${publicRuntimeConfig.apiUrl}/api/services/app/BillingSystems/SendEmailWarningLetter`;
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
      .catch((error) =>
        res.send({
          error: error,
        })

      );
  }