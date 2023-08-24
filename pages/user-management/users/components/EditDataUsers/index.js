import React, { useState, useEffect, useRef } from "react";
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

// import validations from "../../schemas/validations";
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
  const formikRef = useRef();

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
  let initialValues = {
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

  const validationsCreate = Yup.object().shape({
    [nama.name]: Yup.string().required(nama.errorMsg),
    [surName.name]: Yup.string().required(surName.errorMsg),
    [email.name]: Yup.string().required(email.errorMsg).email(email.invalidMsg),
    [userName.name]: Yup.string().required(userName.errorMsg),
    [phoneNumber.name]: Yup.string().required(phoneNumber.errorMsg),
    [password.name]: Yup.string()
      .required(password.errorMsg)
      .min(6, password.invalidMsg),
    [repeatPassword.name]: Yup.string()
      .required(repeatPassword.errorMsg)
      .oneOf([Yup.ref("password"), null], repeatPassword.invalidMsg),
    [photoProfile.name]: Yup.string().required(photoProfile.errorMsg),
  });

  const validationsUpdate = Yup.object().shape({
    [nama.name]: Yup.string().required(nama.errorMsg),
    [surName.name]: Yup.string().required(surName.errorMsg),
    [email.name]: Yup.string().required(email.errorMsg).email(email.invalidMsg),
    [userName.name]: Yup.string().required(userName.errorMsg),
    [phoneNumber.name]: Yup.string().required(phoneNumber.errorMsg),
    [photoProfile.name]: Yup.string().required(photoProfile.errorMsg),
    [password.name]: Yup.string().min(6, password.invalidMsg),
    [repeatPassword.name]: Yup.string().oneOf(
      [Yup.ref("password"), null],
      repeatPassword.invalidMsg
    ),
  });

  const handleSetTabValue = (event, newValue) => {
    setTabValue(newValue);
  };

  const openModal = () => setModalOpen(true);
  const toggleModal = () => setModalOpen(true);
  const closeModal = (isChanged = true) => {
    console.log("closing modal", isChanged);
    setModalOpen(false);
    setTimeout(() => onModalChanged(true), 0);
  };

  const handleSubmit = (values, actions) => {
    createUser(values, actions);
  };

  const createUserBlockLoadingName = "block-create-user";
  const createUser = async (values, actions) => {
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

    if (!params) {
      Block.standard(`.${createUserBlockLoadingName}`, `Creating User`),
        setLoading(true);
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
    } else {
      Block.standard(`.${createUserBlockLoadingName}`, `Updating User`),
        setLoading(true);
      if (body.password == "" || body.password == null) delete body.password;
      body.id = params.id;
      if (body.photoProfile.includes("http")) delete body.photoProfile;
      let response = await fetch(
        "/api/user-management/users/prosesupdateuser",
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
          text: "User has been successfully updated",
          title: "Success",
        });
        closeModal(true);

        actions.resetForm();
      }
    }
    actions.setSubmitting(false);

    Block.remove(`.${createUserBlockLoadingName}`), setLoading(false);
  };

  const getUser = async (id) => {
    Block.standard(`.${createUserBlockLoadingName}`, `Getting User`),
      setLoading(true);

    let response = await fetch("/api/user-management/users/getdetailuser", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
        params: {
          UserId: id,
        },
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());
    console.log("res----", response);
    if (response.error) {
      let err = response.error.error;
      alertService.error({
        text: err.details,
        title: err.message,
      });
      setLoading(false);
    } else {
      let res = response.result;
      console.log(response);
      if (formikRef.current) {
        let roles = res.roleName.map((e) => {
          return capitalizeFirstLetter(e);
        });
        let sites = res.siteId.map((e) => {
          return e.toString();
        });
        console.log(roles);
        formikRef.current.setFieldValue("nama", res.name);
        formikRef.current.setFieldValue("surName", res.surname);
        formikRef.current.setFieldValue("userName", res.userName);
        formikRef.current.setFieldValue("email", res.emailAddress);
        formikRef.current.setFieldValue("phoneNumber", res.phoneNumber);
        formikRef.current.setFieldValue("roles", roles);
        formikRef.current.setFieldValue("sites", sites);
        formikRef.current.setFieldValue("active", res.isActive);
        formikRef.current.setFieldValue("photoProfile", res.photoProfile);
      }
    }

    Block.remove(`.${createUserBlockLoadingName}`), setLoading(false);
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };
  let validations = validationsUpdate;

  useEffect(() => {
    if (params) {
      getUser(params.id);
      validations = validationsUpdate;
      formField.password.required = false;
      formField.repeatPassword.required = false;
    }
  }, [isOpen]);

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
          sx={{ width: "100%" }}
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
            innerRef={formikRef}
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
                            !isValid ||
                            !dirty ||
                            loading ||
                            isSubmitting ||
                            values.roles.length == 0 ||
                            values.sites.length == 0
                          }
                        >
                          {loading ? "Saving.." : "Save"}
                        </MDButton>
                      </MDBox>
                    </MDBox>
                  </MDBox>
                </MDBox>
                {/* <div>
                  isValid = {JSON.stringify(isValid)}
                  dirty = {JSON.stringify(dirty)}
                </div> */}
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
