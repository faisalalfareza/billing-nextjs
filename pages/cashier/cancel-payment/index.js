import React, { useState, useEffect, useRef } from "react";
import { NumericFormat } from "react-number-format";
import { Formik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";

import { Card, Grid, Icon, Radio } from "@mui/material";
import { Block } from "notiflix/build/notiflix-block-aio";

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
  const formikRef = useRef();

  useEffect(() => {
    setCustomerResponse((prevState) => ({
      ...prevState,
      rowData: [],
      totalRows: undefined,
      totalPages: undefined,
    }));
    if (formikRef.current) {
      formikRef.current.setFieldValue("customerName", "");
      formikRef.current.setFieldValue("unitCode", "");
      formikRef.current.setFieldValue("unitNo", "");
    }
    setCancelPaymentData({
      rowData: [],
      totalRows: undefined,
      totalPages: undefined,
    }),
      setSelectedUnit();
    setCustomerRequest((prevState) => ({
      ...prevState,
      unitCode: "",
      unitNo: "",
      keywords: "",
    }));
  }, [site]);

  const schemeModels = {
    formId: "reprint-or-form",
    formField: {
      customerName: {
        name: "customerName",
        label: "Customer Name / ID Client",
        placeholder: "Type Customer Name or ID Client",
        type: "text",
        isRequired: false,
        errorMsg: "Customer Name or ID Client is required.",
        defaultValue: "",
      },
      unitCode: {
        name: "unitCode",
        label: "Unit Code",
        placeholder: "Type Unit Code",
        type: "text",
        isRequired: false,
        errorMsg: "Unit Code is required.",
        defaultValue: "",
      },
      unitNo: {
        name: "unitNo",
        label: "Unit No",
        placeholder: "Type Unit No",
        type: "text",
        isRequired: false,
        errorMsg: "Unit No is required.",
        defaultValue: "",
      },
    },
  };
  let { customerName, unitCode, unitNo } = schemeModels.formField;
  let schemeValidations = Yup.object().shape({
    [customerName.name]: customerName.isRequired
      ? Yup.string().required(customerName.errorMsg)
      : Yup.string().notRequired(),
    [unitCode.name]: unitCode.isRequired
      ? Yup.string().required(unitCode.errorMsg)
      : Yup.string().notRequired(),
    [unitNo.name]: unitNo.isRequired
      ? Yup.string().required(unitNo.errorMsg)
      : Yup.string().notRequired(),
  });
  const schemeInitialValues = {
    [customerName.name]: customerName.defaultValue,
    [unitCode.name]: unitCode.defaultValue,
    [unitNo.name]: unitNo.defaultValue,
  };
  useEffect(() => {
    document.getElementsByName(customerName.name)[0]?.focus();

    let currentSite = typeNormalization(localStorage.getItem("site"));
    if (currentSite == null)
      Swal.fire({ title: "Please choose site first.", icon: "info" });
    else setSite(currentSite);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [isExpandedFilter, setExpandFilter] = useState(true);

  const customerBlockLoadingName = "block-customer";
  const [isLoadingCustomer, setLoadingCustomer] = useState(false);
  const [customerRequest, setCustomerRequest] = useState({
    scheme: site?.siteId,
    unitCode: "",
    unitNo: "",
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
    setCustomerRequest((prevState) => ({
      ...prevState,
      recordsPerPage: e,
    }));
  };
  const keywordsChangeHandler = (e) => {
    customerRequest.keywords = e;
    setCustomerRequest((prevState) => ({
      ...prevState,
      keywords: e,
    }));
  };

  const getCustomerList = async (data) => {
    Block.standard(`.${customerBlockLoadingName}`, `Searching for Customer`),
      setLoadingCustomer(true);

    const { scheme, keywords, unitCode, unitNo, recordsPerPage, skipCount } =
      customerRequest;
    let response = await fetch("/api/cashier/cancel-payment/getcustomerlist", {
      method: "POST",
      body: JSON.stringify({
        params: {
          SiteId: site?.siteId,
          Search: keywords,
          UnitCode: unitCode,
          UnitNo: unitNo,
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
      setCustomerResponse((prevState) => ({
        ...prevState,
        rowData: response.items,
        totalRows: response.totalCount,
        totalPages: Math.ceil(
          response.totalCount / customerRequest.recordsPerPage
        ),
      }));
      setTimeout(() => {
        const element = document.createElement("a");
        element.href = "#customer";
        element.click();
      }, 0);
    }
    Block.remove(`.${customerBlockLoadingName}`), setLoadingCustomer(false);
  };
  const setCustomerTaskList = (rows) => {
    const { skipCount } = customerRequest;

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
                onChange={(changed) => {
                  if (row.original != selectedUnit) {
                    setCancelPaymentData({
                      rowData: [],
                      totalRows: undefined,
                      totalPages: undefined,
                    });
                  }
                  setSelectedUnit(row.original);
                }}
              />
            );
          },
          // align: "center",
        },
        {
          Header: "No",
          Cell: ({ row }) => skipCount + row.index + 1,
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
    site && getCustomerList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerRequest.skipCount, customerRequest.recordsPerPage]);

  const checkingSuccessInput = (isRequired, value, error) => {
    return (
      (!isRequired && true) ||
      (isRequired && value != undefined && value != "" && !error)
    );
  };
  const handleCustomerSubmit = async (e) => {
    e != undefined && e.preventDefault();

    setCancelPaymentData({
      rowData: [],
      totalRows: undefined,
      totalPages: undefined,
    }),
      setSelectedUnit();

    getCustomerList();
  };

  const cancelPaymentBlockLoadingName = "block-cancel-payment";
  const [isLoadingCancelPayment, setLoadingCancelPayment] = useState(false);
  const [cancelPaymentData, setCancelPaymentData] = useState({
    rowData: [],
    totalRows: undefined,
    totalPages: undefined,
  });

  const getCancelPaymentList = async (unitDataID) => {
    Block.standard(
      `.${cancelPaymentBlockLoadingName}`,
      `Getting Cancel Payment Data`
    ),
      setLoadingCancelPayment(true);

    let response = await fetch(
      "/api/cashier/cancel-payment/getlistcancelpayment",
      {
        method: "POST",
        body: JSON.stringify({
          params: {
            UnitDataId: unitDataID,
            MaxResultCount: 1000, // Rows Per Page (Fixed). Start From 1
            SkipCount: 0, // Increments Based On Page (Flexible). Start From 0
          },
        }),
      }
    );
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error)
      alertService.error({ title: "Error", text: response.error.message });
    else {
      setCancelPaymentData((prevState) => ({
        ...prevState,
        rowData: response.items,
        totalRows: response.totalCount,
        totalPages: Math.ceil(
          response.totalCount / customerRequest.recordsPerPage
        ),
      }));
      setTimeout(() => {
        const element = document.createElement("a");
        element.href = "#cancel-payment";
        element.click();
      }, 0);

      response.totalCount == 0 &&
        Swal.fire({
          title: "There is no payment billing for this unit.",
          icon: "info",
        });
    }
    Block.remove(`.${cancelPaymentBlockLoadingName}`),
      setLoadingCancelPayment(false);
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
        { Header: "Remarks", accessor: "remarks", customWidth: "200px" },
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
    params: undefined,
  });
  const openModal = (record = undefined) => {
    setModalOpen({
      isOpen: !modalOpen.isOpen,
      params: record,
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
        mt={2}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <SiteDropdown onSelectSite={handleSite} site={site} />
          </Grid>
        </Grid>
      </MDBox>

      <MDBox mt={2} id="customer">
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card className={customerBlockLoadingName}>
              <MDBox px={3} pt={3} pb={2} lineHeight={1}>
                <Grid container alignItems="center" spacing={2}>
                  <Grid item xs={12} sm={11}>
                    <MDBox>
                      <MDTypography variant="h5">Filter</MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={12} sm={1}>
                    <MDBox display="flex" justifyContent="flex-end">
                      <a
                        onClick={() => setExpandFilter(!isExpandedFilter)}
                        style={{ cursor: "pointer" }}
                      >
                        <MDTypography
                          variant="button"
                          color="text"
                          sx={{ lineHeight: 0 }}
                        >
                          {isExpandedFilter ? (
                            <Icon fontSize="small">expand_less</Icon>
                          ) : (
                            <Icon fontSize="small">expand_more</Icon>
                          )}
                        </MDTypography>
                      </a>
                    </MDBox>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    style={{ display: isExpandedFilter ? "initial" : "none" }}
                  >
                    <Formik
                      initialValues={schemeInitialValues}
                      validationSchema={schemeValidations}
                      innerRef={formikRef}
                    >
                      {({ values, errors, touched }) => {
                        let {
                          customerName: customerNameV,
                          unitCode: unitCodeV,
                          unitNo: unitNoV,
                        } = values;
                        const isValifForm = () =>
                          checkingSuccessInput(
                            customerName.isRequired,
                            customerNameV,
                            errors.customerName
                          );

                        return (
                          <MDBox
                            component="form"
                            role="form"
                            onSubmit={(e) => handleCustomerSubmit(e)}
                          >
                            <Grid container columnSpacing={3}>
                              <Grid item xs={12} sm={4}>
                                <FormField
                                  type={customerName.type}
                                  required={customerName.isRequired}
                                  label={customerName.label}
                                  name={customerName.name}
                                  value={customerNameV}
                                  placeholder={customerName.placeholder}
                                  error={
                                    errors.customerName && touched.customerName
                                  }
                                  success={
                                    customerName.isRequired &&
                                    checkingSuccessInput(
                                      customerName.isRequired,
                                      customerNameV,
                                      errors.customerName
                                    )
                                  }
                                  onKeyUp={(e) =>
                                    setCustomerRequest((prevState) => ({
                                      ...prevState,
                                      keywords: e.target.value,
                                    }))
                                  }
                                />
                              </Grid>
                              <Grid item xs={12} sm={3}>
                                <FormField
                                  type={unitCode.type}
                                  required={unitCode.isRequired}
                                  label={unitCode.label}
                                  name={unitCode.name}
                                  value={unitCodeV}
                                  placeholder={unitCode.placeholder}
                                  error={errors.unitCode && touched.unitCode}
                                  success={
                                    unitCode.isRequired &&
                                    checkingSuccessInput(
                                      unitCode.isRequired,
                                      unitCodeV,
                                      errors.unitCode
                                    )
                                  }
                                  onKeyUp={(e) =>
                                    setCustomerRequest((prevState) => ({
                                      ...prevState,
                                      unitCode: e.target.value,
                                    }))
                                  }
                                />
                              </Grid>
                              <Grid item xs={12} sm={3}>
                                <FormField
                                  type={unitNo.type}
                                  required={unitNo.isRequired}
                                  label={unitNo.label}
                                  name={unitNo.name}
                                  value={unitNoV}
                                  placeholder={unitNo.placeholder}
                                  error={errors.unitNo && touched.unitNo}
                                  success={
                                    unitNo.isRequired &&
                                    checkingSuccessInput(
                                      unitNo.isRequired,
                                      unitNoV,
                                      errors.unitNo
                                    )
                                  }
                                  onKeyUp={(e) =>
                                    setCustomerRequest((prevState) => ({
                                      ...prevState,
                                      unitNo: e.target.value,
                                    }))
                                  }
                                />
                              </Grid>
                              <Grid item xs={12} sm={2}>
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
                                      disabled={isLoadingCustomer}
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
              </MDBox>
              {customerResponse.rowData.length > 0 && (
                <MDBox
                  style={{ display: isExpandedFilter ? "initial" : "none" }}
                >
                  <Grid container alignItems="center">
                    <Grid item xs={12}>
                      <MDBox pl={3}>
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
                        recordsPerPageChangeHandler={
                          recordsPerPageChangeHandler
                        }
                        keywordsChangeHandler={keywordsChangeHandler}
                        entriesPerPage={{
                          defaultValue: customerRequest.recordsPerPage,
                        }}
                        pagination={{ variant: "gradient", color: "primary" }}
                      />
                      <MDBox p={3} pt={0}>
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
                                  getCancelPaymentList(selectedUnit.unitDataId)
                                }
                                disabled={!selectedUnit}
                              >
                                {isLoadingCancelPayment
                                  ? "Showing this Unit.."
                                  : "Show this Unit"}
                              </MDButton>
                            </MDBox>
                          </MDBox>
                        </Grid>
                      </MDBox>
                    </Grid>
                  </Grid>
                </MDBox>
              )}
            </Card>
          </Grid>

          {cancelPaymentData.rowData.length > 0 && (
            <Grid item xs={12} id="cancel-payment">
              <Card className={cancelPaymentBlockLoadingName}>
                <MDBox>
                  <Grid container alignItems="center">
                    <Grid item xs={12} mb={1}>
                      <DataTable
                        title="Cancel Payment List"
                        description="Cancel Payment Data"
                        table={setCancelPaymentTaskList(
                          cancelPaymentData.rowData
                        )}
                        canSearch
                        pagination={{ variant: "gradient", color: "primary" }}
                      />
                    </Grid>
                  </Grid>
                </MDBox>
              </Card>

              {modalOpen.isOpen && (
                <DetailCancelPayment
                  isOpen={modalOpen.isOpen}
                  params={modalOpen.params}
                  onModalChanged={(isChanged) => {
                    setModalOpen((prevState) => ({
                      ...prevState,
                      isOpen: !modalOpen.isOpen,
                    }));
                    isChanged === true &&
                      getCancelPaymentList(selectedUnit.unitDataId);
                  }}
                />
              )}
            </Grid>
          )}
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default CancelPayment;
