import Card from "@mui/material/Card";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";

// @mui material components
import Grid from "@mui/material/Grid";
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

// Data
import dataTableData from "/pagesComponents/applications/data-tables/data/dataTableData";
import { useEffect, useState } from "react";

export default function WaterReading() {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const [listProject, setListProject] = useState([]);

  useEffect(() => {
    fetch(
      "http://18.141.209.135:1006/api/services/app/TAXList/getDataProject?userID=2"
    )
      .then((res) => res.json())
      .then((data) => setListProject(data));
    console.log("listProject", listProject);
  }, []);
  const defaultProps = {
    options: listProject,
    // getOptionLabel: (option) => option.projectName,
    // options: listProject.map((option) => option.projectName),
  };

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
    [project.name]: "",
    [cluster.name]: "",
  };

  const validations = Yup.object().shape({
    [project.name]: Yup.string().required(project.errorMsg),
    [cluster.name]: Yup.string().required(cluster.errorMsg),
  });

  const checkingSuccessInput = (value, error) => {
    return value != undefined && value != "" && value.length > 0 && !error;
  };

  const sleep = (ms) =>
    new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  const resetFilters = (values, actions) => {
    actions.resetForm();
  };
  const handleSubmit = (values, actions) => {
    // eslint-disable-next-line no-alert
    alert(JSON.stringify(values, null, 2));

    actions.setSubmitting(false);
    actions.resetForm();
  };
  function getDropdownProject(accessToken) {
    const url = `${publicRuntimeConfig.apiUrl}/api/services/app/TAXList/getDataProject`;
    const config = { headers: { Authorization: "Bearer " + accessToken } };

    axios.get(url, config).then((res) => {
      const { allPermissions, grantedPermissions } = res.data.result.auth;
      localStorage.setItem(
        "grantedPermissions",
        JSON.stringify(grantedPermissions)
      );
    });
  }

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

  const taskList = {
    columns: [
      { Header: "Company Code", accessor: "coCode" },
      { Header: "Company Name", accessor: "coName" },
      { Header: "No. Seri", accessor: "noSeri" },
      { Header: "FP Trans Code", accessor: "fpTransCode" },
      { Header: "FP Stat Code", fpStatCode: "noSeri" },
      { Header: "Message", accessor: "message" },
    ],
    rows: [
      {
        coCode: "MSV",
        coName: "PT. MAHKOTA SENTOSA UTAMA",
        officerName: "Mulianto Lie",
        title: "Presiden Director",
        noSeri: "001-22-00000001",
        fpTransCode: "01",
        fpStatCode: "1",
        message: "-",
      },
      {
        coCode: "IS",
        coName: "PT Indo Sejati",
        officerName: "Bambang Pamungkas",
        title: "Poucher",
        noSeri: "001-22-00000002",
        fpTransCode: "01",
        fpStatCode: "1",
        message: "-",
      },
    ],
  };
  return (
    <DashboardLayout>
      {/* <DashboardNavbar /> */}
      <MDBox
        p={3}
        color="light"
        bgColor="info"
        variant="gradient"
        borderRadius="lg"
        shadow="lg"
        opacity={1}
      >
        <MDTypography fontWeight="light" variant="h6" color="light">
          Site Name
        </MDTypography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={9}>
            <Autocomplete
              defaultValue="USD"
              options={["BTC", "CNY", "EUR", "GBP", "INR", "USD"]}
              renderInput={(params) => (
                <MDInput {...params} variant="standard" color="light" />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <MDButton variant="gradient" color="primary">
              Set Site
            </MDButton>
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
                      onSubmit={handleSubmit}
                    >
                      {({ values, errors, touched, isSubmitting }) => {
                        const { project: projectV, cluster: clusterV } = values;
                        return (
                          <Form id={form.formId} autoComplete="off">
                            <MDBox>
                              <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                  <Autocomplete
                                    options={[
                                      "BTC",
                                      "CNY",
                                      "EUR",
                                      "GBP",
                                      "INR",
                                      "USD",
                                    ]}
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
                                          projectV,
                                          errors.project
                                        )}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Autocomplete
                                    options={[
                                      "Option 1: This is the first option",
                                      "Option 2: This is the second option",
                                      "Option 3: This is the third option",
                                    ]}
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
                                          clusterV,
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
                                    {/* <MDButton
                                      variant="outlined"
                                      color="secondary"
                                      onClick={resetFilters}
                                    >
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
              <Grid item xs={12} md={6}>
                <MDBox mb={1}>
                  <MDTypography variant="h5">Water Reading List</MDTypography>
                </MDBox>
                <MDBox mb={2}>
                  <MDTypography variant="body2" color="text">
                    Water Reading Data plugin.
                  </MDTypography>
                </MDBox>
              </Grid>
              <Grid item xs={12} md={6} sx={{ textAlign: "right" }}>
                <Grid container alignItems="right" spacing={1}>
                  <Grid item xs={12} md={4}>
                    <MDButton variant="outlined" color="primary">
                      <Icon>add</Icon>&nbsp; Export Excel
                    </MDButton>
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <MDButton variant="outlined" color="primary">
                      <Icon>article</Icon>&nbsp; Download Template
                    </MDButton>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <MDButton variant="gradient" color="primary">
                      <Icon>add</Icon>&nbsp; Upload
                    </MDButton>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </MDBox>
          <DataTable table={dataTableData} canSearch />
        </Card>
      </MDBox>
    </DashboardLayout>
  );
}
