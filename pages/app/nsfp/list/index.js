import React, { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import Autocomplete from "@mui/material/Autocomplete";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDButton from "/components/MDButton";
import MDBadge from "/components/MDBadge";

// NextJS Material Dashboard 2 PRO examples
import DashboardLayout from "/layout/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/layout/Navbars/DashboardNavbar";
import Footer from "/layout/Footer";
import DataTable from "/layout/Tables/DataTable";

import FormField from "/pagesComponents/FormField";


function ListFakturPajak() {
  const schemeModels = {
    formId: "nsfp-list-form",
    formField: {
      company: {
        name: "company",
        label: "Company",
        placeholder: "Select the company.",
        type: "text",
        isRequired: true,
        errorMsg: "Company is required.",
        defaultValue: ""
      },
      yearPeriod: {
        name: "yearPeriod",
        label: "Year Period",
        placeholder: "Select the year period.",
        type: "text",
        isRequired: true,
        errorMsg: "Year Code is required.",
        defaultValue: ""
      },
      transCode: {
        name: "transCode",
        label: "Trans Code",
        placeholder: "Select the trans code.",
        type: "text",
        isRequired: true,
        errorMsg: "Trans Code is required.",
        defaultValue: ""
      },
    }
  };
  let { company, yearPeriod, transCode } = schemeModels.formField;
  let schemeValidations = Yup.object().shape({
    [company.name]: company.isRequired ? Yup.string().required(company.errorMsg) : Yup.string().notRequired(),
    [yearPeriod.name]: yearPeriod.isRequired ? Yup.string().required(yearPeriod.errorMsg) : Yup.string().notRequired(),
    [transCode.name]: transCode.isRequired ? Yup.string().required(transCode.errorMsg) : Yup.string().notRequired(),
  });
  const schemeInitialValues = {
    [company.name]: company.defaultValue,
    [yearPeriod.name]: yearPeriod.defaultValue,
    [transCode.name]: transCode.defaultValue,
  };

  const checkingSuccessInput = (value, error) => {
    return (value != undefined && value != "" && value.length > 0) && !error;
  }
  const sleep = (ms) => new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
  const submitForm = async (values, actions) => {
    await sleep(1000);
  };

  const taskList = {
    columns: [
      { Header: "Company Code", accessor: "coCode" },
      { Header: "Company Name", accessor: "coName" },
      { Header: "No. Seri", accessor: "noSeri" },
      { Header: "Year Period", accessor: "yearPeriod" },
      { Header: "Availability", accessor: "availability" },
    ],
    rows: [
      {
        coCode: "MSV",
        coName: "PT. MAHKOTA SENTOSA UTAMA",
        officerName: "Mulianto Lie",
        title: "Presiden Director",
        noSeri: "001-22-00000001",
        fpTransCode: "01",
        fpStatCode: "1",
        yearPeriod: "2022",
        availability: "-",
        message: "-"
      },
      {
        coCode: "IS",
        coName: "PT Indo Sejati",
        officerName: "Bambang Pamungkas",
        title: "Poucher",
        noSeri: "001-22-00000002",
        fpTransCode: "01",
        fpStatCode: "1",
        yearPeriod: "2022",
        availability: "-",
        message: "-"
      },
    ],
  };


  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <MDBox p={3} lineHeight={1}>
                <Grid container alignItems="center">
                  <Grid item xs={12}>
                    <MDBox mb={1}>
                      <MDTypography variant="h5">
                        List of Faktur Pajak
                      </MDTypography>
                    </MDBox>
                    <MDBox mb={2}>
                      <MDTypography variant="body2" color="text">
                        Used to view tax invoices based on available filters.
                      </MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={12}>
                    <Formik
                      initialValues={schemeInitialValues}
                      validationSchema={schemeValidations}
                      onSubmit={submitForm}
                    >
                      {({ values, errors, touched, isSubmitting }) => {
                        let { 
                          company: companyV,
                          yearPeriod: yearPeriodV,
                          transCode: transCodeV,
                        } = values;

                        return (
                          <Form id={schemeModels.formId} autoComplete="off">
                            <MDBox component="form"> {/* pb={3} px={3} */}
                              <Grid container spacing={3}>
                                <Grid item xs={12} sm={4}>
                                  <Autocomplete
                                    options={[
                                      "Option 1: This is the first option",
                                      "Option 2: This is the second option",
                                      "Option 3: This is the third option"
                                    ]}
                                    renderInput={(params) => (
                                      <FormField
                                        {...params}
                                        type={company.type}
                                        label={company.label + (company.isRequired?' ⁽*⁾':'')}
                                        name={company.name}
                                        placeholder={company.placeholder}
                                        InputLabelProps={{ shrink: true }}
                                        error={errors.company && touched.company}
                                        success={checkingSuccessInput(companyV, errors.company)}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                  <Autocomplete
                                    options={[
                                      "Option 1: This is the first option",
                                      "Option 2: This is the second option",
                                      "Option 3: This is the third option"
                                    ]}
                                    renderInput={(params) => (
                                      <FormField
                                        {...params}
                                        type={yearPeriod.type}
                                        label={yearPeriod.label + (yearPeriod.isRequired?' ⁽*⁾':'')}
                                        name={yearPeriod.name}
                                        placeholder={yearPeriod.placeholder}
                                        InputLabelProps={{ shrink: true }}
                                        error={errors.yearPeriod && touched.yearPeriod}
                                        success={checkingSuccessInput(yearPeriodV, errors.yearPeriod)}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                  <Autocomplete
                                    options={[
                                      "Option 1: This is the first option",
                                      "Option 2: This is the second option",
                                      "Option 3: This is the third option"
                                    ]}
                                    renderInput={(params) => (
                                      <FormField
                                        {...params}
                                        type={transCode.type}
                                        label={transCode.label + (transCode.isRequired?' ⁽*⁾':'')}
                                        name={transCode.name}
                                        placeholder={transCode.placeholder}
                                        InputLabelProps={{ shrink: true }}
                                        error={errors.transCode && touched.transCode}
                                        success={checkingSuccessInput(transCodeV, errors.transCode)}
                                      />
                                    )}
                                  />
                                </Grid>

                                <Grid item xs={12}>
                                  <MDBox display="flex" flexDirection={{ xs: "column", sm: "row" }} justifyContent="flex-end">
                                    <MDButton variant="outlined" color="secondary">
                                      Clear Filters
                                    </MDButton>
                                    <MDBox ml={{ xs: 0, sm: 1 }} mt={{ xs: 1, sm: 0 }}>
                                      <MDButton type="submit" variant="gradient" color="info" sx={{ height: "100%" }}
                                        disabled={isSubmitting}>
                                          Search
                                      </MDButton>
                                    </MDBox>
                                  </MDBox>
                                </Grid>
                              </Grid>
                            </MDBox>
                          </Form>
                        )
                      }}
                    </Formik>
                  </Grid>
                </Grid>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <DataTable table={taskList} canSearch noEndBorder />
              <MDBox pb={3} px={3}>
                <Grid item xs={12}>
                  <MDBox display="flex" flexDirection={{ xs: "column", sm: "row" }} justifyContent="flex-end">
                    <MDButton variant="outlined" color="secondary">
                      Delete & Release
                    </MDButton>
                    <MDBox ml={{ xs: 0, sm: 1 }} mt={{ xs: 1, sm: 0 }}>
                      <MDButton type="submit" variant="gradient" color="primary" sx={{ height: "100%" }}>
                        Download
                      </MDButton>
                    </MDBox>
                  </MDBox>
                </Grid>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      {/* <Footer /> */}
    </DashboardLayout>
  );
}

export default ListFakturPajak;
