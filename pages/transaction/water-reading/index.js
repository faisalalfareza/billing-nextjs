import Card from "@mui/material/Card";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import axios from "axios";
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
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
import * as React from "react";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import ModalWaterReading from "/pagesComponents/app/water-reading/ModalWaterReading";

// Data
import dataTableData from "/pagesComponents/applications/data-tables/data/dataTableData";
import { useEffect, useState } from "react";
import UploadDataWater from "./components/UploadDataWater";
import WaterRowActions from "./components/WaterRowActions";
import EditDataWater from "./components/EditDataWater";
// import templateWaterReading from "../assets/template/template-water-reading.xlsx";

export default function WaterReading(props) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const { dataSite } = props;
  const [openUpload, setOpenUpload] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [dataCluster, setDataCluster] = useState([]);
  const [dataProject, setDataProject] = useState([]);
  const [site, setSite] = useState(null);
  const handleOpenUpload = () => setOpenUpload(true);
  const handleOpenEdit = () => setOpenEdit(true);
  const [isLoading, setLoading] = useState(false);
  const [modalParams, setModalParams] = useState(undefined);

  useEffect(() => {
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
    }
  }, []);

  const getProject = (val) => {
    // setLoading(true);
    console.log("site-----", site);
    const url = `${publicRuntimeConfig.apiUrl}/api/services/app/BillingSystems/GetDropdownProjectBySiteId`;
    axios
      .get(url, {
        params: {
          SiteId: site?.siteId,
        },
      })
      .then((res) => {
        setDataProject(res.data.result);
        console.log("res----", formValues, res.data.result);
        // setLoading(false);
      })
      .catch((err) => console.log(err));
  };
  useEffect(() => {
    getProject();
  }, [site]);

  const chooseSite = (val) => {
    setSite(val);
  };

  console.log("site------", site);

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

  const getFormData = (values) => {
    console.log("getFormData::", values);
  };
  console.log("formValues::", formValues);

  const validations = Yup.object().shape({
    [project.name]: Yup.object()
      .required(project.errorMsg)
      .typeError(project.errorMsg),
    [cluster.name]: Yup.object()
      .required(cluster.errorMsg)
      .typeError(cluster.errorMsg),
  });

  const checkingSuccessInput = (value, error) => {
    return value != undefined && value != "" && value.length > 0 && !error;
  };

  const generateNewFaktur = () => {
    Swal.fire({
      title: "Generate New Faktur Pajak",
      text: "Are you sure to generate new Faktur Pajak? this will remove it from filters & tasklist.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, new faktur!",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
      }
    });
  };
  const cancel = () => {
    Swal.fire({
      title: "Cancel Faktur Pajak",
      text: "Are you sure to cancel the current Faktur Pajak? this will remove it from tasklist & your data will be lost.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, cancel faktur!",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
      }
    });
  };
  const save = () => {
    Swal.fire({
      title: "Are you sure to \nSave Faktur Pajak?",
      text: "Confirmation for saving Faktur Pajak.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, save",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
      }
    });
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
    const url = `${publicRuntimeConfig.apiUrl}/api/services/app/BillingSystems/GetWaterReadingList`;
    axios
      .get(url, {
        params: {
          SiteId: site?.siteId,
          ProjectId: formValues.project?.projectId,
          ClusterId: formValues.cluster?.clusterId,
          MaxResultCount: 1000,
          SkipCount: 0,
        },
      })
      .then((response) => {
        // handle success
        console.log("suksesssss");
        console.log(response.data.result);
        const result = response.data.result.items;
        const list = [];
        const row = result.map((e, i) => {
          list.push({
            no: i + 1,
            project: e.projectName,
            cluster: e.clusterName,
            unitcode: e.unitCode,
            unitno: e.unitNo,
            prev: e.prevRead,
            curr: e.currentRead,
            action: e,
          });
        });
        return setTasklist({
          columns: columns,
          rows: list,
        });
      })
      .catch((error) => {
        // handle error
      });
  };

  if (typeof window !== "undefined") {
  }

  useEffect(() => {
    const a = localStorage.getItem("site");
    console.log("a=====", a);
    if (a == null || a == undefined) {
    }
  });

  const onProjectChange = (val) => {
    setLoading(true);
    const url = `${publicRuntimeConfig.apiUrl}/api/services/app/BillingSystems/GetDropdownClusterByProject?ProjectId=${val.projectId}`;
    axios
      .get(url)
      .then((res) => {
        setDataCluster(res.data.result);
        setLoading(false);
      })
      .catch((err) => console.log(err));
  };

  const propsSite = {
    name: "site",
    label: "Site Name",
    placeholder: "Type Site",
    type: "text",
    isRequired: false,
    errorMsg: "Site is required.",
    defaultValue: "",
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
        {/* <MDTypography fontWeight="light" variant="h6" color="light">
          Site Name
        </MDTypography> */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={12}>
            <Autocomplete
              options={dataSite}
              key="site-dropdown"
              value={site}
              getOptionLabel={(option) =>
                option.siteName ? option.siteId + " - " + option.siteName : ""
              }
              onChange={(e, value) => {
                chooseSite(value);
              }}
              noOptionsText="No results"
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Site Name"
                  variant="standard"
                  color="dark"
                />
              )}
            />
          </Grid>
          {/* <Grid item xs={12} sm={3}>
            <MDButton variant="gradient" color="primary">
              Set Site
            </MDButton>
          </Grid> */}
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
                      onSubmit={(values, { setSubmitting }) => {
                        fetchData(values);
                        setSubmitting(false);
                      }}
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
                        return (
                          <Form id={form.formId} autoComplete="off">
                            <MDBox>
                              <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                  <Autocomplete
                                    disableCloseOnSelect
                                    // includeInputInList={true}
                                    options={dataProject}
                                    key={project.name}
                                    value={values.project}
                                    // getOptionSelected={(option, value) => {
                                    //   return (
                                    //     option.projectName === value.projectName
                                    //   );
                                    // }}
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
                                        {...params}
                                        type={project.type}
                                        label={
                                          project.label +
                                          (project.isRequired ? " *" : "")
                                        }
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
                                    disableCloseOnSelect
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
                                        {...params}
                                        type={cluster.type}
                                        label={
                                          cluster.label +
                                          (cluster.isRequired ? " *" : "")
                                        }
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
                                        disabled={isSubmitting}
                                      >
                                        Search
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
                    Water Reading Data plugin.
                  </MDTypography>
                </MDBox>
              </Grid>
              <Grid item xs={12} md={4} sx={{ textAlign: "right" }}>
                <Grid container alignItems="right" spacing={0}>
                  <Grid item xs={12} md={6}>
                    <MDButton
                      variant="outlined"
                      color="primary"
                      disabled={tasklist.length == 0}
                    >
                      <Icon>add</Icon>&nbsp; Export Excel
                    </MDButton>
                  </Grid>
                  {/*  */}
                  <Grid item xs={12} md={6}>
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
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </MDBox>
          <DataTable table={tasklist} canSearch />
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

export async function getStaticProps(context) {
  const resSite = await fetch(
    `${publicRuntimeConfig.apiUrl}/api/services/app/BillingSystems/GetDropdownSite`
  );

  let listSite = await resSite.json();
  const dataSite = listSite.result;
  return {
    props: {
      dataSite,
    },
    revalidate: 60,
  };
}
