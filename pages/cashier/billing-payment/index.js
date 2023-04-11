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
import Swal from "sweetalert2";
import * as dayjs from "dayjs";
import { FormGroup, FormControlLabel, Checkbox } from "@mui/material";
import DataTableTotal from "../../../layout/Tables/DataTableTotal";
import { useCookies } from "react-cookie";
import SiteDropdown from "../../../pagesComponents/dropdown/Site";
import NumberInput from "/pagesComponents/dropdown/NumberInput";
import TotalDisable from "/pagesComponents/dropdown/TotalDisable";
import { NumericFormat } from "react-number-format";

export default function BillingPayment(props) {
  const [listBilling, setListBilling] = useState([]);
  const [listInvoice, setListInvoice] = useState([]);
  const [site, setSite] = useState(null);
  const [openModal, setOpenModal] = useState(false);
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

  useEffect(() => {
    getPaymentMethod();
    getBank();
    let currentSite = JSON.parse(localStorage.getItem("site"));
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
  let schemeValidations = Yup.object().shape({
    cluster: Yup.string(),
    paymentMethod: Yup.object().required("Payment Method is required."),
    cardNumber: Yup.string(),
    amountPayment: Yup.string()
      .required("Amount Payment is required.")
      .typeError("Amount Payment is required."),
    transactionDate: Yup.date()
      .required("Transaction Date is required.")
      .typeError("Transaction Date is required."),
    bank: Yup.object()
      .required("Bank is required.")
      .typeError("Bank is required."),
    remarks: Yup.string().required("Remarks is required."),
    charge: Yup.string(),
  });

  var customParseFormat = require("dayjs/plugin/customParseFormat");
  dayjs.extend(customParseFormat);

  const initialValues = {
    cluster: detail?.clusterName,
    paymentMethod: "",
    cardNumber: "",
    amountPayment: null,
    transactionDate: null,
    bank: null,
    remarks: "",
    charge: "",
    isPrintOR: true,
    isAddSignee: true,
  };

  const [formValues, setformValues] = useState(initialValues);

  const getFormData = (values) => {
  };

  const submitForm = async (values, actions) => {
    paymentProcess(values, actions);
  };

  const checkingSuccessInput = (value, error) => {
    return value != undefined && value != "" && value.length > 0 && !error;
  };

  const paymentProcess = async (fields, actions) => {
    const body = {
      paymentType: fields.paymentMethod.paymentType,
      cardNumber: fields.cardNumber,
      totalPayment: fields.amountPayment,
      total: 0,
      charge: fields.charge,
      unitDataId: detail.unitDataId,
      unitCode: detail.unitCode,
      unitNo: detail.unitNo,
      psCode: detail.psCode,
      bankId: fields.bank.bankID,
      remarks: fields.remarks,
      listInvoicePayment: listInvoice,
    };

    let response = await fetch("/api/cashier/billing/create", {
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
      alertService.success({
        title: "Input Payment Successfull",
        text: "Official receipt document will be displayed and will be sent to the customer via email",
      });
    }
    actions.setSubmitting(false);
  };

  const handleCheck = (val) => {
    setSelectedPSCode(val.unitDataId);
    setDetail(val);
  };

  const setBillingList = () => {
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
      rows: listBilling,
    };
  };
  const paymentAmountChange = (value, index) => {
    const newData = listInvoice.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          paymentAmount: value,
        };
      } else {
        return item;
      }
    });

    setListInvoice(newData);
  };

  useEffect(() => {
    let tp = listInvoice.reduce((acc, o) => acc + parseInt(o.paymentAmount), 0);
    let n = Object.assign({}, totalFooter);
    n.payment = tp;
    setTotalFooter(n);
  }, [listInvoice]);
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
          Cell: ({ value, row }) => {
            return (
              // <NumberInput
              //   inputProps={{ style: { textAlign: "right" } }}
              //   placeholder="Type Amount Payment"
              //   value={value}
              //   onValueChange={(val) =>
              //     paymentAmountChange(val.value, row.index)
              //   }
              // />
              <TextField
                inputProps={{ style: { textAlign: "right" } }}
                placeholder="Type Amount Payment"
                value={value}
                onChange={(val) =>
                  paymentAmountChange(val.target.value, row.index)
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
    }
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
                            errors,
                            touched,
                            isSubmitting,
                            setFieldValue,
                            resetForm,
                          }) => {
                            const fields = [
                              "cluster",
                              "paymentMethod",
                              "cardNumber",
                              "amountPayment",
                              "transactionDate",
                              "bank",
                              "remarks",
                              "charge",
                            ];
                            // fields.forEach((field) =>
                            //   setFieldValue(field, initialValues[field], false)
                            // );
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
                                        label="Cluster ⁽*⁾"
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
                                        label="Transaction Date ⁽*⁾"
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
                                        }}
                                        renderInput={(params) => (
                                          <FormField
                                            {...params}
                                            type="text"
                                            label="Payment Method *"
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
                                        label="Remarks ⁽*⁾"
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
                                        label="Amount Payment ⁽*⁾"
                                        placeholder="Type Amount Payment"
                                        value={formValues.amountPayment}
                                        onValueChange={(val) =>
                                          setFieldValue(
                                            "amountPayment",
                                            val.floatValue
                                          )
                                        }
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
                                        onValueChange={(val) =>
                                          setFieldValue(
                                            "charge",
                                            val.floatValue
                                          )
                                        }
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
                                        value={123456}
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
                                          totalFooter={totalFooter}
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
