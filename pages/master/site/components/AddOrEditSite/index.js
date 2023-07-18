import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Formik, Form, Field } from "formik";
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
import { useCookies } from "react-cookie";
import { typeNormalization } from "/helpers/utils";
import { Block } from "notiflix/build/notiflix-block-aio";

function AddOrEditSite({ isOpen, params, onModalChanged, site }) {
  const [{ accessToken, encryptedAccessToken }] = useCookies();
  let [first, setFirst] = useState(false);
  const [dataProject, setDataProject] = useState([]);
  const [dataCluster, setDataCluster] = useState([]);
  const [user, setUser] = useState({});

  useEffect(() => {
    if (!first) {
      getProject();
    }
    setFirst(true), first = true;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const projectBlockLoadingName = "block-project";
  const getProject = async () => {
    Block.dots(`.${projectBlockLoadingName}`);

    let response = await fetch("/api/master/site/getdropdownproject", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
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
    } else setDataProject(response.result);

    Block.remove(`.${projectBlockLoadingName}`);
  };

  const clusterBlockLoadingName = "block-cluster";
  const onProjectChange = async (val) => {
    Block.dots(`.${clusterBlockLoadingName}`);

    let response = await fetch("/api/master/site/getdropdownclusterbyproject", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
        params: {
          ProjectId: val[0]?.projectId,
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

  const createSiteBlockLoadingName = "block-create-site";
  const createSite = async (fields, actions) => {
    Block.standard(`.${createSiteBlockLoadingName}`, `Creating Site`);

    let listCluster = [];
    fields.cluster.map((e) => {
      listCluster.push({ clusterId: e.clusterId });
    });
    let listProject = [];
    fields.project.map((e) => {
      listProject.push({
        projectId: e.projectId,
        projectName: e.projectName,
        projectCode: e.projectCode,
      });
    });
    const body = {
      siteId: fields.id,
      siteName: fields.name,
      siteAddress: fields.address,
      siteCode: fields.code,
      email: fields.email,
      officePhone: fields.phone,
      handPhone: fields.handphone,
      isActive: true,
      clusterDataList: listCluster,
      projectDataList: listProject,
    };

    let response = await fetch("/api/master/site/creatmastersite", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
        params: body,
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error) {
      Swal.fire({
        title: "Error",
        icon: "error",
        text: response.error.message,
      });
    } else {
      Swal.fire({
        title: "New Site Added",
        text: "Site " + fields.name + " has been successfully added",
        icon: "success",
        showConfirmButton: true,
        timerProgressBar: true,
        timer: 3000,
      }).then(() => {
        actions.resetForm();
        closeModal(true);
      });
    }

    Block.remove(`.${createSiteBlockLoadingName}`),
      actions.setSubmitting(false);
  };
  const closeModal = (isChanged = false) => {
    setTimeout(() => onModalChanged(isChanged), 0);
  };

  if (isOpen) {
    const initialValues = {
      id: "",
      name: "",
      code: "",
      address: "",
      email: "",
      phone: "",
      handphone: "",
      project: "",
      cluster: "",
      status: "",
    };
    let schemeValidations = Yup.object().shape({
      id: Yup.string().required("Site ID is required"),
      name: Yup.string().required("Site Name is required"),
      code: Yup.string().required("Site Code is required"),
      address: Yup.string().required("Address is required"),
      email: Yup.string()
        .email("Email is invalid")
        .required("Email is required"),
      phone: Yup.string().required("Office Phone is required"),
      handphone: Yup.string().required("Handphone is required"),
      project: Yup.array().required("Project is required"),
      cluster: Yup.array().required("Cluster is required"),
    });

    const checkingSuccessInput = (value, error) => {
      return value != undefined && value != "" && value.length > 0 && !error;
    };
    const sleep = (ms) =>
      new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    const submitForm = (fields, actions) => {
      createSite(fields, actions);
    };


    return (
      <Modal 
        isOpen={isOpen}
        className={createSiteBlockLoadingName}
      >
        <Formik
          initialValues={initialValues}
          validationSchema={schemeValidations}
          onSubmit={submitForm}
        >
          {({ errors, touched, isSubmitting, setFieldValue, resetForm }) => {
            if (params) {
              // get user and set form fields

              const fields = [
                "id",
                "name",
                "code",
                "address",
                "email",
                "phone",
                "handphone",
                "project",
                "cluster",
                "status",
              ];
              fields.forEach((field) =>
                setFieldValue(field, params[field], false)
              );
              setUser(user);
            }

            return (
              <Form id="master-site-form" autoComplete="off">
                <ModalHeader>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={12}>
                      <MDBox mb={1}>
                        <MDTypography variant="h5">
                          {params == undefined ? "Add New" : "Edit"} Site
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
                          type="text"
                          required
                          label="Site ID"
                          name="id"
                          placeholder="Type Site ID"
                          error={errors.id && touched.id}
                          success={checkingSuccessInput(user.id, errors.id)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <FormField
                          type="text"
                          label="Site Name"
                          required
                          name="name"
                          placeholder="Type Site Name"
                          error={errors.name && touched.name}
                          success={checkingSuccessInput(user.name, errors.name)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <FormField
                          type="text"
                          required
                          label="Site Code"
                          name="code"
                          placeholder="Type Site Code"
                          error={errors.code && touched.code}
                          success={checkingSuccessInput(user.code, errors.code)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <FormField
                          type="text"
                          label="Address"
                          required
                          name="address"
                          placeholder="Type Address"
                          error={errors.address && touched.address}
                          success={checkingSuccessInput(
                            user.address,
                            errors.address
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <FormField
                          type="text"
                          label="Email"
                          required
                          name="email"
                          placeholder="Type Email"
                          error={errors.email && touched.email}
                          success={checkingSuccessInput(
                            user.email,
                            errors.email
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <FormField
                          type="text"
                          required
                          label="Office Phone"
                          name="phone"
                          placeholder="Type Office Phone"
                          error={errors.phone && touched.phone}
                          success={checkingSuccessInput(
                            user.phone,
                            errors.phone
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <FormField
                          required
                          type="text"
                          label="Handphone"
                          name="handphone"
                          placeholder="Type Handphone"
                          error={errors.handphone && touched.handphone}
                          success={checkingSuccessInput(
                            user.handphone,
                            errors.handphone
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <Field
                          name="project"
                          multiple
                          disableCloseOnSelect
                          key="project-ddr"
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
                              "project",
                              value !== null ? value : initialValues["project"]
                            );
                            onProjectChange(value);
                          }}
                          renderInput={(params) => (
                            <FormField
                              {...params}
                              required
                              type="text"
                              label="Project"
                              name="project"
                              placeholder="Type Project"
                              error={errors.project && touched.project}
                              success={checkingSuccessInput(
                                user.project,
                                errors.project
                              )}
                              InputLabelProps={{ shrink: true }}
                              className={projectBlockLoadingName}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <Field
                          name="cluster"
                          multiple
                          disableCloseOnSelect
                          component={Autocomplete}
                          options={dataCluster}
                          getOptionLabel={(option) =>
                            option.clusterCode + " - " + option.clusterName
                          }
                          isOptionEqualToValue={(option, value) =>
                            option.clusterId === value.clusterId
                          }
                          key="cluster-ddr"
                          onChange={(e, value) => {
                            setFieldValue(
                              "cluster",
                              value !== null ? value : initialValues["cluster"]
                            );
                          }}
                          renderInput={(params) => (
                            <FormField
                              {...params}
                              type="text"
                              label="Cluster"
                              required
                              name="cluster"
                              placeholder="Type Cluster"
                              error={errors.cluster && touched.cluster}
                              success={checkingSuccessInput(
                                user.cluster,
                                errors.cluster
                              )}
                              InputLabelProps={{ shrink: true }}
                              className={clusterBlockLoadingName}
                            />
                          )}
                        />
                      </Grid>
                      {/* {params && (
                        <Grid item xs={12} sm={12}>
                          <FormGroup>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  disabled={!formValues.isActive}
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
                      )} */}
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
                        disabled={isSubmitting}
                      >
                        {isSubmitting
                          ? params == undefined
                            ? "Adding Site.."
                            : "Updating Site.."
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

// Setting default value for the props of AddOrEditSite
AddOrEditSite.defaultProps = {
  isOpen: false,
  params: undefined,
};

// Typechecking props for the AddOrEditSite
AddOrEditSite.propTypes = {
  isOpen: PropTypes.bool,
  params: PropTypes.object,
  onModalChanged: PropTypes.func,
};

export default AddOrEditSite;
