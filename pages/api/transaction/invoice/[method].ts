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
        case "getinvoicelist":
          getList(res, body);
          break;
        case "getdropdownperiodbysiteid":
          getDropdownPeriod(res, body);
          break;
        case "getdropdownprojectinvoice":
          getDropdownProject(res, body);
          break;
        case "getdropdownclusterinvoice":
          getDropdownCluster(res, body);
          break;
        case "getdropdownunitcodebycluster":
          getDropdownUnitCode(res, body);
          break;
        case "getdropdownunitinvoice":
          getDropdownUnitNo(res, body);
          break;
        case "getsearchpscode":
          findName(res, body);
          break;
        case "getpreviewinvoicepdf":
          preview(res, body);
          break;
        case "changeadjustmentinvoice":
          adjust(res, body);
          break;
        case "regenerateinvoicebyinvoiceidlist":
          regenerate(res, body);
          break;
        case "sendemailinvoicebyinvoiceheaderid":
          sendEmail(res, body);
          break;
        case "sendwainvoice":
          sendWa(res, body);
          break;
        case "uploadexcelchangeadjinvoice":
          uploadExcelChangeAdjInvoice(res, body);
          break;
      }
      break;
  }
}

async function getList(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/BillingSystems/GetInvoiceList`;
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

async function getDropdownProject(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/BillingSystems/GetDropdownProjectInvoice`;
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

async function getDropdownCluster(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/BillingSystems/GetDropdownClusterInvoice`;
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

async function getDropdownUnitNo(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/BillingSystems/GetDropdownUnitInvoice`;
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

async function findName(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/BillingSystems/GetSearchPSCode`;
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

async function preview(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/BillingSystems/GetPreviewInvoicePdf`;
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
    .then((response) => {
      console.log("response----", response);
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

async function adjust(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/BillingSystems/ChangeAdjustmentInvoice`;
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

async function regenerate(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/BillingSystems/ReGenerateInvoiceByInvoiceIdList`;
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
        error: error,
      });
    });
}

async function sendEmail(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/BillingSystems/SendEmailInvoiceByInvoiceHeaderId`;
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
        error: error,
      });
    });
}

async function sendWa(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/BillingSystems/SendWAInvoice`;
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
        error: error,
      });
    });
}
async function uploadExcelChangeAdjInvoice(res: any, body: any) {
  const { accessToken, params } = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/BillingSystems/UploadExcelChangeAdjInvoice`;
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
