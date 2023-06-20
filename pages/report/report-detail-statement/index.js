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
import { Block } from "notiflix/build/notiflix-block-aio";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

function ReportDetailStatement() {
  const [site, setSite] = useState(null);
  const [{ accessToken, encryptedAccessToken }] = useCookies();
  const [dataCluster, setDataCluster] = useState([]);
  const [dataProject, setDataProject] = useState([]);
  const [dataUnitCode, setDataUnitCode] = useState([]);
  const [dataUnitNo, setDataUnitNo] = useState([]);
  const [dataMonth, setDataMonth] = useState([]);
  const [dataYear, setDataYear] = useState([]);
  const formikRef = useRef();

  useEffect(() => {
    setformValues((prevState) => ({
      ...prevState,
      project: null,
      unitCode: null,
      unitNo: null,
      startMonth: null,
      endMonth: null,
      periodYear: [],
      cluster: null,
    }));
    if (formikRef.current) {
      formikRef.current.setFieldValue("project", null);
      formikRef.current.setFieldValue("unitCode", null);
      formikRef.current.setFieldValue("unitNo", null);
      formikRef.current.setFieldValue("startMonth", null);
      formikRef.current.setFieldValue("endMonth", null);
      formikRef.current.setFieldValue("periodYear", []);
      formikRef.current.setFieldValue("cluster", null);
    }
    getProject();
    getMonth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site]);

  const onChangeProject = (val) => {
    setformValues((prevState) => ({
      ...prevState,
      unitCode: null,
      unitNo: null,
      cluster: null,
    }));
    if (formikRef.current) {
      formikRef.current.setFieldValue("unitCode", null);
      formikRef.current.setFieldValue("unitNo", null);
      formikRef.current.setFieldValue("cluster", null);
    }
    getCluster(val);
  };

  const unitNoBlockLoadingName = "block-unit-no";
  const getUnitNo = async (val) => {
    Block.dots(`.${unitNoBlockLoadingName}`);
    console.log(
      "clusterid----",
      formValues.cluster?.clusterId,
      formikRef.current.values
    );
    let response = await fetch(
      "/api/report/detail-statement/getdropdownunitnobycluster",
      {
        method: "POST",
        body: JSON.stringify({
          accessToken: accessToken,
          params: {
            SiteId: site?.siteId,
            ClusterId: formValues.cluster?.clusterId,
            UnitCode: val?.unitCode,
          },
        }),
      }
    );
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error)
      alertService.error({ title: "Error", text: response.error.message });
    else setDataUnitNo(response.result);

    Block.remove(`.${unitNoBlockLoadingName}`);
  };

  const unitCodeBlockLoadingName = "block-unitCode";
  const getUnitCode = async (val) => {
    Block.dots(`.${unitCodeBlockLoadingName}`);

    let response = await fetch(
      "/api/report/detail-statement/getdropdownunitcodebyclusterid",
      {
        method: "POST",
        body: JSON.stringify({
          accessToken: accessToken,
          params: {
            SiteId: site?.siteId,
            clusterId: val?.clusterId,
          },
        }),
      }
    );
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error)
      alertService.error({ title: "Error", text: response.error.message });
    else setDataUnitCode(response.result);

    Block.remove(`.${unitCodeBlockLoadingName}`);
  };

  const monthBlockLoadingName = "block-unitCode";
  const getMonth = async (val) => {
    Block.dots(`.${monthBlockLoadingName}`);

    let response = await fetch(
      "/api/report/detail-statement/getdropdownperiodmonth",
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

    if (response.error)
      alertService.error({ title: "Error", text: response.error.message });
    else setDataMonth(response.result);

    Block.remove(`.${monthBlockLoadingName}`);
  };

  const yearBlockLoadingName = "block-unitCode";
  const getYear = async (val) => {
    Block.dots(`.${yearBlockLoadingName}`);

    let response = await fetch(
      "/api/report/detail-statement/getdropdownperiodyear",
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

    if (response.error)
      alertService.error({ title: "Error", text: response.error.message });
    else setDataYear(response.result);

    Block.remove(`.${yearBlockLoadingName}`);
  };

  const addDate = (val) => {
    return dayjs(val).add(1, "day");
  };

  useEffect(() => {
    let currentSite = JSON.parse(localStorage.getItem("site"));
    if (currentSite == null)
      alertService.info({ title: "Please choose site first." });
    else setSite(currentSite);
    getYear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //dari sini
  const [isLoading, setLoading] = useState(false);
  let schemeValidations = Yup.object().shape({
    cluster: Yup.object()
      .required("Cluster is required")
      .typeError("Cluster is required."),
    periodYear: Yup.array()
      .min(1)
      .required("Period Year is required")
      .typeError("Period Year is required."),
    unitNo: Yup.object()
      .required("Unit No is required.")
      .typeError("Unit No is required."),
    unitCode: Yup.object()
      .required("Unit Code is required.")
      .typeError("Unit Code is required."),
    project: Yup.object()
      .required("Project is required")
      .typeError("Project is required."),
    startMonth: Yup.object()
      .required("Period Start Month is required")
      .typeError("Period Start Month is required."),
    endMonth: Yup.object()
      .required("Period End Month is required")
      .typeError("Period End Month is required."),
  });

  const initialValues = {
    cluster: null,
    project: null,
    unitNo: null,
    unitCode: null,
    periodYear: [],
    startMonth: null,
    endMonth: null,
  };

  const [formValues, setformValues] = useState(initialValues);

  const getFormData = (values) => {};

  const submitForm = async (values, actions) => {
    exportExcel(values, actions, 1);
  };

  const checkingSuccessInput = (value, error) => {
    return value != undefined && value != "" && !error;
  };

  const exportToExcelBlockLoadingName = "block-export-to-excel";
  const exportExcel = async (fields, actions, type) => {
    if (fields.endMonth?.numberMonth < fields.startMonth?.numberMonth) {
      alertService.warn({
        title: "End Month shoud be greater than Start Month",
      });
      return false;
    }
    Block.standard(
      `.${exportToExcelBlockLoadingName}`,
      `Exporting Report Statement to PDF`
    ),
      setLoading(true);

    let listYear = [];
    if (fields.periodYear != null)
      fields.periodYear.map((e) => {
        listYear.push(e.year);
      });
    const body = {
      siteId: site?.siteId,
      projectId: fields.project?.projectId,
      clusterId: fields.cluster?.clusterId,
      unitCode: fields.unitCode?.unitCode,
      unitNo: fields.unitNo?.unitNo,
      startMonth: fields.startMonth?.numberMonth,
      endMonth: fields.endMonth?.numberMonth,
      periodYear: listYear,
    };
    let url = "";
    if (type == 1) url = "/api/report/detail-statement/reportdetailstatement";
    else if (type == 2)
      url = "/api/report/detail-statement/reportpdfdetailstatement";

    let response = await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
        params: body,
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error)
      alertService.info({
        title: response.error.error.message,
      });
    else {
      let data = response.result;
      if (type == 1) {
        if (data != null) window.open(data.uri, "_blank");
        else
          alertService.info({
            title: "No Data",
            text: "No data in this filter",
          });
      } else {
        if (data != null) window.open(data, "_blank");
        else
          alertService.info({
            title: "No Data",
            text: "No data in this filter",
          });
      }
    }
    Block.remove(`.${exportToExcelBlockLoadingName}`), setLoading(false);
  };

  const clusterBlockLoadingName = "block-cluster";
  const getCluster = async (val) => {
    Block.dots(`.${clusterBlockLoadingName}`);

    let response = await fetch(
      "/api/report/detail-statement/getdropdownclusterbyproject",
      {
        method: "POST",
        body: JSON.stringify({
          accessToken: accessToken,
          params: {
            SiteId: site?.siteId,
            ProjectId: val?.projectId,
          },
        }),
      }
    );
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error)
      alertService.error({ title: "Error", text: response.error.message });
    else setDataCluster(response.result);

    Block.remove(`.${clusterBlockLoadingName}`);
  };

  const projectBlockLoadingName = "block-project";
  const getProject = async (val) => {
    Block.dots(`.${projectBlockLoadingName}`);

    let response = await fetch(
      "/api/report/detail-statement/getdropdownprojectbysiteid",
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

    if (response.error)
      alertService.error({ title: "Error", text: response.error.message });
    else setDataProject(response.result);

    Block.remove(`.${projectBlockLoadingName}`);
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
        mt={2}
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
                    <MDBox>
                      <MDTypography variant="h5">
                        Report Detail Statement
                      </MDTypography>
                    </MDBox>
                    <MDBox>
                      <MDTypography variant="button" color="text">
                        Generate Detail Statement Reports
                      </MDTypography>
                    </MDBox>
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
                        actions,
                      }) => {
                        setformValues(values);
                        const isValifForm = () =>
                          checkingSuccessInput(
                            values.unitCode,
                            errors.unitCode
                          ) &&
                          checkingSuccessInput(
                            values.project,
                            errors.project
                          ) &&
                          checkingSuccessInput(
                            values.cluster,
                            errors.cluster
                          ) &&
                          checkingSuccessInput(values.unitNo, errors.unitNo);
                        return (
                          <Form
                            id="detail-statement"
                            autoComplete="off"
                            fullWidth
                          >
                            <MDBox>
                              <Grid container columnSpacing={3}>
                                <Grid item xs={6} sm={6}>
                                  <Field
                                    options={dataProject}
                                    getOptionLabel={(option) =>
                                      option.projectCode +
                                      " - " +
                                      option.projectName
                                    }
                                    component={Autocomplete}
                                    id="project-detail-statement"
                                    value={formValues.project}
                                    onChange={(event, value) => {
                                      setFieldValue(
                                        "project",
                                        value !== null
                                          ? value
                                          : initialValues["project"]
                                      );
                                      getCluster(value);
                                      onChangeProject(value);
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
                                        error={
                                          errors.project && touched.project
                                        }
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
                                    id="cluster-detail-statement"
                                    name="cluster"
                                    component={Autocomplete}
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
                                      getUnitCode(value);
                                    }}
                                    isOptionEqualToValue={(option, value) =>
                                      option.clusterId === value.clusterId
                                    }
                                    renderInput={(params) => (
                                      <FormField
                                        {...params}
                                        type="text"
                                        required
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
                                        className={clusterBlockLoadingName}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid item xs={6} sm={6}>
                                  <Grid container spacing={3}>
                                    <Grid item xs={6} sm={6}>
                                      <Field
                                        options={dataUnitCode}
                                        id="unit-code-statement"
                                        name="unitCode"
                                        value={formValues.unitCode}
                                        component={Autocomplete}
                                        getOptionLabel={(option) =>
                                          option.unitCode
                                        }
                                        isOptionEqualToValue={(option, value) =>
                                          option.unitCodeId === value.unitCodeId
                                        }
                                        onChange={(e, value) => {
                                          setFieldValue(
                                            "unitCode",
                                            value !== null
                                              ? value
                                              : initialValues["unitCode"]
                                          );
                                          getUnitNo(value);
                                        }}
                                        renderInput={(params) => (
                                          <FormField
                                            {...params}
                                            type="text"
                                            required
                                            label="Unit Code"
                                            name="unitCode"
                                            placeholder="Choose Unit Code"
                                            InputLabelProps={{ shrink: true }}
                                            error={
                                              errors.unitCode &&
                                              touched.unitCode
                                            }
                                            success={checkingSuccessInput(
                                              formValues.unitCode,
                                              errors.unitCode
                                            )}
                                            className={unitCodeBlockLoadingName}
                                          />
                                        )}
                                      />
                                    </Grid>
                                    <Grid item xs={6} sm={6}>
                                      <Field
                                        options={dataUnitNo}
                                        id="unit-no-statement"
                                        name="unitNo"
                                        value={formValues.unitNo}
                                        component={Autocomplete}
                                        getOptionLabel={(option) =>
                                          option.unitNo
                                        }
                                        isOptionEqualToValue={(option, value) =>
                                          option.unitNo === value.unitNo
                                        }
                                        onChange={(e, value) => {
                                          setFieldValue(
                                            "unitNo",
                                            value !== null
                                              ? value
                                              : initialValues["unitNo"]
                                          );
                                        }}
                                        renderInput={(params) => (
                                          <FormField
                                            {...params}
                                            type="text"
                                            required
                                            label="Unit No"
                                            name="unitNo"
                                            placeholder="Choose Unit No"
                                            InputLabelProps={{ shrink: true }}
                                            error={
                                              errors.unitNo && touched.unitNo
                                            }
                                            success={checkingSuccessInput(
                                              formValues.unitNo,
                                              errors.unitNo
                                            )}
                                            className={unitNoBlockLoadingName}
                                          />
                                        )}
                                      />
                                    </Grid>
                                  </Grid>
                                </Grid>
                                <Grid item xs={6} sm={6}>
                                  <Grid container spacing={3}>
                                    <Grid item xs={4} sm={4}>
                                      <Field
                                        options={dataMonth}
                                        id="start-month-statement"
                                        name="startMonth"
                                        value={formValues.startMonth}
                                        component={Autocomplete}
                                        getOptionLabel={(option) =>
                                          option.periodMonth
                                        }
                                        isOptionEqualToValue={(option, value) =>
                                          option.periodMonth ===
                                          value.periodMonth
                                        }
                                        onChange={(e, value) => {
                                          setFieldValue(
                                            "startMonth",
                                            value !== null
                                              ? value
                                              : initialValues["startMonth"]
                                          );
                                        }}
                                        renderInput={(params) => (
                                          <FormField
                                            required
                                            {...params}
                                            type="text"
                                            label="Period Start Month"
                                            name="startMonth"
                                            placeholder="Choose Period Start Month"
                                            InputLabelProps={{ shrink: true }}
                                            error={
                                              errors.startMonth &&
                                              touched.startMonth
                                            }
                                            success={checkingSuccessInput(
                                              formValues.startMonth,
                                              errors.startMonth
                                            )}
                                            className={monthBlockLoadingName}
                                          />
                                        )}
                                      />
                                    </Grid>
                                    <Grid item xs={4} sm={4}>
                                      <Field
                                        options={dataMonth}
                                        id="end-month-statement"
                                        name="endMonth"
                                        value={formValues.endMonth}
                                        component={Autocomplete}
                                        getOptionLabel={(option) =>
                                          option.periodMonth
                                        }
                                        isOptionEqualToValue={(option, value) =>
                                          option.periodMonth ===
                                          value.periodMonth
                                        }
                                        onChange={(e, value) => {
                                          setFieldValue(
                                            "endMonth",
                                            value !== null
                                              ? value
                                              : initialValues["endMonth"]
                                          );
                                        }}
                                        renderInput={(params) => (
                                          <FormField
                                            {...params}
                                            required
                                            type="text"
                                            label="Period End Month"
                                            name="endMonth"
                                            placeholder="Choose Period End Month"
                                            InputLabelProps={{ shrink: true }}
                                            error={
                                              errors.endMonth &&
                                              touched.endMonth
                                            }
                                            success={checkingSuccessInput(
                                              formValues.endMonth,
                                              errors.endMonth
                                            )}
                                            className={monthBlockLoadingName}
                                          />
                                        )}
                                      />
                                    </Grid>
                                    <Grid item xs={4} sm={4}>
                                      <Field
                                        options={dataYear}
                                        id="year-statement"
                                        name="periodYear"
                                        multiple
                                        value={formValues.periodYear}
                                        component={Autocomplete}
                                        getOptionLabel={(option) => option.year}
                                        isOptionEqualToValue={(option, value) =>
                                          option.year === value.year
                                        }
                                        onChange={(e, value) => {
                                          setFieldValue(
                                            "periodYear",
                                            value !== null
                                              ? value
                                              : initialValues["periodYear"]
                                          );
                                        }}
                                        renderInput={(params) => (
                                          <FormField
                                            {...params}
                                            type="text"
                                            label="Period Year *"
                                            name="periodYear"
                                            placeholder="Choose Period Year"
                                            InputLabelProps={{ shrink: true }}
                                            error={
                                              errors.periodYear &&
                                              touched.periodYear
                                            }
                                            success={checkingSuccessInput(
                                              formValues.periodYear,
                                              errors.periodYear
                                            )}
                                            className={yearBlockLoadingName}
                                          />
                                        )}
                                      />
                                    </Grid>
                                  </Grid>
                                </Grid>
                                <Grid item xs={12}>
                                  <MDBox
                                    display="flex"
                                    flexDirection={{ xs: "column", sm: "row" }}
                                    justifyContent="flex-end"
                                    mt={2}
                                  >
                                    <MDButton
                                      variant="outlined"
                                      color="secondary"
                                      disabled={isLoading || !isValifForm()}
                                      onClick={() =>
                                        exportExcel(values, actions, 2)
                                      }
                                    >
                                      <PictureAsPdfIcon /> &nbsp;{" "}
                                      {isLoading
                                        ? "Exporting to PDF.."
                                        : "EXPORT TO PDF"}
                                    </MDButton>
                                    <MDBox
                                      ml={{ xs: 0, sm: 1 }}
                                      mt={{ xs: 1, sm: 0 }}
                                    >
                                      <MDButton
                                        ml={{ xs: 0, sm: 1 }}
                                        mt={{ xs: 1, sm: 0 }}
                                        type="submit"
                                        variant="gradient"
                                        color="primary"
                                        sx={{ height: "100%" }}
                                        disabled={isLoading || !isValifForm()}
                                      >
                                        <BorderAllIcon />
                                        &nbsp;{" "}
                                        {isLoading
                                          ? "Exporting to Excel.."
                                          : "Export to Excel"}
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
    </DashboardLayout>
  );
}

export default ReportDetailStatement;
