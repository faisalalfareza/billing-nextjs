import DashboardLayout from "/layout/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/layout/Navbars/DashboardNavbar";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Grid from "@mui/material/Grid";
import { Autocomplete, TextField, Radio } from "@mui/material";
import MDButton from "/components/MDButton";
import MDInput from "/components/MDInput";
import { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import { Formik, Form, Field, ErrorMessage } from "formik";
import FormField from "/pagesComponents/FormField";
import * as Yup from "yup";
import { typeNormalization } from "/helpers/utils";
import { alertService } from "/helpers";
import DataTable from "/layout/Tables/DataTable";
import Icon from "@mui/material/Icon";
import * as dayjs from "dayjs";
import { FormGroup, FormControlLabel, Checkbox } from "@mui/material";
import DataTableTotal from "/layout/Tables/DataTableTotal";
import { useCookies } from "react-cookie";
import SiteDropdown from "/pagesComponents/dropdown/Site";
import NumberInput from "/pagesComponents/dropdown/NumberInput";
import TotalDisable from "/pagesComponents/dropdown/TotalDisable";
import { NumericFormat } from "react-number-format";
import DetailBalance from "./detail-balance";
import Swal from "sweetalert2";

export default function BillingPayment(props) {
  const [listBilling, setListBilling] = useState([]);
  const [listInvoice, setListInvoice] = useState([]);
  const [site, setSite] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [isDetail, setIsDetail] = useState(false);
  const [params, setParams] = useState(undefined);
  const [filterText, setFilterText] = useState("");
  const [selectedPSCode, setSelectedPSCode] = useState(undefined);
  const [detail, setDetail] = useState({});
  const [user, setUser] = useState(undefined);
  const [{ accessToken, encryptedAccessToken }] = useCookies();
  const [dataPaymentMethod, setDataPaymentMethod] = useState([]);
  const [dataBank, setDataBank] = useState([]);
  const [totalFooter, setTotalFooter] = useState({});
  const [totalAc, setTotalAc] = useState(0);
  const [charge, setCharge] = useState(0);
  const [totalPay, setTotalPay] = useState(0);
  const [isCard, setIsCard] = useState({});
  const [hasNote, setHasNote] = useState(false);
  const [invoiceId, setInvoiceId] = useState(undefined);
  const [customerResponse, setCustomerResponse] = useState({
    rowData: [],
    totalRows: undefined,
    totalPages: undefined,
  });

  const [customerRequest, setCustomerRequest] = useState({
    scheme: site?.siteId,
    keywords: "",
    recordsPerPage: 10,
    skipCount: 0,
  });

  useEffect(() => {
    customerRequest.keywords != "" && fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerRequest.skipCount, customerRequest.recordsPerPage]);

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

  const FormSchema = (hasNote) =>
    Yup.object().shape({
      // no more conditional schema, just recreating a schema every time hasNote changes
      note: hasNote ? Yup.string().required() : Yup.string(),
      cluster: Yup.string(),
      paymentMethod: Yup.object().required("Payment Method is required."),
      cardNumber: hasNote
        ? Yup.string().required("Card Number is required.")
        : Yup.string(),
      amountPayment: Yup.string()
        .required("Amount Payment is required.")
        .typeError("Amount Payment is required."),
      transactionDate: Yup.date()
        .required("Transaction Date is required.")
        .typeError("Transaction Date is required."),
      bank: Yup.object()
        .required("Bank is required.")
        .typeError("Bank is required."),
      remarks: Yup.string(),
      charge: Yup.string(),
    });
  const [schema, setSchema] = useState(() => FormSchema(hasNote));

  useEffect(() => {
    // every time hasNote changes, recreate the schema and set it in the state
    setSchema(FormSchema(hasNote));
  }, [hasNote]);

  useEffect(() => {
    getPaymentMethod();
    getBank();

    let currentSite = JSON.parse(localStorage.getItem("site"));
    if (currentSite == null) {
      alertService.info({ title: "Info", text: "Please choose Site first" });
    } else {
      setSite(currentSite);
      let currentUser = JSON.parse(localStorage.getItem("informations"));
      setUser(currentUser);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    console.log("iscard---", isCard);
    if (isCard?.paymentType == 2 || isCard?.paymentType == 3) {
      setHasNote(true);
    } else setHasNote(false);
  }, [isCard]);

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
  const [isLoadingSearch, setLoadingSearch] = useState(false);
  const [isLoadingShow, setLoadingShow] = useState(false);

  let schemeValidations = Yup.object().shape({
    cluster: Yup.string(),
    paymentMethod: Yup.object().required("Payment Method is required."),
    cardNumber: Yup.string().when(["paymentMethod"], {
      is: (paymentMethod) =>
        paymentMethod === { paymentName: "Credit Card", paymentType: 3 } ||
        paymentMethod === { paymentName: "Debit Card", paymentType: 2 },
      then: Yup.string().required("Card Number is required."),
    }),
    // cardNumber: Yup.string(),
    amountPayment: Yup.string()
      .required("Amount Payment is required.")
      .typeError("Amount Payment is required."),
    transactionDate: Yup.date()
      .required("Transaction Date is required.")
      .typeError("Transaction Date is required."),
    bank: Yup.object()
      .required("Bank is required.")
      .typeError("Bank is required."),
    remarks: Yup.string(),
    charge: Yup.string(),
  });

  var customParseFormat = require("dayjs/plugin/customParseFormat");
  dayjs.extend(customParseFormat);

  const initialValues = {
    cluster: detail?.clusterName,
    paymentMethod: "",
    cardNumber: undefined,
    amountPayment: null,
    transactionDate: dayjs().format("YYYY-MM-DD"),
    bank: null,
    remarks: undefined,
    charge: undefined,
    isPrintOR: true,
    isAddSignee: true,
  };

  const [formValues, setformValues] = useState(initialValues);

  const getFormData = (values) => {};

  const submitForm = async (values, actions) => {
    if (values.amountPayment != totalFooter.payment) {
      alertService.warn({
        title: "Warning",
        text: "Amount payment and Total payment should be balanced",
      });
    } else {
      paymentProcess(values, actions);
    }
  };

  const checkingSuccessInput = (value, error) => {
    return value != undefined && value != "" && !error;
  };

  const paymentProcess = async (fields, actions) => {
    setLoading(true);
    console.log("save----", detail);
    console.log("save----", fields);
    const body = {
      siteId: site?.siteId,
      projectId: detail.projectId,
      paymentType: fields.paymentMethod.paymentType,
      cardNumber: fields.cardNumber,
      totalPayment: fields.amountPayment,
      charge: fields.charge,
      unitDataId: detail.unitDataId,
      unitCode: detail.unitCode,
      unitNo: detail.unitNo,
      psCode: detail.psCode,
      bankId: fields.bank.bankID,
      remarks: fields.remarks,
      listInvoicePayment: listInvoice,
    };

    let response = await fetch("/api/cashier/billing/paymentproses", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
        params: body,
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());
    if (response.error) {
      alertService.error({ title: "Error", text: response.error.message });
    } else {
      Swal.fire({
        icon: "success",
        title: "Input Payment Successfull",
        text: "Official receipt document will be displayed and will be sent to the customer via email",
      }).then(() => {
        let data = response.result;
        if (data != null) window.open(data, "_blank");
      });
      setFilterText("");
      setCustomerRequest((prevState) => ({
        ...prevState,
        keywords: "",
      }));
      setCustomerResponse((prevState) => ({
        ...prevState,
        rowData: [],
        totalRows: undefined,
        totalPages: undefined,
      }));
      setSelectedPSCode(undefined);

      cancel();
    }
    actions.setSubmitting(false);
    setLoading(false);
  };

  const cancel = () => {
    setListInvoice([]);
    setIsDetail(false);
    setformValues(initialValues);
    setTotalFooter({});
    setTotalAc(0);
  };

  const handleCheck = (val) => {
    setSelectedPSCode(val.unitDataId);
    setDetail(val);
  };

  const setBillingList = (list) => {
    return {
      columns: [
        {
          Header: "Choose",
          accessor: "e",
          Cell: ({ value }) => {
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
      rows: list,
    };
  };
  const paymentAmountChange = (value, index) => {
    const newData = [...listInvoice];
    let a = value.replaceAll("Rp. ", "").replaceAll(".", "").replace(",", ".");
    let valFloat = parseFloat(a);
    newData[index].paymentAmount = valFloat;
    newData[index].paymentAmount = valFloat;

    setListInvoice(newData);
  };

  useEffect(() => {
    totalChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPay, charge]);

  useEffect(() => {
    let newState = [...listInvoice];
    let temp = totalPay;
    newState.map((e, index) => {
      console.log("temp----", temp);
      if (index + 1 === newState.length) {
        e.paymentAmount = temp;
      } else {
        if (temp < e.balance) {
          e.paymentAmount = temp;
          temp = 0;
        } else if (temp > e.balance) {
          e.paymentAmount = e.balance;
          temp -= e.balance;
        }
      }
    });
    setListInvoice(newState);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPay]);

  const totalChange = () => {
    let t = totalPay - charge;
    setTotalAc(t);
  };

  useEffect(() => {
    let tp = listInvoice.reduce((acc, o) => acc + parseInt(o.paymentAmount), 0);
    let n = Object.assign({}, totalFooter);
    n.payment = tp;
    setTotalFooter(n);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listInvoice]);

  const handleDetail = () => {
    setOpenDetail(!openDetail);
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
          Cell: ({ value, row }) => {
            return (
              <NumericFormat
                displayType="text"
                value={value}
                decimalSeparator=","
                prefix="Rp "
                thousandSeparator="."
                renderText={(value) => (
                  <u
                    onClick={() => {
                      console.log("valueeee", row);
                      setInvoiceId(row.original.invoiceId);
                      handleDetail();
                    }}
                    style={{ color: "#4593C4", cursor: "pointer" }}
                  >
                    {value}
                  </u>
                )}
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
          Cell: ({ value, row }) => {
            return (
              <NumberInput
                inputProps={{
                  style: { textAlign: "right" },
                  onBlur: (e) => {
                    console.log("foo bar", e.target.value);
                    paymentAmountChange(e.target.value, row.index);
                  },
                }}
                placeholder="Type Amount Payment"
                value={value}
              />
            );
          },
        },
      ],
      rows: listInvoice,
    };
  };

  const fetchData = async (data) => {
    setLoadingSearch(true);
    const { scheme, keywords, recordsPerPage, skipCount } = customerRequest;
    let response = await fetch("/api/cashier/billing/getcustomerlist", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
        params: {
          SiteId: site?.siteId,
          Search: filterText,
          MaxResultCount: recordsPerPage,
          SkipCount: skipCount,
        },
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error) setLoadingSearch(false);
    else {
      const list = [];
      let data = response.result;
      data.items.map((e, i) => {
        list.push({
          no: skipCount + i + 1,
          projectName: e.projectName,
          clusterName: e.clusterName,
          customerName: e.customerName,
          unitName: e.unitName,
          unitCode: e.unitCode,
          unitNo: e.unitNo,
          e,
        });
      });
      setCustomerResponse((prevState) => ({
        ...prevState,
        rowData: list,
        totalRows: data.totalCount,
        totalPages: Math.ceil(data.totalCount / customerRequest.recordsPerPage),
      }));
      setLoadingSearch(false);
    }
  };

  const getPaymentMethod = async () => {
    let response = await fetch(
      "/api/cashier/billing/getdropdownpaymentmethod",
      {
        method: "POST",
        body: JSON.stringify({
          accessToken: accessToken,
        }),
      }
    );
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error) {
      setLoading(false);
      alertService.error({ title: "Error", text: response.error.message });
    } else {
      setDataPaymentMethod(response.result);
    }
  };

  const getBank = async () => {
    let response = await fetch("/api/cashier/billing/getdropdownbank", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error) {
      setLoading(false);
      alertService.error({ title: "Error", text: response.error.message });
    } else {
      setDataBank(response.result);
    }
  };

  const getDetail = async (data) => {
    setLoadingShow(true);
    let response = await fetch(
      "/api/cashier/billing/getpaymentdetailbypscode",
      {
        method: "POST",
        body: JSON.stringify({
          accessToken: accessToken,
          params: {
            PsCode: detail.psCode,
            unitDataId: detail.unitDataId,
          },
        }),
      }
    );
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error) {
      const error = response.error;
      setLoadingShow(false);
      alertService.error({ title: "Error", text: response.error.message });
    } else {
      const result = response.result.listInvoicePayment;
      result.map((e) => {
        e["paymentTemp"] = e.paymentAmount;
      });
      setListInvoice(result);
      setIsDetail(true);
      let newState = { ...formValues };
      newState.cluster = detail.clusterName;
      setformValues(newState);
      let tb = result.reduce((acc, o) => acc + parseInt(o.balance), 0);
      let te = result.reduce((acc, o) => acc + parseInt(o.endBalance), 0);
      let tp = result.reduce((acc, o) => acc + parseInt(o.paymentAmount), 0);
      setTotalFooter((prevState) => {
        return {
          ...prevState,
          balance: tb,
          endBalance: te,
          payment: tp,
        };
      });
      setLoadingShow(false);
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
                    value={filterText}
                    required
                    label="Customer Name / ID Client"
                    onChange={(e) => {
                      setFilterText(e.target.value);
                      setCustomerRequest((prevState) => ({
                        ...prevState,
                        keywords: e.target.value,
                      }));
                    }}
                    error={filterText == ""}
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
                      disabled={filterText == "" || isLoadingSearch}
                      onClick={() => {
                        fetchData();
                      }}
                    >
                      <Icon>search</Icon>&nbsp;{" "}
                      {isLoadingSearch ? "Searching..." : "Search"}
                    </MDButton>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </MDBox>
          {customerResponse.rowData.length > 0 && (
            <MDBox>
              <MDBox pl={3}>
                <MDTypography variant="h5">Search Result</MDTypography>
              </MDBox>
              <DataTable
                table={setBillingList(customerResponse.rowData)}
                manualPagination={true}
                totalRows={customerResponse.totalRows}
                totalPages={customerResponse.totalPages}
                recordsPerPage={customerRequest.recordsPerPage}
                skipCount={customerRequest.skipCount}
                pageChangeHandler={skipCountChangeHandler}
                recordsPerPageChangeHandler={recordsPerPageChangeHandler}
                keywordsChangeHandler={keywordsChangeHandler}
                entriesPerPage={{
                  defaultValue: customerRequest.recordsPerPage,
                }}
                pagination={{ variant: "gradient", color: "primary" }}
              />
              <MDBox p={3} alignItems="center" textAlign="center">
                <MDButton
                  disabled={
                    selectedPSCode == undefined ||
                    selectedPSCode == null ||
                    isLoadingShow
                  }
                  variant="gradient"
                  color="primary"
                  onClick={() => {
                    getDetail();
                  }}
                >
                  <Icon>search</Icon>&nbsp;{" "}
                  {isLoadingShow ? "Showing This Unit..." : "Show This Unit"}
                </MDButton>
              </MDBox>
            </MDBox>
          )}
        </Card>
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
                            errors,
                            touched,
                            isSubmitting,
                            setFieldValue,
                            resetForm,
                            values,
                          }) => {
                            setformValues(values);
                            const isValifForm = () =>
                              checkingSuccessInput(
                                values.paymentMethod,
                                errors.paymentMethod
                              ) &&
                              checkingSuccessInput(
                                values.amountPayment,
                                errors.amountPayment
                              ) &&
                              checkingSuccessInput(values.bank, errors.bank);
                            return (
                              <Form
                                id="payment-detail"
                                autoComplete="off"
                                fullWidth
                              >
                                <MDBox pb={3}>
                                  <Grid container spacing={3}>
                                    <Grid item xs={6}>
                                      <FormField
                                        type="text"
                                        required
                                        label="Cluster"
                                        name="cluster"
                                        disabled
                                        placeholder="Type Cluster"
                                        error={
                                          errors.cluster && touched.cluster
                                        }
                                        success={checkingSuccessInput(
                                          formValues.cluster,
                                          errors.cluster
                                        )}
                                      />
                                    </Grid>
                                    <Grid item xs={6}>
                                      <FormField
                                        InputLabelProps={{ shrink: true }}
                                        type="date"
                                        required
                                        label="Transaction Date"
                                        name="transactionDate"
                                        placeholder="Type Transaction Date"
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
                                        name="paymentMethod"
                                        component={Autocomplete}
                                        options={dataPaymentMethod}
                                        getOptionLabel={(option) =>
                                          option.paymentName
                                        }
                                        onChange={(e, value) => {
                                          setFieldValue(
                                            "paymentMethod",
                                            value !== null
                                              ? value
                                              : initialValues["paymentMethod"]
                                          );
                                          setIsCard(value);
                                        }}
                                        isOptionEqualToValue={(option, value) =>
                                          option.paymentType ===
                                          value.paymentType
                                        }
                                        renderInput={(params) => (
                                          <FormField
                                            {...params}
                                            type="text"
                                            required
                                            label="Payment Method"
                                            name="paymentMethod"
                                            placeholder="Choose Payment Method"
                                            InputLabelProps={{ shrink: true }}
                                            error={
                                              errors.paymentMethod &&
                                              touched.paymentMethod
                                            }
                                            success={checkingSuccessInput(
                                              formValues.paymentMethod,
                                              errors.paymentMethod
                                            )}
                                          />
                                        )}
                                      />
                                    </Grid>
                                    <Grid item xs={6}>
                                      <Field
                                        name="bank"
                                        component={Autocomplete}
                                        options={dataBank}
                                        getOptionLabel={(option) =>
                                          option.bankName
                                        }
                                        onChange={(e, value) => {
                                          setFieldValue(
                                            "bank",
                                            value !== null
                                              ? value
                                              : initialValues["bank"]
                                          );
                                        }}
                                        isOptionEqualToValue={(option, value) =>
                                          option.bankID === value.bankID
                                        }
                                        renderInput={(params) => (
                                          <FormField
                                            {...params}
                                            type="text"
                                            label="Bank"
                                            name="bank"
                                            placeholder="Choose Bank"
                                            InputLabelProps={{ shrink: true }}
                                            error={errors.bank && touched.bank}
                                            success={checkingSuccessInput(
                                              formValues.bank,
                                              errors.bank
                                            )}
                                          />
                                        )}
                                      />
                                    </Grid>
                                    <Grid item xs={6}>
                                      <FormField
                                        type="text"
                                        label="Card number"
                                        name="cardNumber"
                                        placeholder="Type Card Number"
                                        error={
                                          errors.cardNumber &&
                                          touched.cardNumber
                                        }
                                        success={checkingSuccessInput(
                                          formValues.cardNumber,
                                          errors.cardNumber
                                        )}
                                      />
                                    </Grid>
                                    <Grid item xs={6}>
                                      <FormField
                                        type="text"
                                        label="Remarks"
                                        name="remarks"
                                        placeholder="Type Remarks"
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
                                      <NumberInput
                                        required
                                        label="Amount Payment"
                                        placeholder="Type Amount Payment"
                                        value={formValues.amountPayment}
                                        onValueChange={(val) => {
                                          console.log("val-------", val);
                                          setFieldValue(
                                            "amountPayment",
                                            val.floatValue
                                          );
                                          if (val.floatValue != undefined)
                                            setTotalPay(val.floatValue);
                                          else setTotalPay(0);
                                        }}
                                        error={
                                          errors.amountPayment &&
                                          touched.amountPayment
                                        }
                                        success={checkingSuccessInput(
                                          formValues.amountPayment,
                                          errors.amountPayment
                                        )}
                                      />

                                      <MDBox mt={0.75}>
                                        <MDTypography
                                          component="div"
                                          variant="caption"
                                          color="error"
                                          fontWeight="regular"
                                        >
                                          <ErrorMessage name="amountPayment" />
                                        </MDTypography>
                                      </MDBox>
                                    </Grid>
                                    <Grid item xs={4}>
                                      <NumberInput
                                        label="Charge"
                                        placeholder="Type Charge"
                                        value={formValues.charge}
                                        onValueChange={(val) => {
                                          console.log("val-------", val);
                                          setFieldValue(
                                            "charge",
                                            val.floatValue
                                          );
                                          if (val.floatValue != undefined)
                                            setCharge(val.floatValue);
                                          else setCharge(0);
                                        }}
                                        error={errors.charge && touched.charge}
                                        success={checkingSuccessInput(
                                          formValues.charge,
                                          errors.charge
                                        )}
                                      />
                                      <MDBox mt={0.75}>
                                        <MDTypography
                                          component="div"
                                          variant="caption"
                                          color="error"
                                          fontWeight="regular"
                                        >
                                          <ErrorMessage name="charge" />
                                        </MDTypography>
                                      </MDBox>
                                    </Grid>
                                    <Grid item xs={4}>
                                      <TotalDisable
                                        title="Total"
                                        value={totalAc}
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
                                        <DetailBalance
                                          isOpen={openDetail}
                                          params={invoiceId}
                                          close={handleDetail}
                                        />
                                        <DataTableTotal
                                          table={setInvoiceList()}
                                          showTotalEntries={false}
                                          isSorted={false}
                                          totalFooter={totalFooter}
                                          entriesPerPage={false}
                                        />
                                      </MDBox>
                                    </Grid>
                                  </Grid>
                                </MDBox>
                                <Grid item xs={6}>
                                  <FormGroup>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          disabled={!formValues.isPrintOR}
                                          name="print-or"
                                          color="primary"
                                          checked={formValues.isPrintOR}
                                          onChange={(e) => {
                                            setFieldValue(
                                              "isPrintOR",
                                              e.target.checked != null
                                                ? e.target.checked
                                                : initialValues["isPrintOR"]
                                            );
                                          }}
                                        />
                                      }
                                      label="Print Official Receipt (OR)"
                                    />
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          disabled={!formValues.isAddSignee}
                                          name="add-signee"
                                          color="primary"
                                          checked={formValues.isAddSignee}
                                          onChange={(e) => {
                                            setFieldValue(
                                              "isAddSignee",
                                              e.target.checked != null
                                                ? e.target.checked
                                                : initialValues["isAddSignee"]
                                            );
                                          }}
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
                                      onClick={() => cancel()}
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
                                        disabled={!isValifForm() || isLoading}
                                      >
                                        {isLoading ? "Saving..." : "Save"}
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
