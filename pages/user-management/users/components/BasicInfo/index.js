import MDBox from "components/MDBox";
import Grid from "@mui/material/Grid";
import MDTypography from "/components/MDTypography";
import { Card, Switch } from "@mui/material";
import UploadImage from "../UploadImage";
import MDButton from "/components/MDButton";
import FormField from "/pagesComponents/FormField";
import { useState, useEffect } from "react";
import { InputAdornment, IconButton } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

export default function BasicInfo({ formData }) {
  const { formField, values, errors, touched, setFieldValue, setFieldTouched } =
    formData;
  const {
    nama,
    surName,
    userName,
    email,
    password,
    repeatPassword,
    phoneNumber,
  } = formField;
  const {
    nama: namaV,
    surName: surNameV,
    userName: userNameV,
    email: emailV,
    password: passwordV,
    repeatPassword: repeatPasswordV,
    phoneNumber: phoneNumberV,
  } = values;

  // const [random, setRandom] = useState(true);
  const [active, setActive] = useState(true);
  // const [lockout, setLockout] = useState(true);
  const [showPasswordNew, setShowPasswordNew] = useState(false);
  const handleClickShowPasswordNew = () => setShowPasswordNew(!showPasswordNew);
  const handleMouseDownPasswordNew = () => setShowPasswordNew(!showPasswordNew);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const handleClickShowPasswordConfirm = () =>
    setShowPasswordConfirm(!showPasswordConfirm);
  const handleMouseDownPasswordConfirm = () =>
    setShowPasswordConfirm(!showPasswordConfirm);

  const handleSetRandom = () => {
    setRandom(!random);
    if (random) {
      setFieldValue("password", "");
      setFieldValue("repeatPassword", "");
      setFieldTouched("password", false);
      setFieldTouched("repeatPassword", false);
    }
  };
  const handleSetActive = () => setActive(!active);
  const handleSetLockout = () => setLockout(!lockout);
  const optionsFile = {
    max_file_size: 1048576,
    type: "image/*",
    url: "ProsesUploadUserProfile", // Controller Name
    pictureUrl: "Temp/Downloads/ProfileUser", // Dst Folder
  };

  const handleImage = (image) => {
    console.log("image---", image);
    setFieldValue("photoProfile", image);
  };
  console.log(formData);
  return (
    <>
      <Card sx={{ p: 2, width: "100%", mt: 2 }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={12}>
            <MDBox>
              <MDTypography variant="body">Create New Users</MDTypography>
              <MDTypography variant="caption" ml={2}>
                - Let&prime;s start with the basic information
              </MDTypography>
            </MDBox>
          </Grid>
          <Grid item xs={4}>
            <UploadImage {...optionsFile} onSelectImage={handleImage} />
          </Grid>
          <Grid item xs={8}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={12}>
                <FormField
                  type={nama.type}
                  label={nama.label}
                  name={nama.name}
                  value={namaV}
                  required={nama.required}
                  placeholder={nama.placeholder}
                  error={errors.nama && touched.nama}
                  success={namaV.length > 0 && !errors.nama}
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <FormField
                  type={surName.type}
                  label={surName.label}
                  name={surName.name}
                  required={surName.required}
                  value={surNameV}
                  placeholder={surName.placeholder}
                  error={errors.surName && touched.surName}
                  success={surNameV.length > 0 && !errors.surName}
                />
              </Grid>
            </Grid>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={12}>
                <FormField
                  type={userName.type}
                  label={userName.label}
                  required={userName.required}
                  name={userName.name}
                  value={userNameV}
                  placeholder={userName.placeholder}
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <FormField
                  type={email.type}
                  label={email.label}
                  name={email.name}
                  required={email.required}
                  value={emailV}
                  placeholder={email.placeholder}
                  error={errors.email && touched.email}
                  success={emailV.length > 0 && !errors.email}
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <FormField
                  type={phoneNumber.type}
                  label={phoneNumber.label}
                  name={phoneNumber.name}
                  required={phoneNumber.required}
                  value={phoneNumberV}
                  placeholder={phoneNumber.placeholder}
                  error={errors.phoneNumber && touched.phoneNumber}
                  success={phoneNumberV.length > 0 && !errors.phoneNumber}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Card>

      <Card sx={{ p: 2, width: "100%", mt: 2 }}>
        <Grid container spacing={3}>
          {/* <Grid item xs={12} sm={12}>
            <MDBox
              display="flex"
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              flexDirection={{ xs: "column", sm: "row" }}
            >
              <MDBox display="flex" alignItems="center">
                <MDBox lineHeight={0}>
                  <MDTypography variant="body" color="text">
                    Set Random Password
                  </MDTypography>
                </MDBox>
              </MDBox>
              <MDBox
                display="flex"
                justifyContent="flex-end"
                alignItems="center"
                width={{ xs: "100%", sm: "auto" }}
                mt={{ xs: 1, sm: 0 }}
              >
                <MDBox lineHeight={0} mx={2}>
                  <MDTypography variant="button" color="text">
                    {random ? "Enabled" : "Disabled"}
                  </MDTypography>
                </MDBox>
                <MDBox mr={1}>
                  <Switch checked={random} onChange={handleSetRandom} />
                </MDBox>
              </MDBox>
            </MDBox>
          </Grid> */}
          <Grid item xs={12} sm={12}>
            <FormField
              type={showPasswordNew ? "text" : password.type}
              label={password.label}
              name={password.name}
              value={passwordV}
              // disabled={random}
              required={password.required}
              placeholder={password.placeholder}
              error={errors.password && touched.password}
              success={passwordV.length > 0 && !errors.password}
              InputProps={{
                // <-- This is where the toggle button is added.
                endAdornment: (
                  <InputAdornment
                    position="end"
                    sx={{
                      marginRight: "30px",
                      marginBottom: "20px",
                    }}
                  >
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
              type={showPasswordConfirm ? "text" : repeatPassword.type}
              label={repeatPassword.label}
              name={repeatPassword.name}
              value={repeatPasswordV}
              required={repeatPassword.required}
              // disabled={random}
              placeholder={repeatPassword.placeholder}
              error={errors.repeatPassword && touched.repeatPassword}
              success={repeatPasswordV.length > 0 && !errors.repeatPassword}
              InputProps={{
                // <-- This is where the toggle button is added.
                endAdornment: (
                  <InputAdornment
                    position="end"
                    sx={{
                      marginRight: "30px",
                      marginBottom: "20px",
                    }}
                  >
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
          <Grid item xs={12} sm={12}>
            <MDBox
              display="flex"
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              flexDirection={{ xs: "column", sm: "row" }}
            >
              <MDBox display="flex" alignItems="center">
                <MDBox lineHeight={0}>
                  <MDTypography variant="body" color="text">
                    Active
                  </MDTypography>
                </MDBox>
              </MDBox>
              <MDBox
                display="flex"
                justifyContent="flex-end"
                alignItems="center"
                width={{ xs: "100%", sm: "auto" }}
                mt={{ xs: 1, sm: 0 }}
              >
                <MDBox lineHeight={0} mx={2}>
                  <MDTypography variant="button" color="text">
                    {active ? "Enabled" : "Disabled"}
                  </MDTypography>
                </MDBox>
                <MDBox mr={1}>
                  <Switch checked={active} onChange={handleSetActive} />
                </MDBox>
              </MDBox>
            </MDBox>
          </Grid>
          {/* <Grid item xs={12} sm={12}>
            <MDBox
              display="flex"
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              flexDirection={{ xs: "column", sm: "row" }}
            >
              <MDBox display="flex" alignItems="center">
                <MDBox lineHeight={0}>
                  <MDTypography variant="body" color="text">
                    Lockout enabled
                  </MDTypography>
                </MDBox>
              </MDBox>
              <MDBox
                display="flex"
                justifyContent="flex-end"
                alignItems="center"
                width={{ xs: "100%", sm: "auto" }}
                mt={{ xs: 1, sm: 0 }}
              >
                <MDBox lineHeight={0} mx={2}>
                  <MDTypography variant="button" color="text">
                    {lockout ? "Enabled" : "Disabled"}
                  </MDTypography>
                </MDBox>
                <MDBox mr={1}>
                  <Switch checked={lockout} onChange={handleSetLockout} />
                </MDBox>
              </MDBox>
            </MDBox>
          </Grid> */}
        </Grid>
      </Card>
    </>
  );
}
