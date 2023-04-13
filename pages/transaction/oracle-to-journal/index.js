import React, { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

import { Card, Grid, Icon, Autocomplete, FormControl, FormLabel } from "@mui/material";

import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDButton from "/components/MDButton";

import { typeNormalization } from "/helpers/utils";
import { alertService } from "/helpers/alert.service";

import DashboardLayout from "/layout/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/layout/Navbars/DashboardNavbar";

import FormField from "/pagesComponents/FormField";
import SiteDropdown from "../../../pagesComponents/dropdown/Site";

function OracleToJournal({params}) {
    const [{ accessToken, encryptedAccessToken }] = useCookies();
    const [ site, setSite ] = useState();
    const handleSite = (siteVal) => {
        setSite(siteVal);
        localStorage.setItem("site", JSON.stringify(siteVal));
    };

    const schemaModels = {
        formId: "oracle-to-journal",
        formField: {
            periodMethod: {
                name: "periodMethod",
                label: "Period",
                placeholder: "Choose Period",
                type: "text",
                isRequired: true,
                errorMsg: "Period is required",
                defaultValue: undefined
            },
            paymentMethod: {
                name: "paymentMethod",
                label: "Payment Type",
                placeholder: "Choose Payment Type",
                type: "text",
                isRequired: true,
                errorMsg: "Payment Type is required",
                defaultValue: undefined
            },
            paymentStartDate: {
                name: "paymentStartDate",
                label: "Payment Start Date",
                placeholder: "Choose Start Date",
                type: "date",
                isRequired: true,
                errorMsg: "Start Date is required.",
                defaultValue: "",
            },
            accountingDate: {
                name: "accountingDate",
                label: "Accounting Date",
                placeholder: "Choose Accounting Date",
                type: "date",
                isRequired: true,
                errorMsg: "Accounting Date is required.",
                defaultValue: "",
            },
            
        }
    };

    let { 
        periodMethod, 
        paymentMethod, 
        paymentStartDate,
        accountingDate, 
        
    } = schemaModels.formField;

    let schemeValidations = Yup.object().shape({
        [periodMethod.name]: periodMethod.isRequired ? Yup.object().required(periodMethod.errorMsg) : Yup.object().notRequired(),
        [paymentMethod.name]: paymentMethod.isRequired ? Yup.object().required(paymentMethod.errorMsg) : Yup.object().notRequired(),
        [paymentStartDate.name]: paymentStartDate.isRequired
        ? Yup.date().required(paymentStartDate.errorMsg)
        : Yup.date().notRequired(),
        [accountingDate.name]: accountingDate.isRequired
        ? Yup.date().required(accountingDate.errorMsg)
        : Yup.date().notRequired(),
        
    });

    const schemeInitialValues = {
        [periodMethod.name]: params ? periodMethod.defaultValue : null,
        [paymentMethod.name]: params ? paymentMethod.defaultValue : null,
        [paymentStartDate.name]: params
        ? dayjs(params.paymentStartDate).format("YYYY-MM-DD")
        : null,
        [accountingDate.name]: params
        ? dayjs(params.accountingDate).format("YYYY-MM-DD")
        : null,
        
    };

    useEffect(() => {
        document.getElementsByName(periodMethod.name)[0].focus();

        let currentSite = typeNormalization(localStorage.getItem("site"));
        if (currentSite == null) {
            Swal.fire({
                title: "Info!",
                text: "Please choose Site first",
                icon: "info",
            });
            } else setSite(currentSite);
            // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [ periodMethodList, setPeriodMethodList ] = useState([]);
    const [ paymentMethodList, setPaymentMethodList ] = useState([]);

    const getDropdownPeriodMethod = async () => {
        let response = await fetch("/api/master/period/list", {
            method: "POST",
            body: JSON.stringify({
              accessToken: accessToken,
              params: {
                "SiteId": site?.siteId
              }
            })
        });
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        response = typeNormalization(await response.json());
    
        if (response.error) alertService.error({ title: "Error", text: response.error.message });
        else setPeriodMethodList(response.result);
    };

    useEffect(() => {
        getDropdownPeriodMethod();
    }, [site]);

    const getDropdownPaymentMethod = async () => { 
        let response = await fetch("/api/cashier/bulk-payment/listPaymentMethod", {
          method: "POST",
          body: JSON.stringify({
            accessToken: accessToken
          })
        });
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        response = typeNormalization(await response.json());
    
        if (response.error) alertService.error({ title: "Error", text: response.error.message });
        else setPaymentMethodList(response);
      };
      useEffect(() => {
        getDropdownPaymentMethod();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [site]);

    const checkingSuccessInput = (isRequired, value, error) => {
        return (!isRequired && true) || (isRequired && value != undefined && value != "" && !error);
    };

    const [formValues, setformValues] = useState(schemeInitialValues);

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
                mb={2}
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
                                    <Grid item xs={12} md={8} mb={2}>
                                        <MDBox>
                                            <MDTypography variant="h5">
                                                Oracle To Journal
                                            </MDTypography>
                                        </MDBox>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Formik
                                            initialValues={schemeInitialValues}
                                            validationSchema={schemeValidations}
                                            
                                        >
                                            {({
                                                values,
                                                errors,
                                                touched,
                                                setFieldValue
                                            }) => {
                                                let { 
                                                paymentMethod: paymentMethodV,
                                                fileUpload: fileUploadV
                                                } = values;
                                                const isValifForm = () => (
                                                checkingSuccessInput(paymentMethod.isRequired, paymentMethodV, errors.paymentMethod) &&
                                                checkingSuccessInput(fileUpload.isRequired, fileUploadV, errors.fileUpload)
                                                );

                                                return (
                                                <Form id={schemaModels.formId} autoComplete="off">
                                                    <MDBox lineHeight={2}>
                                                        <Grid container spacing={3}>
                                                            <Grid item xs={12} sm={6}>
                                                                <Autocomplete 
                                                                    style={{ paddingBottom: 20 }}
                                                                    options={periodMethodList}
                                                                    key={periodMethod.name}
                                                                    // value={values.paymentMethod}
                                                                    getOptionLabel={(option) => option.periodName}
                                                                    onChange={(e, value) => {
                                                                    setFieldValue(periodMethod.name, value);
                                                                    }}
                                                                    noOptionsText="No results"
                                                                    renderInput={(params) => (
                                                                    <FormField
                                                                        {...params}
                                                                        type={periodMethod.type}
                                                                        label={
                                                                        periodMethod.label +
                                                                        (periodMethod.isRequired ? " ⁽*⁾" : "")
                                                                        }
                                                                        name={periodMethod.name}
                                                                        placeholder={periodMethod.placeholder}
                                                                        InputLabelProps={{ shrink: true }}
                                                                        error={errors.periodMethod && touched.periodMethod}
                                                                        success={periodMethod.isRequired && checkingSuccessInput(periodMethod.isRequired, values.periodMethod, errors.periodMethod)}
                                                                    /> 
                                                                    )}
                                                                />
                                                                
                                                                <Autocomplete 
                                                                    style={{ paddingBottom: 20 }}
                                                                    options={paymentMethodList}
                                                                    key={paymentMethod.name}
                                                                    // value={values.paymentMethod}
                                                                    getOptionLabel={(option) => option.paymentName}
                                                                    onChange={(e, value) => {
                                                                    setFieldValue(paymentMethod.name, value);
                                                                    }}
                                                                    noOptionsText="No results"
                                                                    renderInput={(params) => (
                                                                    <FormField
                                                                        {...params}
                                                                        type={paymentMethod.type}
                                                                        label={
                                                                        paymentMethod.label +
                                                                        (paymentMethod.isRequired ? " ⁽*⁾" : "")
                                                                        }
                                                                        name={paymentMethod.name}
                                                                        placeholder={paymentMethod.placeholder}
                                                                        InputLabelProps={{ shrink: true }}
                                                                        error={errors.paymentMethod && touched.paymentMethod}
                                                                        success={paymentMethod.isRequired && checkingSuccessInput(paymentMethod.isRequired, values.paymentMethod, errors.paymentMethod)}
                                                                    /> 
                                                                    )}
                                                                />

                                                                <FormField
                                                                    style={{ paddingBottom: 20 }}
                                                                    type={paymentStartDate.type}
                                                                    label={
                                                                        paymentStartDate.label +
                                                                        (paymentStartDate.isRequired ? " ⁽*⁾" : "")
                                                                    }
                                                                    name={paymentStartDate.name}
                                                                    // value={formValues.startDate}
                                                                    placeholder={paymentStartDate.placeholder}
                                                                    error={errors.paymentStartDate && touched.paymentStartDate}
                                                                    success={checkingSuccessInput(
                                                                        formValues.paymentStartDate,
                                                                        errors.paymentStartDate
                                                                    )}
                                                                    InputLabelProps={{ shrink: true }}
                                                                />
                                                            </Grid>
                                                            <Grid item xs={12} sm={6}>
                                                                <FormField
                                                                    style={{ paddingBottom: 20 }}
                                                                    type={accountingDate.type}
                                                                    label={
                                                                        accountingDate.label +
                                                                        (accountingDate.isRequired ? " ⁽*⁾" : "")
                                                                    }
                                                                    name={accountingDate.name}
                                                                    // value={formValues.startDate}
                                                                    placeholder={accountingDate.placeholder}
                                                                    error={errors.accountingDate && touched.accountingDate}
                                                                    success={checkingSuccessInput(
                                                                        formValues.accountingDate,
                                                                        errors.accountingDate
                                                                    )}
                                                                    InputLabelProps={{ shrink: true }}
                                                                />
                                                                
                                                            </Grid>
                                                        </Grid>
                                                    </MDBox>
                                                </Form>
                                                );
                                            }}
                                        </Formik>
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

export default OracleToJournal;