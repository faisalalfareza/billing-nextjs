import DashboardLayout from "/layout/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/layout/Navbars/DashboardNavbar";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Grid from "@mui/material/Grid";
import { Autocomplete, TextField, Radio } from "@mui/material";
import MDButton from "/components/MDButton";
import { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import { Formik, Form, Field, ErrorMessage } from "formik";
import FormField from "/pagesComponents/FormField";
import * as Yup from "yup";
import { typeNormalization } from "/helpers/utils";
import { alertService } from "/helpers";
import Icon from "@mui/material/Icon";
import { useCookies } from "react-cookie";
import SiteDropdown from "/pagesComponents/dropdown/Site";
import BorderAllIcon from "@mui/icons-material/BorderAll";

export default function ReportInvoice(props) {
  let typeDummy = [
    {
      id: 1,
      name: "Summary",
    },
    { id: 2, name: "Detail" },
  ];
  const [site, setSite] = useState(null);
  const [{ accessToken, encryptedAccessToken }] = useCookies();
  const [dataCluster, setDataCluster] = useState([]);
  const [dataProject, setDataProject] = useState([]);
  const [dataType, setDataType] = useState(typeDummy);
  const [dataPeriod, setDataPeriod] = useState([]);

  useEffect(() => {
    getPeriod();
  }, [site]);

  const getPeriod = async (val) => {
    let response = await fetch(
      "/api/transaction/invoice/getdropdownperiodbysiteid",
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
    console.log("response----", response);
    if (response.error) {
      alertService.error({ title: "Error", text: response.error.message });
    } else {
      setDataPeriod(response.result);
    }
    console.log("period------", dataPeriod);
  };

  useEffect(() => {
    let currentSite = JSON.parse(localStorage.getItem("site"));
    if (currentSite == null) {
      alertService.info({ title: "Info", text: "Please choose Site first" });
    } else {
      setSite(currentSite);
    }
  }, []);

  //dari sini
  const [isLoading, setLoading] = useState(false);
  let schemeValidations = Yup.object().shape({
    cluster: Yup.array().nullable(),
    type: Yup.object()
      .required("Report Type is required.")
      .typeError("Report Type is required."),
    period: Yup.object()
      .required("Period is required.")
      .typeError("Period is required."),
    project: Yup.object().nullable(),
  });

  const initialValues = {
    cluster: null,
    project: null,
    type: null,
    period: null,
  };

  const [formValues, setformValues] = useState(initialValues);

  const getFormData = (values) => {};

  const submitForm = async (values, actions) => {
    exportExcel(values, actions);
  };

  const checkingSuccessInput = (value, error) => {
    return value != undefined && value != "" && !error;
  };

  const exportExcel = async (fields, actions) => {
    setLoading(true);
    console.log("fields-----", fields);
    let listCluster = [];
    if (fields.cluster != null)
      fields.cluster.map((e) => {
        listCluster.push(e.clusterId);
      });

    const body = {
      siteId: site?.siteId,
      projectId: fields.project?.projectId,
      clusterId: listCluster.length == 0 ? undefined : listCluster,
      periodId: fields.period.periodId,
      reportType: fields.type.id,
    };

    let response = await fetch("/api/report/invoice/reportinvoice", {
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
      let data = response.result.uri;
      if (data != null) window.open(data, "_blank");
      else
        alertService.info({ title: "No Data", text: "No data in this filter" });
    }
    actions.setSubmitting(false);
    setLoading(false);
  };

  const getCluster = async (val) => {
    let response = await fetch(
      "/api/transaction/invoice/getdropdownclusterinvoice",
      {
        method: "POST",
        body: JSON.stringify({
          accessToken: accessToken,
          params: {
            SiteId: site?.siteId,
            periodId: val?.periodId,
          },
        }),
      }
    );
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

  const getProject = async (val) => {
    let response = await fetch(
      "/api/transaction/invoice/getdropdownprojectinvoice",
      {
        method: "POST",
        body: JSON.stringify({
          accessToken: accessToken,
          params: {
            SiteId: site?.siteId,
            periodId: val?.periodId,
          },
        }),
      }
    );
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
      <MDBox pb={3}>
        <Card>
          <MDBox p={3} lineHeight={1}>
            <Grid container alignItems="center">
              <Grid item xs={12} md={12}>
                <MDBox mb={1}>
                  <MDTypography variant="h5">Report Invoice</MDTypography>
                </MDBox>
                <MDBox mb={4}>
                  <MDTypography variant="body2" color="text">
                    Generate Invoice Reports
                  </MDTypography>
                </MDBox>
                <MDBox mb={2}>
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
                      values,
                    }) => {
                      setformValues(values);
                      const isValifForm = () =>
                        checkingSuccessInput(values.period, errors.period) &&
                        checkingSuccessInput(values.type, errors.type);
                      return (
                        <Form id="payment-detail" autoComplete="off" fullWidth>
                          <MDBox pb={3}>
                            <Grid container spacing={3}>
                              <Grid item xs={6}>
                                <Field
                                  key="period-ddr"
                                  name="period"
                                  component={Autocomplete}
                                  options={dataPeriod}
                                  getOptionLabel={(option) => option.periodName}
                                  isOptionEqualToValue={(option, value) =>
                                    option.periodId === value.periodId
                                  }
                                  onChange={(e, value) => {
                                    setFieldValue(
                                      "period",
                                      value !== null
                                        ? value
                                        : initialValues["period"]
                                    );
                                    getProject(value);
                                    getCluster(value);
                                  }}
                                  renderInput={(params) => (
                                    <FormField
                                      {...params}
                                      type="text"
                                      required
                                      label="Period"
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
                              <Grid item xs={6}>
                                <Field
                                  key="type-ddr"
                                  name="type"
                                  component={Autocomplete}
                                  options={dataType}
                                  getOptionLabel={(option) => option.name}
                                  isOptionEqualToValue={(option, value) =>
                                    option.id === value.id
                                  }
                                  onChange={(e, value) => {
                                    setFieldValue(
                                      "type",
                                      value !== null
                                        ? value
                                        : initialValues["type"]
                                    );
                                  }}
                                  renderInput={(params) => (
                                    <FormField
                                      {...params}
                                      type="text"
                                      required
                                      label="Report Type"
                                      name="type"
                                      placeholder="Choose Type"
                                      InputLabelProps={{ shrink: true }}
                                      error={errors.type && touched.type}
                                      success={checkingSuccessInput(
                                        formValues.type,
                                        errors.type
                                      )}
                                    />
                                  )}
                                />
                              </Grid>
                              <Grid item xs={6}>
                                <Field
                                  name="project"
                                  key="project-ddr"
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
                                    option.projectId === value.projectId
                                  }
                                  renderInput={(params) => (
                                    <FormField
                                      {...params}
                                      type="text"
                                      label="Project"
                                      name="project"
                                      placeholder="Choose Project"
                                      InputLabelProps={{ shrink: true }}
                                      error={errors.project && touched.project}
                                      success={checkingSuccessInput(
                                        formValues.project,
                                        errors.project
                                      )}
                                    />
                                  )}
                                />
                              </Grid>
                              <Grid item xs={6}>
                                <Field
                                  key="cluster-ddr"
                                  name="cluster"
                                  component={Autocomplete}
                                  options={dataCluster}
                                  multiple
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
                                    option.clusterId === value.clusterId
                                  }
                                  renderInput={(params) => (
                                    <FormField
                                      {...params}
                                      type="text"
                                      label="Cluster"
                                      name="cluster"
                                      placeholder="Choose Cluster"
                                      InputLabelProps={{ shrink: true }}
                                      error={errors.cluster && touched.cluster}
                                      success={checkingSuccessInput(
                                        formValues.cluster,
                                        errors.cluster
                                      )}
                                    />
                                  )}
                                />
                              </Grid>
                            </Grid>
                          </MDBox>
                          <Grid item xs={12} mt={3}>
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
                                  disabled={!isValifForm() || isLoading}
                                >
                                  <BorderAllIcon />
                                  &nbsp;{" "}
                                  {!isLoading
                                    ? "EXPORT TO EXCEL"
                                    : "EXPORTING TO EXCEL ..."}
                                </MDButton>
                              </MDBox>
                            </MDBox>
                          </Grid>
                        </Form>
                      );
                    }}
                  </Formik>
                </MDBox>
              </Grid>
            </Grid>
          </MDBox>
        </Card>
      </MDBox>
    </DashboardLayout>
  );
}
