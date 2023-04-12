import Autocomplete from "@mui/material/Autocomplete";
import { TextField } from "@mui/material";
import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { typeNormalization } from "/helpers/utils";

export default function PeriodDropdown(props){
    const [dataPeriod, setDataPeriod] = useState([]);
    const [{ accessToken, encryptedAccessToken }] = useCookies();


    useEffect(() => {
        getPeriod();
    }, []);

    const getPeriod = async () => {
        let response = await fetch("/api/transaction/oracle-to-journal/dropdownperiod", {
            method: "POST",
            body: JSON.stringify({
            accessToken: accessToken
            }),
        });
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        response = typeNormalization(await response.json());

        console.log("up---", response.result);
        setDataPeriod(response.result);
    };

    const handlePeriodChange = (value) => {
        props.onSelectPeriod(value);
    }

    return (
        <Autocomplete
        options={dataPeriod}
        key="site-period"
        value={props.period}
        getOptionLabel={(option) =>
            option.periodName ? option.periodId + " - " + option.periodName : ""
        }
        onChange={(e, value) => {
            handlePeriodChange(value);
        }}
        noOptionsText="No results"
        setCustomKey={(option) => option.periodId}
        renderInput={(params) => (
            <TextField
            {...params}
            label="Period"
            variant="standard"
            color="dark"
            />
        )}
        />
    );
}