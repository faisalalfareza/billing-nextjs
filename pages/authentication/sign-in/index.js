import { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";

import Link from "next/link";
import Router from 'next/router';

// @mui material components
import Switch from "@mui/material/Switch";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDInput from "/components/MDInput";
import MDButton from "/components/MDButton";

// Authentication layout components
import IllustrationLayout from "/pagesComponents/authentication/components/IllustrationLayout";
import FormField from "/pagesComponents/FormField";

// Image
import bgImage from "/assets/images/illustrations/bg-1.jpg";

// Data
import axios from "axios";
import getConfig from 'next/config';
import { useCookies } from 'react-cookie';
const { publicRuntimeConfig } = getConfig();


function SignIn() {
  const [isLoadingSubmit, setLoadingSubmit] = useState(false);
  
  const [userNameOrEmailAddressVF, setUserNameOrEmailAddress] = useState("");
  const [passwordVF, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [cookies, setCookie, removeCookie] = useCookies(['accessToken', 'encryptedAccessToken']);


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
        defaultValue: ""
      },
      password: {
        name: "password",
        label: "Password",
        placeholder: "Type Password",
        type: "password",
        isRequired: true,
        errorMsg: "Password is required.",
        invalidMinLengthMsg: "Password is less than the maximum limit of 6 characters.",
        defaultValue: ""
      }
    }
  };
  let { userNameOrEmailAddress, password } = schemeModels.formField;
  let schemeValidations = Yup.object().shape({
    // [userNameOrEmailAddress.name]: userNameOrEmailAddress.isRequired ? Yup.string().required(userNameOrEmailAddress.errorMsg).email(userNameOrEmailAddress.invalidFormatMsg): Yup.string().notRequired(),
    [userNameOrEmailAddress.name]: userNameOrEmailAddress.isRequired ? Yup.string().required(userNameOrEmailAddress.errorMsg) : Yup.string().notRequired(),
    [password.name]: password.isRequired ? Yup.string().required(password.errorMsg).min(6, password.invalidMinLengthMsg) : Yup.string().notRequired(),
  });
  const schemeInitialValues = {
    [userNameOrEmailAddress.name]: userNameOrEmailAddress.defaultValue,
    [password.name]: password.defaultValue,
  };

  const checkingSuccessInput = (value, error) => {
    return (value != undefined && value != "" && value.length > 0) && !error;
  }

  const handleSetRememberMe = () => setRememberMe(!rememberMe);
  const handleSigninSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);

    authenticate({ 
      userNameOrEmailAddress: userNameOrEmailAddressVF, 
      password: passwordVF
    });
  }

  function authenticate(params) {
    const credential = JSON.stringify({ 
      userNameOrEmailAddress: params.userNameOrEmailAddress, 
      password: params.password
    });
    const url = `${publicRuntimeConfig.apiUrl}/TokenAuth/Authenticate`;
    const config = {
      headers: {'Content-Type': 'application/json' },
      auth: { username: params.userNameOrEmailAddress, password: params.password },
      xsrfCookieName: 'XSRF-TOKEN', xsrfHeaderName: 'X-XSRF-TOKEN'
    };
  
    axios.post(url, credential, config)
      .then((response) => {
        setLoadingSubmit(false);
        processAuthenticateResult(response.data.result, "/dashboards");
      })
      .catch((error) => {
        setLoadingSubmit(false);
  
        // The request was made and the server responded with a status code
        if (error.response) {
          console.error('ERROR RESPONSE ['+url+']  :=> ', error.response);
          Swal.fire({
            icon: 'error',
            title: error.response.data.error.message,
            text: error.message + ": " + error.response.data.error.details,
            footer: "<p style='text-align: center;line-height: 1;'> Contact admin for further handling regarding access rights or authority.</p>"
          });
        }
        // The request was made but no response was received
        else if (error.request) {
          console.error('ERROR REQUEST ['+url+']  :=> ', error.request);
          Swal.fire({
            icon: 'error',
            title: error.message
          });
        }
        // Something happened in setting up the request that triggered an Error
        else console.error('ERROR ['+url+']  :=> ', error.message);
  
        console.error('ERROR CONFIG ['+url+']  :=> ', error.config);
      });
  }
  function processAuthenticateResult(authenticateResult, redirectUrl = undefined) {
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
  function processSetToken(accessToken, encryptedAccessToken, expireInSeconds, rememberMe, twoFactorRememberClientToken, redirectUrl) {
    const tokenExpireDate = (new Date(new Date().getTime() + 1000 * expireInSeconds));
    setCookie('accessToken', accessToken, { path: '/',  expires: tokenExpireDate})
    setCookie('encryptedAccessToken', encryptedAccessToken, {path: '/', expires: tokenExpireDate})

    Router.push(redirectUrl);
  }
  function getCurrentLoginInformations(params) {}


  return (
    <IllustrationLayout
      title="Sign In"
      description="Enter your user name or email, and password to sign in."
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
            return (
              checkingSuccessInput(userNameOrEmailAddressV, errors.userNameOrEmailAddress) && 
              checkingSuccessInput(passwordV, errors.password)
            ) ? true : false;
          };

          return (
            // <Form id={schemeModels.formId} autoComplete="off" onSubmit={handleSigninSubmit}>
              <MDBox component="form" role="form" onSubmit={(e) => handleSigninSubmit(e)}>
                <MDBox mb={2}>
                  <FormField type={userNameOrEmailAddress.type} label={userNameOrEmailAddress.label + (userNameOrEmailAddress.isRequired?' ⁽*⁾':'')} name={userNameOrEmailAddress.name} value={userNameOrEmailAddressV} placeholder={userNameOrEmailAddress.placeholder} 
                    error={errors.userNameOrEmailAddress && touched.userNameOrEmailAddress} success={checkingSuccessInput(userNameOrEmailAddressV, errors.userNameOrEmailAddress)} 
                    onKeyUp={(e) => setUserNameOrEmailAddress(e.target.value)} />
                </MDBox>
                <MDBox mb={2}>
                  <FormField type={password.type} label={password.label + (password.isRequired?' ⁽*⁾':'')} name={password.name} value={passwordV} placeholder={password.placeholder} 
                    error={errors.password && touched.password} success={checkingSuccessInput(passwordV, errors.password)} inputProps={{ autoComplete: "" }} 
                    onKeyUp={(e) => setPassword(e.target.value)} />
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
                  <MDButton type="submit" variant="gradient" color="dark" size="large" fullWidth
                    disabled={!isValifForm() || isLoadingSubmit}>
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
            // </Form>
          )
        }}
      </Formik>
    </IllustrationLayout>
  );
}

export default SignIn;
