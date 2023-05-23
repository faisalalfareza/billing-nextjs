import React, { useState, useEffect, useRef } from "react";
import { useCookies } from "react-cookie";
import { Formik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";

import { Card, Grid, Icon, Radio } from "@mui/material";
import { Block } from "notiflix/build/notiflix-block-aio";

import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDButton from "/components/MDButton";

import { typeNormalization } from "/helpers/utils";
import { alertService } from "/helpers";

import DashboardLayout from "/layout/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/layout/Navbars/DashboardNavbar";
import DataTable from "/layout/Tables/DataTable";

import FormField from "/pagesComponents/FormField";
import SiteDropdown from "../../../pagesComponents/dropdown/Site";

function RePrintOR() {
  const [{ accessToken, encryptedAccessToken }] = useCookies();

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
    }
  }, [site]);

  const schemeModels = {
    formId: "reprint-or-form",
    formField: {
      customerName: {
        name: "customerName",
        label: "Customer Name / ID Client",
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
      alertService.info({
        title: "Info!",
        text: "Please choose Site first",
      });
    } else setSite(currentSite);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [isExpandedFilter, setExpandFilter] = useState(true);

  const customerBlockLoadingName = "block-customer";
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

  const getCustomerList = async () => {
    Block.standard(`.${customerBlockLoadingName}`, `Searching for Customer`),
      setLoadingCustomer(true);

    const { scheme, keywords, recordsPerPage, skipCount } = customerRequest;
    let response = await fetch("/api/cashier/reprintor/getcustomerlist", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
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
                    setOfficialReceiptData({
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

    setOfficialReceiptData({
      rowData: [],
      totalRows: undefined,
      totalPages: undefined,
    }),
      setSelectedUnit();

    getCustomerList();
  };

  const orBlockLoadingName = "block-official-receipt",
    reprintBlockLoadingName = "block-reprint-official-receipt";
  const [isLoadingOfficialReceipt, setLoadingOfficialReceipt] = useState(false);
  const [officialReceiptData, setOfficialReceiptData] = useState({
    rowData: [],
    totalRows: undefined,
    totalPages: undefined,
  });

  const getOfficialReceiptList = async (unitDataID) => {
    Block.standard(`.${orBlockLoadingName}`, `Getting Official Receipt Data`),
      setLoadingOfficialReceipt(true);

    let response = await fetch(
      "/api/cashier/reprintor/getlistofficialreceipt",
      {
        method: "POST",
        body: JSON.stringify({
          accessToken: accessToken,
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
      setOfficialReceiptData((prevState) => ({
        ...prevState,
        rowData: response.items,
        totalRows: response.totalCount,
        totalPages: Math.ceil(
          response.totalCount / customerRequest.recordsPerPage
        ),
      }));
      setTimeout(() => {
        const element = document.createElement("a");
        element.href = "#official-receipt";
        element.click();
      }, 0);

      (response.totalCount == 0) && Swal.fire({
        title: "There is no payment billing for this unit.",
        icon: "info",
      });
    }
    Block.remove(`.${orBlockLoadingName}`), setLoadingOfficialReceipt(false);
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
                disabled={isLoadingOfficialReceipt}
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
    Block.standard(`.${orBlockLoadingName}`, `Reprinting Official Receipt`),
      setLoadingOfficialReceipt(true);

    const body = {
      SiteId: site?.siteId,
      BillingHeaderId: billingHeaderId,
    };
    let response = await fetch(
      "/api/cashier/reprintor/reprintofficialreceipt",
      {
        method: "POST",
        body: JSON.stringify({
          accessToken: accessToken,
          params: body,
        }),
      }
    );
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error)
      alertService.error({ title: "Error", text: response.error.message });
    else window.open(response.result, "_blank");

    Block.remove(`.${orBlockLoadingName}`), setLoadingOfficialReceipt(false);
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
                      innerRef={formikRef}
                      initialValues={schemeInitialValues}
                      validationSchema={schemeValidations}
                    >
                      {({ values, errors, touched }) => {
                        let { customerName: customerNameV } = values;
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
                              <Grid item xs={12} sm={10}>
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
                                  getOfficialReceiptList(
                                    selectedUnit.unitDataId
                                  )
                                }
                                disabled={!selectedUnit}
                              >
                                {isLoadingOfficialReceipt
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

          {officialReceiptData.rowData.length > 0 && (
            <Grid item xs={12} id="official-receipt">
              <Card className={orBlockLoadingName}>
                <MDBox>
                  <Grid container alignItems="center">
                    <Grid item xs={12} mb={1}>
                      <DataTable
                        title="Reprint Official Receipt List"
                        description="Official Receipt Data"
                        table={setOfficialReceiptTaskList(
                          officialReceiptData.rowData
                        )}
                        canSearch
                        pagination={{ variant: "gradient", color: "primary" }}
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
