import React, { useState, useEffect } from "react";
import * as dayjs from "dayjs";
import * as moment from "moment";
import Swal from "sweetalert2";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Grid from "@mui/material/Grid";
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

function AddOrEditPeriod({ isOpen, params, onModalChanged, site }) {
  const [modalOpen, setModalOpen] = useState(true);
  const [{ accessToken, encryptedAccessToken }] = useCookies();
  const [isLoadingSubmit, setLoadingSubmit] = useState(false);
  const [no, setNo] = useState(null);

  const schemeModels = {
    formId: "period-form",
    formField: {
      periodNumber: {
        name: "periodNumber",
        label: "Period Number",
        placeholder: "Auto fullfill",
        type: "text",
        isRequired: true,
        errorMsg: "Period Number is required.",
        defaultValue: "",
      },
      periodName: {
        name: "periodName",
        label: "Periode Name",
        placeholder: "Type Periode Name",
        type: "text",
        isRequired: true,
        errorMsg: "Periode Name is required.",
        maxLength: 50,
        invalidMaxLengthMsg:
          "Periode Name exceeds the maximum limit of 50 characters.",
        defaultValue: "",
      },
      startDate: {
        name: "startDate",
        label: "Start Date",
        placeholder: "Choose Date",
        type: "date",
        isRequired: true,
        errorMsg: "Start Date is required.",
        defaultValue: "",
      },
      endDate: {
        name: "endDate",
        label: "End Date",
        placeholder: "Choose Date",
        type: "date",
        isRequired: true,
        errorMsg: "End Date is required.",
        defaultValue: "",
      },
      closeDate: {
        name: "closeDate",
        label: "Close Date",
        placeholder: "Choose Date",
        type: "date",
        isRequired: true,
        errorMsg: "Close Date is required.",
        defaultValue: "",
      },
      statusActive: {
        name: "statusActive",
        label: "Status",
        placeholder: "Status",
        type: "text",
        isRequired: true,
        errorMsg: "Status is required.",
        defaultValue: "",
      },
    },
  };
  let {
    periodNumber,
    periodName,
    startDate,
    endDate,
    closeDate,
    statusActive,
  } = schemeModels.formField;

  var customParseFormat = require("dayjs/plugin/customParseFormat");
  dayjs.extend(customParseFormat);

  const initialValues = {
    [periodNumber.name]: params ? params.periodNumber : no,
    [periodName.name]: params ? params.periodName : null,
    [startDate.name]: params
      ? dayjs(params.startDate).format("YYYY-MM-DD")
      : null,
    [endDate.name]: params ? dayjs(params.endDate).format("YYYY-MM-DD") : null,
    [closeDate.name]: params
      ? dayjs(params.closeDate).format("YYYY-MM-DD")
      : null,
    [statusActive.name]: params ? params.isActive : true,
  };

  const [formValues, setformValues] = useState(initialValues);

  const getFormData = (values) => {
    console.log("getFormData::", values);
  };
  console.log("formValues::", formValues);

  const getLastPeriodNo = (val) => {
    // setLoading(true);
    console.log("site-----", site);
    const url = `${publicRuntimeConfig.apiUrl}/api/services/app/MasterBilling/GetLastPeriodNo`;
    axios
      .get(url, {
        params: {
          SiteId: site?.siteId,
        },
      })
      .then((res) => {
        setNo(res.data.result);
        setformValues((prevState) => ({
          ...prevState,
          periodNumber: res.data.result,
        }));
        console.log("res----", formValues, res.data.result);
        // setLoading(false);
      })
      .catch((err) => console.log(err));
  };
  useEffect(() => {
    if (site) {
      getLastPeriodNo();
    }
  }, [isOpen]);

  const addDate = (val) => {
    return dayjs(val).add(1, "day");
  };
  const createPeriod = async (values, actions) => {
    setLoadingSubmit(false);

    const url = `${publicRuntimeConfig.apiUrl}/api/services/app/MasterBilling/CreateMasterPeriod`;
    const urlUpdate = `${publicRuntimeConfig.apiUrl}/api/services/app/MasterBilling/UpdateMasterPeriod`;
    const config = {
      headers: {
        Authorization: "Bearer " + accessToken,
        "Content-Type": "application/json",
      },
    };
    const body = {
      siteId: site.siteId,
      periodMonth: addDate(values.periodName),
      periodYear: addDate(values.periodName),
      periodNumber: values.periodNumber,
      startDate: addDate(values.startDate),
      endDate: addDate(values.endDate),
      closeDate: addDate(values.closeDate),
      isActive: values.statusActive,
    };
    console.log("CompanyOfficer/CreateOrUpdateCompanyOfficer ", body);

    if (!params) {
      axios
        .post(url, body, config)
        .then((res) => {
          if (res.data.success) {
            Swal.fire({
              title: "New Period Added",
              text:
                "Period " +
                values.periodNumber +
                " has been successfully added",
              icon: "success",
              showConfirmButton: true,
              timerProgressBar: true,
              timer: 3000,
            }).then(() => {
              setLoadingSubmit(false);
              actions.resetForm();
              closeModal();
            });
          }
        })
        .catch((error) => {
          setLoadingSubmit(false);
          console.log("error-----", error.response.data.error.message);
          Swal.fire({
            title: "Error",
            icon: "error",
            text: error.response.data.error.message,
          });
        });
    } else {
      body.periodId = params.periodId;
      axios
        .put(urlUpdate, body, config)
        .then((res) => {
          if (res.data.success) {
            Swal.fire({
              title: "Period Updated",
              text:
                "Period " +
                values.periodName +
                " in " +
                values.periodNumber +
                " has been successfully updated.",
              icon: "success",
              showConfirmButton: true,
              timerProgressBar: true,
              timer: 3000,
            }).then((result) => {
              setLoadingSubmit(false);
              actions.resetForm();
              closeModal();
            });
          }
        })
        .catch((error) => {
          setLoadingSubmit(false);
          console.log("error-----", error);
          // <Popup icon={error} text={error.message} title="Error"/>
        });
    }
  };

  const openModal = () => setModalOpen(true);
  const toggleModal = () => setModalOpen(true);
  const closeModal = () => {
    setModalOpen(false);
    setTimeout(() => onModalChanged(), 0);
  };

  console.log("params--------", params);
  if (params) {
    // setformValues((prevState) => ({
    //   ...prevState,
    //   [periodNumber.name]: params.periodNumber,
    //   [periodName.name]: params.periodName,
    //   [startDate.name]: params.startDate,
    //   [endDate.name]: params.endDate,
    //   [closeDate.name]: params.closeDate,
    //   [statusActive.name]: params.isActive,
    // }));
  }

  if (isOpen) {
    let schemeValidations = Yup.object().shape({
      [startDate.name]: startDate.isRequired
        ? Yup.date().required(startDate.errorMsg)
        : Yup.date().notRequired(),
      [periodName.name]: periodName.isRequired
        ? Yup.string()
            .required(periodName.errorMsg)
            .max(periodName.maxLength, periodName.invalidMaxLengthMsg)
        : Yup.string().notRequired(),
      [endDate.name]: endDate.isRequired
        ? Yup.date().required(endDate.errorMsg)
        : Yup.date().notRequired(),
      [closeDate.name]: closeDate.isRequired
        ? Yup.date().required(closeDate.errorMsg)
        : Yup.date().notRequired(),
    });

    // let getCompany =
    //   params != undefined
    //     ? params.coCode + " - " + params.coName
    //     : periodNumber.defaultValue;
    // let getOfficerName =
    //   params != undefined ? params.periodName : periodName.defaultValue;
    // let getOfficerTitle =
    //   params != undefined ? params.title : startDate.defaultValue;
    // const schemeInitialValues = {
    //   [periodNumber.name]: getCompany,
    //   [periodName.name]: getOfficerName,
    //   [startDate.name]: getOfficerTitle,
    // };

    const checkingSuccessInput = (value, error) => {
      return value != undefined && value != "" && value.length > 0 && !error;
    };
    const sleep = (ms) =>
      new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    const submitForm = async (values, actions) => {
      // await sleep(1000);
      createPeriod(values, actions);
    };

    return (
      <Modal
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
                          {params == undefined ? "Add New" : "Edit"} Period
                        </MDTypography>
                      </MDBox>
                    </Grid>
                  </Grid>
                </ModalHeader>
                <ModalBody>
                  <MDBox pb={3} px={3}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={12}>
                        <FormField
                          disabled
                          type={periodNumber.type}
                          label={
                            periodNumber.label +
                            (periodNumber.isRequired ? " ⁽*⁾" : "")
                          }
                          name={periodNumber.name}
                          value={formValues.periodNumber}
                          placeholder={periodNumber.placeholder}
                          error={errors.periodNumber && touched.periodNumber}
                          success={checkingSuccessInput(
                            formValues.periodNumber,
                            errors.periodNumber
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            label={periodName.label}
                            value={formValues.periodName}
                            // variant="inline"
                            inputFormat="MMMM YYYY"
                            views={["year", "month"]}
                            onChange={(newValue) => {
                              setFieldValue(
                                periodName.name,
                                newValue != null
                                  ? newValue
                                  : initialValues[periodName.name]
                              );
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="standard"
                                fullWidth
                                error={errors.periodName && touched.periodName}
                                helperText={
                                  errors.periodName && touched.periodName
                                    ? periodName.errorMsg
                                    : ""
                                }
                              />
                            )}
                          />
                        </LocalizationProvider>

                        {/* <FormField
                          type={periodName.type}
                          label={
                            periodName.label +
                            (periodName.isRequired ? " ⁽*⁾" : "")
                          }
                          name={periodName.name}
                          value={formValues.periodName}
                          placeholder={periodName.placeholder}
                          error={errors.periodName && touched.periodName}
                          success={checkingSuccessInput(
                            formValues.periodName,
                            errors.periodName
                          )}
                        /> */}
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <FormField
                          type={startDate.type}
                          label={
                            startDate.label +
                            (startDate.isRequired ? " ⁽*⁾" : "")
                          }
                          name={startDate.name}
                          value={formValues.startDate}
                          placeholder={startDate.placeholder}
                          error={errors.startDate && touched.startDate}
                          success={checkingSuccessInput(
                            formValues.startDate,
                            errors.startDate
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <FormField
                          type={endDate.type}
                          label={
                            endDate.label + (endDate.isRequired ? " ⁽*⁾" : "")
                          }
                          name={endDate.name}
                          value={formValues.endDate}
                          placeholder={endDate.placeholder}
                          error={errors.endDate && touched.endDate}
                          success={checkingSuccessInput(
                            formValues.endDate,
                            errors.endDate
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <FormField
                          type={closeDate.type}
                          label={
                            closeDate.label +
                            (closeDate.isRequired ? " ⁽*⁾" : "")
                          }
                          name={closeDate.name}
                          value={formValues.closeDate}
                          placeholder={closeDate.placeholder}
                          error={errors.closeDate && touched.closeDate}
                          success={checkingSuccessInput(
                            formValues.closeDate,
                            errors.closeDate
                          )}
                        />
                      </Grid>
                      {params && (
                        <Grid item xs={12} sm={12}>
                          <FormGroup>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  disabled={!formValues.statusActive}
                                  name={statusActive.name}
                                  checked={formValues.statusActive}
                                  onChange={(e) => {
                                    console.log(e.target.checked);
                                    setFieldValue(
                                      statusActive.name,
                                      e.target.checked != null
                                        ? e.target.checked
                                        : initialValues[statusActive.name]
                                    );
                                  }}
                                />
                              }
                              label="Active"
                            />
                          </FormGroup>
                        </Grid>
                      )}
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
                        {isLoadingSubmit
                          ? params == undefined
                            ? "Adding Period.."
                            : "Updating Period.."
                          : params == undefined
                          ? "Save"
                          : "Update"}
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

// Setting default value for the props of AddOrEditPeriod
AddOrEditPeriod.defaultProps = {
  isOpen: false,
  params: undefined,
};

// Typechecking props for the AddOrEditPeriod
AddOrEditPeriod.propTypes = {
  isOpen: PropTypes.bool,
  params: PropTypes.object,
  onModalChanged: PropTypes.func,
};

export default AddOrEditPeriod;
