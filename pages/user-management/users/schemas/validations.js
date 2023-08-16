/**
=========================================================
* NextJS Material Dashboard 2 PRO - v2.0.0
=========================================================

* Product Page: https://www.creative-tim.com/product/nextjs-material-dashboard-pro
* Copyright 2022 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import * as Yup from "yup";
import checkout from "../schemas/form";

const {
  formField: {
    nama,
    surName,
    userName,
    email,
    password,
    repeatPassword,
    phoneNumber,
    active,
    lockout,
    random,
    roles,
    sites,
    photoProfile,
  },
} = checkout;

const validations = Yup.object().shape({
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

export default validations;
