import Card from "@mui/material/Card";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
// @mui material components
import { Grid, TextField } from "@mui/material";
// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Icon from "@mui/material/Icon";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

// NextJS Material Dashboard 2 PRO layout
import DashboardLayout from "/layout/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/layout/Navbars/DashboardNavbar";
import Footer from "/layout/Footer";
import DataTable from "/layout/Tables/DataTable";
import MDButton from "/components/MDButton";
import MDInput from "/components/MDInput";
import FormField from "/pagesComponents/FormField";
import Autocomplete from "@mui/material/Autocomplete";
import { useMaterialUIController } from "/context";
import { useCookies } from "react-cookie";
import * as React from "react";
import { typeNormalization, downloadTempFile } from "/helpers/utils";
import { alertService } from "/helpers";

// Data
import { useEffect, useState } from "react";
import UploadDataWater from "./components/UploadDataWater";
import WaterRowActions from "./components/WaterRowActions";
import EditDataWater from "./components/EditDataWater";
import SiteDropdown from "/pagesComponents/dropdown/Site";
import { NumericFormat } from "react-number-format";
import Image from "next/image";
import fileCheck from "/assets/images/file-check.svg";
import FindName from "./components/FindName";

export default function Invoice(props) {
  const [controller] = useMaterialUIController();
  const [customerResponse, setCustomerResponse] = useState({
    rowData: [
      {
        siteId: 0,
        invoiceId: 0,
        period: 0,
        projectId: 0,
        projectCode: "string",
        projectName: "string",
        clusterId: 0,
        clusterName: "string",
        unitCodeID: 0,
        unitId: 0,
        unitCode: "string",
        unitNo: "string",
        psCode: "string",
        name: "string",
        invoiceNo: "string",
        invoiceName: "string",
        totalTunggakan: 123456,
      },
    ],
    totalRows: undefined,
    totalPages: undefined,
  });
  const [openUpload, setOpenUpload] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openFind, setOpenFind] = useState(false);
  const [dataCluster, setDataCluster] = useState([]);
  const [dataProject, setDataProject] = useState([]);
  const [dataPeriod, setDataPeriod] = useState([]);
  const [dataUnitCode, setDataUnitCode] = useState([]);
  const [dataUnitNo, setDataUnitNo] = useState([]);
  const [site, setSite] = useState(null);
  const [period, setPeriod] = useState(null);
  const [customer, setCustomer] = useState(null);
  const handleOpenUpload = () => setOpenUpload(true);
  const handleOpenEdit = () => setOpenEdit(true);
  const [isLoading, setLoading] = useState(false);
  const [modalParams, setModalParams] = useState(undefined);
  const [{ accessToken, encrypftedAccessToken }] = useCookies();

  useEffect(() => {
    let currentSite = JSON.parse(localStorage.getItem("site"));
    console.log("currentSite-----------", currentSite);
    if (currentSite == null) {
      alertService.info({ title: "Info", text: "Please choose Site first" });
    } else {
      setSite(currentSite);
    }
    getProject();
    getPeriod();
  }, []);

  const [customerRequest, setCustomerRequest] = useState({
    scheme: site?.siteId,
    keywords: "",
    recordsPerPage: 10,
    skipCount: 0,
  });

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

  const getProject = async (val) => {
    let response = await fetch("/api/transaction/invoice/dropdownproject", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
        params: {
          SiteId: site?.siteId,
          periodId: val?.periodId,
        },
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());
    console.log("response----", response);
    if (response.error) {
      alertService.error({ title: "Error", text: response.error.message });
    } else {
      setDataProject(response.result);
    }
    console.log("project------", dataProject);
  };

  const getPeriod = async (val) => {
    let response = await fetch("/api/transaction/invoice/dropdownperiod", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
        params: {
          SiteId: site?.siteId,
        },
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());
    console.log("response----", response);
    if (response.error) {
      alertService.error({ title: "Error", text: response.error.message });
    } else {
      setDataPeriod(response.result);
    }
    console.log("period------", dataPeriod);
  };

  useEffect(() => {
    getProject();
    getPeriod();
  }, [site]);
  useEffect(() => {
    // fetchData();
  }, [customerRequest.skipCount, customerRequest.recordsPerPage]);

  console.log("site------", site);

  const initialValues = {
    project: null,
    cluster: null,
    period: null,
    nameF: "",
    unitCode: null,
    unitNo: null,
  };

  const [formValues, setformValues] = useState(initialValues);

  const getFormData = (values) => {};

  const validations = Yup.object().shape({
    period: Yup.object()
      .required("Period is required.")
      .typeError("Period is required."),
    project: Yup.object().nullable(),
    cluster: Yup.object().nullable(),
    nameF: Yup.string().nullable(),
    unitCode: Yup.object().nullable(),
    unitNo: Yup.object().nullable(),
  });

  const checkingSuccessInput = (value, error) => {
    console.log("-----", value, error);
    return value != undefined && value != "" && value.length > 0 && !error;
  };

  const columns = [
    { Header: "no", accessor: "no", width: "5%" },
    { Header: "period", accessor: "period", width: "25%" },
    { Header: "project", accessor: "project", width: "25%" },
    { Header: "cluster", accessor: "cluster" },
    { Header: "unitCode", accessor: "unitCode", width: "7%" },
    { Header: "unitNo", accessor: "unitNo" },
    { Header: "id client", accessor: "psCode" },
    { Header: "name", accessor: "name" },
    { Header: "invoice no", accessor: "invoiceNo" },
    { Header: "invoice name", accessor: "invoiceName" },
    {
      Header: "total tunggakan",
      accessor: "totalTunggakan",
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
      Header: "preview tunggakan",
      accessor: "prev",
      align: "center",
      Cell: ({ value }) => {
        return (
          <Image
            src={fileCheck.src}
            alt="Picture of the author"
            width={25}
            height={25}
            style={{ cursor: "pointer" }}
          />
        );
      },
    },
    {
      Header: "action",
      accessor: "action",
      align: "center",
      Cell: ({ value }) => {
        return (
          <u style={{ color: "#4593C4", cursor: "pointer" }}>Adjustment</u>
          // <WaterRowActions
          //   record={value}
          //   openModalonEdit={openModalEdit}
          //   onDeleted={fetchData}
          // />
        );
      },
    },
  ];
  const [tasklist, setTasklist] = useState({ columns: columns, rows: [] });

  const fetchData = async (values, actions) => {
    setLoading(false);
    console.log("record--", recordsPerPage);
    const { scheme, keywords, recordsPerPage, skipCount } = customerRequest;
    let response = await fetch("/api/transaction/invoice/list", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
        params: {
          SiteId: site?.siteId,
          PeriodId: values.period?.periodId,
          ProjectId: values.project?.projectId,
          Cluster: values.cluster?.clusterName,
          UnitCode: values.unitCode?.unitCode,
          UnitNo: values.unitNo?.unitNo,
          psCode: customer?.psCode,
          MaxResultCount: recordsPerPage,
          SkipCount: skipCount,
        },
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    // console.log("GET PERMISSIONS RESULT", response);

    console.log("response----", response);
    if (response.error)
      alertService.error({ title: "Error", text: response.error.message });
    else {
      let data = response.result;
      const list = [];
      data.items.map((e, i) => {
        list.push({
          no: skipCount + i + 1,
          project: e.projectName,
          cluster: e.clusterName,
          unitCode: e.unitCode,
          unitNo: e.unitNo,
          prev: e.prevRead,
          curr: e.currentRead,
          action: e,
        });
      });
      setCustomerResponse((prevState) => ({
        ...prevState,
        rowData: list,
        totalRows: data.totalCount,
        totalPages: Math.ceil(data.totalCount / customerRequest.recordsPerPage),
      }));

      // setlistRow(list);
      // return setTasklist({
      //   columns: columns,
      //   rows: list,
      // });
      console.log("list------", customerResponse);
      setLoading(false);
    }
  };

  const setCustomerTaskList = (list) => {
    return {
      columns: columns,
      rows: list,
    };
  };

  const handleExport = async () => {
    let response = await fetch("/api/transaction/water/export", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
        params: {
          maxResultCount: 1000,
          skipCount: 0,
          siteId: site?.siteId,
          projectId: formValues.project?.projectId,
          clusterId: formValues.cluster?.clusterId,
          search: undefined,
        },
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    console.log("GET PERMISSIONS RESULT", response);

    console.log("response----", response);
    if (response.error)
      alertService.error({ text: response.error.message, title: "Error" });
    else {
      downloadTempFile(response.result.uri);
    }
  };

  const getCluster = async (val) => {
    let response = await fetch("/api/transaction/invoice/dropdowncluster", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
        params: {
          SiteId: site?.siteId,
          periodId: val?.periodId,
        },
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());
    console.log("response----", response);
    if (response.error) {
      alertService.error({ title: "Error", text: response.error.message });
    } else {
      setDataCluster(response.result);
    }
    console.log("cluster------", dataCluster);
  };

  const getUnitCode = async (val) => {
    let response = await fetch("/api/transaction/invoice/dropdownunitcode", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
        params: {
          SiteId: site?.siteId,
          periodId: val?.periodId,
        },
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());
    console.log("response----", response);
    if (response.error) {
      alertService.error({ title: "Error", text: response.error.message });
    } else {
      setDataUnitCode(response.result);
    }
    console.log("unitCode------", dataUnitCode);
  };

  const getUnitNo = async (val) => {
    let response = await fetch("/api/transaction/invoice/dropdownunitno", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
        params: {
          SiteId: site?.siteId,
          periodId: val?.periodId,
        },
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());
    console.log("response----", response);
    if (response.error) {
      alertService.error({ title: "Error", text: response.error.message });
    } else {
      setDataUnitNo(response.result);
    }
    console.log("unitNo------", dataUnitNo);
  };

  const openModalEdit = (record) => {
    setModalParams(record);
    setOpenEdit(true);
  };

  const changeModalUpload = () => {
    setOpenUpload(!openUpload);
    // fetchData();
  };

  const changeModalEdit = () => {
    setOpenEdit(false);
    // fetchData();
  };

  const handleSite = (siteVal) => {
    setSite(siteVal);
    localStorage.setItem("site", JSON.stringify(siteVal));
  };

  const handleFind = () => {
    setOpenFind(!openFind);
  };

  const handlePSCode = (val) => {
    setCustomer(val);
  };

  useEffect(() => {}, [customer]);

  const submitForm = async (values, actions) => {
    console.log("formval------", values);
    fetchData(values, actions);
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
                  <Grid item xs={12} md={8}>
                    <MDBox mb={1}>
                      <MDTypography variant="h5">Filter</MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={12}>
                    <Formik
                      initialValues={initialValues}
                      validationSchema={validations}
                      onSubmit={submitForm}
                    >
                      {({
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                        handleSubmit,
                        isSubmitting,
                        setFieldValue,
                        resetForm,
                        /* and other goodies */
                      }) => {
                        setformValues(values);
                        getFormData(values);
                        const isValifForm = () => {
                          return checkingSuccessInput(
                            values.period,
                            errors.period
                          )
                            ? true
                            : false;
                        };
                        return (
                          <Form id="invoice-filter" autoComplete="off">
                            <MDBox>
                              <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                  <Field
                                    name="period"
                                    component={Autocomplete}
                                    options={dataPeriod}
                                    getOptionLabel={(option) =>
                                      option.periodName
                                    }
                                    // isOptionEqualToValue={(option, value) =>
                                    //   option.value === value.value
                                    // }
                                    onChange={(e, value) => {
                                      setFieldValue(
                                        "period",
                                        value !== null
                                          ? value
                                          : initialValues["period"]
                                      );
                                      getProject(value);
                                      getCluster(value);
                                      getUnitNo(value);
                                      setPeriod(value);
                                      getUnitCode(value);
                                    }}
                                    renderInput={(params) => (
                                      <FormField
                                        {...params}
                                        type="text"
                                        label="Period *"
                                        name="period"
                                        placeholder="Choose Period"
                                        InputLabelProps={{ shrink: true }}
                                        error={errors.period && touched.period}
                                        success={checkingSuccessInput(
                                          formValues.period,
                                          errors.period
                                        )}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Grid container spacing={2}>
                                    <Grid item xs={10}>
                                      <FormField
                                        type="text"
                                        label="Name"
                                        name="nameF"
                                        value={customer?.name}
                                        placeholder="Type Name"
                                        InputLabelProps={{ shrink: true }}
                                        error={errors.nameF && touched.nameF}
                                        success={checkingSuccessInput(
                                          formValues.nameF,
                                          errors.nameF
                                        )}
                                      />
                                    </Grid>
                                    <Grid item xs={2}>
                                      <MDButton
                                        variant="text"
                                        color="info"
                                        onClick={handleFind}
                                        disabled={period == undefined}
                                      >
                                        Find
                                      </MDButton>
                                    </Grid>
                                  </Grid>
                                  <FindName
                                    isOpen={openFind}
                                    close={handleFind}
                                    site={site?.siteId}
                                    period={period?.periodId}
                                    handlePSCode={handlePSCode}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Field
                                    name="project"
                                    component={Autocomplete}
                                    options={dataProject}
                                    getOptionLabel={(option) =>
                                      option.projectName
                                    }
                                    onChange={(e, value) => {
                                      setFieldValue(
                                        "project",
                                        value !== null
                                          ? value
                                          : initialValues["project"]
                                      );
                                    }}
                                    isOptionEqualToValue={(option, value) =>
                                      option.value === value.value
                                    }
                                    renderInput={(params) => (
                                      <FormField
                                        {...params}
                                        type="text"
                                        label="Project"
                                        name="project"
                                        placeholder="Choose Project"
                                        InputLabelProps={{ shrink: true }}
                                        error={
                                          errors.project && touched.project
                                        }
                                        success={checkingSuccessInput(
                                          formValues.project,
                                          errors.project
                                        )}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Field
                                    name="cluster"
                                    component={Autocomplete}
                                    options={dataCluster}
                                    getOptionLabel={(option) =>
                                      option.clusterCode +
                                      " - " +
                                      option.clusterName
                                    }
                                    onChange={(e, value) => {
                                      setFieldValue(
                                        "cluster",
                                        value !== null
                                          ? value
                                          : initialValues["cluster"]
                                      );
                                    }}
                                    isOptionEqualToValue={(option, value) =>
                                      option.value === value.value
                                    }
                                    renderInput={(params) => (
                                      <FormField
                                        {...params}
                                        type="text"
                                        label="Cluster"
                                        name="cluster"
                                        placeholder="Choose Cluster"
                                        InputLabelProps={{ shrink: true }}
                                        error={
                                          errors.cluster && touched.cluster
                                        }
                                        success={checkingSuccessInput(
                                          formValues.cluster,
                                          errors.cluster
                                        )}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Field
                                    name="unitCode"
                                    component={Autocomplete}
                                    options={dataUnitCode}
                                    getOptionLabel={(option) => option.unitCode}
                                    onChange={(e, value) => {
                                      setFieldValue(
                                        "unitCode",
                                        value !== null
                                          ? value
                                          : initialValues["unitCode"]
                                      );
                                    }}
                                    isOptionEqualToValue={(option, value) =>
                                      option.value === value.value
                                    }
                                    renderInput={(params) => (
                                      <FormField
                                        {...params}
                                        type="text"
                                        label="Unit Code"
                                        name="unitCode"
                                        placeholder="Choose Unit Code"
                                        InputLabelProps={{ shrink: true }}
                                        error={
                                          errors.unitCode && touched.unitCode
                                        }
                                        success={checkingSuccessInput(
                                          formValues.unitCode,
                                          errors.unitCode
                                        )}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Field
                                    name="unitNo"
                                    component={Autocomplete}
                                    options={dataUnitNo}
                                    getOptionLabel={(option) => option.unitNo}
                                    onChange={(e, value) => {
                                      setFieldValue(
                                        "unitNo",
                                        value !== null
                                          ? value
                                          : initialValues["unitNo"]
                                      );
                                    }}
                                    isOptionEqualToValue={(option, value) =>
                                      option.value === value.value
                                    }
                                    renderInput={(params) => (
                                      <FormField
                                        {...params}
                                        type="text"
                                        label="Unit No"
                                        name="unitNo"
                                        placeholder="Choose Unit No"
                                        InputLabelProps={{ shrink: true }}
                                        error={errors.unitNo && touched.unitNo}
                                        success={checkingSuccessInput(
                                          formValues.unitNo,
                                          errors.unitNo
                                        )}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <MDBox
                                    display="flex"
                                    flexDirection={{ xs: "column", sm: "row" }}
                                    justifyContent="flex-end"
                                  >
                                    {/* <MDButton
                                      type="reset"
                                      variant="outlined"
                                      color="secondary"
                                      // onClick={resetForm}
                                    >
                                      Clear Filters
                                    </MDButton> */}
                                    <MDBox
                                      ml={{ xs: 0, sm: 1 }}
                                      mt={{ xs: 1, sm: 0 }}
                                    >
                                      ilo = {isLoading ? "bener" : "salah"} ,
                                      upil = {isValifForm() ? "bener" : "salah"}
                                      <MDButton
                                        type="submit"
                                        variant="gradient"
                                        color="primary"
                                        sx={{ height: "100%" }}
                                        disabled={!isValifForm() || isLoading}
                                      >
                                        {isLoading ? "Searching.." : "Search"}
                                      </MDButton>
                                    </MDBox>
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
      <MDBox pb={3}>
        <Card>
          <MDBox p={3} lineHeight={1}>
            <Grid container alignItems="center">
              <Grid item xs={12} md={6}>
                <MDBox mb={1}>
                  <MDTypography variant="h5">Invoice List</MDTypography>
                </MDBox>
                <MDBox mb={2}>
                  <MDTypography variant="body2" color="text">
                    Invoice Data
                  </MDTypography>
                </MDBox>
              </Grid>
              <Grid item xs={12} md={6} sx={{ textAlign: "right" }}>
                <Grid container alignItems="right" spacing={0}>
                  <Grid item xs={12}>
                    <MDBox
                      display="flex"
                      flexDirection={{ xs: "column", sm: "row" }}
                      justifyContent="flex-end"
                    >
                      <MDButton
                        variant="outlined"
                        color="primary"
                        disabled={customerResponse.rowData.length == 0}
                        onClick={handleExport}
                      >
                        <Icon>add</Icon>&nbsp; RE-GENERATE
                      </MDButton>
                      <MDBox ml={{ xs: 0, sm: 1 }} mt={{ xs: 1, sm: 0 }}>
                        <MDButton
                          variant="outlined"
                          color="primary"
                          onClick={handleOpenUpload}
                        >
                          <Icon>email</Icon>&nbsp; SEND EMAIL
                        </MDButton>
                        <UploadDataWater
                          site={site}
                          isOpen={openUpload}
                          onModalChanged={changeModalUpload}
                        />
                      </MDBox>
                      <MDBox ml={{ xs: 0, sm: 1 }} mt={{ xs: 1, sm: 0 }}>
                        <MDButton
                          variant="outlined"
                          color="primary"
                          disabled={customerResponse.rowData.length == 0}
                          onClick={handleExport}
                        >
                          <WhatsAppIcon /> &nbsp; SEND WHATSAPP
                        </MDButton>
                      </MDBox>
                    </MDBox>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </MDBox>
          <DataTable
            canSearch
            table={setCustomerTaskList(customerResponse.rowData)}
            manualPagination={true}
            totalRows={customerResponse.totalRows}
            totalPages={customerResponse.totalPages}
            recordsPerPage={customerRequest.recordsPerPage}
            skipCount={customerRequest.skipCount}
            pageChangeHandler={skipCountChangeHandler}
            recordsPerPageChangeHandler={recordsPerPageChangeHandler}
            keywordsChangeHandler={keywordsChangeHandler}
            entriesPerPage={{ defaultValue: customerRequest.recordsPerPage }}
            pagination={{ variant: "gradient", color: "primary" }}
          />
        </Card>
        <EditDataWater
          site={site}
          isOpen={openEdit}
          params={modalParams}
          onModalChanged={changeModalEdit}
        />
      </MDBox>
    </DashboardLayout>
  );
}
