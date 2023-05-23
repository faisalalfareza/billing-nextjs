import DashboardLayout from "/layout/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/layout/Navbars/DashboardNavbar";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Grid from "@mui/material/Grid";
import { Autocomplete, TextField, Radio } from "@mui/material";
import MDButton from "/components/MDButton";
import { useEffect, useState, useRef } from "react";
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
import { Block } from "notiflix/build/notiflix-block-aio";

function ReportInvoice() {
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
  const formikRef = useRef();

  useEffect(() => {
    getPeriod();
    setformValues((prevState) => ({
      ...prevState,
      project: null,
      period: null,
      cluster: [],
    }));
    if (formikRef.current) {
      formikRef.current.setFieldValue("project", null);
      formikRef.current.setFieldValue("period", null);
      formikRef.current.setFieldValue("cluster", []);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site]);

  const periodBlockLoadingName = "block-period";
  const getPeriod = async (val) => {
    Block.dots(`.${periodBlockLoadingName}`);

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
    if (response.error) {
      alertService.error({ title: "Error", text: response.error.message });
    } else setDataPeriod(response.result);

    Block.remove(`.${periodBlockLoadingName}`);
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
    cluster: [],
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

  const exportToExcelBlockLoadingName = "block-export-to-excel";
  const exportExcel = async (fields, actions) => {
    Block.standard(`.${exportToExcelBlockLoadingName}`, `Exporting Invoice Report to Excel`),
      setLoading(true);

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
      let err = response.error;
      alertService.error({
        title: "Error",
        text: err.error.message,
      });
    } else {
      let data = response.result.uri;
      if (data != null) window.open(data, "_blank");
      else alertService.info({ title: "No Data", text: "No data in this filter" });
    }

    actions.setSubmitting(false);
    Block.remove(`.${exportToExcelBlockLoadingName}`),
      setLoading(false);
  };

  const clusterBlockLoadingName = "block-cluster";
  const getCluster = async (val) => {
    Block.dots(`.${clusterBlockLoadingName}`);

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
    if (response.error) {
      alertService.error({ title: "Error", text: response.error.message });
    } else setDataCluster(response.result);

    Block.remove(`.${clusterBlockLoadingName}`);
  };

  const projectBlockLoadingName = "block-project";
  const getProject = async (val) => {
    Block.dots(`.${projectBlockLoadingName}`);

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
    if (response.error) {
      alertService.error({ title: "Error", text: response.error.message });
    } else setDataProject(response.result);

    Block.remove(`.${projectBlockLoadingName}`);
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
        mt={2} mb={0}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <SiteDropdown onSelectSite={handleSite} site={site} />
          </Grid>
        </Grid>
      </MDBox>

      <MDBox mt={2}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card className={exportToExcelBlockLoadingName}>
              <MDBox p={3} lineHeight={1}>
                <Grid container alignItems="center" spacing={2}>
                  <Grid item xs={12} mb={2}>
                    <MDBox><MDTypography variant="h5">Report Invoice</MDTypography></MDBox>
                    <MDBox><MDTypography variant="button" color="text">Generate Invoice Reports</MDTypography></MDBox>
                  </Grid>
                  <Grid item xs={12}>
                    <Formik
                      innerRef={formikRef}
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
                            <MDBox>
                              <Grid container columnSpacing={3}>
                                <Grid item xs={6} sm={6}>
                                  <Field
                                    id="period-invoice"
                                    name="period"
                                    component={Autocomplete}
                                    options={dataPeriod}
                                    getOptionLabel={(option) => option.periodName}
                                    isOptionEqualToValue={(option, value) =>
                                      option.periodId === value.periodId
                                    }
                                    value={formValues.period}
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
                                        className={periodBlockLoadingName}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid item xs={6} sm={6}>
                                  <Field
                                    id="type-invoice"
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
                                <Grid item xs={6} sm={6}>
                                  <Field
                                    name="project"
                                    id="project-invoice"
                                    value={formValues.project}
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
                                        className={projectBlockLoadingName}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid item xs={6} sm={6}>
                                  <Field
                                    options={dataCluster}
                                    id="cluster-invoice"
                                    name="cluster"
                                    component={Autocomplete}
                                    multiple
                                    disableCloseOnSelect
                                    getOptionLabel={(option) =>
                                      option.clusterCode +
                                      " - " +
                                      option.clusterName
                                    }
                                    value={formValues.cluster}
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
                                        className={clusterBlockLoadingName}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <MDBox
                                    display="flex"
                                    flexDirection={{ xs: "column", sm: "row" }}
                                    justifyContent="flex-end"
                                    mt={2}
                                  >
                                    <MDButton
                                      type="submit"
                                      variant="gradient"
                                      color="primary"
                                      sx={{ height: "100%" }}
                                      disabled={
                                        isLoading ||
                                        !isValifForm()
                                      }
                                    >
                                      <BorderAllIcon />&nbsp;{" "}
                                      {isLoading
                                        ? "Exporting to Excel.."
                                        : "Export to Excel"
                                      }
                                    </MDButton>
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
    </DashboardLayout>
  );
}

export default ReportInvoice;
