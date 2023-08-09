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
import Site from "../Site";

import { Tabs, Card } from "@mui/material";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import UploadImage from "../UploadImage";

import validations from "../../schemas/validations";
import form from "../../schemas/form";
import initialValues from "../../schemas/initialValues";

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
  const { isOpen, params, onModalChanged, site, listBank, listTemplate } =
    props;
  const [modalOpen, setModalOpen] = useState(true);
  const [{ accessToken, encryptedAccessToken }] = useCookies();
  const formikRef = useRef();
  const [openDetail, setOpenDetail] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const { formId, formField } = form;

  const handleSetTabValue = (event, newValue) => {
    setTabValue(newValue);
  };

  const openModal = () => setModalOpen(true);
  const toggleModal = () => setModalOpen(true);
  const closeModal = (isChanged = false) => {
    setModalOpen(false);
    setTimeout(() => onModalChanged(isChanged), 0);
  };

  const detailUsersBlockLoadingName = "block-detail-user";
  const submitForm = async (values, actions) => {
    await sleep(1000);

    // eslint-disable-next-line no-alert
    alert(JSON.stringify(values, null, 2));

    actions.setSubmitting(false);
    actions.resetForm();
  };

  const handleSubmit = (values, actions) => {
    if (isLastStep) {
      submitForm(values, actions);
    } else {
      actions.setTouched({});
      actions.setSubmitting(false);
    }
  };

  const handleDetail = () => {
    setOpenDetail(!openDetail);
  };

  function getStepContent(stepIndex, formData) {
    switch (stepIndex) {
      case 0:
        return <BasicInfo formData={formData} />;
      case 1:
        return <Roles formData={formData} />;
      case 2:
        return <Site formData={formData} />;
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
        className={detailUsersBlockLoadingName}
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
            {({ values, errors, touched, isSubmitting }) => (
              <Form id={formId} autoComplete="off">
                <Card sx={{ height: "100%" }}>
                  <MDBox p={3}>
                    <MDBox>
                      {getStepContent(tabValue, {
                        values,
                        touched,
                        formField,
                        errors,
                      })}
                      <MDBox
                        mt={2}
                        width="100%"
                        display="flex"
                        justifyContent="space-between"
                      >
                        <MDButton
                          disabled={isSubmitting}
                          type="submit"
                          variant="gradient"
                          color="dark"
                        >
                          Save
                        </MDButton>
                      </MDBox>
                    </MDBox>
                  </MDBox>
                </Card>
              </Form>
            )}
          </Formik>
          {/* <CustomTabPanel value={tabValue} index={0}>
            <BasicInfo />
          </CustomTabPanel>
          <CustomTabPanel value={tabValue} index={1}>
            Item Two
          </CustomTabPanel>
          <CustomTabPanel value={tabValue} index={2}>
            Item Three
          </CustomTabPanel> */}
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
