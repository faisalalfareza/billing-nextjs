import DashboardLayout from "/layout/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/layout/Navbars/DashboardNavbar";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Grid from "@mui/material/Grid";
import Autocomplete from "@mui/material/Autocomplete";
import { Link } from "@mui/material";
import MDButton from "/components/MDButton";
import MDInput from "/components/MDInput";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
import { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import { Formik, Form } from "formik";
import FormField from "/pagesComponents/FormField";
import * as Yup from "yup";
import axios from "axios";
import DataTable from "/layout/Tables/DataTable";
import SiteRowActions from "./components/SiteRowActions";
import AddOrEditSite from "./components/AddOrEditSite";
import Icon from "@mui/material/Icon";
import MDBadgeDot from "/components/MDBadgeDot";

export default function MasterSite(props) {
  const dummy = [
    {
      siteId: 45,
      siteName: "PT.Wahana Mustika Gemilang",
      isActive: true,
    },
    {
      siteId: 45,
      siteName: "PT.Wahana Mustika Gemilang",
      isActive: true,
    },
    {
      siteId: 45,
      siteName: "PT.Wahana Mustika Gemilang",
      isActive: true,
    },
  ];
  const { dataProject, dataSite } = props;
  const [listSite, setListSite] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [modalParams, setModalParams] = useState(undefined);

  //dari sini

  const form = {
    formId: "master-site-filter",
    formField: {
      project: {
        name: "project",
        label: "Project",
        placeholder: "Type Project",
        type: "text",
        isRequired: false,
        errorMsg: "Project is required.",
        defaultValue: "",
      },
      cluster: {
        name: "cluster",
        label: "Cluster",
        placeholder: "Type Cluster",
        type: "text",
        isRequired: false,
        errorMsg: "Cluster is required.",
        defaultValue: "",
      },
      siteId: {
        name: "siteId",
        label: "Site ID",
        placeholder: "Type Site ID",
        type: "text",
        isRequired: false,
        errorMsg: "Site ID is required.",
        defaultValue: "",
      },
      siteName: {
        name: "siteName",
        label: "Site Name",
        placeholder: "Type Site Name",
        type: "text",
        isRequired: false,
        errorMsg: "Site Name is required.",
        defaultValue: "",
      },
    },
  };

  const { project, cluster, siteId, siteName } = form.formField;

  const initialValues = {
    [project.name]: null,
    [cluster.name]: [],
    [siteId.name]: null,
    [siteName.name]: null,
  };

  const [formValues, setformValues] = useState(initialValues);

  const getFormData = (values) => {
    console.log("getFormData::", values);
  };
  console.log("formValues::", formValues);

  const validations = Yup.object().shape({
    [project.name]: Yup.object().nullable(),
    [cluster.name]: Yup.array().nullable(),
    [siteId.name]: Yup.object().nullable(),
    [siteName.name]: Yup.object().nullable(),
  });

  const checkingSuccessInput = (value, error) => {
    return value != undefined && value != "" && value.length > 0 && !error;
  };

  const [dataCluster, setDataCluster] = useState([]);
  const [isLoading, setLoading] = useState(false);

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

  const setSiteList = () => {
    return {
      columns: [
        { Header: "No", accessor: "no" },
        { Header: "Site ID", accessor: "siteId" },
        { Header: "Site Name", accessor: "siteName" },
        {
          Header: "Project",
          accessor: "project",
          Cell: ({ value }) => {
            return (
              <Link href="#" underline="always">
                {value} project choosen
              </Link>
            );
          },
        },
        {
          Header: "Cluster",
          accessor: "cluster",
          Cell: ({ value }) => {
            return (
              <Link href="#" underline="always">
                {value} cluster choosen
              </Link>
            );
          },
        },
        {
          Header: "Logo",
          accessor: "logo",
          Cell: ({ value }) => {
            return (
              <Link href="#" underline="always">
                View
              </Link>
            );
          },
        },
        {
          Header: "Status",
          accessor: "status",
          Cell: ({ value }) => {
            return (
              <MDBadgeDot
                color={value ? "success" : "danger"}
                size="sm"
                badgeContent={value ? "Active" : "Inactive"}
              />
            );
          },
        },
        {
          Header: "Action",
          accessor: "action",
          align: "center",
          sorted: true,
          Cell: ({ value }) => {
            return (
              <SiteRowActions
                record={value}
                openModalonEdit={openModalAddOrEditOnEdit}
                onDeleted={fetchData}
              />
            );
          },
        },
      ],
      rows: listSite,
    };
  };

  const openModalAddOrEditOnEdit = (record) => {
    setModalParams(record);
    setOpenModal(!openModal);
  };

  const changeModalAddOrEdit = () => {
    setOpenModal(!openModal);
    fetchData();
  };

  const openModalAddOrEditOnAdd = () => {
    setModalParams(undefined);
    setOpenModal(!openModal);
  };
  const handleClose = () => setOpenModal(false);

  const fetchData = async (data) => {
    const url = `${publicRuntimeConfig.apiUrl}/api/services/app/MasterBilling/GetListMasterSite`;
    axios
      .get(url, {
        params: {
          SiteId: formValues.siteId?.siteId,
          ProjectId: formValues.project?.projectId,
          ClusterId: formValues.cluster[0]?.clusterId,
          MaxResultCount: 1000,
          SkipCount: 0,
        },
      })
      .then((response) => {
        // handle success
        const result = response.data.result.items;
        const list = [];
        const row = result.map((e, i) => {
          list.push({
            no: i + 1,
            project: e.siteId,
            cluster: e.siteId,
            status: e.isActive,
            siteId: e.siteId,
            siteName: e.siteName,
            action: {
              project: e.siteId,
              cluster: e.siteId,
              status: e.isActive,
              siteId: e.siteId,
              siteName: e.siteName,
            },
          });
        });
        setListSite(list);
        console.log("list------", list);
      })
      .catch((error) => {
        // handle error
      });
  };
  //sampai sini

  return (
    <DashboardLayout>
      <DashboardNavbar />
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
                                <Grid item xs={12} sm={3}>
                                  <Autocomplete
                                    disableCloseOnSelect
                                    options={dataSite}
                                    key={siteId.name}
                                    value={values.siteId}
                                    getOptionLabel={(option) =>
                                      option.siteId ? option.siteId + "" : ""
                                    }
                                    onChange={(e, value) => {
                                      setFieldValue(siteId.name, value);
                                    }}
                                    noOptionsText="No results"
                                    renderInput={(params) => (
                                      <FormField
                                        {...params}
                                        type={siteId.type}
                                        label={
                                          siteId.label +
                                          (siteId.isRequired ? " *" : "")
                                        }
                                        name={siteId.name}
                                        placeholder={siteId.placeholder}
                                        InputLabelProps={{ shrink: true }}
                                        error={errors.siteId && touched.siteId}
                                        success={checkingSuccessInput(
                                          siteId,
                                          errors.siteId
                                        )}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                  <Autocomplete
                                    disableCloseOnSelect
                                    options={dataSite}
                                    key={siteName.name}
                                    value={values.siteName}
                                    getOptionLabel={(option) =>
                                      option.siteName || ""
                                    }
                                    onChange={(e, value) => {
                                      setFieldValue(
                                        siteName.name,
                                        value
                                          ? value
                                          : initialValues[siteName.name]
                                      );
                                    }}
                                    noOptionsText="No results"
                                    renderInput={(params) => (
                                      <FormField
                                        {...params}
                                        type={siteName.type}
                                        label={
                                          siteName.label +
                                          (siteName.isRequired ? " *" : "")
                                        }
                                        name={siteName.name}
                                        placeholder={siteName.placeholder}
                                        InputLabelProps={{ shrink: true }}
                                        error={
                                          errors.siteName && touched.siteName
                                        }
                                        success={checkingSuccessInput(
                                          siteName,
                                          errors.siteName
                                        )}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                  <Autocomplete
                                    disableCloseOnSelect
                                    options={dataProject}
                                    key={project.name}
                                    value={values.project}
                                    getOptionLabel={(option) =>
                                      option.projectCode +
                                        " - " +
                                        option.projectName || ""
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
                                <Grid item xs={12} sm={3}>
                                  <Autocomplete
                                    disableCloseOnSelect
                                    clearOnBlur={false}
                                    key={cluster.name}
                                    options={dataCluster}
                                    value={values.cluster}
                                    getOptionLabel={(option) =>
                                      option.clusterCode +
                                      " - " +
                                      option.clusterName
                                    }
                                    multiple
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

      {/* tasklist */}
      <MDBox pb={3}>
        <Card>
          <MDBox p={3} lineHeight={1}>
            <Grid container alignItems="center">
              <Grid item xs={12} md={8}>
                <MDBox mb={1}>
                  <MDTypography variant="h5">Master Site List</MDTypography>
                </MDBox>
                <MDBox mb={2}>
                  <MDTypography variant="body2" color="text">
                    For site data maintenance{" "}
                    {openModal ? "bukamodal" : "tutupModal"}
                  </MDTypography>
                </MDBox>
              </Grid>
              <Grid item xs={12} md={4} sx={{ textAlign: "right" }}>
                <Grid container alignItems="right" spacing={1}>
                  <Grid item xs={12} md={12}>
                    <MDButton
                      variant="gradient"
                      color="primary"
                      onClick={openModalAddOrEditOnAdd}
                    >
                      <Icon>add</Icon>&nbsp; Add New Site
                    </MDButton>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </MDBox>
          <DataTable table={setSiteList()} canSearch />
        </Card>
        <AddOrEditSite
          isOpen={openModal}
          params={modalParams}
          onModalChanged={changeModalAddOrEdit}
        />
      </MDBox>
    </DashboardLayout>
  );
}

export async function getStaticProps(context) {
  const urlP = `${publicRuntimeConfig.apiUrl}/api/services/app/BillingSystems/GetDropdownProject`;
  const resProject = await fetch(urlP);
  let listProject = await resProject.json();
  const dataProject = listProject.result;
  const resSite = await fetch(
    `${publicRuntimeConfig.apiUrl}/api/services/app/BillingSystems/GetDropdownSite`
  );
  let listSite = await resSite.json();
  const dataSite = listSite.result;
  return {
    props: {
      dataProject,
      dataSite,
    },
    revalidate: 60,
  };
}
