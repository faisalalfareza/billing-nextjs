import React, { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

import { Card, Grid, Icon, Autocomplete } from "@mui/material";

import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDButton from "/components/MDButton";

import { typeNormalization } from "/helpers/utils";
import { alertService } from "/helpers/alert.service";

import DashboardLayout from "/layout/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/layout/Navbars/DashboardNavbar";

import FormField from "/pagesComponents/FormField";
import SiteDropdown from "../../../pagesComponents/dropdown/Site";


function UploadBulkPayment() {
  const [{ accessToken, encryptedAccessToken }] = useCookies();

  const [site, setSite] = useState(null);
  const handleSite = (siteVal) => {
    setSite(siteVal);
    localStorage.setItem("site", JSON.stringify(siteVal));
  };

  
  const schemeModels = {
    formId: "upload-bulk-payment-form",
    formField: {
      paymentMethod: {
        name: "paymentMethod",
        label: "Payment Method",
        placeholder: "Choose Payment Method",
        type: "text",
        isRequired: true,
        errorMsg: "Payment Method is required.",
        defaultValue: undefined
      },
      fileUpload: {
        name: "fileUpload",
        label: "File Upload",
        placeholder: "Upload Bulk Payment Excel",
        type: "file",
        isRequired: true,
        errorMsg: "File Upload is required.",
        defaultValue: null
      },
    }
  };
  let { paymentMethod, fileUpload } = schemeModels.formField;
  let schemeValidations = Yup.object().shape({
    [paymentMethod.name]: paymentMethod.isRequired ? Yup.object().required(paymentMethod.errorMsg) : Yup.object().notRequired(),
    [fileUpload.name]: fileUpload.isRequired ? Yup.mixed().required(fileUpload.errorMsg) : Yup.mixed().notRequired()
  });
  const schemeInitialValues = {
    [paymentMethod.name]: paymentMethod.defaultValue,
    [fileUpload.name]: fileUpload.defaultValue
  };
  useEffect(() => {
    document.getElementsByName(paymentMethod.name)[0].focus();

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


  const [paymentMethodList, setPaymentMethodList] = useState([]);
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

  const [uploadedList, setUploadedList] = useState([]);
  const uploadaOptions = {
    fileType: ["xlsx", "xls"],
    maxFileSize: 1000000 * 2
  };
  const SheetJSFT = uploadaOptions.fileType.map((x) => ("." + x)).join(",");
  const downloadFile = () => {
    const element = document.createElement("a");
    element.href = "/template/template-upload-bulk-payment.xlsx";
    element.download = "template-upload-bulk-payment.xlsx";
    element.click();
  };
  const onFileChange = (files) => (files && files[0]) && onFileUpload(files[0]);
  const onFileUpload = (file) => {
    setUploadedList([]);

    const reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;

    reader.onload = (e) => {
      const bstr = e.target.result;
      const wb = XLSX.read(bstr, { type: rABS ? "binary" : "array" });

      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];

      const data = XLSX.utils.sheet_to_json(ws, { header: 2 });
      const data_formated = data.map(e => {
        const date_splitted = e["Transaction Date"]?.split("/");
        const date_formatted = new Date();
        date_formatted.setUTCDate(date_splitted[0]);
        date_formatted.setUTCMonth(parseInt(date_splitted[1]) - 1);
        date_formatted.setUTCFullYear(date_splitted[2]);
        date_formatted.setUTCHours(0, 0, 0, 0);

        return ({
          "idClient": e["ID Client"],
          "unitCode": e["Unit Code"],
          "unitNo": e["Unit No"],
          "invoiceNumber": e["Invoice Number"],
          "transactionDate": date_formatted.toISOString(),
          "amount": e["Amount"]
        })
      });
      console.log("UPLOADED FILE", data_formated);
      setUploadedList(data_formated);
    };

    if (rABS) reader.readAsBinaryString(file);
    else reader.readAsArrayBuffer(file);
  };


  const checkingSuccessInput = (isRequired, value, error) => {
    return (!isRequired && true) || (isRequired && value != undefined && value != "" && !error);
  };
  const handleUploadBulkPaymentSubmit = (values, actions) => uploadBulkPayment(values, actions);

  const [isLoadingUploadBulkPayment, setLoadingUploadBulkPayment] = useState(false);
  const uploadBulkPayment = async (values, actions) => {
    setLoadingUploadBulkPayment(true);

    let response = await fetch("/api/cashier/bulk-payment/uploadBulkPayment", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
        params: {
          "siteId": site?.siteId,
          "paymentMethodId": values.paymentMethod?.paymentType,
          "detailUploadBulkPaymentList": uploadedList
        }
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error) alertService.error({ title: "Error", text: response.error.message });
    else {
      if (response.success) {
        const isFailed = (response.result.totalGagal > 0);

        Swal.fire({
          title: 'Upload Bulk Payment Successfull',
          html:
            `${response.result.totalSukses} data has been successfully uploaded.` +
            (isFailed ? `<br><strong>${response.result.totalGagal} data failed to upload</strong>, <a href="${response.result.urlDataGagal}" download="error-upload-bulk-payment.xlsx"><u>download here to see.</u></a>` : ``),
          icon: 'success',
          timerProgressBar: true,
          timer: !isFailed && 3000,
        }).then(() => {
          if (isFailed) {
            actions.setFieldValue(fileUpload.name, null);
            setTimeout(() => document.getElementsByName(fileUpload.name)[0].value = null, 0);
          } else {
            actions.resetForm();
            setTimeout(() => {
              document.getElementsByName(paymentMethod.name)[0].value = null;
              document.getElementsByName(fileUpload.name)[0].value = null;
            }, 0);
          } setUploadedList([]);
        });
      }
    } setLoadingUploadBulkPayment(false);
  };


  return (
    <DashboardLayout>
      <DashboardNavbar />

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
                        Upload Bulk Payment
                      </MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={12} md={4} sx={{ textAlign: "right" }}>
                    <MDButton variant="outlined" color="dark" onClick={downloadFile}>
                      <Icon>receipt_outlined</Icon>&nbsp; Download Template
                    </MDButton>
                  </Grid>
                  <Grid item xs={12}>
                    <Formik
                      initialValues={schemeInitialValues}
                      validationSchema={schemeValidations}
                      onSubmit={handleUploadBulkPaymentSubmit}
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
                          <Form id={schemeModels.formId} autoComplete="off">
                            <MDBox>
                              <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                  <Autocomplete
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
                                </Grid>
                                <Grid item xs={12} sm={6}>    
                                  <FormField
                                  
                                    type={fileUpload.type}
                                    label={
                                      fileUpload.label +
                                      (fileUpload.isRequired ? " ⁽*⁾" : "")
                                    }
                                    name={fileUpload.name}
                                    placeholder={fileUpload.placeholder}
                                    InputLabelProps={{ shrink: true }}
                                    error={errors.fileUpload && touched.fileUpload}
                                    success={fileUpload.isRequired && checkingSuccessInput(fileUpload.isRequired, values.fileUpload, errors.fileUpload)}
                                    accept={SheetJSFT} 
                                    onChange={(e, value) => {
                                      setFieldValue(fileUpload.name, e.target.value);
                                      onFileChange(e.target.files);        
                                    }}
                                  />  
                                  {/* <MDTypography variant="caption" color="error" fontWeight="regular">*Only file .xls/.xlsx and maximum file size 2mb</MDTypography> */}
                                </Grid>
                                <Grid item xs={12}>
                                  <MDBox
                                    display="flex"
                                    flexDirection={{ xs: "column", sm: "row" }}
                                    justifyContent="flex-end"
                                  >
                                    <MDButton
                                      type="submit"
                                      variant="gradient"
                                      color="primary"
                                      sx={{ height: "100%" }}
                                      disabled={isLoadingUploadBulkPayment || !isValifForm()}
                                    >
                                      <Icon>upload</Icon>&nbsp; { isLoadingUploadBulkPayment ? "Uploading Bulk Payment.." : "Upload Bulk Payment" }
                                    </MDButton>
                                  </MDBox>
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
  );
}

export default UploadBulkPayment;
