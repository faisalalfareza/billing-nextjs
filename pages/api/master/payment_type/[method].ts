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
){
    let { method, query, body } = req;
    body = JSON.parse(body);
    switch (method){
        case "POST" :
            switch (query.method){
                case "getdropdownpaymenttype":
                    getDropdownPaymentType(res, body);
                    break;
            }
            break;
    }
}

async function getDropdownPaymentType(res: any, body: any){
    const { accessToken, params } = body;
    const url = `${publicRuntimeConfig.apiUrl}/api/services/app/MasterBilling/GetDropdownPaymentType`;
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