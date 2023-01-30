import { useState } from "react";
import { useCookies } from "react-cookie";
import { Formik, Form } from "formik";
import Swal from "sweetalert2";
import * as Yup from "yup";
import axios from "axios";

import Switch from "@mui/material/Switch";

import Link from "next/link";
import Router from "next/router";
import getConfig from "next/config";

import bgImage from "/assets/images/illustrations/bg-1.jpg";

import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDButton from "/components/MDButton";

import IllustrationLayout from "/pagesComponents/authentication/components/IllustrationLayout";
import FormField from "/pagesComponents/FormField";

const { publicRuntimeConfig } = getConfig();

function SignIn(props) {
  const {} = props;

  const [isLoadingSubmit, setLoadingSubmit] = useState(false);
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
        label: "User Name Or Email Address",
        placeholder: "Type User Name Or Email Address",
        type: "text",
        isRequired: true,
        errorMsg: "User Name Or Email Address is required.",
        invalidFormatMsg: "Invalid User Name Or Email Address format.",
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

  const checkingSuccessInput = (value, error) => {
    return value != undefined && value != "" && value.length > 0 && !error;
  };

  const handleSetRememberMe = () => setRememberMe(!rememberMe);
  const handleSigninSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);

    authenticate({
      userNameOrEmailAddress: userNameOrEmailAddressVF,
      password: passwordVF,
    });
  };

  function authenticate(params) {
    const credential = JSON.stringify({
      userNameOrEmailAddress: params.userNameOrEmailAddress,
      password: params.password,
    });
    const url = `${publicRuntimeConfig.apiUrl}/api/TokenAuth/Authenticate`;
    const config = {
      headers: { "Content-Type": "application/json" },
      auth: {
        username: params.userNameOrEmailAddress,
        password: params.password,
      },
      xsrfCookieName: "XSRF-TOKEN",
      xsrfHeaderName: "X-XSRF-TOKEN",
    };

    axios
      .post(url, credential, config)
      .then((response) =>
        processAuthenticateResult(response.data.result, "/dashboards")
      )
      .catch((error) => {
        setLoadingSubmit(false);

        if (error.response) {
          console.error("ERROR RESPONSE [" + url + "]  :=> ", error.response);
          Swal.fire({
            icon: "error",
            title: error.response.data.error.message,
            text: error.message + ": " + error.response.data.error.details,
            footer:
              "<p style='text-align: center;line-height: 1;'> Contact admin for further handling regarding access rights or authority.</p>",
          });
        } else if (error.request) {
          console.error("ERROR REQUEST [" + url + "]  :=> ", error.request);
          Swal.fire({
            icon: "error",
            title: error.message,
          });
        } else console.error("ERROR [" + url + "]  :=> ", error.message);

        console.error("ERROR CONFIG [" + url + "]  :=> ", error.config);
      });
  }
  function processAuthenticateResult(
    authenticateResult,
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
    redirectUrl
  ) {
    const tokenExpireDate = new Date(
      new Date().getTime() + 1000 * expireInSeconds
    );
    setCookie("accessToken", accessToken, {
      path: "/",
      expires: tokenExpireDate,
    });
    setCookie("encryptedAccessToken", encryptedAccessToken, {
      path: "/",
      expires: tokenExpireDate,
    });

    getCurrentLoginInformations(accessToken, redirectUrl);
  }

  function getCurrentLoginInformations(accessToken, redirectUrl) {
    const url = `${publicRuntimeConfig.apiUrl}/api/services/app/Session/GetCurrentLoginInformations`;
    const config = { headers: { Authorization: "Bearer " + accessToken } };

    axios.get(url, config).then((res) => {
      const informations = res.data.result;
      const { application, tenant, user } = informations;
      localStorage.setItem("informations", JSON.stringify(informations));
      localStorage.setItem("application", JSON.stringify(application));

      getUserPermissions(accessToken), getUserProfilePicture(accessToken);

      setLoadingSubmit(false);
      Router.push(redirectUrl);
    });
  }
  function getUserPermissions(accessToken) {
    const url = `${publicRuntimeConfig.apiUrl}/AbpUserConfiguration/GetAll`;
    const config = { headers: { Authorization: "Bearer " + accessToken } };

    axios.get(url, config).then((res) => {
      const { allPermissions, grantedPermissions } = res.data.result.auth;
      localStorage.setItem(
        "grantedPermissions",
        JSON.stringify(grantedPermissions)
      );
    });
  }
  function getUserProfilePicture(accessToken) {
    const url = `${publicRuntimeConfig.apiUrl}/api/services/app/Profile/GetProfilePicture`;
    const config = { headers: { Authorization: "Bearer " + accessToken } };

    axios.get(url, config).then((res) => {
      const { profilePicture } = res.data.result;
      localStorage.setItem("profilePicture", profilePicture);
    });
  }

  return (
    <IllustrationLayout
      formTitle="Billing Residence Application"
      formDescription=""
      illustration={bgImage}
    >
      <Formik
        initialValues={schemeInitialValues}
        validationSchema={schemeValidations}
      >
        {({ values, errors, touched, isSubmitting }) => {
          let {
            userNameOrEmailAddress: userNameOrEmailAddressV,
            password: passwordV,
          } = values;

          const isValifForm = () => {
            return checkingSuccessInput(
              userNameOrEmailAddressV,
              errors.userNameOrEmailAddress
            ) && checkingSuccessInput(passwordV, errors.password)
              ? true
              : false;
          };

          return (
            <MDBox
              component="form"
              role="form"
              onSubmit={(e) => handleSigninSubmit(e)}
            >
              <MDBox mb={2}>
                <FormField
                  type={userNameOrEmailAddress.type}
                  label={
                    userNameOrEmailAddress.label +
                    (userNameOrEmailAddress.isRequired ? " ⁽*⁾" : "")
                  }
                  name={userNameOrEmailAddress.name}
                  value={userNameOrEmailAddressV}
                  placeholder={userNameOrEmailAddress.placeholder}
                  error={
                    errors.userNameOrEmailAddress &&
                    touched.userNameOrEmailAddress
                  }
                  success={checkingSuccessInput(
                    userNameOrEmailAddressV,
                    errors.userNameOrEmailAddress
                  )}
                  onKeyUp={(e) => setUserNameOrEmailAddress(e.target.value)}
                />
              </MDBox>
              <MDBox mb={2}>
                <FormField
                  type={password.type}
                  label={password.label + (password.isRequired ? " ⁽*⁾" : "")}
                  name={password.name}
                  value={passwordV}
                  placeholder={password.placeholder}
                  error={errors.password && touched.password}
                  success={checkingSuccessInput(passwordV, errors.password)}
                  inputProps={{ autoComplete: "" }}
                  onKeyUp={(e) => setPassword(e.target.value)}
                />
              </MDBox>
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
              <MDBox mt={4} mb={1}>
                <MDButton
                  type="submit"
                  variant="gradient"
                  color="dark"
                  size="large"
                  fullWidth
                  disabled={!isValifForm() || isLoadingSubmit}
                >
                  {isLoadingSubmit ? "Signing.." : "Sign In"}
                </MDButton>
              </MDBox>
              <MDBox mt={3} textAlign="center" lineHeight="1">
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
              </MDBox>
            </MDBox>
          );
        }}
      </Formik>
    </IllustrationLayout>
  );
}

export default SignIn;

export async function getStaticProps() {
  return {
    props: {},
  };
}
