import DashboardLayout from "/layout/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/layout/Navbars/DashboardNavbar";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Grid from "@mui/material/Grid";
import { Autocomplete, TextField, Radio } from "@mui/material";
import { Link } from "@mui/material";
import MDButton from "/components/MDButton";
import MDInput from "/components/MDInput";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
import { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import { Formik, Form, Field } from "formik";
import FormField from "/pagesComponents/FormField";
import * as Yup from "yup";
import axios from "axios";
import DataTable from "/layout/Tables/DataTable";
import Icon from "@mui/material/Icon";
import MDBadgeDot from "/components/MDBadgeDot";
import Swal from "sweetalert2";
import * as dayjs from "dayjs";
import { FormGroup, FormControlLabel, Checkbox } from "@mui/material";
import DataTableTotal from "../../../layout/Tables/DataTableTotal";
import { useCookies } from "react-cookie";
import { typeNormalization } from "/helpers/utils";
import SiteDropdown from "../../../pagesComponents/dropdown/Site";
import { NumericFormat } from "react-number-format";

export default function BillingPayment(props) {
  let dummy = {
    unitDataId: 1,
    siteId: 45,
    projectId: 29,
    clusterId: 632,
    projectName: "Tanjung Bunga",
    clusterName: "Bouvardia",
    unitName: "Bouvardia Park",
    unitCode: "BOAV",
    unitNo: "0001",
    customerName: "reynard renaldo",
    psCode: "40217770",
  };
  let dummyinvoice = [
    {
      invoiceId: 1,
      invoiceNo: "string",
      invoiceName: "string",
      balance: 123456,
      endBalance: 78910,
      paymentAmount: 1237878,
    },
    {
      invoiceId: 2,
      invoiceNo: "string",
      invoiceName: "string",
      balance: 767656587,
      endBalance: 234242,
      paymentAmount: 45609,
    },
  ];
  const [listBilling, setListBilling] = useState([]);
  const [listInvoice, setListInvoice] = useState(dummyinvoice);
  const [site, setSite] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [isDetail, setIsDetail] = useState(true);
  const [params, setParams] = useState(undefined);
  const [filterText, setFilterText] = useState("");
  const [selectedPSCode, setSelectedPSCode] = useState(undefined);
  const [detail, setDetail] = useState(dummy);
  const [user, setUser] = useState(undefined);
  const [{ accessToken, encryptedAccessToken }] = useCookies();
  const [dataPaymentMethod, setDataPaymentMethod] = useState([]);
  const [dataBank, setDataBank] = useState([]);

  useEffect(() => {
    getPaymentMethod();
    getBank();
    let currentSite = JSON.parse(localStorage.getItem("site"));
    console.log("currentSite-----------", currentSite);
    if (currentSite == null) {
      Swal.fire({
        title: "Info!",
        text: "Please choose Site first",
        icon: "info",
      });
    } else {
      setSite(currentSite);
      let currentUser = JSON.parse(localStorage.getItem("informations"));
      setUser(currentUser);
    }
  }, []);
  useEffect(() => {
    // fetchData();
  }, [site]);

  function NumberField({ field }) {
    return (
      <NumericFormat
        {...field}
        customInput="TextField"
        decimalScale={0}
        allowNegative={false}
      />
    );
  }

  //dari sini
  const [isLoading, setLoading] = useState(false);
  const schemeModels = {
    formId: "payment-detail-form",
    formField: {
      paymentMethod: {
        name: "paymentMethod",
        label: "Payment Method",
        placeholder: "Choose Payment Method",
        type: "text",
        isRequired: true,
        errorMsg: "Payment Method is required.",
        defaultValue: "",
      },
      amountPayment: {
        name: "amountPayment",
        label: "Amount Payment",
        placeholder: "Type Amount Payment",
        type: "number",
        isRequired: true,
        errorMsg: "Amount Payment is required.",
        maxLength: 50,
        invalidMaxLengthMsg:
          "Amount Payment exceeds the maximum limit of 50 characters.",
        defaultValue: "",
      },
      transactionDate: {
        name: "transactionDate",
        label: "Transaction Date",
        placeholder: "Choose Date",
        type: "date",
        isRequired: true,
        errorMsg: "Transaction Date is required.",
        defaultValue: "",
      },
      bank: {
        name: "bank",
        label: "Bank",
        placeholder: "Choose Bank",
        type: "text",
        isRequired: true,
        errorMsg: "Bank is required.",
        defaultValue: "",
      },
      remarks: {
        name: "remarks",
        label: "Remarks",
        placeholder: "Type the remarks",
        type: "text",
        isRequired: true,
        errorMsg: "Remarks is required.",
        defaultValue: "",
      },
    },
  };
  let {
    paymentMethod,
    amountPayment,
    transactionDate,
    bank,
    remarks,
    statusActive,
  } = schemeModels.formField;
  let schemeValidations = Yup.object().shape({
    [paymentMethod.name]: paymentMethod.isRequired
      ? Yup.object()
          .required(paymentMethod.errorMsg)
          .typeError(paymentMethod.errorMsg)
      : Yup.object().notRequired(),
    [amountPayment.name]: amountPayment.isRequired
      ? Yup.string()
          .required(amountPayment.errorMsg)
          .typeError(amountPayment.errorMsg)
      : Yup.string().notRequired(),
    [transactionDate.name]: transactionDate.isRequired
      ? Yup.date()
          .required(transactionDate.errorMsg)
          .typeError(transactionDate.errorMsg)
      : Yup.date().notRequired(),
    [bank.name]: bank.isRequired
      ? Yup.object().required(bank.errorMsg).typeError(bank.errorMsg)
      : Yup.object().notRequired(),
    [remarks.name]: remarks.isRequired
      ? Yup.string().required(remarks.errorMsg).typeError(remarks.errorMsg)
      : Yup.string().notRequired(),
  });

  var customParseFormat = require("dayjs/plugin/customParseFormat");
  dayjs.extend(customParseFormat);

  const initialValues = {
    [paymentMethod.name]: params ? params.paymentMethod : null,
    [amountPayment.name]: params ? params.amountPayment : null,
    [transactionDate.name]: params
      ? dayjs(params.transactionDate).format("YYYY-MM-DD")
      : null,
    [bank.name]: params ? dayjs(params.bank).format("YYYY-MM-DD") : null,
    [remarks.name]: params ? dayjs(params.remarks).format("YYYY-MM-DD") : null,
  };

  const [formValues, setformValues] = useState(initialValues);

  const getFormData = (values) => {
    console.log("getFormData::", values);
  };
  console.log("formValues::", formValues);

  const submitForm = async (values, actions) => {
    createPeriod(values, actions);
  };

  const checkingSuccessInput = (value, error) => {
    return value != undefined && value != "" && value.length > 0 && !error;
  };

  const createPeriod = async (values, actions) => {
    // setLoadingSubmit(false);
    // const url = `${publicRuntimeConfig.apiUrl}/api/services/app/MasterBilling/CreateMasterPeriod`;
    // const urlUpdate = `${publicRuntimeConfig.apiUrl}/api/services/app/MasterBilling/UpdateMasterPeriod`;
    // const config = {
    //   headers: {
    //     Authorization: "Bearer " + accessToken,
    //     "Content-Type": "application/json",
    //   },
    // };
    // const body = {
    //   siteId: site.siteId,
    //   periodMonth: addDate(values.periodName),
    //   periodYear: addDate(values.periodName),
    //   periodNumber: values.periodNumber,
    //   startDate: addDate(values.startDate),
    //   endDate: addDate(values.endDate),
    //   closeDate: addDate(values.closeDate),
    //   isActive: values.statusActive,
    // };
    // console.log("CompanyOfficer/CreateOrUpdateCompanyOfficer ", body);
    // if (!params) {
    //   axios
    //     .post(url, body, config)
    //     .then((res) => {
    //       if (res.data.success) {
    //         Swal.fire({
    //           title: "New Period Added",
    //           text:
    //             "Period " +
    //             values.periodNumber +
    //             " has been successfully added",
    //           icon: "success",
    //           showConfirmButton: true,
    //           timerProgressBar: true,
    //           timer: 3000,
    //         }).then(() => {
    //           setLoadingSubmit(false);
    //           actions.resetForm();
    //           closeModal();
    //         });
    //       }
    //     })
    //     .catch((error) => {
    //       setLoadingSubmit(false);
    //       console.log("error-----", error.response.data.error.message);
    //       Swal.fire({
    //         title: "Error",
    //         icon: "error",
    //         text: error.response.data.error.message,
    //       });
    //     });
    // } else {
    //   body.periodId = params.periodId;
    //   axios
    //     .put(urlUpdate, body, config)
    //     .then((res) => {
    //       if (res.data.success) {
    //         Swal.fire({
    //           title: "Period Updated",
    //           text:
    //             "Period " +
    //             values.periodName +
    //             " in " +
    //             values.periodNumber +
    //             " has been successfully updated.",
    //           icon: "success",
    //           showConfirmButton: true,
    //           timerProgressBar: true,
    //           timer: 3000,
    //         }).then((result) => {
    //           setLoadingSubmit(false);
    //           actions.resetForm();
    //           closeModal();
    //         });
    //       }
    //     })
    //     .catch((error) => {
    //       setLoadingSubmit(false);
    //       console.log("error-----", error);
    //       // <Popup icon={error} text={error.message} title="Error"/>
    //     });
    // }
  };

  const handleCheck = (val) => {
    console.log("val-----check", val);
    setSelectedPSCode(val.unitDataId);
    setDetail(val);
    console.log("data---checked", selectedPSCode);
  };

  const setBillingList = () => {
    return {
      columns: [
        {
          Header: "Choose",
          accessor: "e",
          Cell: ({ value }) => {
            console.log("valueme", value);
            return (
              <Radio
                onChange={(e) => {
                  handleCheck(value);
                }}
                value={value}
                name="radio-buttons"
                inputProps={{ "aria-label": "A" }}
                checked={value.unitDataId == selectedPSCode}
              />
            );
          },
        },
        { Header: "No", accessor: "no" },
        { Header: "Project", accessor: "projectName" },
        { Header: "Cluster", accessor: "clusterName" },

        { Header: "Unit Name", accessor: "unitName" },
        { Header: "Unit Code", accessor: "unitCode" },
        { Header: "Unit No", accessor: "unitNo" },
        { Header: "Customer Name", accessor: "customerName" },
      ],
      rows: listBilling,
    };
  };
  const curr = (value) => {
    console.log("duit", value);
    return formatValue({
      value: value.toString(),
      groupSeparator: ".",
      decimalSeparator: ",",
      prefix: "Rp ",
    });
  };
  const setInvoiceList = () => {
    return {
      columns: [
        { Header: "Invoice Number", accessor: "invoiceNo" },
        { Header: "Invoice Name", accessor: "invoiceName" },
        {
          Header: "Balance",
          accessor: "balance",
          align: "right",
          Cell: ({ value }) => {
            return (
              <NumericFormat
                displayType="text"
                value={value}
                decimalSeparator=","
                prefix="Rp "
                thousandSeparator="."
              />
            );
          },
        },

        {
          Header: "End Balance",
          accessor: "endBalance",
          align: "right",
          Cell: ({ value }) => {
            return (
              <NumericFormat
                displayType="text"
                value={value}
                decimalSeparator=","
                prefix="Rp "
                thousandSeparator="."
              />
            );
          },
        },
        {
          Header: "Payment Amount",
          accessor: "paymentAmount",
          align: "right",
          Cell: ({ value }) => {
            let valString = value.toString();
            console.log("duitpayAmount----", valString, typeof valString);
            return (
              <NumericFormat
                customInput={TextField}
                id="input-example"
                name="input-name"
                placeholder="Please enter a number"
                prefix="Rp. "
                variant="outlined"
                isNumericString={true}
                thousandSeparator="."
                decimalSeparator=","
                allowNegative={false}
                value={value}
                decimalScale={2}
                onValueChange={(value, name) =>
                  console.log("upilll", value, name)
                }
              />
            );
          },
        },
      ],
      rows: listInvoice,
    };
  };

  const openModalAddOrEditOnEdit = (record) => {
    setParams(record);
    setOpenModal(!openModal);
  };

  const changeModalAddOrEdit = () => {
    setOpenModal(!openModal);
    fetchData();
  };

  const openModalAddOrEditOnAdd = () => {
    setParams(undefined);
    setOpenModal(!openModal);
  };
  const handleClose = () => setOpenModal(false);
  const chooseSite = (val) => {
    setSite(val);
    localStorage.setItem("site", JSON.stringify(val));
    // fetchData();
  };

  const fetchData = async (data) => {
    let response = await fetch("/api/cashier/billing/list", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
        params: {
          SiteId: site?.siteId,
          Search: filterText,
          MaxResultCount: 1000,
          SkipCount: 0,
        },
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    console.log("response----", response);
    if (response.error) setLoading(false);
    else {
      const list = [];
      const row = response.result.map((e, i) => {
        list.push({
          no: i + 1,
          projectName: e.projectName,
          clusterName: e.clusterName,
          customerName: e.customerName,
          unitName: e.unitName,
          unitCode: e.unitCode,
          unitNo: e.unitNo,
          e,
        });
      });
      setListBilling(list);
      console.log("list------", list);
    }
    // const url = `${publicRuntimeConfig.apiUrl}/api/services/app/CashierSystem/GetCustomerList`;
    // axios
    //   .get(url, {
    //     params: {
    //       SiteId: site?.siteId,
    //       Search: filterText,
    //       MaxResultCount: 1000,
    //       SkipCount: 0,
    //     },
    //   })
    //   .then((response) => {
    //     // handle success
    //     const result = response.data.result.items;
    //     const list = [];
    //     const row = result.map((e, i) => {
    //       list.push({
    //         no: i + 1,
    //         projectName: e.projectName,
    //         clusterName: e.clusterName,
    //         customerName: e.customerName,
    //         unitName: e.unitName,
    //         unitCode: e.unitCode,
    //         unitNo: e.unitNo,
    //         e,
    //       });
    //     });
    //     setListBilling(list);
    //     console.log("list------", list);
    //   })
    //   .catch((error) => {
    //     // handle error
    //   });
  };

  const getPaymentMethod = async () => {
    let response = await fetch("/api/cashier/billing/dropdownpayment", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());
    console.log("response----", response);
    if (response.error) {
      setLoading(false);
      Swal.fire({
        title: "Error",
        text: response.error.message,
        icon: "error",
      });
    } else {
      setDataPaymentMethod(response.result);
    }
  };

  const getBank = async () => {
    let response = await fetch("/api/cashier/billing/dropdownbank", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());
    console.log("response----", response);
    if (response.error) {
      setLoading(false);
      Swal.fire({
        title: "Error",
        text: response.error.message,
        icon: "error",
      });
    } else {
      setDataBank(response.result);
    }
  };

  const getDetail = async (data) => {
    let response = await fetch("/api/cashier/billing/detail", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
        params: {
          PsCode: detail.psCode,
          unitDataId: detail.unitDataId,
        },
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    console.log("response----", response);
    if (response.error) {
      const error = response.error;
      setLoading(false);
      Swal.fire({
        title: "Error",
        text: error.error.message,
        icon: "error",
      });
    } else {
      const result = response.result.listInvoicePayment;
      setListInvoice(result);
      setIsDetail(true);
      console.log("list-invoice-----", listInvoice);
    }
  };

  const handleSite = (siteVal) => {
    setSite(siteVal);
    localStorage.setItem("site", JSON.stringify(siteVal));
  };
  //sampai sini

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
      {/* tasklist */}
      <MDBox pb={3}>
        <Card>
          <MDBox p={3} lineHeight={1}>
            <Grid container alignItems="center">
              <Grid item xs={12} md={8}>
                <MDBox>
                  <MDTypography variant="h5">Filter</MDTypography>
                </MDBox>
                <MDBox mb={2}>
                  <MDInput
                    variant="standard"
                    label="Customer Name / ID Client *"
                    onChange={(e) => {
                      setFilterText(e.target.value);
                      //   fetchData(filterText);
                    }}
                    fullWidth
                  />
                </MDBox>
              </Grid>
              <Grid item xs={12} md={4} sx={{ textAlign: "right" }}>
                <Grid container alignItems="right" spacing={1}>
                  <Grid item xs={12} md={12}>
                    <MDButton
                      variant="gradient"
                      color="primary"
                      onClick={() => {
                        fetchData();
                      }}
                    >
                      <Icon>search</Icon>&nbsp; Search
                    </MDButton>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </MDBox>
          <MDBox pl={3}>
            <MDTypography variant="h5">Search Result</MDTypography>
          </MDBox>
          <DataTable table={setBillingList()} canSearch />
          <MDBox p={3} alignItems="center" textAlign="center">
            <MDButton
              disabled={selectedPSCode == undefined || selectedPSCode == null}
              variant="gradient"
              color="primary"
              onClick={() => {
                getDetail();
              }}
            >
              <Icon>search</Icon>&nbsp; Show This Unit
            </MDButton>
          </MDBox>
        </Card>
        {/* <AddOrEditPeriod
          site={site}
          isOpen={openModal}
          params={params}
          onModalChanged={changeModalAddOrEdit}
        /> */}
      </MDBox>
      {isDetail && (
        <MDBox mt={5} mb={9}>
          <Grid container justifyContent="center">
            <Grid item xs={12} lg={12}>
              <Card>
                <MDBox
                  mt={-3}
                  mb={-1}
                  mx={4}
                  textAlign="center"
                  bgColor="primary"
                  borderRadius="lg"
                  shadow="xl"
                  py={2}
                >
                  <Grid container spacing={3}>
                    <Grid item xs={4}>
                      <MDTypography variant="h6" color="light">
                        CUSTOMER NAME
                      </MDTypography>
                      <MDTypography variant="body2" color="light">
                        {detail.customerName}
                      </MDTypography>
                    </Grid>
                    <Grid item xs={4}>
                      <MDTypography variant="h6" color="light">
                        UNIT CODE
                      </MDTypography>
                      <MDTypography variant="body2" color="light">
                        {detail.unitCode}
                      </MDTypography>
                    </Grid>
                    <Grid item xs={4}>
                      <MDTypography variant="h6" color="light">
                        UNIT NO
                      </MDTypography>
                      <MDTypography variant="body2" color="light">
                        {detail.unitNo}
                      </MDTypography>
                    </Grid>
                  </Grid>
                  <MDBox mb={1} textAlign="center"></MDBox>
                </MDBox>
                <MDBox p={2}>
                  <MDBox
                    p={1}
                    mt={3}
                    width="100%"
                    display="flex"
                    justifyContent="space-between"
                  >
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <MDTypography variant="h5">
                          Payment Detail{" "}
                        </MDTypography>
                      </Grid>
                      <Grid item xs={12}>
                        <Formik
                          initialValues={initialValues}
                          validationSchema={schemeValidations}
                          onSubmit={submitForm}
                        >
                          {({
                            values,
                            errors,
                            touched,
                            isSubmitting,
                            setFieldValue,
                            resetForm,
                          }) => {
                            setformValues(values);
                            getFormData(values);

                            const isValifForm = () => {
                              // return checkingSuccessInput(companyV, errors.periodNumber) &&
                              //   checkingSuccessInput(officerNameV, errors.amountPayment) &&
                              //   checkingSuccessInput(officerTitleV, errors.paymentMethod)
                              //   ? true
                              //   : false;
                            };

                            return (
                              <Form
                                id={schemeModels.formId}
                                autoComplete="off"
                                fullWidth
                              >
                                <MDBox pb={3}>
                                  <Grid container spacing={3}>
                                    <Grid item xs={6}>
                                      <FormField
                                        disabled
                                        type="text"
                                        label="Cluster"
                                        name="cluster"
                                        // value={detail?.clusterName}
                                        placeholder="Custer"
                                      />
                                    </Grid>
                                    <Grid item xs={6}>
                                      <FormField
                                        type={transactionDate.type}
                                        label={
                                          transactionDate.label +
                                          (transactionDate.isRequired
                                            ? " ⁽*⁾"
                                            : "")
                                        }
                                        name={transactionDate.name}
                                        value={formValues.transactionDate}
                                        placeholder={
                                          transactionDate.placeholder
                                        }
                                        error={
                                          errors.transactionDate &&
                                          touched.transactionDate
                                        }
                                        success={checkingSuccessInput(
                                          formValues.transactionDate,
                                          errors.transactionDate
                                        )}
                                      />
                                    </Grid>
                                    <Grid item xs={6}>
                                      <Field
                                        name={paymentMethod.name}
                                        component={Autocomplete}
                                        options={dataPaymentMethod}
                                        getOptionLabel={(option) =>
                                          option.paymentName
                                        }
                                        onChange={(e, value) => {
                                          setFieldValue(
                                            paymentMethod.name,
                                            value !== null
                                              ? value
                                              : initialValues[
                                                  paymentMethod.name
                                                ]
                                          );
                                        }}
                                        renderInput={(params) => (
                                          <FormField
                                            {...params}
                                            type={paymentMethod.type}
                                            label={
                                              paymentMethod.label +
                                              (paymentMethod.isRequired
                                                ? " *"
                                                : "")
                                            }
                                            name={paymentMethod.name}
                                            placeholder={
                                              paymentMethod.placeholder
                                            }
                                            InputLabelProps={{ shrink: true }}
                                            error={
                                              errors.paymentMethod &&
                                              touched.paymentMethod
                                            }
                                            success={checkingSuccessInput(
                                              paymentMethod,
                                              errors.paymentMethod
                                            )}
                                          />
                                        )}
                                      />
                                    </Grid>
                                    <Grid item xs={6}>
                                      <Field
                                        name={bank.name}
                                        component={Autocomplete}
                                        options={dataBank}
                                        getOptionLabel={(option) =>
                                          option.bankName
                                        }
                                        onChange={(e, value) => {
                                          setFieldValue(
                                            bank.name,
                                            value !== null
                                              ? value
                                              : initialValues[bank.name]
                                          );
                                        }}
                                        renderInput={(params) => (
                                          <FormField
                                            {...params}
                                            type={bank.type}
                                            label={
                                              bank.label +
                                              (bank.isRequired ? " *" : "")
                                            }
                                            name={bank.name}
                                            placeholder={bank.placeholder}
                                            InputLabelProps={{ shrink: true }}
                                            error={errors.bank && touched.bank}
                                            success={checkingSuccessInput(
                                              bank,
                                              errors.bank
                                            )}
                                          />
                                        )}
                                      />
                                    </Grid>
                                    <Grid item xs={6}>
                                      <MDInput
                                        label="Card Number"
                                        variant="standard"
                                        fullWidth
                                      />
                                    </Grid>
                                    <Grid item xs={6}>
                                      <FormField
                                        type={remarks.type}
                                        label={
                                          remarks.label +
                                          (remarks.isRequired ? " ⁽*⁾" : "")
                                        }
                                        name={remarks.name}
                                        value={formValues.remarks}
                                        placeholder={remarks.placeholder}
                                        error={
                                          errors.remarks && touched.remarks
                                        }
                                        success={checkingSuccessInput(
                                          formValues.remarks,
                                          errors.remarks
                                        )}
                                      />
                                    </Grid>
                                    <Grid item xs={4}>
                                      <FormField
                                        component={NumericFormat}
                                        type={amountPayment.type}
                                        label={
                                          amountPayment.label +
                                          (amountPayment.isRequired
                                            ? " ⁽*⁾"
                                            : "")
                                        }
                                        name={amountPayment.name}
                                        value={formValues.amountPayment}
                                        placeholder={amountPayment.placeholder}
                                        error={
                                          errors.amountPayment &&
                                          touched.amountPayment
                                        }
                                        success={checkingSuccessInput(
                                          formValues.amountPayment,
                                          errors.amountPayment
                                        )}
                                      />
                                    </Grid>
                                    <Grid item xs={4}>
                                      <MDInput
                                        variant="outlined"
                                        label="Charge"
                                        fullWidth
                                        disabled
                                      />
                                    </Grid>
                                    <Grid item xs={4}>
                                      <MDInput
                                        variant="outlined"
                                        label="Total"
                                        fullWidth
                                        disabled
                                      />
                                    </Grid>
                                    <Grid item xs={12}>
                                      <MDBox
                                        color="dark"
                                        bgColor="white"
                                        borderRadius="lg"
                                        shadow="lg"
                                        opacity={1}
                                        p={2}
                                      >
                                        Allocation
                                        {/* <DataTable
                                        table={setInvoiceList()}
                                        showTotalEntries={false}
                                        isSorted={false}
                                      /> */}
                                        <DataTableTotal
                                          table={setInvoiceList()}
                                          showTotalEntries={false}
                                          isSorted={false}
                                        />
                                      </MDBox>
                                    </Grid>
                                    {params && (
                                      <Grid item xs={12} sm={12}>
                                        <FormGroup>
                                          <FormControlLabel
                                            control={
                                              <Checkbox
                                                disabled={
                                                  !formValues.statusActive
                                                }
                                                name={statusActive.name}
                                                checked={
                                                  formValues.statusActive
                                                }
                                                onChange={(e) => {
                                                  console.log(e.target.checked);
                                                  setFieldValue(
                                                    statusActive.name,
                                                    e.target.checked != null
                                                      ? e.target.checked
                                                      : initialValues[
                                                          statusActive.name
                                                        ]
                                                  );
                                                }}
                                              />
                                            }
                                            label="Active"
                                          />
                                        </FormGroup>
                                      </Grid>
                                    )}
                                  </Grid>
                                </MDBox>
                                <Grid item xs={6}>
                                  <FormGroup>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          // disabled={!formValues.statusActive}
                                          name="print-or"
                                          color="primary"
                                          // checked={formValues.statusActive}
                                          // onChange={(e) => {
                                          //   console.log(e.target.checked);
                                          //   setFieldValue(
                                          //     statusActive.name,
                                          //     e.target.checked != null
                                          //       ? e.target.checked
                                          //       : initialValues[statusActive.name]
                                          //   );
                                          // }}
                                        />
                                      }
                                      label="Print Official Receipt (OR)"
                                    />
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          // disabled={!formValues.statusActive}
                                          name="print-or"
                                          color="primary"
                                          // checked={formValues.statusActive}
                                          // onChange={(e) => {
                                          //   console.log(e.target.checked);
                                          //   setFieldValue(
                                          //     statusActive.name,
                                          //     e.target.checked != null
                                          //       ? e.target.checked
                                          //       : initialValues[statusActive.name]
                                          //   );
                                          // }}
                                        />
                                      }
                                      label={"Add Signee : " + user?.user.name}
                                    />
                                  </FormGroup>
                                </Grid>
                                <Grid item xs={12} mt={3}>
                                  <MDBox
                                    display="flex"
                                    flexDirection={{ xs: "column", sm: "row" }}
                                    justifyContent="flex-end"
                                  >
                                    <MDButton
                                      type="reset"
                                      variant="outlined"
                                      color="secondary"
                                    >
                                      Cancel
                                    </MDButton>
                                    <MDBox
                                      ml={{ xs: 0, sm: 1 }}
                                      mt={{ xs: 1, sm: 0 }}
                                    >
                                      <MDButton
                                        type="submit"
                                        variant="gradient"
                                        color="primary"
                                        sx={{ height: "100%" }}
                                        disabled={isLoading}
                                      >
                                        {isLoading
                                          ? params == undefined
                                            ? "Adding Period.."
                                            : "Updating Period.."
                                          : params == undefined
                                          ? "Save"
                                          : "Update"}
                                      </MDButton>
                                    </MDBox>
                                  </MDBox>
                                </Grid>
                              </Form>
                            );
                          }}
                        </Formik>
                      </Grid>
                    </Grid>
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>
      )}
    </DashboardLayout>
  );
}
