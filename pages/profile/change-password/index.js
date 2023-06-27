import MDBox from "/components/MDBox";
import { useEffect, useState, useRef } from "react";
import DashboardLayout from "/layout/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/layout/Navbars/DashboardNavbar";
import { Formik, Form, Field } from "formik";
import FormField from "/pagesComponents/FormField";
import MDButton from "/components/MDButton";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import MDTypography from "/components/MDTypography";
import MDAvatar from "/components/MDAvatar";
import { capitalizeFirstLetter } from "/helpers/utils";
import * as Yup from "yup";
import { Block } from "notiflix/build/notiflix-block-aio";
import { InputAdornment, IconButton } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import Swal from "sweetalert2";

// Data
import { useCookies } from "react-cookie";
import { typeNormalization } from "/helpers/utils";
import { alertService } from "/helpers";

export function getProfile() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("profilePicture");
  }

  return;
}

export function getInformation() {
  if (typeof window !== "undefined") {
    return JSON.parse(localStorage.getItem("informations"));
  }

  return;
}

function ChangePassword(props) {
  const profiles = getProfile();
  const informations = getInformation();
  const [userName, setUserName] = useState("~");
  const initialValues = {
    currentP: null,
    newP: null,
    confirmP: null,
  };
  const [{ accessToken, encryptedAccessToken }] = useCookies();
  const [formValues, setformValues] = useState(initialValues);
  const [isLoading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = () => setShowPassword(!showPassword);
  const [showPasswordNew, setShowPasswordNew] = useState(false);
  const handleClickShowPasswordNew = () => setShowPasswordNew(!showPasswordNew);
  const handleMouseDownPasswordNew = () => setShowPasswordNew(!showPasswordNew);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const handleClickShowPasswordConfirm = () =>
    setShowPasswordConfirm(!showPasswordConfirm);
  const handleMouseDownPasswordConfirm = () =>
    setShowPasswordConfirm(!showPasswordConfirm);

  const getFormData = (values) => {};

  useEffect(() => {
    setUserName(
      informations
        ? capitalizeFirstLetter(informations["user"]["userName"])
        : "~"
    );
  }, [informations]);

  let schemeValidations = Yup.object().shape({
    currentP: Yup.string()
      .required("Current Password is required.")
      .typeError("Current Password is required."),
    newP: Yup.string()
      .required("New Password is required.")
      .matches(
        /^(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/,
        "Must Contain 6 Characters, One Number and One Special Case Character"
      )
      .typeError("New Password is required."),
    confirmP: Yup.string()
      .required("Confirm Password is required.")
      .oneOf(
        [Yup.ref("newP"), null],
        "Confirm Password must match New Password"
      ),
  });

  const checkingSuccessInput = (value, error) => {
    return value != undefined && value != "" && !error;
  };
  const submitForm = async (values, actions) => {
    // await sleep(1000);
    processChangePassword(values, actions);
  };

  const detailPasswordBlockLoadingName = "block-change-password";
  const processChangePassword = async (values, actions) => {
    Block.standard(`.${detailPasswordBlockLoadingName}`, `Changing Password`),
      setLoading(true);

    const body = {
      currentPassword: values.currentP,
      newPassword: values.newP,
    };

    let response = await fetch("/api/profile/changepassword", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
        params: body,
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error)
      alertService.error({
        title: "Error",
        text: response.error.error.message,
      });
    else {
      Swal.fire({
        title: "Password Changed",
        text: "Password has been successfully changed.",
        icon: "success",
      }).then((result) => {
        actions.resetForm();
        setformValues(initialValues);
      });
    }

    Block.remove(`.${detailPasswordBlockLoadingName}`), setLoading(false);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Card
        sx={{
          position: "relative",
          py: 2,
          px: 2,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <MDAvatar
              src={`data:image/png;base64, ${profiles}`}
              alt="profile-image"
              size="xl"
              shadow="sm"
            />
          </Grid>
          <Grid item>
            <MDBox height="100%" mt={0.5} lineHeight={1}>
              <MDTypography variant="h5" fontWeight="medium">
                {userName}
              </MDTypography>
              {/* <MDTypography variant="button" color="text" fontWeight="regular">
                CEO / Co-Founder
              </MDTypography> */}
            </MDBox>
          </Grid>
        </Grid>
      </Card>
      <Card
        sx={{
          position: "relative",
          py: 2,
          px: 2,
          mt: 2,
        }}
      >
        <Grid
          container
          spacing={3}
          alignItems="center"
          className={detailPasswordBlockLoadingName}
        >
          <Grid item xs={12}>
            <MDTypography variant="h5" fontWeight="medium">
              Change Password
            </MDTypography>
          </Grid>
          <Grid item xs={12}>
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
                  return (
                    checkingSuccessInput(values.currentP, errors.currentP) &&
                    checkingSuccessInput(values.newP, errors.newP) &&
                    checkingSuccessInput(values.confirmP, errors.confirmP)
                  );
                };

                return (
                  <Form id="edit-data-unit-item" autoComplete="off">
                    <MDBox>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={12}>
                          <FormField
                            type={showPassword ? "text" : "password"}
                            label="Current Password"
                            name="currentP"
                            value={formValues.currentP}
                            placeholder="Type Current Password"
                            error={errors.currentP && touched.currentP}
                            success={checkingSuccessInput(
                              formValues.currentP,
                              errors.currentP
                            )}
                            InputProps={{
                              // <-- This is where the toggle button is added.
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleClickShowPassword}
                                    onMouseDown={handleMouseDownPassword}
                                  >
                                    {showPassword ? (
                                      <VisibilityIcon />
                                    ) : (
                                      <VisibilityOffIcon />
                                    )}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={12}>
                          <FormField
                            type={showPasswordNew ? "text" : "password"}
                            label="New Password"
                            name="newP"
                            value={formValues.newP}
                            placeholder="Type New Password"
                            error={errors.newP && touched.newP}
                            success={checkingSuccessInput(
                              formValues.newP,
                              errors.newP
                            )}
                            InputProps={{
                              // <-- This is where the toggle button is added.
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleClickShowPasswordNew}
                                    onMouseDown={handleMouseDownPasswordNew}
                                  >
                                    {showPasswordNew ? (
                                      <VisibilityIcon />
                                    ) : (
                                      <VisibilityOffIcon />
                                    )}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={12} md={12}>
                          <FormField
                            type={showPasswordConfirm ? "text" : "password"}
                            label="Confirm Password"
                            name="confirmP"
                            value={formValues.confirmP}
                            placeholder="Type Confirm Password"
                            error={errors.confirmP && touched.confirmP}
                            success={checkingSuccessInput(
                              formValues.confirmP,
                              errors.confirmP
                            )}
                            InputProps={{
                              // <-- This is where the toggle button is added.
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleClickShowPasswordConfirm}
                                    onMouseDown={handleMouseDownPasswordConfirm}
                                  >
                                    {showPasswordConfirm ? (
                                      <VisibilityIcon />
                                    ) : (
                                      <VisibilityOffIcon />
                                    )}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <MDTypography variant="h5" fontWeight="medium">
                            Password requierements
                          </MDTypography>
                          <MDTypography variant="body">
                            Please follow this guide for a strong password:
                          </MDTypography>
                          <MDBox height="100%" pl={2} mt={-2}>
                            <MDTypography variant="body" sx={{ ml: 2 }}>
                              <ul>
                                <li>One special characters</li>
                                <li>Min 6 characters</li>
                                <li> One number (2 are recommended)</li>
                                <li>Change it often</li>
                              </ul>
                            </MDTypography>
                          </MDBox>
                        </Grid>
                      </Grid>
                    </MDBox>
                    <MDBox
                      px={2}
                      display="flex"
                      justifyContent="flex-end"
                      flexDirection={{ xs: "column", sm: "row" }}
                    >
                      <MDBox>
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
                  </Form>
                );
              }}
            </Formik>
          </Grid>
        </Grid>
      </Card>
    </DashboardLayout>
  );
}

export default ChangePassword;
