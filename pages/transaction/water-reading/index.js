import Card from "@mui/material/Card";
import { Formik, Form } from "formik";
import * as Yup from "yup";
// @mui material components
import { Grid, TextField } from "@mui/material";
// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Icon from "@mui/material/Icon";

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
import dataTableData from "/pagesComponents/applications/data-tables/data/dataTableData";
import { useEffect, useState } from "react";
import UploadDataWater from "./components/UploadDataWater";
import WaterRowActions from "./components/WaterRowActions";
import EditDataWater from "./components/EditDataWater";
import SiteDropdown from "../../../pagesComponents/dropdown/Site";
// import templateWaterReading from "../assets/template/template-water-reading.xlsx";

export default function WaterReading(props) {
  const [controller] = useMaterialUIController();
  const [customerResponse, setCustomerResponse] = useState({
    rowData: [],
    totalRows: undefined,
    totalPages: undefined,
  });
  const [openUpload, setOpenUpload] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [dataCluster, setDataCluster] = useState([]);
  const [dataProject, setDataProject] = useState([]);
  const [site, setSite] = useState(null);
  const handleOpenUpload = () => setOpenUpload(true);
  const handleOpenEdit = () => setOpenEdit(true);
  const [isLoading, setLoading] = useState(false);
  const [modalParams, setModalParams] = useState(undefined);
  const [{ accessToken, encryptedAccessToken }] = useCookies();

  useEffect(() => {
    let currentSite = JSON.parse(localStorage.getItem("site"));
    if (currentSite == null) {
      alertService.info({ title: "Info", text: "Please choose Site first" });
    } else {
      setSite(currentSite);
    }
    getProject();
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
    let response = await fetch(
      "/api/transaction/water/getdropdownprojectbysiteid",
      {
        method: "POST",
        body: JSON.stringify({
          accessToken: accessToken,
          params: {
            SiteId: site?.siteId,
          },
        }),
      }
    );
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());
    if (response.error) {
      alertService.error({ title: "Error", text: response.error.message });
    } else {
      setDataProject(response.result);
    }
  };
  useEffect(() => {
    getProject();
  }, [site]);
  useEffect(() => {
    fetchData();
  }, [customerRequest.skipCount, customerRequest.recordsPerPage]);

  const form = {
    formId: "water-reading-filter",
    formField: {
      project: {
        name: "project",
        label: "Project",
        placeholder: "Type Project",
        type: "text",
        isRequired: true,
        errorMsg: "Project is required.",
        defaultValue: "",
      },
      cluster: {
        name: "cluster",
        label: "Cluster",
        placeholder: "Type Cluster",
        type: "text",
        isRequired: true,
        errorMsg: "CLuster is required.",
        defaultValue: "",
      },
    },
  };

  const { project, cluster } = form.formField;

  const initialValues = {
    [project.name]: null,
    [cluster.name]: null,
  };

  const [formValues, setformValues] = useState(initialValues);

  const getFormData = (values) => {};

  const validations = Yup.object().shape({
    [project.name]: Yup.object()
      .required(project.errorMsg)
      .typeError(project.errorMsg),
    [cluster.name]: Yup.object()
      .required(cluster.errorMsg)
      .typeError(cluster.errorMsg),
  });

  const checkingSuccessInput = (value, error) => {
    return value != undefined && value != "" && !error;
  };

  const columns = [
    { Header: "no", accessor: "no", width: "5%" },
    { Header: "project", accessor: "project", width: "25%" },
    { Header: "cluster", accessor: "cluster" },
    { Header: "unitcode", accessor: "unitcode", width: "7%" },
    { Header: "unitno", accessor: "unitno" },
    { Header: "prev read", accessor: "prev" },
    { Header: "current read", accessor: "curr" },
    {
      Header: "action",
      accessor: "action",
      align: "center",
      sorted: true,
      Cell: ({ value }) => {
        return (
          <WaterRowActions
            record={value}
            openModalonEdit={openModalEdit}
            onDeleted={fetchData}
          />
        );
      },
    },
  ];
  const [tasklist, setTasklist] = useState({ columns: columns, rows: [] });

  const fetchData = async (data) => {
    setLoading(true);
    const { scheme, keywords, recordsPerPage, skipCount } = customerRequest;
    let response = await fetch("/api/transaction/water/getwaterreadinglist", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
        params: {
          SiteId: site?.siteId,
          ProjectId: formValues.project?.projectId,
          ClusterId: formValues.cluster?.clusterId,
          MaxResultCount: recordsPerPage,
          SkipCount: skipCount,
        },
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

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
          unitcode: e.unitCode,
          unitno: e.unitNo,
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
    let response = await fetch(
      "/api/transaction/water/exporttoexcelwaterreading",
      {
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
      }
    );
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error)
      alertService.error({ text: response.error.message, title: "Error" });
    else {
      downloadTempFile(response.result.uri);
    }
  };

  const onProjectChange = async (val) => {
    let response = await fetch("/api/master/site/getdropdownclusterbyproject", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
        params: {
          ProjectId: val?.projectId,
        },
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error) {
      alertService.error({ title: "Error", text: response.error.message });
    } else {
      setDataCluster(response.result);
    }
  };

  const openModalEdit = (record) => {
    setModalParams(record);
    setOpenEdit(true);
  };

  const changeModalUpload = () => {
    setOpenUpload(!openUpload);
    fetchData();
  };

  const changeModalEdit = () => {
    setOpenEdit(false);
    fetchData();
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
                      onSubmit={fetchData}
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
                        const isValifForm = () =>
                          checkingSuccessInput(
                            values.project,
                            errors.project
                          ) &&
                          checkingSuccessInput(values.cluster, errors.cluster);
                        return (
                          <Form id={form.formId} autoComplete="off">
                            <MDBox>
                              <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                  <Autocomplete
                                    // disableCloseOnSelect
                                    // includeInputInList={true}
                                    options={dataProject}
                                    key={project.name}
                                    value={values.project}
                                    isOptionEqualToValue={(option, value) =>
                                      option.projectId === value.projectId
                                    }
                                    getOptionLabel={(option) =>
                                      values.project != {}
                                        ? option.projectCode +
                                          " - " +
                                          option.projectName
                                        : "Nothing selected"
                                    }
                                    onChange={(e, value) => {
                                      setFieldValue(
                                        project.name,
                                        value !== null
                                          ? value
                                          : initialValues[project.name]
                                      );
                                      onProjectChange(value);
                                    }}
                                    noOptionsText="No results"
                                    renderInput={(params) => (
                                      <FormField
                                        required={project.isRequired}
                                        {...params}
                                        type={project.type}
                                        label={project.label}
                                        name={project.name}
                                        placeholder={project.placeholder}
                                        InputLabelProps={{ shrink: true }}
                                        error={
                                          errors.project && touched.project
                                        }
                                        success={checkingSuccessInput(
                                          project,
                                          errors.project
                                        )}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Autocomplete
                                    // disableCloseOnSelect
                                    isOptionEqualToValue={(option, value) =>
                                      option.clusterId === value.clusterId
                                    }
                                    key={cluster.name}
                                    options={dataCluster}
                                    value={values.cluster}
                                    getOptionLabel={(option) =>
                                      option.clusterCode +
                                      " - " +
                                      option.clusterName
                                    }
                                    onChange={(e, value) =>
                                      setFieldValue(
                                        cluster.name,
                                        value !== null
                                          ? value
                                          : initialValues[cluster.name]
                                      )
                                    }
                                    renderInput={(params) => (
                                      <FormField
                                        required={cluster.isRequired}
                                        {...params}
                                        type={cluster.type}
                                        label={cluster.label}
                                        name={cluster.name}
                                        placeholder={cluster.placeholder}
                                        InputLabelProps={{ shrink: true }}
                                        error={
                                          errors.cluster && touched.cluster
                                        }
                                        success={checkingSuccessInput(
                                          cluster,
                                          errors.cluster
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
                                    <MDButton
                                      type="reset"
                                      variant="outlined"
                                      color="secondary"
                                      onClick={resetForm}
                                    >
                                      Clear Filters
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
                                        {isLoading ? "Searching..." : "Search"}
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
              <Grid item xs={12} md={8}>
                <MDBox mb={1}>
                  <MDTypography variant="h5">Water Reading List</MDTypography>
                </MDBox>
                <MDBox mb={2}>
                  <MDTypography variant="body2" color="text">
                    Water Reading Data.
                  </MDTypography>
                </MDBox>
              </Grid>
              <Grid item xs={12} md={4} sx={{ textAlign: "right" }}>
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
                        <Icon>add</Icon>&nbsp; Export Excel
                      </MDButton>
                      <MDBox ml={{ xs: 0, sm: 1 }} mt={{ xs: 1, sm: 0 }}>
                        <MDButton
                          variant="gradient"
                          color="primary"
                          onClick={handleOpenUpload}
                        >
                          <Icon>add</Icon>&nbsp; Add New
                        </MDButton>
                        <UploadDataWater
                          site={site}
                          isOpen={openUpload}
                          onModalChanged={changeModalUpload}
                        />
                      </MDBox>
                    </MDBox>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </MDBox>
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
