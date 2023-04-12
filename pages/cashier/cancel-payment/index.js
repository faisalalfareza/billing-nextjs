import React, { useState, useEffect } from "react";
import { NumericFormat } from "react-number-format";
import { Formik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";

import { Card, Grid, Icon, Radio } from "@mui/material";

import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDButton from "/components/MDButton";

import { typeNormalization } from "/helpers/utils";
import { alertService } from "/helpers/alert.service";

import DashboardLayout from "/layout/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/layout/Navbars/DashboardNavbar";
import DataTable from "/layout/Tables/DataTable";

import DetailCancelPayment from "./components/DetailCancelPayment";

import FormField from "/pagesComponents/FormField";
import SiteDropdown from "../../../pagesComponents/dropdown/Site";


function CancelPayment() {
  const [site, setSite] = useState(null);
  const handleSite = (siteVal) => {
    setSite(siteVal);
    localStorage.setItem("site", JSON.stringify(siteVal));
  };

  
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
    setCustomerRequest({
      ...prevState,
      skipCount: e,
    });
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
    let response = await fetch("/api/cashier/cancel-payment/listCustomer", {
      method: "POST",
      body: JSON.stringify({
        params: {
          SiteId: site?.siteId,
          Search: keywords,
          MaxResultCount: recordsPerPage, // Rows Per Page (Fixed). Start From 1
          SkipCount: skipCount, // Increments Based On Page (Flexible). Start From 0
        },
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error) alertService.error({ title: "Error", text: response.error.message });
    else {
      setCustomerResponse((prevState) => ({
        ...prevState,
        rowData: response.items,
        totalRows: response.totalCount,
        totalPages: Math.ceil(response.totalCount / customerRequest.recordsPerPage),
      }));
    } setLoadingCustomer(false);
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


  const checkingSuccessInput = (isRequired, value, error) => {
    return (!isRequired && true) || (isRequired && value != undefined && value != "" && !error);
  };
  const onFormSubmit = async (e) => {
    e != undefined && e.preventDefault();
    getCustomerList();
  };


  const [isLoadingCancelPayment, setLoadingCancelPayment] = useState(false);
  const [cancelPaymentData, setCancelPaymentData] = useState({
    rowData: [],
    totalRows: undefined,
    totalPages: undefined,
  });

  const getCancelPaymentList = async (unitDataID) => {
    setLoadingCancelPayment(true);

    let response = await fetch("/api/cashier/cancel-payment/listCancelPayment", {
      method: "POST",
      body: JSON.stringify({
        params: {
          UnitDataId: unitDataID,
          MaxResultCount: 1000, // Rows Per Page (Fixed). Start From 1
          SkipCount: 0, // Increments Based On Page (Flexible). Start From 0
        },
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error) alertService.error({ title: "Error", text: response.error.message });
    else {
      setCancelPaymentData((prevState) => ({
        ...prevState,
        rowData: response.items,
        totalRows: response.totalCount,
        totalPages: Math.ceil(response.totalCount / customerRequest.recordsPerPage),
      }));
    } setLoadingCancelPayment(false);
  };
  const setCancelPaymentTaskList = (rows) => {
    return {
      columns: [
        {
          Header: "No",
          accessor: "billingHeaderId",
          Cell: ({ row }) => row.index + 1,
          align: "center",
        },
        { Header: "Receipt Number", accessor: "receiptNumber" },
        { Header: "Transaction Date", accessor: "transactionDate" },
        { Header: "Payment Method", accessor: "method" },
        {
          Header: "Total Amount",
          accessor: "totalAmount",
          align: "right",
          Cell: ({ value }) => {
            return (
              <NumericFormat
                displayType="text"
                value={value}
                decimalSeparator=","
                prefix="Rp. "
                thousandSeparator="."
              />
            );
          },
        },
        { Header: "Remarks", accessor: "remarks" },
        { Header: "Canceled", accessor: "canceled" },
        {
          Header: "Actions",
          accessor: "action",
          Cell: ({ row }) => {
            return (
              <MDButton
                variant="outlined"
                color="info"
                size="small"
                disabled={!row.original.billingHeaderId}
                onClick={(e) => openModal(row.original)}
              >
                <Icon>payment</Icon>&nbsp; Detail
              </MDButton>
            );
          },
          align: "center",
        },
      ],
      rows: rows,
    };
  };


  const [modalOpen, setModalOpen] = useState({
    isOpen: false,
    params: undefined
  });
  const openModal = (record = undefined) => {
    setModalOpen({
      isOpen: !modalOpen.isOpen,
      params: record
    });
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
                  <Grid item xs={12} mb={2}>
                    <MDBox>
                      <MDTypography variant="h5">
                        Filter
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
                        touched
                      }) => {
                        let {
                          customerName: customerNameV
                        } = values;
                        const isValifForm = () => (
                          checkingSuccessInput(customerName.isRequired, customerNameV, errors.customerName)
                        );

                        return (
                          <MDBox
                            component="form"
                            role="form"
                            onSubmit={(e) => onFormSubmit(e)}
                          >
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
                                  error={errors.customerName && touched.customerName}
                                  success={customerName.isRequired && checkingSuccessInput(customerName.isRequired, customerNameV, errors.customerName)}
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
                                  <MDBox
                                    ml={{ xs: 0, sm: 1 }}
                                    mt={{ xs: 1, sm: 0 }}
                                  >
                                    <MDButton
                                      type="submit"
                                      variant="gradient"
                                      color="primary"
                                      sx={{ height: "100%" }}
                                      disabled={!isValifForm() || isLoadingCustomer}
                                    >
                                      <Icon>search</Icon>&nbsp;{" "} { isLoadingCustomer ? "Searching.." : "Search" }
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
                { customerResponse.rowData.length > 0 && (
                  <Grid container alignItems="center" pt={3}>
                    <Grid item xs={12} mb={2}>
                      <MDBox>
                        <MDTypography variant="h5">Search Result</MDTypography>
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
                        recordsPerPageChangeHandler={recordsPerPageChangeHandler}
                        keywordsChangeHandler={keywordsChangeHandler}
                      />
                      <MDBox pt={3} pb={1} px={3}>
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
                                onClick={() => getCancelPaymentList(selectedUnit.unitDataId)}
                                disabled={!selectedUnit}
                              >
                                { isLoadingCancelPayment ? "Showing this Unit.." : "Show this Unit" }
                              </MDButton>
                            </MDBox>
                          </MDBox>
                        </Grid>
                      </MDBox>
                    </Grid>
                  </Grid>
                ) }
              </MDBox>
            </Card>
          </Grid>

          { cancelPaymentData.rowData.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <MDBox p={3} lineHeight={1}>
                  <Grid container alignItems="center">
                    <Grid item xs={12} mb={2}>
                      <MDBox>
                        <MDTypography variant="h5">
                          Cancel Payment List
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12}>
                      <DataTable
                        table={setCancelPaymentTaskList(cancelPaymentData.rowData)}
                        // canEntriesPerPage entriesPerPage={{ defaultValue: customerRequest.recordsPerPage }}
                        // canSearch
                      />
                    </Grid>
                  </Grid>
                </MDBox>
              </Card>

              { modalOpen.isOpen && <DetailCancelPayment
                  isOpen={modalOpen.isOpen}
                  params={modalOpen.params}
                  onModalChanged={(isChanged) => {
                    setModalOpen((prevState) => ({
                      ...prevState,
                      isOpen: !modalOpen.isOpen
                    }));
                    isChanged && getCancelPaymentList(selectedUnit.unitDataId);
                  }}
                />
              }
            </Grid>
          )}
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default CancelPayment;
