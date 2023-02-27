import React, { useState, useEffect } from "react";
import * as dayjs from "dayjs";
import * as moment from "moment";
import Swal from "sweetalert2";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import * as XLSX from "xlsx";

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import { Grid, Icon } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDButton from "/components/MDButton";
import FormField from "/pagesComponents/FormField";

// Data
import axios from "axios";
import getConfig from "next/config";
import { useCookies } from "react-cookie";
const { publicRuntimeConfig } = getConfig();
import { MonthPicker } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import TextField from "@mui/material/TextField";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Popup from "../../../../../pagesComponents/app/Popup";

function UploadDataWater({ isOpen, onModalChanged, site }) {
  const [modalOpen, setModalOpen] = useState(true);
  const [{ accessToken, encryptedAccessToken }] = useCookies();
  const [isLoadingSubmit, setLoadingSubmit] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [dataProject, setDataProject] = useState([]);
  const [dataCluster, setDataCluster] = useState([]);
  const [dataWater, setDataWater] = useState([]);
  const [cols, setCols] = useState([]);
  const [period, setPeriod] = useState(null);
  const SheetJSFT = [
    "xlsx",
    "xlsb",
    "xlsm",
    "xls",
    "xml",
    "csv",
    "txt",
    "ods",
    "fods",
    "uos",
    "sylk",
    "dif",
    "dbf",
    "prn",
    "qpw",
    "123",
    "wb*",
    "wq*",
    "html",
    "htm",
  ]
    .map(function (x) {
      return "." + x;
    })
    .join(",");

  /* generate an array of column objects */
  const make_cols = (refstr) => {
    let o = [],
      C = XLSX.utils.decode_range(refstr).e.c + 1;
    for (var i = 0; i < C; ++i)
      o[i] = { name: XLSX.utils.encode_col(i), key: i };
    return o;
  };
  const downloadTxtFile = () => {
    const element = document.createElement("a");
    element.href = "/template/template-water-reading.xlsx";
    element.download = "template-water-reading.xlsx";
    element.click();
  };

  const schemeModels = {
    formId: "period-form",
    formField: {
      project: {
        name: "project",
        label: "Project",
        placeholder: "Choose Project",
        type: "text",
        isRequired: true,
        errorMsg: "Project is required.",
        defaultValue: "",
      },
      cluster: {
        name: "cluster",
        label: "Cluster",
        placeholder: "Choose Cluster",
        type: "text",
        isRequired: true,
        errorMsg: "Cluster is required.",
        defaultValue: "",
      },
      fileUpload: {
        name: "fileUpload",
        label: "File Upload",
        placeholder: "Choose File",
        type: "file",
        isRequired: true,
        errorMsg: "File is required.",
        defaultValue: "",
      },
    },
  };
  let { project, cluster, fileUpload } = schemeModels.formField;

  var customParseFormat = require("dayjs/plugin/customParseFormat");
  dayjs.extend(customParseFormat);

  const initialValues = {
    [project.name]: null,
    [cluster.name]: null,
    [fileUpload.name]: null,
  };

  const [formValues, setformValues] = useState(initialValues);

  const getFormData = (values) => {
    console.log("getFormData::", values);
  };
  console.log("formValues::", formValues);
  console.log("dataCluster----", dataCluster);

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

  const getPeriod = (val) => {
    // setLoading(true);
    console.log("site-----", site);
    const url = `${publicRuntimeConfig.apiUrl}/api/services/app/BillingSystems/GetActivePeriod`;
    axios
      .get(url, {
        params: {
          SiteId: site?.siteId,
        },
      })
      .then((res) => {
        setPeriod(res.data.result);
        console.log("res----", formValues, res.data.result);
        // setLoading(false);
      })
      .catch((err) => console.log(err));
  };
  useEffect(() => {
    if (site) {
      getProject();
      getPeriod();
    }
  }, [isOpen]);

  useEffect(() => {
    const a = localStorage.getItem("site");
    console.log("a=====", a);
    if (a == null || a == undefined) {
    }
  });

  const onProjectChange = (val) => {
    setLoading(true);
    const url = `${publicRuntimeConfig.apiUrl}/api/services/app/BillingSystems/GetDropdownClusterByProject`;
    axios
      .get(url, {
        params: {
          ProjectId: val?.projectId,
        },
      })
      .then((res) => {
        setDataCluster(res.data.result);
        setLoading(false);
      })
      .catch((err) => console.log(err));
  };
  const uploadExcel = async (values, actions) => {
    setLoadingSubmit(false);

    const url = `${publicRuntimeConfig.apiUrl}/api/services/app/BillingSystems/UploadExcelWaterReading`;
    const config = {
      headers: {
        Authorization: "Bearer " + accessToken,
        "Content-Type": "application/json",
      },
    };
    const list = [];
    dataWater.map((e) => {
      list.push({
        siteId: site.siteId,
        projectId: formValues.project.projectId,
        clusterId: formValues.cluster.clusterId,
        unitNo: e.UnitNo,
        unitCode: e.UnitCode,
        prevRead: +e.PrevRead,
        currentRead: e.CurrRead,
        periodId: period.periodId,
      });
    });
    const body = list;
    console.log("CompanyOfficer/CreateOrUpdateCompanyOfficer ", body);
    axios
      .post(url, body, config)
      .then((res) => {
        if (res.data.success) {
          Swal.fire({
            title: "Uploading success",
            text:
              dataWater.length + " rows data has been successfully uploaded",
            icon: "success",
          }).then(() => {
            setLoadingSubmit(false);
            actions.resetForm();
            closeModal();
          });
        }
      })
      .catch((error) => {
        setLoadingSubmit(false);
        console.log("error-------", error);
      });
  };

  const openModal = () => setModalOpen(true);
  const toggleModal = () => setModalOpen(true);
  const closeModal = () => {
    setModalOpen(false);
    setDataWater([]);
    setTimeout(() => onModalChanged(), 0);
  };

  if (isOpen) {
    let schemeValidations = Yup.object().shape({
      [project.name]: project.isRequired
        ? Yup.object().required(project.errorMsg).typeError(project.errorMsg)
        : Yup.object().notRequired(),
      [cluster.name]: cluster.isRequired
        ? Yup.object().required(cluster.errorMsg).typeError(cluster.errorMsg)
        : Yup.object().notRequired(),
      [fileUpload.name]: fileUpload.isRequired
        ? Yup.mixed().required(fileUpload.errorMsg)
        : Yup.mixed().notRequired(),
    });

    const checkingSuccessInput = (value, error) => {
      return value != undefined && value != "" && value.length > 0 && !error;
    };
    const sleep = (ms) =>
      new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    const submitForm = async (values, actions) => {
      // await sleep(1000);
      uploadExcel(values, actions);
    };
    const handleFile = (file /*:File*/) => {
      /* Boilerplate to set up FileReader */
      const reader = new FileReader();
      const rABS = !!reader.readAsBinaryString;
      reader.onload = (e) => {
        /* Parse data */
        const bstr = e.target.result;
        const wb = XLSX.read(bstr, { type: rABS ? "binary" : "array" });
        /* Get first worksheet */
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        console.log(rABS, wb);
        /* Convert array of arrays */
        const data = XLSX.utils.sheet_to_json(ws, { header: 2 });
        console.log(ws);
        console.log(data);
        // console.log(data)
        /* Update state */
        setDataWater(data);
        setCols(make_cols(ws["!ref"]));
        // this.setState({ data: data, cols: make_cols(ws["!ref"]) });
        console.log("datawater----", dataWater);
        console.log("cols-----", cols);
      };
      if (rABS) reader.readAsBinaryString(file);
      else reader.readAsArrayBuffer(file);
    };
    const handleChangeFile = (e) => {
      console.log("e------", e);
      const files = e.target.files;
      if (files && files[0]) handleFile(files[0]);
    };

    return (
      <Modal
        size="lg"
        isOpen={isOpen}
        toggle={toggleModal}
        onOpened={openModal}
        onClosed={closeModal}
      >
        <Formik
          initialValues={initialValues}
          validationSchema={schemeValidations}
          onSubmit={submitForm}
        >
          {({
            values,
            errors,
            touched,
            isSubmitting,
            setFieldValue,
            resetForm,
          }) => {
            setformValues(values);
            getFormData(values);

            const isValifForm = () => {
              // return checkingSuccessInput(companyV, errors.periodNumber) &&
              //   checkingSuccessInput(officerNameV, errors.periodName) &&
              //   checkingSuccessInput(officerTitleV, errors.startDate)
              //   ? true
              //   : false;
            };

            return (
              <Form id={schemeModels.formId} autoComplete="off">
                <ModalHeader>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={12}>
                      <MDBox mb={1}>
                        <MDTypography variant="h5">
                          Upload New Water Reading
                        </MDTypography>
                      </MDBox>
                    </Grid>
                  </Grid>
                </ModalHeader>
                <ModalBody>
                  <MDBox pb={3} px={3}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={12}>
                        <MDTypography variant="caption">
                          Active Period :{" "}
                          <MDTypography variant="caption" color="info">
                            {period?.periodName}
                          </MDTypography>
                        </MDTypography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        {dataProject && (
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
                                error={errors.project && touched.project}
                                success={checkingSuccessInput(
                                  project,
                                  errors.project
                                )}
                              />
                            )}
                          />
                        )}
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        {dataCluster && (
                          <Autocomplete
                            disableCloseOnSelect
                            clearOnBlur={false}
                            key={cluster.name}
                            options={dataCluster}
                            value={values.cluster}
                            getOptionLabel={(option) =>
                              values.cluster != {}
                                ? option.clusterCode +
                                  " - " +
                                  option.clusterName
                                : "Nothing selected"
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
                                error={errors.cluster && touched.cluster}
                                success={checkingSuccessInput(
                                  cluster,
                                  errors.cluster
                                )}
                              />
                            )}
                          />
                        )}
                      </Grid>

                      <Grid item xs={6}>
                        <FormField
                          type={fileUpload.type}
                          label={
                            fileUpload.label +
                            (fileUpload.isRequired ? " *" : "")
                          }
                          name={fileUpload.name}
                          placeholder={fileUpload.placeholder}
                          InputLabelProps={{ shrink: true }}
                          error={errors.fileUpload && touched.fileUpload}
                          success={checkingSuccessInput(
                            fileUpload,
                            errors.fileUpload
                          )}
                          setFieldValue={setFieldValue}
                          accept={SheetJSFT}
                          onChange={(e, value) => {
                            console.log("value------------", value);
                            console.log("e------------", e);
                            handleChangeFile(e);
                            setFieldValue(fileUpload.name, e.target.value);
                          }}
                        />
                        {dataWater.length > 0 && (
                          <MDTypography variant="body">
                            Uploaded {dataWater.length} rows
                          </MDTypography>
                        )}
                      </Grid>
                      <Grid item xs={6}>
                        <MDButton
                          variant="outlined"
                          color="primary"
                          onClick={downloadTxtFile}
                        >
                          <Icon>article</Icon>&nbsp; Download Template
                        </MDButton>
                      </Grid>
                    </Grid>
                  </MDBox>
                </ModalBody>
                <ModalFooter>
                  <MDBox
                    display="flex"
                    flexDirection={{ xs: "column", sm: "row" }}
                  >
                    <MDButton
                      variant="outlined"
                      color="secondary"
                      onClick={closeModal}
                    >
                      Cancel
                    </MDButton>
                    <MDBox ml={{ xs: 0, sm: 1 }} mt={{ xs: 1, sm: 0 }}>
                      <MDButton
                        type="submit"
                        variant="gradient"
                        color="primary"
                        sx={{ height: "100%" }}
                        disabled={isLoadingSubmit}
                      >
                        {isLoadingSubmit ? "Adding Water Reading.." : "Save"}
                      </MDButton>
                    </MDBox>
                  </MDBox>
                </ModalFooter>
              </Form>
            );
          }}
        </Formik>
      </Modal>
    );
  }

  return false;
}

// Setting default value for the props of UploadDataWater
UploadDataWater.defaultProps = {
  isOpen: false,
  params: undefined,
};

// Typechecking props for the UploadDataWater
UploadDataWater.propTypes = {
  isOpen: PropTypes.bool,
  params: PropTypes.object,
  onModalChanged: PropTypes.func,
};

export default UploadDataWater;
