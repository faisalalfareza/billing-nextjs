import {NextApiRequest, NextApiResponse} from 'next';
import getConfig from 'next/config';
import axios from 'axios';

const {publicRuntimeConfig} = getConfig();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  let {method, query, body} = req;
  // console.log('body: ' + JSON.stringify(body));
  if (query.method != 'prosesuploaduserprofile') body = JSON.parse(body);
  switch (method) {
    case 'POST':
      switch (query.method) {
        case 'getall':
          getList(res, body);
          break;

        case 'upload':
          uploadImage(res, body);
          break;

        case 'getroles':
          getRoles(res, body);
          break;
        case 'getdropdownsite':
          getDropdownSite(res, body);
          break;
        case 'prosescreatenewuser':
          prosesCreateNewUser(res, body);
          break;
        case 'prosesupdateuser':
          update(res, body);
          break;
        case 'get':
          getDetailUser(res, body);
          break;
        case 'prosesuploaduserprofile':
          prosesUploadUserProfile(res, req, body);
          break;
      }
      break;
  }
}

async function getList(res: any, body: any) {
  const {accessToken, params} = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/User/GetAll`;
  const config = {
    headers: {
      Authorization: 'Bearer ' + accessToken,
      'Access-Control-Allow-Origin': '*',
    },
    params: params,
  };

  axios
    .get(url, config)
    .then(response =>
      res.send({
        result: response.data.result,
      }),
    )
    .catch(error =>
      res.send({
        error: error.response.data,
      }),
    );
}
async function uploadImage(res: any, body: any) {
  const {accessToken, params} = body;

  const url = `${publicRuntimeConfig.apiUrl}/Temp/Downloads/LogoSite`;
  const config = {
    headers: {
      Authorization: 'Bearer ' + accessToken,
      'Access-Control-Allow-Origin': '*',
    },
  };

  axios
    .post(url, params, config)
    .then(response =>
      res.send({
        result: response.data.result,
      }),
    )
    .catch(error =>
      res.send({
        error: error,
      }),
    );
}

async function getRoles(res: any, body: any) {
  const {accessToken, params} = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/Role/GetRoles`;
  const config = {
    headers: {
      Authorization: 'Bearer ' + accessToken,
      'Access-Control-Allow-Origin': '*',
    },
    params: params,
  };

  axios
    .get(url, config)
    .then(response =>
      res.send({
        result: response.data.result,
      }),
    )
    .catch(error =>
      res.send({
        error: error.response.data,
      }),
    );
}

async function getDropdownSite(res: any, body: any) {
  const {accessToken, params} = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/BillingSystems/GetDropdownSite`;
  const config = {
    headers: {
      Authorization: 'Bearer ' + accessToken,
      'Access-Control-Allow-Origin': '*',
    },
    params: params,
  };

  axios
    .get(url, config)
    .then(response =>
      res.send({
        result: response.data.result,
      }),
    )
    .catch(error =>
      res.send({
        error: error,
      }),
    );
}

async function prosesCreateNewUser(res: any, body: any) {
  const {accessToken, params} = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/User/ProsesCreateNewUser`;
  const config = {
    headers: {
      Authorization: 'Bearer ' + accessToken,
      'Access-Control-Allow-Origin': '*',
    },
  };

  axios
    .post(url, params, config)
    .then(response => {
      res.send({
        result: response.data.result,
      });
    })
    .catch(error => {
      res.send({
        error: error.response.data,
      });
    });
}

async function update(res: any, body: any) {
  const {accessToken, params} = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/User/ProsesUpdateUser`;
  const config = {
    headers: {
      Authorization: 'Bearer ' + accessToken,
      'Access-Control-Allow-Origin': '*',
    },
  };

  axios
    .post(url, params, config)
    .then(response => {
      res.send({
        result: response.data.result,
      });
    })
    .catch(error => {
      res.send({
        error: error.response.data,
      });
    });
}

async function getDetailUser(res: any, body: any) {
  const {accessToken, params} = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/User/Get`;
  const config = {
    headers: {
      Authorization: 'Bearer ' + accessToken,
      'Access-Control-Allow-Origin': '*',
    },
    params: params,
  };

  axios
    .get(url, config)
    .then(response =>
      res.send({
        result: response.data.result,
      }),
    )
    .catch(error =>
      res.send({
        error: error.response.data,
      }),
    );
}

async function prosesUploadUserProfile(res: any, req: any, body: any) {
  const {accessToken, params} = body;

  const url = `${publicRuntimeConfig.apiUrl}/api/services/app/MasterBilling/ProsesUploadUserProfile`;
  const config = {
    headers: {
      Authorization: req.headers.authorization,
      'Access-Control-Allow-Origin': '*',
    },
  };
  axios
    .post(url, body, config)
    .then(response => {
      res.send({
        result: response.data.result,
      });
    })
    .catch(error => {
      res.send({
        error: error.response.data,
      });
    });
}
