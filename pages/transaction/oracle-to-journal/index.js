import Card from "@mui/material/Card";
import { Formik, Form } from "formik";
import * as Yup from "yup";
// @mui material components
import { Grid, TextField } from "@mui/material";
// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Icon from "@mui/material/Icon";

// NextJS Material Dashboard 2 PRO layout
import DashboardLayout from "/layout/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/layout/Navbars/DashboardNavbar";
import Footer from "/layout/Footer";
import DataTable from "/layout/Tables/DataTable";
import MDButton from "/components/MDButton";
import MDInput from "/components/MDInput";
import FormField from "/pagesComponents/FormField";
import Autocomplete from "@mui/material/Autocomplete";
import { useMaterialUIController } from "/context";
import { useCookies } from "react-cookie";
import * as React from "react";
import { typeNormalization, downloadTempFile } from "/helpers/utils";
import { alertService } from "/helpers";

// Data

import { useEffect, useState } from "react";
import SiteDropdown from "../../../pagesComponents/dropdown/Site";
import PeriodDropdown from "../../../pagesComponents/dropdown/Period";
// import templateWaterReading from "../assets/template/template-water-reading.xlsx";

export default function OracleToJournal(props){
    const [controller] = useMaterialUIController();
    const [customerResponse, setCustomerResponse] = useState({
      rowData: [],
      totalRows: undefined,
      totalPages: undefined,
    });

    const [dataPeriod, setDataPeriod] = useState([]);
    const [site, setSite] = useState(null);
    const [{ accessToken, encryptedAccessToken }] = useCookies();

    useEffect(() => {
        let currentSite = JSON.parse(localStorage.getItem("site"));
        console.log("currentSite-----------", currentSite);
        if (currentSite == null) {
        alertService.info({
            title: "Info!",
            text: "Please choose Site first",
        });
        } else {
        setSite(currentSite);
        }
        getPeriod();
    }, []);

    const [customerRequest, setCustomerRequest] = useState({
            scheme: site?.siteId,
            keywords: "",
            recordsPerPage: 10,
            skipCount: 0,
        });

        const skipCountChangeHandler = (e) => {
        customerRequest.skipCount = e;
        setCustomerRequest((prevState) => ({
        ...prevState,
        skipCount: e,
        }));
    };
    const recordsPerPageChangeHandler = (e) => {
        customerRequest.recordsPerPage = e;
        setCustomerRequest({
        ...prevState,
        recordsPerPage: e,
        });
    };
    const keywordsChangeHandler = (e) => {
        customerRequest.keywords = e;
        setCustomerRequest((prevState) => ({
        ...prevState,
        keywords: e,
        }));
    };

    const getPeriod = async (val) => {
        let response = await fetch("/api/transaction/oracle-to-journal/dropdownperiod", {
        method: "POST",
        body: JSON.stringify({
            accessToken: accessToken,
            params: {
            SiteId: site?.siteId,
            },
        }),
        });
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        response = typeNormalization(await response.json());
        console.log("response----", response);
        if (response.error) {
        alertService.error({ title: "Error", text: response.error.message });
        } else {
        setDataPeriod(response.result);
        }
        console.log("project------", dataPeriod);
    };
    useEffect(() => {
        getPeriod();
    }, [site]);
    useEffect(() => {
        //fetchData();
    }, [customerRequest.skipCount, customerRequest.recordsPerPage]);

    const handleSite = (siteVal) => {
        setSite(siteVal);
        localStorage.setItem("site", JSON.stringify(siteVal));
    };

    const form = {
        formId: "oracle-to-journal",
        formField: {
            period: {
                name: "period",
                label: "Period",
                placeholder: "Type Period",
                type: "text",
                isRequired: true,
                errorMsg: "Period is required.",
                defaultValue: "",
            }
        }
    }

    const { period } = form.formField;

    return (
        <DashboardLayout>
            <DashboardNavbar/>
            <MDBox
                p={3}
                color="light"
                bgColor="info"
                variant="gradient"
                borderRadius="lg"
                shadow="lg"
                opacity={1}
            >
                <Grid container spacing={3}>
                <Grid item xs={12} sm={12}>
                    <SiteDropdown onSelectSite={handleSite} site={site} />
                </Grid>
                </Grid>
            </MDBox>
            <MDBox py={3}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Card>
                            <MDBox p={3} lineHeight={1}>
                                <Grid container alignItems="center">
                                    <Grid item xs={12} md={8}>
                                        <MDBox mb={1}>
                                            <MDTypography variant="h6">Transaction Oracle Journal</MDTypography>
                                            <MDTypography variant="body2" color="text">
                                                Billing Transaction to Oracle
                                            </MDTypography>
                                        </MDBox>
                                    </Grid>
                                </Grid>
                            </MDBox>
                            <MDBox p={3} lineHeight={1}>
                                <Grid container alignItems="center">
                                    <Grid item xs={12}>
                                        <Grid item xs={12} md={6}>
                                            <Autocomplete
                                                // disableCloseOnSelect
                                                // includeInputInList={true}
                                                options={dataPeriod}
                                                key={period.name}
                                                value={values.project}
                                                // getOptionSelected={(option, value) => {
                                                //   return (
                                                //     option.projectName === value.projectName
                                                //   );
                                                // }}
                                                getOptionLabel={(option) =>
                                                values.project != {}
                                                    ? option.periodId +
                                                    " - " +
                                                    option.periodName
                                                    : "Nothing selected"
                                                }
                                                onChange={(e, value) => {
                                                setFieldValue(
                                                    project.name,
                                                    value !== null
                                                    ? value
                                                    : initialValues[period.name]
                                                );
                                                onProjectChange(value);
                                                }}
                                                noOptionsText="No results"
                                                renderInput={(params) => (
                                                <FormField
                                                    {...params}
                                                    type={period.type}
                                                    label={
                                                    period.label +
                                                    (period.isRequired ? " *" : "")
                                                    }
                                                    name={period.name}
                                                    placeholder={period.placeholder}
                                                    InputLabelProps={{ shrink: true }}
                                                    error={
                                                    errors.period && touched.period
                                                    }
                                                    success={checkingSuccessInput(
                                                    period,
                                                    errors.period
                                                    )}
                                                />
                                                )}
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </MDBox>
                        </Card>
                    </Grid>
                </Grid>
            </MDBox>
        </DashboardLayout>
    )
}