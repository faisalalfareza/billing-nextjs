import React, { useState, useEffect } from "react";
import * as dayjs from "dayjs";
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
import { Block } from "notiflix/build/notiflix-block-aio";

// Data
import { typeNormalization } from "/helpers/utils";
import { alertService } from "/helpers";
import { useCookies } from "react-cookie";
function UploadDataWater(props) {
  const { isOpen, onModalChanged, site } = props;
  const [modalOpen, setModalOpen] = useState(true);
  const [{ accessToken, encryptedAccessToken }] = useCookies();
  const [isLoading, setLoading] = useState(false);
  const [dataProject, setDataProject] = useState([]);
  const [dataCluster, setDataCluster] = useState([]);
  const [dataWater, setDataWater] = useState([]);
  const [cols, setCols] = useState([]);
  const [period, setPeriod] = useState(null);
  const SheetJSFT = ["xlsx", "xlsb", "xlsm", "xls", "xml", "csv"]
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
    formId: "water-upload-form",
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
        label: "Cluster *",
        placeholder: "Choose Cluster",
        type: "text",
        isRequired: false,
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
    [cluster.name]: [],
    [fileUpload.name]: null,
  };

  const [formValues, setformValues] = useState(initialValues);

  const getFormData = (values) => {
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
    
    if (response.error) alertService.error({ title: "Error", text: response.error.message });
    else setDataProject(response.result);

    Block.remove(`.${projectBlockLoadingName}`);
  };

  const getPeriod = async (val) => {
    let response = await fetch("/api/transaction/water/getactiveperiod", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
        params: {
          SiteId: site?.siteId,
        },
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());
    
    if (response.error) alertService.error({ title: "Error", text: response.error.message });
    else setPeriod(response.result);
  };
  useEffect(() => {
    if (site) {
      getProject();
      getPeriod();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

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

    if (response.error) {
      Swal.fire({
        title: "Error",
        text: response.error.message,
        icon: "error",
      });
    } else setDataCluster(response.result);

    Block.remove(`.${clusterBlockLoadingName}`);
  };

  const uploadExcelWaterReadingBlockLoadingName = "block-upload-excel-water-reading";
  const uploadExcel = async (values, actions) => {
    Block.standard(`.${uploadExcelWaterReadingBlockLoadingName}`, `Uploading Water Reading`),
      setLoading(true);

    let listCluster = [];
    formValues.cluster.map((e) => {
      listCluster.push(e.clusterId);
    });
    const list = [];
    dataWater.map((e) => {
      list.push({
        unitNo: e.UnitNo,
        unitCode: e.UnitCode,
        prevRead: +e.PrevRead,
        currentRead: e.CurrRead,
      });
    });
    const body = {
      siteId: site.siteId,
      projectId: formValues.project.projectId,
      periodId: period.periodId,
      clusterId: listCluster,
      waterReadingUploadDetailList: list,
    };

    let response = await fetch(
      "/api/transaction/water/uploadexcelwaterreading",
      {
        method: "POST",
        body: JSON.stringify({
          accessToken: accessToken,
          params: body,
        }),
      }
    );
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error) alertService.error({ text: response.error.message, title: "Error" });
    else {
      const isFailed = response.result.totalGagal > 0;
      // Swal.fire({
      //   title: "Uploading success",
      //   text: dataWater.length + " rows data has been successfully uploaded",
      //   icon: "success",
      // }).then(() => {
      //   setLoading(false);
      //   actions.resetForm();
      //   closeModal();
      // });
      let title = "",
        icon = "";
      if (isFailed) {
        title = "Upload Water Reading Failed";
        icon = "error";
      } else {
        title = "Upload Water Reading Successfull";
        icon = "success";
      }
      Swal.fire({
        title: title,
        html:
          `${response.result.totalSukses} data has been successfully uploaded.` +
          (isFailed
            ? `<br><strong>${response.result.totalGagal} data failed to upload</strong>, <a href="${response.result.urlDataGagal}" download="error-upload-bulk-payment.xlsx"><u>download here to see.</u></a>`
            : ``),
        icon: icon,
        timerProgressBar: true,
        timer: !isFailed && 3000,
      }).then(() => {
        if (isFailed) {
          actions.setFieldValue(fileUpload.name, null);
          setTimeout(
            () => (document.getElementsByName(fileUpload.name)[0].value = null),
            0
          );
        } else {
          actions.resetForm();
          setTimeout(() => {
            document.getElementsByName(fileUpload.name)[0].value = null;
          }, 0);
        }
        setDataWater([]);

        if (!isFailed) 
          closeModal(true);
      });
    }

    Block.remove(`.${uploadExcelWaterReadingBlockLoadingName}`),
      setLoading(false);
  };

  const openModal = () => setModalOpen(true);
  const toggleModal = () => setModalOpen(true);
  const closeModal = (isChanged = false) => {
    setModalOpen(false);
    setTimeout(() => setDataWater([]), 1500);
    setTimeout(() => onModalChanged(isChanged), 0);
  };

  if (isOpen) {
    let schemeValidations = Yup.object().shape({
      [project.name]: project.isRequired
        ? Yup.object().required(project.errorMsg).typeError(project.errorMsg)
        : Yup.object().notRequired(),
      [cluster.name]: Yup.array().min(1).required(cluster.errorMsg),
      [fileUpload.name]: fileUpload.isRequired
        ? Yup.mixed().required(fileUpload.errorMsg)
        : Yup.mixed().notRequired(),
    });

    const checkingSuccessInput = (value, error) => {
      return value != undefined && value != "" && value != null && !error;
    };
    const sleep = (ms) =>
      new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    const submitForm = async (values, actions) => {
      // await sleep(1000);
      uploadExcel(values, actions);
    };

    const uploadedListBlockLoadingName = "block-uploaded-list";
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
        /* Convert array of arrays */
        const data = XLSX.utils.sheet_to_json(ws, { header: 2 });
        /* Update state */
        setDataWater(data);
        setCols(make_cols(ws["!ref"]));
        // this.setState({ data: data, cols: make_cols(ws["!ref"]) });

        Block.remove(`.${uploadedListBlockLoadingName}`);
      };
      if (rABS) reader.readAsBinaryString(file);
      else reader.readAsArrayBuffer(file);
    };
    const handleChangeFile = (e) => {
      const files = e.target.files;
      if (files && files[0]) {
        Block.dots(`.${uploadedListBlockLoadingName}`);

        handleFile(files[0]);
      }
    };

    return (
      <Modal
        {...props}
        size="lg"
        isOpen={isOpen}
        toggle={toggleModal}
        onOpened={openModal}
        onClosed={closeModal}
        className={uploadExcelWaterReadingBlockLoadingName}
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

            const isValifForm = () =>
              checkingSuccessInput(values.project, errors.project) &&
              checkingSuccessInput(values.cluster, errors.cluster) &&
              checkingSuccessInput(values.fileUpload, errors.fileUpload);

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
                          {period && (
                            <MDTypography variant="caption" color="info">
                              {period?.periodName}
                            </MDTypography>
                          )}
                        </MDTypography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Field
                          name={project.name}
                          key={project.name}
                          component={Autocomplete}
                          isOptionEqualToValue={(option, value) =>
                            option.projectId === value.projectId
                          }
                          options={dataProject}
                          getOptionLabel={(option) =>
                            option.projectCode + " - " + option.projectName
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
                          renderInput={(params) => (
                            <FormField
                              {...params}
                              type={project.type}
                              required={project.isRequired}
                              label={project.label}
                              name={project.name}
                              placeholder={project.placeholder}
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
                      <Grid item xs={12} sm={6}>
                        <Field
                          multiple
                          name={cluster.name}
                          disableCloseOnSelect
                          component={Autocomplete}
                          options={dataCluster}
                          getOptionLabel={(option) =>
                            option.clusterCode + " - " + option.clusterName
                          }
                          isOptionEqualToValue={(option, value) =>
                            option.clusterId === value.clusterId
                          }
                          key={cluster.name}
                          onChange={(e, value) => {
                            setFieldValue(
                              cluster.name,
                              value !== null
                                ? value
                                : initialValues[cluster.name]
                            );
                          }}
                          renderInput={(params) => (
                            <FormField
                              {...params}
                              type={cluster.type}
                              required={cluster.isRequired}
                              label={cluster.label}
                              name={cluster.name}
                              placeholder={cluster.placeholder}
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

                      <Grid item xs={6}>
                        <FormField
                          type={fileUpload.type}
                          required={fileUpload.isRequired}
                          label={fileUpload.label}
                          name={fileUpload.name}
                          placeholder={fileUpload.placeholder}
                          InputLabelProps={{ shrink: true }}
                          error={errors.fileUpload && touched.fileUpload}
                          success={checkingSuccessInput(
                            formValues.fileUpload,
                            errors.fileUpload
                          )}
                          // setFieldValue={setFieldValue}
                          accept={SheetJSFT}
                          onChange={(e, value) => {
                            handleChangeFile(e);
                            setFieldValue(fileUpload.name, e.target.value);
                          }}
                          className={uploadedListBlockLoadingName}
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
                        disabled={!isValifForm() || isLoading}
                      >
                        {isLoading ? "Saving.." : "Save"}
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
