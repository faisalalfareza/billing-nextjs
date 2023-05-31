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
import DataTable from "/layout/Tables/DataTable";
import MDButton from "/components/MDButton";
import FormField from "/pagesComponents/FormField";
import Autocomplete from "@mui/material/Autocomplete";
import { useMaterialUIController } from "/context";
import { useCookies } from "react-cookie";
import { useEffect, useState, useRef } from "react";
import { typeNormalization, downloadTempFile } from "/helpers/utils";
import { alertService } from "/helpers";

// Data
import UploadDataWater from "./components/UploadDataWater";
import WaterRowActions from "./components/WaterRowActions";
import EditDataWater from "./components/EditDataWater";
import SiteDropdown from "../../../pagesComponents/dropdown/Site";
import { Block } from "notiflix/build/notiflix-block-aio";
import ClusterMultiSelect from "../../../pagesComponents/dropdown/ClusterMultiSelect";

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
  const formikRef = useRef();

  useEffect(() => {
    let currentSite = JSON.parse(localStorage.getItem("site"));
    if (currentSite == null)
      alertService.info({ title: "Please choose site first." });
    else setSite(currentSite);

    getProject();

    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const projectBlockLoadingName = "block-project";
  const getProject = async (val) => {
    Block.dots(`.${projectBlockLoadingName}`);

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

    if (response.error)
      alertService.error({ title: "Error", text: response.error.message });
    else setDataProject(response.result);

    Block.remove(`.${projectBlockLoadingName}`);
  };
  useEffect(() => {
    getProject();
    setformValues((prevState) => ({
      ...prevState,
      project: null,
      cluster: null,
    }));
    if (formikRef.current) {
      formikRef.current.setFieldValue("project", null);
      formikRef.current.setFieldValue("cluster", null);
    }
    setCustomerResponse((prevState) => ({
      ...prevState,
      rowData: [],
      totalRows: undefined,
      totalPages: undefined,
    }));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site]);
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        errorMsg: "Cluster is required.",
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
    { Header: "No", accessor: "no", width: "5%" },
    { Header: "Period", accessor: "period" },
    { Header: "Project", accessor: "project", width: "25%" },
    { Header: "Cluster", accessor: "cluster" },
    { Header: "Unit Code", accessor: "unitcode", width: "7%" },
    { Header: "Unit No", accessor: "unitno" },
    { Header: "Prev Read", accessor: "prev" },
    { Header: "Current Read", accessor: "curr" },
    {
      Header: "Action",
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

  const [isExpandedFilter, setExpandFilter] = useState(true);

  const waterReadingBlockLoadingName = "block-water-reading";
  const fetchData = async (data) => {
    Block.standard(
      `.${waterReadingBlockLoadingName}`,
      `Getting Water Reading Data`
    ),
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
          Search: keywords,
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
          period: e.period,
          action: e,
        });
      });
      setCustomerResponse((prevState) => ({
        ...prevState,
        rowData: list,
        totalRows: data.totalCount,
        totalPages: Math.ceil(data.totalCount / customerRequest.recordsPerPage),
      }));
      setTimeout(() => {
        const element = document.createElement("a");
        element.href = "#water-reading";
        element.click();
      }, 0);
    }

    Block.remove(`.${waterReadingBlockLoadingName}`), setLoading(false);
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

  const clusterBlockLoadingName = "block-cluster";
  const onProjectChange = async (val) => {
    Block.dots(`.${clusterBlockLoadingName}`);

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

    if (response.error)
      alertService.error({ title: "Error", text: response.error.message });
    else setDataCluster(response.result);

    Block.remove(`.${clusterBlockLoadingName}`);
  };

  const openModalEdit = (record) => {
    setModalParams(record);
    setOpenEdit(true);
  };

  const handleSite = (siteVal) => {
    setSite(siteVal);
    localStorage.setItem("site", JSON.stringify(siteVal));
  };

  const optionsME = [
    { label: "foo", value: "foo" },
    { label: "bar", value: "bar" },
    { label: "jar", value: "jar" },
    { label: "nar", value: "nar" },
    { label: "mar", value: "mar" },
    { label: "far", value: "far" },
  ];
  const [selectedOptions, setSelectedOptions] = useState([]);
  const getOptionLabel = (option) => `${option.clusterName}`;
  const getOptionDisabled = (option) => option.value === "foo";
  const handleToggleOption = (selectedOptions) =>
    setSelectedOptions(selectedOptions);
  const handleClearOptions = () => setSelectedOptions([]);
  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedOptions(options);
    } else {
      handleClearOptions();
    }
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
            <Card>
              <MDBox p={3} lineHeight={1}>
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
                              <Grid container columnSpacing={3}>
                                <Grid item xs={12} sm={6}>
                                  <Autocomplete
                                    // disableCloseOnSelect
                                    // includeInputInList={true}
                                    options={dataProject}
                                    id="project-cluster"
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
                                          formValues.project,
                                          errors.project
                                        )}
                                        className={projectBlockLoadingName}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  {/* <ClusterMultiSelect
                                    items={dataCluster}
                                    getOptionLabel={getOptionLabel}
                                    getOptionDisabled={getOptionDisabled}
                                    selectedValues={selectedOptions}
                                    label="Cluster"
                                    placeholder="Choose Cluster"
                                    selectAllLabel="Select all"
                                    onToggleOption={handleToggleOption}
                                    onClearOptions={handleClearOptions}
                                    onSelectAll={handleSelectAll}
                                  /> */}
                                  <Autocomplete
                                    // disableCloseOnSelect
                                    isOptionEqualToValue={(option, value) =>
                                      option.clusterId === value.clusterId
                                    }
                                    id="cluster-water"
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
                                    <MDBox
                                      ml={{ xs: 0, sm: 1 }}
                                      mt={{ xs: 1, sm: 0 }}
                                    >
                                      <MDButton
                                        type="submit"
                                        variant="gradient"
                                        color="primary"
                                        sx={{ height: "100%" }}
                                        disabled={isLoading || !isValifForm()}
                                      >
                                        <Icon>search</Icon>&nbsp;{" "}
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

      <MDBox mt={3.5} id="water-reading">
        <MDBox
          display="flex"
          justifyContent="flex-end"
          alignItems="flex-start"
          mb={2}
        >
          <MDBox display="flex">
            <MDBox>
              <MDButton
                variant="outlined"
                color="primary"
                disabled={customerResponse.rowData.length == 0}
                onClick={handleExport}
              >
                <Icon>description</Icon>&nbsp;Export Excel
              </MDButton>
            </MDBox>
            <MDBox ml={1}>
              <MDButton
                variant="gradient"
                color="primary"
                onClick={handleOpenUpload}
              >
                <Icon>add</Icon>&nbsp; Add New Water Reading
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>
        <Card className={waterReadingBlockLoadingName}>
          <MDBox>
            <Grid container alignItems="center">
              <Grid item xs={12} mb={1}>
                <DataTable
                  title="Water Reading List"
                  description="Water Reading Data"
                  table={setCustomerTaskList(customerResponse.rowData)}
                  manualPagination={true}
                  totalRows={customerResponse.totalRows}
                  totalPages={customerResponse.totalPages}
                  recordsPerPage={customerRequest.recordsPerPage}
                  skipCount={customerRequest.skipCount}
                  pageChangeHandler={skipCountChangeHandler}
                  recordsPerPageChangeHandler={recordsPerPageChangeHandler}
                  keywordsChangeHandler={keywordsChangeHandler}
                  entriesPerPage={{
                    defaultValue: customerRequest.recordsPerPage,
                  }}
                  canSearch
                  pagination={{ variant: "gradient", color: "primary" }}
                />
              </Grid>
            </Grid>
          </MDBox>
        </Card>
      </MDBox>

      {openUpload && (
        <UploadDataWater
          site={site}
          isOpen={openUpload}
          onModalChanged={(isChanged) => {
            setOpenUpload(!openUpload);
            isChanged === true && fetchData();
          }}
        />
      )}
      {openEdit && (
        <EditDataWater
          site={site}
          isOpen={openEdit}
          params={modalParams}
          onModalChanged={(isChanged) => {
            setOpenEdit(!openEdit);
            isChanged === true && fetchData();
          }}
        />
      )}
    </DashboardLayout>
  );
}
