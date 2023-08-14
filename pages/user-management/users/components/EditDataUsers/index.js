import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { FormGroup, FormControlLabel, Checkbox } from "@mui/material";

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
import DataTable from "/layout/Tables/DataTable";
import Container from "@mui/material/Container";
import { Block } from "notiflix/build/notiflix-block-aio";
import AppBar from "@mui/material/AppBar";

// Data
import { useCookies } from "react-cookie";
import { typeNormalization } from "/helpers/utils";
import { alertService } from "/helpers";
import NumberInput from "/pagesComponents/dropdown/NumberInput";
import Header from "../Header";
import BasicInfo from "../BasicInfo";
import Roles from "../Roles";
import Sites from "../Sites";

import { Tabs, Card } from "@mui/material";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import UploadImage from "../UploadImage";

import validations from "../../schemas/validations";
import form from "../../schemas/form";
// import initialValues from "../../schemas/initialValues";

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

function EditDataUsers(props) {
  console.log("EditDataUsers-----", props);
  const { isOpen, params, onModalChanged } = props;
  const [modalOpen, setModalOpen] = useState(true);
  const [{ accessToken, encryptedAccessToken }] = useCookies();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const { formId, formField } = form;

  const {
    formField: {
      nama,
      surName,
      userName,
      email,
      phoneNumber,
      password,
      repeatPassword,
      roles,
      sites,
      random,
      lockout,
      active,
      photoProfile,
    },
  } = form;
  let initialValues = {};
  if (params) {
    initialValues = {
      [nama.name]: params.name ? params.name : "",
      [surName.name]: params.surname ? params.surname : "",
      [userName.name]: params.userName ? params.userName : "",
      [email.name]: params.emailAddress ? params.emailAddress : "",
      [phoneNumber.name]: params.name ? params.name : "",
      [password.name]: params.name ? params.name : "",
      [repeatPassword.name]: params.name ? params.name : "",
      [roles.name]: params.name ? params.name : [],
      [sites.name]: params.name ? params.name : [],
      // [random.name]: params.name ? params.name : true,
      [active.name]: params.name ? params.name : true,
      // [lockout.name]: params.name ? params.name : true,
      [photoProfile.name]: params.name ? params.name : "",
    };
  } else {
    initialValues = {
      [nama.name]: "",
      [surName.name]: "",
      [userName.name]: "",
      [email.name]: "",
      [phoneNumber.name]: "",
      [password.name]: "",
      [repeatPassword.name]: "",
      [roles.name]: [],
      [sites.name]: [],
      // [random.name]: true,
      [active.name]: true,
      // [lockout.name]: true,
      [photoProfile.name]: "",
    };
  }

  const handleSetTabValue = (event, newValue) => {
    setTabValue(newValue);
  };

  const openModal = () => setModalOpen(true);
  const toggleModal = () => setModalOpen(true);
  const closeModal = (isChanged = false) => {
    setModalOpen(false);
    setTimeout(() => onModalChanged(isChanged), 0);
  };

  const handleSubmit = (values, actions) => {
    createUser(values, actions);
  };

  const createUserBlockLoadingName = "block-create-user";
  const createUser = async (values, actions) => {
    Block.standard(`.${createUserBlockLoadingName}`, `Creating User`),
      setLoading(true);
    const body = {
      userName: values.userName,
      name: values.nama,
      surname: values.surName,
      emailAddress: values.email,
      phoneNumber: +values.phoneNumber,
      siteId: values.sites,
      photoProfile: values.photoProfile,
      isActive: values.active,
      roleNames: values.roles,
      password: values.password,
    };

    let response = await fetch(
      "/api/user-management/users/prosescreatenewuser",
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
      let err = response.error.error;
      alertService.error({
        text: err.details,
        title: err.message,
      });
      setLoading(false);
    } else {
      alertService.success({
        text: "User has been successfully created",
        title: "Success",
      });
      closeModal(true);

      actions.resetForm();
    }
    actions.setSubmitting(false);

    Block.remove(`.${createUserBlockLoadingName}`), setLoading(false);
  };

  function getStepContent(stepIndex, formData) {
    switch (stepIndex) {
      case 0:
        return <BasicInfo formData={formData} />;
      case 1:
        return <Roles formData={formData} />;
      case 2:
        return <Sites formData={formData} />;
      default:
        return null;
    }
  }

  if (isOpen) {
    return (
      <Modal
        size="xl"
        isOpen={isOpen}
        toggle={toggleModal}
        onOpened={openModal}
        onClosed={closeModal}
        className={createUserBlockLoadingName}
      >
        <MDBox
          sx={{ width: "100%", bgcolor: "background.paper" }}
          minWidth={{ xs: "22rem", md: "25rem" }}
          mx="auto"
          mt={2}
          p={2}
        >
          <AppBar position="static">
            <Tabs
              value={tabValue}
              onChange={handleSetTabValue}
              aria-label="basic tabs example"
              centered
            >
              <Tab label="Basic Info" {...a11yProps(0)} />
              <Tab label="Roles" {...a11yProps(1)} />
              <Tab label="Site" {...a11yProps(2)} />
            </Tabs>
          </AppBar>
          <Formik
            initialValues={initialValues}
            validationSchema={validations}
            onSubmit={handleSubmit}
          >
            {({
              values,
              errors,
              touched,
              isSubmitting,
              setFieldValue,
              setFieldTouched,
              isValid,
              dirty,
            }) => (
              <Form id={formId} autoComplete="off">
                <MDBox sx={{ height: "100%" }}>
                  <MDBox>
                    {getStepContent(tabValue, {
                      values,
                      touched,
                      formField,
                      errors,
                      setFieldValue,
                      setFieldTouched,
                    })}
                    <MDBox
                      mt={2}
                      display="flex"
                      justifyContent="flex-end"
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
                          disabled={
                            !isValid || !dirty || loading || isSubmitting
                          }
                        >
                          {loading ? "Saving.." : "Save"}
                        </MDButton>
                      </MDBox>
                    </MDBox>
                  </MDBox>
                </MDBox>
              </Form>
            )}
          </Formik>
        </MDBox>
      </Modal>
    );
  }

  return false;
}

// Setting default value for the props of EditDataUsers
EditDataUsers.defaultProps = {
  isOpen: false,
  params: undefined,
};

// Typechecking props for the EditDataUsers
EditDataUsers.propTypes = {
  isOpen: PropTypes.bool,
  params: PropTypes.object,
  onModalChanged: PropTypes.func,
};

export default EditDataUsers;
