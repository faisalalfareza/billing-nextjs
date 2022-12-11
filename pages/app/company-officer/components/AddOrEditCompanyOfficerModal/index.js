import React, { useState, useEffect } from "react";
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
import getConfig from 'next/config';
import { useCookies } from 'react-cookie';
const { publicRuntimeConfig } = getConfig();


function AddOrEditCompanyOfficerModal({ isOpen, params, onModalChanged }) {
  const [modalOpen, setModalOpen] = useState(true);
  const [{ accessToken, encryptedAccessToken }] = useCookies();
  const [isLoadingSubmit, setLoadingSubmit] = useState(false);

  useEffect(() => {
    getMsCompanyDropdown();
  }, []);

  const [companyList, setCompany] = useState([]);
  const getMsCompanyDropdown = async (e) => {
    if (e) e.preventDefault();

    const url = `${publicRuntimeConfig.apiUrl}/api/services/app/CompanyOfficer/GetMsCompanyDropdown`;
    const config = {headers: {Authorization: "Bearer " + accessToken}};
    axios
      .get(url, config)
      .then(res => {
        let companyList = res.data.result;
        companyList = [
          {"coCode":"MSU","coName":"PT. MAHKOTA SENTOSA UTAMA"},
          {"coCode":"MSV","coName":"PT. MAHKOTA SENTOSA UTAMA"},
          {"coCode":"IS","coName":"PT Indo Sejati"},
          {"coCode":"SCo","coName":"SimCorp"}
        ];
        companyList = companyList.map(e => (e.coCode + " - " + e.coName).toUpperCase());
        setCompany(companyList);
      });
  };

  const createOrUpdateCompanyOfficer = async (values, actions) => {
    setLoadingSubmit(true);

    const url = `${publicRuntimeConfig.apiUrl}/api/services/app/CompanyOfficer/CreateOrUpdateCompanyOfficer`;
    const config = {
      headers: {
        Authorization: "Bearer " + accessToken,
        'Content-Type': 'application/json'
      }
    };

    let company = values.company.split(" - ");
    let loginName = JSON.parse(localStorage.getItem("informations")).user.userName;
    const body = {
      inputUN: loginName,
      coCode: company[0],
      coName: company[1],
      officerName: (params == undefined) ? values.officerName : params.officerName,
      officerNameNew: values.officerName,
      title: values.officerTitle,
      flag: (params == undefined) ? 1 : 2
    };
    console.log("CompanyOfficer/CreateOrUpdateCompanyOfficer ", body);

    axios
      .post(url, body, config)
      .then(res => {
        if (res.data.success) {
          if (params == undefined) { // Add Company Officer
            Swal.fire({
              title: 'New Officer Added',
              text: "Officer "+values.officerName+" has been successfully added to "+values.company+".",
              icon: 'success',
              showConfirmButton: true,
              timerProgressBar: true,
              timer: 3000,
            }).then(() => {
              setLoadingSubmit(false);
              actions.resetForm();
              closeModal();
            });
          } else { // Update Company Officer
            Swal.fire({
              title: 'Officer Updated',
              text: "Officer "+values.officerName+" in "+values.company+" has been successfully updated.",
              icon: 'success',
              showConfirmButton: true,
              timerProgressBar: true,
              timer: 3000,
            }).then((result) => {
              setLoadingSubmit(false);
              actions.resetForm();
              closeModal();
            });
          }
        }
      }).catch((error) => setLoadingSubmit(false));
  };

  const openModal = () => setModalOpen(true);
  const toggleModal = () => setModalOpen(true);
  const closeModal = () => {
    setModalOpen(false);
    setTimeout(() => onModalChanged(), 0);
  };

  if (isOpen) {  
    const schemeModels = {
      formId: "company-officer-form",
      formField: {
        company: {
          name: "company",
          label: "Company",
          placeholder: "Select the company to add officers.",
          type: "text",
          isRequired: true,
          errorMsg: "Company is required.",
          defaultValue: ""
        },
        officerName: {
          name: "officerName",
          label: "Officer Name",
          placeholder: "What's the officer's name?",
          type: "text",
          isRequired: true,
          errorMsg: "Officer Name is required.",
          maxLength: 50,
          invalidMaxLengthMsg: "Officer Name exceeds the maximum limit of 50 characters.",
          defaultValue: ""
        },
        officerTitle: {
          name: "officerTitle",
          label: "Officer Title",
          placeholder: "What's the officer's title?",
          type: "text",
          isRequired: true,
          errorMsg: "Officer Title is required.",
          defaultValue: ""
        },
      }
    };
    let { company, officerName, officerTitle } = schemeModels.formField;
    let schemeValidations = Yup.object().shape({
      [company.name]: company.isRequired ? Yup.string().required(company.errorMsg) : Yup.string().notRequired(),
      [officerName.name]: officerName.isRequired ? Yup.string().required(officerName.errorMsg).max(officerName.maxLength, officerName.invalidMaxLengthMsg) : Yup.string().notRequired(),
      [officerTitle.name]: officerTitle.isRequired ? Yup.string().required(officerTitle.errorMsg) : Yup.string().notRequired(),
    });
  
    let getCompany = (params != undefined ? (params.coCode + " - " + params.coName) : company.defaultValue);
    let getOfficerName = (params != undefined ? params.officerName : officerName.defaultValue);
    let getOfficerTitle = (params != undefined ? params.title : officerTitle.defaultValue);
    const schemeInitialValues = {
      [company.name]: getCompany,
      [officerName.name]: getOfficerName,
      [officerTitle.name]: getOfficerTitle
    };

    const checkingSuccessInput = (value, error) => {
      return (value != undefined && value != "" && value.length > 0) && !error;
    }
    const sleep = (ms) => new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
    const submitForm = async (values, actions) => {
      await sleep(1000);
      createOrUpdateCompanyOfficer(values, actions);
    };


    return (
      <Modal 
        isOpen={modalOpen}
        toggle={toggleModal}
        onOpened={openModal} 
        onClosed={closeModal} 
      >
        <Formik
          initialValues={schemeInitialValues}
          validationSchema={schemeValidations}
          onSubmit={submitForm}
        >
          {({ values, errors, touched, isSubmitting }) => {
            let { 
              company: companyV,
              officerName: officerNameV,
              officerTitle: officerTitleV
            } = values;

            const isValifForm = () => {
              return (
                checkingSuccessInput(companyV, errors.company) && 
                checkingSuccessInput(officerNameV, errors.officerName) && 
                checkingSuccessInput(officerTitleV, errors.officerTitle)
              ) ? true : false;
            };

            return (
              <Form id={schemeModels.formId} autoComplete="off">
                <ModalHeader>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={11}>
                      <MDBox mb={1}>
                        <MDTypography variant="h5">
                          {params == undefined ? "Add New" : "Edit"} Company Officer
                        </MDTypography>
                      </MDBox>
                      <MDBox mb={2}>
                        <MDTypography variant="button" color="text">
                          Used to register users who are usually in charge of reporting tax from a company.
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} md={1}>
                      <button
                        aria-label="Close"
                        className=" close"
                        type="button" 
                        onClick={closeModal}
                      >
                        <span aria-hidden={true}>×</span>
                      </button>
                    </Grid>
                  </Grid>
                </ModalHeader>
                <ModalBody>
                  <MDBox component="form" pb={3} px={3}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Grid item xs={12} sm={12}>
                          <Autocomplete
                            defaultValue={companyV}
                            options={companyList}
                            renderInput={(params) => (
                              <FormField
                                {...params}
                                type={company.type}
                                label={company.label + (company.isRequired?' ⁽*⁾':'')}
                                name={company.name}
                                placeholder={company.placeholder}
                                InputLabelProps={{ shrink: true }}
                                error={errors.company && touched.company}
                                success={checkingSuccessInput(companyV, errors.company)}
                              />
                            )}
                            // onChange={(event, newValue) => {
                            //   setValue('FormField', newValue, { shouldValidate: true });
                            // }}
                            // multiple
                          />
                        </Grid>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormField type={officerName.type} label={officerName.label + (officerName.isRequired?' ⁽*⁾':'')} name={officerName.name} value={officerNameV} placeholder={officerName.placeholder} 
                          error={errors.officerName && touched.officerName} success={checkingSuccessInput(officerNameV, errors.officerName)} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormField type={officerTitle.type} label={officerTitle.label + (officerTitle.isRequired?' ⁽*⁾':'')} name={officerTitle.name} value={officerTitleV} placeholder={officerTitle.placeholder} 
                          error={errors.officerTitle && touched.officerTitle} success={checkingSuccessInput(officerTitleV, errors.officerTitle)} />
                      </Grid>
                    </Grid>
                  </MDBox>
                </ModalBody>
                <ModalFooter>
                  <MDBox display="flex" flexDirection={{ xs: "column", sm: "row" }}>
                    <MDButton variant="outlined" color="secondary" onClick={closeModal}>
                      Cancel
                    </MDButton>
                    <MDBox ml={{ xs: 0, sm: 1 }} mt={{ xs: 1, sm: 0 }}>
                      <MDButton type="submit" variant="gradient" color="primary" sx={{ height: "100%" }}
                        disabled={!isValifForm() || isLoadingSubmit}>
                          {isLoadingSubmit 
                            ? (params == undefined ? "Adding Officer.." : "Updating Officer..")
                            : (params == undefined ? "Add Officer" : "Update Officer")
                          }
                      </MDButton>
                    </MDBox>
                  </MDBox>
                </ModalFooter>
              </Form>
            )
          }}
        </Formik>
      </Modal>
    );
  }

  return false;
}

// Setting default value for the props of AddOrEditCompanyOfficerModal
AddOrEditCompanyOfficerModal.defaultProps = {
  isOpen: false,
  params: undefined
};

// Typechecking props for the AddOrEditCompanyOfficerModal
AddOrEditCompanyOfficerModal.propTypes = {
  isOpen: PropTypes.bool,
  params: PropTypes.object,
  onModalChanged: PropTypes.func,
};

export default AddOrEditCompanyOfficerModal;
