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
import dataTableData from "/pagesComponents/applications/data-tables/data/dataTableData";
import { useEffect, useState } from "react";
import SiteDropdown from "../../../pagesComponents/dropdown/Site";
// import templateWaterReading from "../assets/template/template-water-reading.xlsx";

export default function OracleToJournal(props){
    const [controller] = useMaterialUIController();
    const [customerResponse, setCustomerResponse] = useState({
      rowData: [],
      totalRows: undefined,
      totalPages: undefined,
    });
    const [openUpload, setOpenUpload] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [dataPeriod, setDataPeriod] = useState([]);
    const [site, setSite] = useState(null);
    const handleOpenUpload = () => setOpenUpload(true);
    const handleOpenEdit = () => setOpenEdit(true);
    const [isLoading, setLoading] = useState(false);
    const [modalParams, setModalParams] = useState(undefined);
    const [{ accessToken, encryptedAccessToken }] = useCookies();

    const schemeModels = {
        formId: "period-data-form",
        formField: {           
            jenisData: {
                name: "periodData",
                label: "Period",
                placeholder: "Select Active Period",
                type: "text",
                isRequired: true,
                errorMsg: "Period is required.",
                defaultValue: ""
            },
        },
    };
    let { periodData } =
        schemeModels.formField;


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
        getActivePeriod();
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
    
      const [periodList, setPeriodList] = useState([]);
      const getPeriodList = async (e) => {
        if (e) e.preventDefault();

        const url = `${publicRuntimeConfig.apiUrl}/api/services/app/JenisData/getListData?schema=${site}`;
        //const config = { headers: { Authorization: "Bearer " + accessToken } };
        axios
            //.get(url, config)
            .get(url)
            .then(res => {
                let periodList = res.data.result;
                setjenisData(periodList);
          });
      };

      useEffect(() => {
        getActivePeriod();
        getPeriodList();
      }, [site]);

      useEffect(() => {
        
      }, [customerRequest.skipCount, customerRequest.recordsPerPage]);
    
      console.log("site------", site);
    
      
      const handleSite = (siteVal) => {
        setSite(siteVal);
        localStorage.setItem("site", JSON.stringify(siteVal));
      };

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
                                                    defaultValue={periodData}
                                                    //defaultValue={{ id: 1, jenisData: "DATA CONNEXINDO NOV 2021" }}
                                                    options={periodList}
                                                    getOptionLabel={(option) => option.periodname}
                                                    onChange={(e, value) => {
                                                        setFieldValue(periodList.periodname, value.periodid);
                                                    }}
                                                    renderInput={(params) => (
                                                        <FormField
                                                            {...params}
                                                            type={periodData.type}
                                                            label={periodData.label + (periodData.isRequired ? ' ⁽*⁾' : '')}
                                                            name={periodData.name}
                                                            placeholder={periodData.placeholder}
                                                            InputLabelProps={{ shrink: true }}
                                                            error={errors.periodData && touched.periodData}
                                                            success={periodData.isRequired && checkingSuccessInput(periodData.isRequired, periodDataV, errors.periodData)}
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