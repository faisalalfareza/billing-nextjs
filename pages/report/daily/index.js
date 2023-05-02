import DashboardLayout from "/layout/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/layout/Navbars/DashboardNavbar";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Grid from "@mui/material/Grid";
import { Autocomplete, TextField, Radio } from "@mui/material";
import MDButton from "/components/MDButton";
import { useEffect, useState, useRef } from "react";
import Card from "@mui/material/Card";
import { Formik, Form, Field, useFormikContext } from "formik";
import FormField from "/pagesComponents/FormField";
import * as Yup from "yup";
import { typeNormalization } from "/helpers/utils";
import { alertService } from "/helpers";
import { useCookies } from "react-cookie";
import SiteDropdown from "/pagesComponents/dropdown/Site";
import BorderAllIcon from "@mui/icons-material/BorderAll";
import * as dayjs from "dayjs";

export default function ReportDaily(props) {
  let typeDummy = [
    {
      id: 1,
      name: "Yes",
    },
    { id: 0, name: "No" },
  ];
  const [site, setSite] = useState(null);
  const [{ accessToken, encryptedAccessToken }] = useCookies();
  const [dataCluster, setDataCluster] = useState([]);
  const [dataProject, setDataProject] = useState([]);
  const [dataCancel, setDataCancel] = useState(typeDummy);
  const [dataPeriod, setDataPeriod] = useState([]);
  const [dataPaymentMethod, setDataPaymentMethod] = useState([]);
  const formikRef = useRef();

  useEffect(() => {
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
    getProject();
    getPeriod();
  }, [site]);

  const getPaymentMethod = async () => {
    let response = await fetch(
      "/api/cashier/billing/getdropdownpaymentmethod",
      {
        method: "POST",
        body: JSON.stringify({
          accessToken: accessToken,
        }),
      }
    );
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error) {
      alertService.error({ title: "Error", text: response.error.message });
    } else {
      setDataPaymentMethod(response.result);
    }
  };

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

  const addDate = (val) => {
    return dayjs(val).add(1, "day");
  };

  useEffect(() => {
    let currentSite = JSON.parse(localStorage.getItem("site"));
    if (currentSite == null) {
      alertService.info({ title: "Info", text: "Please choose Site first" });
    } else {
      setSite(currentSite);
    }
    getPaymentMethod();
  }, []);

  //dari sini
  const [isLoading, setLoading] = useState(false);
  let schemeValidations = Yup.object().shape({
    cluster: Yup.array()
      .required("Cluster is required")
      .min(1)
      .typeError("Cluster is required."),
    cancelPayment: Yup.object().nullable(),
    paymentMethod: Yup.object().nullable(),
    period: Yup.object()
      .required("Period is required.")
      .typeError("Period is required."),
    project: Yup.object()
      .required("Project is required")
      .typeError("Project is required."),
    startDate: Yup.date().nullable(),
    endDate: Yup.date().nullable(),
  });

  const initialValues = {
    cluster: [],
    project: null,
    paymentMethod: null,
    period: null,
    cancelPayment: null,
    startDate: "",
    endDate: "",
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
      paymentTypeId: fields.paymentMethod?.paymentType,
      cancelPayment: fields.cancelPayment?.id,
      startDate: fields.startDate != "" ? addDate(fields.startDate) : undefined,
      endDate: fields.startDate != "" ? addDate(fields.endDate) : undefined,
    };

    let response = await fetch("/api/report/daily/repordaily", {
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
    let response = await fetch("/api/master/site/getdropdownclusterbyproject", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
        params: {
          SiteId: site?.siteId,
          ProjectId: val?.projectId,
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

  useEffect(() => {
    console.log("formval----", formValues);
  }, [formValues]);

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
                  <MDTypography variant="h5">Daily Report</MDTypography>
                </MDBox>
                <MDBox mb={4}>
                  <MDTypography variant="body2" color="text">
                    Generate Daily Reports
                  </MDTypography>
                </MDBox>
                <MDBox mb={2}>
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
                      console.log("valies----", values);
                      setformValues(values);
                      const isValifForm = () =>
                        checkingSuccessInput(values.period, errors.period) &&
                        checkingSuccessInput(values.project, errors.project) &&
                        checkingSuccessInput(values.cluster, errors.cluster);
                      return (
                        <Form id="payment-detail" autoComplete="off" fullWidth>
                          <MDBox pb={3}>
                            <Grid container spacing={3}>
                              <Grid item xs={6}>
                                <Field
                                  options={dataProject}
                                  getOptionLabel={(option) =>
                                    option.projectCode +
                                    " - " +
                                    option.projectName
                                  }
                                  component={Autocomplete}
                                  id="project-daily"
                                  value={formValues.project}
                                  onChange={(event, value) => {
                                    setFieldValue(
                                      "project",
                                      value !== null
                                        ? value
                                        : initialValues["project"]
                                    );
                                    getCluster(value);
                                  }}
                                  renderInput={(params) => (
                                    <FormField
                                      {...params}
                                      type="text"
                                      required
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
                                  options={dataCluster}
                                  id="cluster-ddr"
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
                                      label="Cluster *"
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
                              <Grid item xs={6}>
                                <Field
                                  options={dataPeriod}
                                  id="period-ddr"
                                  name="period"
                                  value={formValues.period}
                                  component={Autocomplete}
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
                                <Grid container spacing={3}>
                                  <Grid item xs={6}>
                                    <FormField
                                      key="startDate"
                                      InputLabelProps={{ shrink: true }}
                                      type="date"
                                      label="Transaction Start Date"
                                      name="startDate"
                                      placeholder="Type Transaction Start Date"
                                      error={
                                        errors.startDate && touched.startDate
                                      }
                                      success={checkingSuccessInput(
                                        formValues.startDate,
                                        errors.startDate
                                      )}
                                    />
                                  </Grid>
                                  <Grid item xs={6}>
                                    <FormField
                                      key="endDate"
                                      InputLabelProps={{ shrink: true }}
                                      type="date"
                                      label="Transaction End Date"
                                      name="endDate"
                                      placeholder="Type Transaction End Date"
                                      error={errors.endDate && touched.endDate}
                                      success={checkingSuccessInput(
                                        formValues.endDate,
                                        errors.endDate
                                      )}
                                    />
                                  </Grid>
                                </Grid>
                              </Grid>
                              <Grid item xs={6}>
                                <Field
                                  name="paymentMethod"
                                  component={Autocomplete}
                                  options={dataPaymentMethod}
                                  getOptionLabel={(option) =>
                                    option.paymentName
                                  }
                                  isOptionEqualToValue={(option, value) =>
                                    option.paymentType === value.paymentType
                                  }
                                  onChange={(e, value) => {
                                    setFieldValue(
                                      "paymentMethod",
                                      value !== null
                                        ? value
                                        : initialValues["paymentMethod"]
                                    );
                                  }}
                                  renderInput={(params) => (
                                    <FormField
                                      {...params}
                                      type="text"
                                      label="Payment Method"
                                      name="paymentMethod"
                                      placeholder="Choose Payment Method"
                                      InputLabelProps={{ shrink: true }}
                                      error={
                                        errors.paymentMethod &&
                                        touched.paymentMethod
                                      }
                                      success={checkingSuccessInput(
                                        formValues.paymentMethod,
                                        errors.paymentMethod
                                      )}
                                    />
                                  )}
                                />
                              </Grid>
                              <Grid item xs={6}>
                                <Field
                                  key="cancelpayment-ddr"
                                  name="cancelPayment"
                                  component={Autocomplete}
                                  options={dataCancel}
                                  getOptionLabel={(option) => option.name}
                                  isOptionEqualToValue={(option, value) =>
                                    option.id === value.id
                                  }
                                  onChange={(e, value) => {
                                    setFieldValue(
                                      "cancelPayment",
                                      value !== null
                                        ? value
                                        : initialValues["cancelPayment"]
                                    );
                                  }}
                                  renderInput={(params) => (
                                    <FormField
                                      {...params}
                                      type="text"
                                      label="Cancel Payment"
                                      name="cancelPayment"
                                      placeholder="Choose Cancel Payment"
                                      InputLabelProps={{ shrink: true }}
                                      error={
                                        errors.cancelPayment &&
                                        touched.cancelPayment
                                      }
                                      success={checkingSuccessInput(
                                        formValues.cancelPayment,
                                        errors.cancelPayment
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
