import React, { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";

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

import { useMaterialUIController } from "/context";


function GenerateFakturPajak() {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const schemeModels = {
    formId: "nsfp-generate-form",
    formField: {
      fpBranchCode: {
        name: "fpBranchCode",
        label: "FP Branch Code",
        placeholder: "Type FP Branch Code",
        type: "text",
        isRequired: true,
        errorMsg: "FP Branch Code is required.",
        defaultValue: ""
      },
      fpYear: {
        name: "fpYear",
        label: "FP Year",
        placeholder: "Type FP Year",
        type: "text",
        isRequired: true,
        errorMsg: "FP Year is required.",
        defaultValue: ""
      },
      fpNoFrom: {
        name: "fpNoFrom",
        label: "FP No (From)",
        placeholder: "Type FP No From",
        type: "text",
        isRequired: true,
        errorMsg: "FP No (From) is required.",
        defaultValue: ""
      },
      fpNoTo: {
        name: "fpNoTo",
        label: "FP No (To)",
        placeholder: "Type FP No To",
        type: "text",
        isRequired: true,
        errorMsg: "FP No (To) is required.",
        defaultValue: ""
      },
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
      statCode: {
        name: "statCode",
        label: "Stat Code",
        placeholder: "Select the stat code.",
        type: "text",
        isRequired: true,
        errorMsg: "Stat Code is required.",
        defaultValue: ""
      },
    }
  };
  let { 
    fpBranchCode, fpYear, fpNoFrom, fpNoTo,
    company, yearPeriod, transCode, statCode
  } = schemeModels.formField;
  let schemeValidations = Yup.object().shape({
    [fpBranchCode.name]: fpBranchCode.isRequired ? Yup.string().required(fpBranchCode.errorMsg): Yup.string().notRequired(),
    [fpYear.name]: fpYear.isRequired ? Yup.string().required(fpYear.errorMsg) : Yup.string().notRequired(),
    [fpNoFrom.name]: fpNoFrom.isRequired ? Yup.string().required(fpNoFrom.errorMsg) : Yup.string().notRequired(),
    [fpNoTo.name]: fpNoTo.isRequired ? Yup.string().required(fpNoTo.errorMsg) : Yup.string().notRequired(),
    [company.name]: company.isRequired ? Yup.string().required(company.errorMsg) : Yup.string().notRequired(),
    [yearPeriod.name]: yearPeriod.isRequired ? Yup.string().required(yearPeriod.errorMsg) : Yup.string().notRequired(),
    [transCode.name]: transCode.isRequired ? Yup.string().required(transCode.errorMsg) : Yup.string().notRequired(),
    [statCode.name]: statCode.isRequired ? Yup.string().required(statCode.errorMsg) : Yup.string().notRequired(),
  });
  const schemeInitialValues = {
    [fpBranchCode.name]: fpBranchCode.defaultValue,
    [fpYear.name]: fpYear.defaultValue,
    [fpNoFrom.name]: fpNoFrom.defaultValue,
    [fpNoTo.name]: fpNoTo.defaultValue,
    [company.name]: company.defaultValue,
    [yearPeriod.name]: yearPeriod.defaultValue,
    [transCode.name]: transCode.defaultValue,
    [statCode.name]: statCode.defaultValue,
  };

  const checkingSuccessInput = (value, error) => {
    return (value != undefined && value != "" && value.length > 0) && !error;
  }
  const sleep = (ms) => new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
  const resetFilters = (values, actions) => {
    actions.resetForm();
  };
  const submitFilters = async (values, actions) => {
    await sleep(1000);
  };

  const generateNewFaktur = () => {
    Swal.fire({
      title: 'Generate New Faktur Pajak',
      text: "Are you sure to generate new Faktur Pajak? this will remove it from filters & tasklist.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, new faktur!',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
      }
    })
  };
  const cancel = () => {
    Swal.fire({
      title: 'Cancel Faktur Pajak',
      text: "Are you sure to cancel the current Faktur Pajak? this will remove it from tasklist & your data will be lost.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, cancel faktur!',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
      }
    })
  };
  const save = () => {
    Swal.fire({
      title: 'Are you sure to \nSave Faktur Pajak?',
      text: "Confirmation for saving Faktur Pajak.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, save',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
      }
    })
  };

  const taskList = {
    columns: [
      { Header: "Company Code", accessor: "coCode" },
      { Header: "Company Name", accessor: "coName" },
      { Header: "No. Seri", accessor: "noSeri" },
      { Header: "FP Trans Code", accessor: "fpTransCode" },
      { Header: "FP Stat Code", fpStatCode: "noSeri" },
      { Header: "Message", accessor: "message" },
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
                  <Grid item xs={12} md={8}>
                    <MDBox mb={1}>
                      <MDTypography variant="h5">
                        Filter Generate Faktur Pajak
                      </MDTypography>
                    </MDBox>
                    <MDBox mb={2}>
                      <MDTypography variant="body2" color="text">
                        Used to generate tax invoices based on available filters.
                      </MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={12} md={4} sx={{ textAlign: "right" }}>
                    <MDBox
                      bgColor={darkMode ? "grey-900" : "grey-100"}
                      borderRadius="lg"
                      display="flex"
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", sm: "center" }}
                      flexDirection={{ xs: "column", sm: "row" }}
                      my={3}
                      py={1}
                      pl={{ xs: 1, sm: 2 }}
                      pr={1}
                    >
                      <MDTypography variant="caption" fontWeight="regular" color="text" textTransform="uppercase">
                        Total No Seri to be Generated
                      </MDTypography>
                      <MDBox
                        width={{ xs: "100%", sm: "50%", md: "25%" }}
                        mt={{ xs: 1, sm: 0 }}
                      >
                        <MDBadge
                          variant="contained"
                          color="secondary"
                          badgeContent="12"
                          container
                        />
                      </MDBox>
                    </MDBox>
                  </Grid>
                  <Grid item xs={12}>
                    <Formik
                      initialValues={schemeInitialValues}
                      validationSchema={schemeValidations}
                      onSubmit={submitFilters}
                    >
                      {({ values, errors, touched, isSubmitting }) => {
                        let { 
                          fpBranchCode: fpBranchCodeV,
                          fpYear: fpYearV,
                          fpNoFrom: fpNoFromV,
                          fpNoTo: fpNoToV,
                          company: companyV,
                          yearPeriod: yearPeriodV,
                          transCode: transCodeV,
                          statCode: statCodeV,
                        } = values;

                        const noSeriFPCheckingSuccessInput = (isHexaColor) => {
                          if (
                            checkingSuccessInput(fpBranchCodeV, errors.fpBranchCode) && 
                            checkingSuccessInput(fpYearV, errors.fpYear) &&
                            checkingSuccessInput(fpNoFromV, errors.fpNoFrom) &&
                            checkingSuccessInput(fpNoToV, errors.fpNoTo)
                          ) return (isHexaColor?"#4CAF50":"success");
                          else {
                            if (
                              (errors.fpBranchCode && touched.fpBranchCode) || 
                              (errors.fpYear && touched.fpYear) ||
                              (errors.fpNoFrom && touched.fpNoFrom) ||
                              (errors.fpNoTo && touched.fpNoTo)
                            ) return (isHexaColor?"#F44335":"error");
                            else return (isHexaColor?"lightgrey":"text");
                          }
                        };

                        return (
                          <Form id={schemeModels.formId} autoComplete="off">
                            <MDBox component="form"> {/* pb={3} px={3} */}
                              <Grid container spacing={3}>
                                <Grid item xs={12} sm={2} alignSelf="center">
                                  <MDTypography 
                                    variant="caption"
                                    fontWeight="medium"
                                    textTransform="capitalize"
                                    color={noSeriFPCheckingSuccessInput(false)} 
                                  >
                                    No. Seri Faktur Pajak ⁽*⁾
                                  </MDTypography>
                                </Grid>
                                <Grid item xs={12} sm={10}>
                                  <MDBox
                                    border={`1px solid ${noSeriFPCheckingSuccessInput(true)}`}
                                    borderRadius="lg"
                                    display="flex"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    p={3}
                                    mt={2}
                                  >
                                    <Grid item xs={12} sm={3}>
                                      <FormField type={fpBranchCode.type} label={fpBranchCode.label} name={fpBranchCode.name} value={fpBranchCodeV} placeholder={fpBranchCode.placeholder} 
                                        error={errors.fpBranchCode && touched.fpBranchCode} success={checkingSuccessInput(fpBranchCodeV, errors.fpBranchCode)} />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                      <FormField type={fpYear.type} label={fpYear.label} name={fpYear.name} value={fpYearV} placeholder={fpYear.placeholder} 
                                        error={errors.fpYear && touched.fpYear} success={checkingSuccessInput(fpYearV, errors.fpYear)} />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                      <FormField type={fpNoFrom.type} label={fpNoFrom.label} name={fpNoFrom.name} value={fpNoFromV} placeholder={fpNoFrom.placeholder} 
                                        error={errors.fpNoFrom && touched.fpNoFrom} success={checkingSuccessInput(fpNoFromV, errors.fpNoFrom)} />
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                      <FormField type={fpNoTo.type} label={fpNoTo.label} name={fpNoTo.name} value={fpNoToV} placeholder={fpNoTo.placeholder} 
                                        error={errors.fpNoTo && touched.fpNoTo} success={checkingSuccessInput(fpNoToV, errors.fpNoTo)} />
                                    </Grid>
                                  </MDBox>
                                </Grid>
                                <Grid item xs={12} sm={3}>
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
                                <Grid item xs={12} sm={3}>
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
                                <Grid item xs={12} sm={3}>
                                  <Autocomplete
                                    options={[
                                      "Option 1: This is the first option",
                                      "Option 2: This is the second option",
                                      "Option 3: This is the third option"
                                    ]}
                                    renderInput={(params) => (
                                      <FormField
                                        {...params}
                                        type={statCode.type}
                                        label={statCode.label + (statCode.isRequired?' ⁽*⁾':'')}
                                        name={statCode.name}
                                        placeholder={statCode.placeholder}
                                        InputLabelProps={{ shrink: true }}
                                        error={errors.statCode && touched.statCode}
                                        success={checkingSuccessInput(statCodeV, errors.statCode)}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={3}>
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
                                    <MDButton variant="outlined" color="secondary" 
                                      onClick={resetFilters}>
                                        Clear Filters
                                    </MDButton>
                                    <MDBox ml={{ xs: 0, sm: 1 }} mt={{ xs: 1, sm: 0 }}>
                                      <MDButton type="submit" variant="gradient" color="info" sx={{ height: "100%" }}
                                        disabled={isSubmitting} onClick={submitFilters}>
                                          Generate Faktur
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
                    <MDButton variant="outlined" color="secondary"
                      onClick={cancel}>
                        Cancel
                    </MDButton>
                    <MDBox ml={{ xs: 0, sm: 1 }} mt={{ xs: 1, sm: 0 }}>
                      <MDButton type="submit" variant="gradient" color="dark" sx={{ height: "100%" }}
                        onClick={generateNewFaktur}>
                          Generate New Faktur
                      </MDButton>
                    </MDBox>
                    <MDBox ml={{ xs: 0, sm: 1 }} mt={{ xs: 1, sm: 0 }}>
                      <MDButton type="submit" variant="gradient" color="primary" sx={{ height: "100%" }}
                        onClick={save}>
                          Save
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

export default GenerateFakturPajak;
