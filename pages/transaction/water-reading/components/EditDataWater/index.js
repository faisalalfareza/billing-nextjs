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
function EditDataWater({ isOpen, params, onModalChanged, site }) {
  const [modalOpen, setModalOpen] = useState(true);
  const [{ accessToken, encryptedAccessToken }] = useCookies();
  const [isLoadingSubmit, setLoadingSubmit] = useState(false);

  const schemeModels = {
    formId: "water-edit-form",
    formField: {
      prev: {
        name: "prev",
        label: "Prev Read (m3)",
        placeholder: "Type prev read",
        type: "number",
        isRequired: true,
        errorMsg: "Prev Read is required.",
        defaultValue: "",
      },
      current: {
        name: "current",
        label: "Current Read (m3)",
        placeholder: "Type Current Read (m3)",
        type: "text",
        isRequired: true,
        errorMsg: "Current Read (m3) is required.",
        defaultValue: "",
      },
    },
  };
  let { prev, current } = schemeModels.formField;

  const initialValues = {
    [prev.name]: params ? params.prevRead : undefined,
    [current.name]: params ? params.currentRead : undefined,
  };

  const [formValues, setformValues] = useState(initialValues);

  const getFormData = (values) => {
    console.log("getFormData::", values);
  };
  console.log("formValues::", formValues);

  const updateWater = async (values, actions) => {
    setLoadingSubmit(false);

    const url = `${publicRuntimeConfig.apiUrl}/api/services/app/BillingSystems/UpdateDetailWaterReading`;
    const config = {
      headers: {
        Authorization: "Bearer " + accessToken,
        "Content-Type": "application/json",
      },
    };
    const body = {
      waterReadingId: params.waterReadingId,
      currentRead: values.current,
      prevRead: values.prev,
    };
    console.log(url, body);

    body.periodId = params.periodId;
    axios
      .put(url, body, config)
      .then((res) => {
        if (res.data.success) {
          Swal.fire({
            title: "Water Reading Updated",
            text:
              "Water Reading " +
              params.period +
              " in " +
              params.unitCode +
              " - " +
              params.unitNo +
              " has been successfully updated.",
            icon: "success",
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
  };

  const openModal = () => setModalOpen(true);
  const toggleModal = () => setModalOpen(true);
  const closeModal = () => {
    setModalOpen(false);
    setTimeout(() => onModalChanged(), 0);
  };

  console.log("params--------", params);
  useEffect(() => {
    if (params) {
      console.log("parms------", params);
      // setformValues((prevState) => ({
      //   ...prevState,
      //   [prev.name]: params?.prevRead,
      //   [current.name]: params?.currentRead,
      // }));

      console.log("formparams------", formValues);
    }
  }, [params]);

  if (isOpen) {
    let schemeValidations = Yup.object().shape({
      [prev.name]: prev.isRequired
        ? Yup.number().required(prev.errorMsg).min(0)
        : Yup.number().notRequired(),
      [current.name]: current.isRequired
        ? Yup.number().required(current.errorMsg).min(0)
        : Yup.number().notRequired(),
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
      updateWater(values, actions);
    };

    return (
      <Modal
        size="xl"
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
            console.log("val-----", values);
            // setformValues((prevState) => ({
            //   ...prevState,
            //   [prev.name]: params?.prevRead,
            //   [current.name]: params?.currentRead,
            // }));
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
                        <MDBox
                          color="white"
                          bgColor="white"
                          variant="gradient"
                          borderRadius="lg"
                          shadow="lg"
                          opacity={1}
                          p={2}
                        >
                          <MDTypography variant="caption">
                            Active Period :{" "}
                            <MDTypography variant="caption" color="info">
                              {params?.period}
                            </MDTypography>
                          </MDTypography>
                          <Grid container spacing={1}>
                            <Grid item xs={6}>
                              <MDBox key="project" display="flex" py={1} pr={2}>
                                <MDTypography
                                  variant="button"
                                  fontWeight="bold"
                                  textTransform="capitalize"
                                >
                                  Project: &nbsp;
                                </MDTypography>
                                <MDTypography
                                  variant="button"
                                  fontWeight="regular"
                                  color="text"
                                >
                                  &nbsp;{params.projectName}
                                </MDTypography>
                              </MDBox>
                              <MDBox key="cluster" display="flex" py={1} pr={2}>
                                <MDTypography
                                  variant="button"
                                  fontWeight="bold"
                                  textTransform="capitalize"
                                >
                                  Cluster: &nbsp;
                                </MDTypography>
                                <MDTypography
                                  variant="button"
                                  fontWeight="regular"
                                  color="text"
                                >
                                  &nbsp;{params.clusterName}
                                </MDTypography>
                              </MDBox>
                            </Grid>
                            <Grid item xs={6}>
                              <MDBox
                                key="unitcode"
                                display="flex"
                                py={1}
                                pr={2}
                              >
                                <MDTypography
                                  variant="button"
                                  fontWeight="bold"
                                  textTransform="capitalize"
                                >
                                  Unit Code: &nbsp;
                                </MDTypography>
                                <MDTypography
                                  variant="button"
                                  fontWeight="regular"
                                  color="text"
                                >
                                  &nbsp;{params.unitCode}
                                </MDTypography>
                              </MDBox>
                              <MDBox key="unitno" display="flex" py={1} pr={2}>
                                <MDTypography
                                  variant="button"
                                  fontWeight="bold"
                                  textTransform="capitalize"
                                >
                                  Unit No: &nbsp;
                                </MDTypography>
                                <MDTypography
                                  variant="button"
                                  fontWeight="regular"
                                  color="text"
                                >
                                  &nbsp;{params.unitNo}
                                </MDTypography>
                              </MDBox>
                            </Grid>
                          </Grid>
                        </MDBox>
                      </Grid>

                      <Grid item xs={12} sm={12}>
                        <FormField
                          type={prev.type}
                          label={prev.label + (prev.isRequired ? " ⁽*⁾" : "")}
                          name={prev.name}
                          value={formValues.prev}
                          placeholder={prev.placeholder}
                          error={errors.prev && touched.prev}
                          success={checkingSuccessInput(
                            formValues.prev,
                            errors.prev
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <FormField
                          type={current.type}
                          label={
                            current.label + (current.isRequired ? " ⁽*⁾" : "")
                          }
                          name={current.name}
                          value={formValues.current}
                          placeholder={current.placeholder}
                          error={errors.current && touched.current}
                          success={checkingSuccessInput(
                            formValues.current,
                            errors.current
                          )}
                        />
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

// Setting default value for the props of EditDataWater
EditDataWater.defaultProps = {
  isOpen: false,
  params: undefined,
};

// Typechecking props for the EditDataWater
EditDataWater.propTypes = {
  isOpen: PropTypes.bool,
  params: PropTypes.object,
  onModalChanged: PropTypes.func,
};

export default EditDataWater;
