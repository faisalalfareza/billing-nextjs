import React, { useState, useEffect } from "react";
import * as dayjs from "dayjs";
import Swal from "sweetalert2";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { ClickAwayListener } from "@mui/base";

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Grid from "@mui/material/Grid";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDButton from "/components/MDButton";
import FormField from "/pagesComponents/FormField";

// Data
import getConfig from "next/config";
import { useCookies } from "react-cookie";
const { publicRuntimeConfig } = getConfig();
import TextField from "@mui/material/TextField";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { typeNormalization } from "/helpers/utils";
import { alertService } from "/helpers";
import { Block } from "notiflix/build/notiflix-block-aio";

function AddOrEditPeriod({ isOpen, params, onModalChanged, site }) {
  const [{ accessToken, encryptedAccessToken }] = useCookies();
  const [isLoadingSubmit, setLoadingSubmit] = useState(false);
  const [no, setNo] = useState(null);
  const [open, setOpen] = useState(false);

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
      isActive: {
        name: "isActive",
        label: "Status",
        placeholder: "Status",
        type: "text",
        isRequired: true,
        errorMsg: "Status is required.",
        defaultValue: "",
      },
    },
  };
  let { periodNumber, periodName, startDate, endDate, closeDate, isActive } =
    schemeModels.formField;

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
    [isActive.name]: params ? params.isActive : true,
  };

  const [formValues, setformValues] = useState(initialValues);

  const getFormData = (values) => {};

  const periodNoBlockLoadingName = "block-period-no";
  const getLastPeriodNo = async (val) => {
    Block.dots(`.${periodNoBlockLoadingName}`); // setLoading(true);

    let response = await fetch("/api/master/period/getlastperiodno", {
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

    setNo(response.result);
    setformValues((prevState) => ({
      ...prevState,
      periodNumber: response.result,
    }));

    Block.remove(`.${periodNoBlockLoadingName}`);
  };
  useEffect(() => {
    if (site) getLastPeriodNo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const addDate = (val) => {
    return dayjs(val).add(1, "day");
  };

  const createPeriodBlockLoadingName = "block-create-period";
  const createPeriod = async (values, actions) => {
    setLoadingSubmit(true);

    const body = {
      siteId: site.siteId,
      periodMonth: addDate(values.periodName),
      periodYear: addDate(values.periodName),
      periodNumber: params ? params.periodNumber : no,
      startDate: addDate(values.startDate),
      endDate: addDate(values.endDate),
      closeDate: addDate(values.closeDate),
      isActive: values.isActive,
    };

    if (!params) {
      Block.standard(`.${createPeriodBlockLoadingName}`, `Creating Period`);

      let response = await fetch("/api/master/period/createmasterperiod", {
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
        alertService.warn({
          title: "Warning",
          text: err.error.message,
        });
      } else {
        Swal.fire({
          title: "New Period Added",
          text: "Period " + no + " has been successfully added",
          icon: "success",
          showConfirmButton: true,
          timerProgressBar: true,
          timer: 3000,
        }).then(() => {
          actions.resetForm();
          closeModal(true);
        });
      }
    } else {
      Block.standard(`.${createPeriodBlockLoadingName}`, `Updating Period`);

      body.periodID = params.periodId;

      let response = await fetch(
        "/api/master/period/prosesupdatemasterperiod",
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

      if (response.error) {
        let err = response.error;
        alertService.warn({
          title: "Warning",
          text: err.error.message,
        });
      } else {
        Swal.fire({
          title: "Period Updated",
          text:
            "Period " + values.periodName + " has been successfully updated.",
          icon: "success",
          showConfirmButton: true,
          timerProgressBar: true,
          timer: 3000,
        }).then((result) => {
          actions.resetForm();
          closeModal(true);
        });
      }
    }

    Block.remove(`.${createPeriodBlockLoadingName}`),
      actions.setSubmitting(false), setLoadingSubmit(false);
  };
  const closeModal = (isChanged = false) => {
    setNo(undefined), setformValues({});
    setTimeout(() => onModalChanged(isChanged), 0);
  };

  if (params) {
    // setformValues((prevState) => ({
    //   ...prevState,
    //   [periodNumber.name]: params.periodNumber,
    //   [periodName.name]: params.periodName,
    //   [startDate.name]: params.startDate,
    //   [endDate.name]: params.endDate,
    //   [closeDate.name]: params.closeDate,
    //   [isActive.name]: params.isActive,
    // }));
  }

  if (isOpen) {
    let schemeValidations = Yup.object().shape({
      [startDate.name]: startDate.isRequired
        ? Yup.date().required(startDate.errorMsg).typeError("Invalid Date")
        : Yup.date().notRequired(),
      [periodName.name]: periodName.isRequired
        ? Yup.string()
            .required(periodName.errorMsg)
            .max(periodName.maxLength, periodName.invalidMaxLengthMsg)
        : Yup.string().notRequired(),
      [endDate.name]: endDate.isRequired
        ? Yup.date().required(endDate.errorMsg).typeError("Invalid Date")
        : Yup.date().notRequired(),
      [closeDate.name]: closeDate.isRequired
        ? Yup.date().required(closeDate.errorMsg).typeError("Invalid Date")
        : Yup.date().notRequired(),
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
      if (dayjs(values.startDate).isAfter(dayjs(values.endDate))) {
        Swal.fire({
          icon: "warning",
          title: "Oh Snap!",
          text: "End date should be greater than Start date",
        });
        document.getElementsByName(endDate.name)[0].focus();
      } else if (dayjs(values.endDate).isAfter(dayjs(values.closeDate))) {
        Swal.fire({
          icon: "warning",
          title: "Oh Snap!",
          text: "Close date should be greater than End date",
        });
        document.getElementsByName(closeDate.name)[0].focus();
      } else {
        createPeriod(values, actions);
      }
    };

    const onKeyDown = (e) => {
      e.preventDefault();
    };

    return (
      <Modal 
        isOpen={isOpen}
        className={createPeriodBlockLoadingName}
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
                    <ClickAwayListener
                      mouseEvent="onMouseDown"
                      onClickAway={() => {
                        setOpen(false);
                      }}
                    >
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={12}>
                          <FormField
                            disabled
                            required={periodNumber.isRequired}
                            type={periodNumber.type}
                            label={periodNumber.label}
                            name={periodNumber.name}
                            value={params ? params.periodNumber : no}
                            placeholder={periodNumber.placeholder}
                            error={errors.periodNumber && touched.periodNumber}
                            success={checkingSuccessInput(
                              formValues.periodNumber,
                              errors.periodNumber
                            )}
                            InputLabelProps={{ shrink: true }}
                            className={periodNoBlockLoadingName}
                          />
                        </Grid>
                        <Grid item xs={12} sm={12}>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                              open={open}
                              onOpen={() => setOpen(true)}
                              onClose={() => setOpen(false)}
                              label={periodName.label}
                              value={formValues.periodName}
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
                                  onKeyDown={onKeyDown}
                                  required={periodName.isRequired}
                                  variant="standard"
                                  fullWidth
                                  onClick={(e) => setOpen(true)}
                                  error={
                                    errors.periodName && touched.periodName
                                  }
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
                            label={startDate.label}
                            name={startDate.name}
                            required={startDate.isRequired}
                            // value={formValues.startDate}
                            placeholder={startDate.placeholder}
                            error={errors.startDate && touched.startDate}
                            success={checkingSuccessInput(
                              formValues.startDate,
                              errors.startDate
                            )}
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={12}>
                          <FormField
                            type={endDate.type}
                            label={endDate.label}
                            name={endDate.name}
                            // value={formValues.endDate}
                            required={endDate.isRequired}
                            placeholder={endDate.placeholder}
                            error={errors.endDate && touched.endDate}
                            success={checkingSuccessInput(
                              formValues.endDate,
                              errors.endDate
                            )}
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={12}>
                          <FormField
                            type={closeDate.type}
                            label={closeDate.label}
                            name={closeDate.name}
                            required={closeDate.isRequired}
                            // value={formValues.closeDate}
                            placeholder={closeDate.placeholder}
                            error={errors.closeDate && touched.closeDate}
                            success={checkingSuccessInput(
                              formValues.closeDate,
                              errors.closeDate
                            )}
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>
                        {params && (
                          <Grid item xs={12} sm={12}>
                            <FormGroup>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name={isActive.name}
                                    checked={formValues.isActive}
                                    onChange={(e) => {
                                      setFieldValue(
                                        isActive.name,
                                        e.target.checked != null
                                          ? e.target.checked
                                          : initialValues[isActive.name]
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
                    </ClickAwayListener>
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
                      type="reset"
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
