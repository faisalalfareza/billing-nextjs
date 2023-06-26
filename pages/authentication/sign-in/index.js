import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { Formik } from "formik";
import Swal from "sweetalert2";
import * as Yup from "yup";

import Switch from "@mui/material/Switch";

import Link from "next/link";
import Router from "next/router";

import bgImage from "/assets/images/illustrations/bg-1.jpg";

import { Grid } from "@mui/material";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDButton from "/components/MDButton";

import IllustrationLayout from "/pagesComponents/authentication/components/IllustrationLayout";
import FormField from "/pagesComponents/FormField";

import { typeNormalization } from "../../../helpers/utils";
import appInfo from "/appinfo.json";
import { checkRoute } from "../../../routes"

function SignIn(props) {
  const {} = props;

  const [isLoadingAuthentication, setLoadingAuthentication] = useState(false);
  const [cookies, setCookie, removeCookie] = useCookies([
    "accessToken",
    "encryptedAccessToken",
  ]);

  const [userNameOrEmailAddressVF, setUserNameOrEmailAddress] = useState("");
  const [passwordVF, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const schemeModels = {
    formId: "auth-form",
    formField: {
      userNameOrEmailAddress: {
        name: "userNameOrEmailAddress",
        label: "Username / Email",
        placeholder: "Type Username / Email",
        type: "text",
        isRequired: true,
        errorMsg: "Username / Email is required.",
        invalidFormatMsg: "Invalid Username / Email format.",
        defaultValue: "",
      },
      password: {
        name: "password",
        label: "Password",
        placeholder: "Type Password",
        type: "password",
        isRequired: true,
        errorMsg: "Password is required.",
        invalidMinLengthMsg:
          "Password is less than the maximum limit of 6 characters.",
        defaultValue: "",
      },
    },
  };
  let { userNameOrEmailAddress, password } = schemeModels.formField;
  let schemeValidations = Yup.object().shape({
    [userNameOrEmailAddress.name]: userNameOrEmailAddress.isRequired
      ? Yup.string().required(userNameOrEmailAddress.errorMsg)
      : Yup.string().notRequired(),
    [password.name]: password.isRequired
      ? Yup.string()
          .required(password.errorMsg)
          .min(6, password.invalidMinLengthMsg)
      : Yup.string().notRequired(),
  });
  const schemeInitialValues = {
    [userNameOrEmailAddress.name]: userNameOrEmailAddress.defaultValue,
    [password.name]: password.defaultValue,
  };
  useEffect(() => {
    document.getElementsByName(userNameOrEmailAddress.name)[0].focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkingSuccessInput = (isRequired, value, error) => {
    return (
      (!isRequired && true) ||
      (isRequired && value != undefined && value != "" && !error)
    );
  };

  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  let [loginAttempt, setLoginAttempt] = useState(3);
  const handleSigninSubmit = async (e) => {
    e != undefined && e.preventDefault();
    setLoadingAuthentication(true);

    authenticate({
      userNameOrEmailAddress: userNameOrEmailAddressVF,
      password: passwordVF,
    });
  };

  async function authenticate(params) {
    let response = await fetch("/api/authentication/authenticate", {
      method: "POST",
      body: JSON.stringify({
        userNameOrEmailAddress: params.userNameOrEmailAddress,
        password: params.password,
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error) {
      setLoadingAuthentication(false);
      const error = response.error;
      if (error.response) {
        console.error("ERROR RESPONSE => ", error.response);
        Swal.fire({
          icon: "error",
          title: error.response.data.error.message,
          text: error.message + ": " + error.response.data.error.details,
          footer:
            "<p style='text-align: center;line-height: 1;font-size: small;'> Contact admin for further handling regarding access rights or authority.</p>",
        });
      } else if (error.request) {
        console.error("ERROR REQUEST => ", error.request);
        Swal.fire({
          icon: "error",
          title: error.message,
        });
      } else {
        console.error("ERROR => ", error.message);
        if (error.message.includes("connect EHOSTUNREACH")) {
          Swal.fire({
            icon: "error",
            title: "Make sure the device is connected to the internet without interruption.",
            showConfirmButton: loginAttempt > 0 ? true : false,
            showCancelButton: true,
            focusConfirm: true,
            confirmButtonText: `Try Again (${loginAttempt})`,
            cancelButtonText: "OK",
            // footer:
            //   "<p style='text-align: center;line-height: 1;font-size: small;'>" +
            //   "This may be due to an incorrect username/email or password. Please check it again, and also make sure the device is connected to the internet without interruption." +
            //   "</p>",
          }).then(
            (result) =>
              result.isConfirmed &&
              handleSigninSubmit().then(() => (loginAttempt -= 1))
          );
        } else {
          Swal.fire({
            icon: "error",
            title: "Incorrect username/email or password. Please check it again.",
          });
        }
      }

      // console.error("ERROR CONFIG => ", error.config);
    } else {
      if (response.isCached[0])
        processAuthenticateResult(
          response.result.authenticateResult,
          undefined,
          "/dashboards"
        );
      else
        processAuthenticateResult(
          response.result,
          response.isCached[1].fromOwnSetting,
          "/dashboards"
        );
    }
  }
  function processAuthenticateResult(
    authenticateResult,
    reconfiguredExpireInSeconds = undefined,
    redirectUrl = undefined
  ) {
    if (authenticateResult.shouldResetPassword) {
    } else if (authenticateResult.requiresTwoFactorVerification) {
    } else if (authenticateResult.accessToken) {
      if (authenticateResult.returnUrl && !redirectUrl) {
        redirectUrl = authenticateResult.returnUrl;
      }

      processSetToken(
        authenticateResult.accessToken,
        authenticateResult.encryptedAccessToken,
        authenticateResult.expireInSeconds,
        null,
        authenticateResult.twoFactorRememberClientToken,
        authenticateResult.userId,
        reconfiguredExpireInSeconds,
        redirectUrl
      );
    } else {
      Router.push("/authentication/sign-in");
    }
  }
  function processSetToken(
    accessToken,
    encryptedAccessToken,
    expireInSeconds,
    rememberMe,
    twoFactorRememberClientToken,
    userId,
    reconfiguredExpireInSeconds,
    redirectUrl
  ) {
    const tokenExpireDate = new Date(new Date().getTime() + 1000 * expireInSeconds);
    setCookie("accessToken", accessToken, { path: "/",  expires: tokenExpireDate });
    setCookie("encryptedAccessToken", encryptedAccessToken, { path: "/", expires: tokenExpireDate });

    getCurrentLoginInformations(
      {
        accessToken: accessToken,
        userId: userId,
      },
      reconfiguredExpireInSeconds,
      redirectUrl
    );
  }

  async function getCurrentLoginInformations(
    authenticateResult,
    reconfiguredExpireInSeconds,
    redirectUrl
  ) {
    const { accessToken, userId } = authenticateResult;

    let response = await fetch("/api/authentication/informations", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
        expireInSeconds: reconfiguredExpireInSeconds,
        userId: userId,
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error) setLoadingAuthentication(false);
    else {
      const informations = response.result;
      const { application } = informations;

      localStorage.setItem("informations", JSON.stringify(informations));
      localStorage.setItem("application", JSON.stringify(application));

      getUserPermissions(accessToken, redirectUrl),
        getUserProfilePicture(authenticateResult, reconfiguredExpireInSeconds);
    }
  }
  async function getUserPermissions(accessToken, redirectUrl) {
    let response = await fetch("/api/authentication/permissions", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error) setLoadingAuthentication(false);
    else {
      const { allPermissions, grantedPermissions } = response.result;

      localStorage.setItem("allPermissions", JSON.stringify(allPermissions));

      grantedPermissions["Pages.Cashier.CancelPayment"] && delete grantedPermissions["Pages.Cashier.CancelPayment"];
      grantedPermissions["Pages.Report"] && delete grantedPermissions["Pages.Report"];

      localStorage.setItem("grantedPermissions", JSON.stringify(grantedPermissions));
      
      Router.replace(redirectUrl, 
        (Router.asPath !== Router.pathname) && 
        checkRoute(Router.asPath) && 
        Router.asPath
      );
      // window.open(redirectUrl, "_self");
    }
  }
  async function getUserProfilePicture(
    authenticateResult,
    reconfiguredExpireInSeconds
  ) {
    const { accessToken, userId } = authenticateResult;

    let response = await fetch("/api/authentication/profiles", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
        expireInSeconds: reconfiguredExpireInSeconds,
        userId: userId,
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    if (response.error) setLoadingAuthentication(false);
    else {
      const { profileUrl } = response.result;

      localStorage.setItem("profilePicture", profileUrl);
    }
  }

  return (
    <IllustrationLayout
      formTitle={appInfo.formTitle}
      formDescription=""
      illustration={bgImage}
    >
      <Grid container alignItems="center" rowSpacing={1}>
        <Grid item xs={12} mt={2}>
          <MDBox>
            <MDTypography variant="h5">Sign In</MDTypography>
          </MDBox>
        </Grid>
        <Grid item xs={12}>
          <Formik
            initialValues={schemeInitialValues}
            validationSchema={schemeValidations}
          >
            {({ values, errors, touched }) => {
              let {
                userNameOrEmailAddress: userNameOrEmailAddressV,
                password: passwordV,
              } = values;
              const isValifForm = () =>
                checkingSuccessInput(
                  userNameOrEmailAddress.isRequired,
                  userNameOrEmailAddressV,
                  errors.userNameOrEmailAddress
                ) &&
                checkingSuccessInput(
                  password.isRequired,
                  passwordV,
                  errors.password
                );

              return (
                <MDBox
                  component="form"
                  role="form"
                  onSubmit={(e) => handleSigninSubmit(e)}
                >
                  <Grid container>
                    <Grid item xs={12}>
                      <FormField
                        type={userNameOrEmailAddress.type}
                        required={userNameOrEmailAddress.isRequired}
                        label={userNameOrEmailAddress.label}
                        name={userNameOrEmailAddress.name}
                        value={userNameOrEmailAddressV}
                        placeholder={userNameOrEmailAddress.placeholder}
                        error={
                          errors.userNameOrEmailAddress &&
                          touched.userNameOrEmailAddress
                        }
                        success={
                          userNameOrEmailAddress.isRequired &&
                          checkingSuccessInput(
                            userNameOrEmailAddress.isRequired,
                            userNameOrEmailAddressV,
                            errors.userNameOrEmailAddress
                          )
                        }
                        onKeyUp={(e) => setUserNameOrEmailAddress(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormField
                        type={password.type}
                        required={password.isRequired}
                        label={password.label}
                        name={password.name}
                        value={passwordV}
                        placeholder={password.placeholder}
                        error={errors.password && touched.password}
                        success={
                          password.isRequired &&
                          checkingSuccessInput(
                            password.isRequired,
                            passwordV,
                            errors.password
                          )
                        }
                        inputProps={{ autoComplete: "" }}
                        onKeyUp={(e) => setPassword(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <MDBox display="flex" alignItems="center" ml={-1}>
                        <Switch checked={rememberMe} onChange={handleSetRememberMe} />
                        <MDTypography
                          variant="button"
                          fontWeight="regular"
                          color="text"
                          onClick={handleSetRememberMe}
                          sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
                        >
                          &nbsp;&nbsp;Remember me
                        </MDTypography>
                      </MDBox>
                    </Grid>
                    <Grid item xs={12}>
                      <MDBox mt={2}>
                        <MDButton
                          type="submit"
                          variant="gradient"
                          color="primary"
                          size="large"
                          fullWidth
                          disabled={!isValifForm() || isLoadingAuthentication}
                        >
                          {isLoadingAuthentication ? "Signing.." : "Sign In"}
                        </MDButton>
                      </MDBox>
                    </Grid>
                    {/* <MDBox mt={3} textAlign="center" lineHeight="1">
                      <MDTypography variant="button" color="text" lineHeight="1">
                        Don&apos;t remember your password yet?{" "}
                        <Link href="/authentication/reset-password">
                          <a>
                            <MDTypography
                              variant="button"
                              color="dark"
                              fontWeight="medium"
                              textGradient
                            >
                              Forgot Password
                            </MDTypography>
                          </a>
                        </Link>
                      </MDTypography>
                    </MDBox> */}
                  </Grid>
                </MDBox>
              );
            }}
          </Formik>
        </Grid>
      </Grid>
    </IllustrationLayout>
  );
}

export default SignIn;

export async function getStaticProps() {
  // await redisIO.flushdb();

  return {
    props: {},
  };
}
