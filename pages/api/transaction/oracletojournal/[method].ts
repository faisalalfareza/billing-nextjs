import { NextApiRequest, NextApiResponse } from "next";
import getConfig from "next/config";
import axios from "axios";
import { json } from "stream/consumers";

const { publicRuntimeConfig } = getConfig();

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    let { method, query, body} = req;
    body = JSON.parse(body);
    switch(method){
        case "POST":
            switch (query.method){
                case "GeneratePaymentJournal":
                    GeneratePaymentJournal(res, body);
                    break;
                case "ExportToExcelJournalToOracle":
                    ExportToExcelJournalToOracle(res, body);
                    break;
                case "FetchJournalOracleList":
                    FetchJournalOracleList(res, body);
            }
    }
}

async function GeneratePaymentJournal(res: any, body: any) {
    const { accessToken, params } = body;

    const url = `${publicRuntimeConfig.apiUrl}/api/services/app/TransactionToOracleAppServices/GeneratePaymentJournal`;
    const config = {
        headers: {
            Authorization: "Bearer " + accessToken,
            "Access-Control-Allow-Origin": "*"
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

async function ExportToExcelJournalToOracle(res: any, body: any){
    const {accessToken, params} = body;

    const url = `${publicRuntimeConfig.apiUrl}/api/services/app/TransactionToOracleAppServices/ExportToExcelJournalToOracle`;
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

async function FetchJournalOracleList(res: any, body: any){
    const { accessToken, params } = body;

    const url = `${publicRuntimeConfig.apiUrl}/api/services/app/TransactionToOracleAppServices/FetchJournalOracleList`;
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