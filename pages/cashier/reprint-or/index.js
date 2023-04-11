import React, { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { Formik, Form } from "formik";
import * as Yup from "yup";
// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import Autocomplete from "@mui/material/Autocomplete";
import Radio from "@mui/material/Radio";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDButton from "/components/MDButton";

// NextJS Material Dashboard 2 PRO examples
import DashboardLayout from "/layout/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/layout/Navbars/DashboardNavbar";
import DataTable from "/layout/Tables/DataTable";

import FormField from "/pagesComponents/FormField";
import SiteDropdown from "../../../pagesComponents/dropdown/Site";
import { typeNormalization } from "/helpers/utils";
import { alertService } from "/helpers";

function RePrintOR() {
  const [{ accessToken, encryptedAccessToken }] = useCookies();
  const [site, setSite] = useState(null);

  const schemeModels = {
    formId: "reprint-or-form",
    formField: {
      customerName: {
        name: "customerName",
        label: "Customer Name or ID Client",
        placeholder: "Entry the Customer Name or ID Client",
        type: "text",
        isRequired: true,
        errorMsg: "Customer Name or ID Client is required.",
        defaultValue: "",
      },
    },
  };
  let { customerName } = schemeModels.formField;
  let schemeValidations = Yup.object().shape({
    [customerName.name]: customerName.isRequired
      ? Yup.string().required(customerName.errorMsg)
      : Yup.string().notRequired(),
  });
  const schemeInitialValues = {
    [customerName.name]: customerName.defaultValue,
  };
  useEffect(() => {
    document.getElementsByName(customerName.name)[0].focus();
    let currentSite = JSON.parse(localStorage.getItem("site"));
    if (currentSite == null) {
      alertService.info({ title: "Info", text: "Please choose Site first" });
    } else {
      setSite(currentSite);
    }
  }, []);

  const [isLoadingCustomer, setLoadingCustomer] = useState(false);
  const [customerRequest, setCustomerRequest] = useState({
    scheme: site?.siteId,
    keywords: "",
    recordsPerPage: 5,
    skipCount: 0,
  });
  const [customerResponse, setCustomerResponse] = useState({
    rowData: [],
    totalRows: undefined,
    totalPages: undefined,
  });
  const [selectedUnit, setSelectedUnit] = useState();

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

  const getCustomerList = async (data) => {
    setLoadingCustomer(true);

    const { scheme, keywords, recordsPerPage, skipCount } = customerRequest;
    let response = await fetch("/api/cashier/reprintor/listCustomer", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
        params: {
          SiteId: site?.siteId,
          // Search: keywords,
          MaxResultCount: recordsPerPage, // Rows Per Page (Fixed). Start From 1
          SkipCount: skipCount, // Increments Based On Page (Flexible). Start From 0
        },
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error)
      alertService.error({ title: "Error", text: response.error.message });
    else {
      let data = response.result;
      setCustomerResponse((prevState) => ({
        ...prevState,
        rowData: data.items,
        totalRows: data.totalCount,
        totalPages: Math.ceil(data.totalCount / customerRequest.recordsPerPage),
      }));
      setLoadingCustomer(false);
    }
  };

  const setCustomerTaskList = (rows) => {
    return {
      columns: [
        {
          Header: "Choose",
          Cell: ({ row }) => {
            return (
              <Radio
                checked={row.original == selectedUnit}
                name="radio-buttons"
                value={row.original}
                onChange={(changed) => setSelectedUnit(row.original)}
              />
            );
          },
          align: "center",
        },
        {
          Header: "No",
          Cell: ({ row }) => row.index + 1,
          align: "center",
        },
        { Header: "Project", accessor: "projectName" },
        { Header: "Cluster", accessor: "clusterName" },
        { Header: "Unit Name", accessor: "unitName" },
        { Header: "Unit Code", accessor: "unitCode" },
        { Header: "Unit No", accessor: "unitNo" },
        { Header: "Customer Name", accessor: "customerName" },
      ],
      rows: rows,
    };
  };
  useEffect(() => {
    customerRequest.keywords != "" && getCustomerList();
  }, [customerRequest.skipCount, customerRequest.recordsPerPage]);

  const checkingSuccessInput = (value, error) => {
    return value != undefined && value != "" && value.length > 0 && !error;
  };
  const handleCustomerSubmit = async (e) => {
    e != undefined && e.preventDefault();
    getCustomerList();
  };

  const [isLoadingOfficialReceipt, setLoadingOfficialReceipt] = useState(false);
  const [officialReceiptData, setOfficialReceiptData] = useState({
    rowData: [],
    totalRows: undefined,
    totalPages: undefined,
  });

  const getOfficialReceiptList = async (unitDataID) => {
    setLoadingOfficialReceipt(true);

    const { scheme, keywords, recordsPerPage, skipCount } = customerRequest;
    let response = await fetch("/api/cashier/reprintor/listOr", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
        params: {
          UnitDataId: unitDataID,
          MaxResultCount: 1000, // Rows Per Page (Fixed). Start From 1
          SkipCount: 0, // Increments Based On Page (Flexible). Start From 0
        },
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error)
      alertService.error({ title: "Error", text: response.error.message });
    else {
      let data = response.result;
      setOfficialReceiptData((prevState) => ({
        ...prevState,
        rowData: data.items,
        totalRows: data.totalCount,
        totalPages: Math.ceil(data.totalCount / customerRequest.recordsPerPage),
      }));
      setLoadingOfficialReceipt(false);
    }
  };

  const setOfficialReceiptTaskList = (rows) => {
    return {
      columns: [
        {
          Header: "No",
          accessor: "billingHeaderId",
          Cell: ({ row }) => row.index + 1,
          align: "center",
        },
        { Header: "Receipt Number", accessor: "receiptNumber" },
        { Header: "Invoice Number", accessor: "invoiceNumber" },
        { Header: "Invoice Name", accessor: "invoiceName" },
        { Header: "Transaction Date", accessor: "transactionDate" },
        { Header: "Method", accessor: "method" },
        { Header: "Total Amount", accessor: "totalAmount", align: "right" },
        { Header: "Remarks", accessor: "remarks" },
        {
          Header: "Actions",
          accessor: "action",
          Cell: ({ row }) => {
            return (
              <MDButton
                variant="outlined"
                color="info"
                size="small"
                onClick={(e) =>
                  reprintOfficialReceipt(row.original.billingHeaderId)
                }
              >
                <Icon>print</Icon>&nbsp; Re-Print
              </MDButton>
            );
          },
          align: "center",
        },
      ],
      rows: rows,
    };
  };

  const reprintOfficialReceipt = async (billingHeaderId) => {
    setLoadingOfficialReceipt(true);
    const body = {
      SiteId: site?.siteId,
      BillingHeaderId: billingHeaderId,
    };
    let response = await fetch("/api/cashier/reprintor/reprintOr", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
        params: body,
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error)
      alertService.error({ title: "Error", text: response.error.message });
    else {
      let data = response.result;
      window.open(data);
      setLoadingOfficialReceipt(false);
    }
  };

  const handleSite = (siteVal) => {
    setSite(siteVal);
    localStorage.setItem("site", JSON.stringify(siteVal));
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
          {/* Customer List */}
          <Grid item xs={12}>
            <Card>
              <MDBox p={3} lineHeight={1}>
                <Grid container alignItems="center">
                  <Grid item xs={12}>
                    <MDBox mb={1}>
                      <MDTypography variant="h5">Filter</MDTypography>
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
                    >
                      {({ values, errors, touched }) => {
                        let { customerName: customerNameV } = values;

                        const isValifForm = () => {
                          return checkingSuccessInput(
                            customerNameV,
                            errors.customerName
                          )
                            ? true
                            : false;
                        };

                        return (
                          <MDBox
                            component="form"
                            role="form"
                            onSubmit={(e) => handleCustomerSubmit(e)}
                          >
                            {" "}
                            {/* pb={3} px={3} */}
                            <Grid container spacing={3}>
                              <Grid item xs={12} sm={9}>
                                <FormField
                                  type={customerName.type}
                                  label={
                                    customerName.label +
                                    (customerName.isRequired ? " ⁽*⁾" : "")
                                  }
                                  name={customerName.name}
                                  value={customerNameV}
                                  placeholder={customerName.placeholder}
                                  error={
                                    errors.customerName && touched.customerName
                                  }
                                  success={checkingSuccessInput(
                                    customerNameV,
                                    errors.customerName
                                  )}
                                  onKeyUp={(e) =>
                                    setCustomerRequest((prevState) => ({
                                      ...prevState,
                                      keywords: e.target.value,
                                    }))
                                  }
                                />
                              </Grid>
                              <Grid item xs={12} sm={3}>
                                <MDBox
                                  display="flex"
                                  flexDirection={{ xs: "column", sm: "row" }}
                                  justifyContent="flex-end"
                                >
                                  {/* <MDButton variant="outlined" color="secondary">
                                    Clear Filters
                                  </MDButton> */}
                                  <MDBox
                                    ml={{ xs: 0, sm: 1 }}
                                    mt={{ xs: 1, sm: 0 }}
                                  >
                                    <MDButton
                                      type="submit"
                                      variant="gradient"
                                      color="primary"
                                      sx={{ height: "100%" }}
                                      disabled={
                                        !isValifForm() || isLoadingCustomer
                                      }
                                    >
                                      <Icon>search</Icon>&nbsp;{" "}
                                      {isLoadingCustomer
                                        ? "Searching.."
                                        : "Search"}
                                    </MDButton>
                                  </MDBox>
                                </MDBox>
                              </Grid>
                            </Grid>
                          </MDBox>
                        );
                      }}
                    </Formik>
                  </Grid>
                </Grid>
                {customerResponse.rowData.length > 0 && (
                  <Grid container alignItems="center" pt={3}>
                    <Grid item xs={12}>
                      <MDBox mb={1}>
                        <MDTypography variant="h5">Search Result</MDTypography>
                      </MDBox>
                      <MDBox mb={2}>
                        <MDTypography variant="body2" color="text">
                          Customers related to search `
                          {customerRequest.keywords}`.
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12}>
                      <DataTable
                        table={setCustomerTaskList(customerResponse.rowData)}
                        manualPagination={true}
                        totalRows={customerResponse.totalRows}
                        totalPages={customerResponse.totalPages}
                        recordsPerPage={customerRequest.recordsPerPage}
                        skipCount={customerRequest.skipCount}
                        pageChangeHandler={skipCountChangeHandler}
                        recordsPerPageChangeHandler={
                          recordsPerPageChangeHandler
                        }
                        keywordsChangeHandler={keywordsChangeHandler}
                        entriesPerPage={{
                          defaultValue: customerRequest.recordsPerPage,
                        }}
                        pagination={{ variant: "gradient", color: "primary" }}
                      />
                      <MDBox pt={1} pb={1} px={3}>
                        <Grid item xs={12}>
                          <MDBox
                            display="flex"
                            flexDirection={{ xs: "column", sm: "row" }}
                            justifyContent="center"
                          >
                            <MDBox ml={{ xs: 0, sm: 1 }} mt={{ xs: 1, sm: 0 }}>
                              <MDButton
                                type="button"
                                variant="gradient"
                                color="primary"
                                sx={{ height: "100%" }}
                                onClick={() =>
                                  getOfficialReceiptList(
                                    selectedUnit.unitDataId
                                  )
                                }
                                disabled={!selectedUnit}
                              >
                                Show this Unit
                              </MDButton>
                            </MDBox>
                          </MDBox>
                        </Grid>
                      </MDBox>
                    </Grid>
                  </Grid>
                )}
              </MDBox>
            </Card>
          </Grid>

          {/* Reprint Official Receipt List */}
          {officialReceiptData.rowData.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <MDBox p={3} lineHeight={1}>
                  <Grid container alignItems="center">
                    <Grid item xs={12}>
                      <MDBox mb={1}>
                        <MDTypography variant="h5">
                          Re-Print Official Receipt List
                        </MDTypography>
                      </MDBox>
                      <MDBox mb={2}>
                        <MDTypography variant="body2" color="text">
                          Official receipts of {selectedUnit.projectName}{" "}
                          {selectedUnit.unitName} {selectedUnit.unitCode}{" "}
                          {selectedUnit.unitNo} on behalf of{" "}
                          {selectedUnit.customerName}.
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12}>
                      <DataTable
                        table={setOfficialReceiptTaskList(
                          officialReceiptData.rowData
                        )}
                        canEntriesPerPage
                        entriesPerPage={{
                          defaultValue: customerRequest.recordsPerPage,
                        }}
                        canSearch
                      />
                    </Grid>
                  </Grid>
                </MDBox>
              </Card>
            </Grid>
          )}
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default RePrintOR;
