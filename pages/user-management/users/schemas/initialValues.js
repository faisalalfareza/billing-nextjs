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

import checkout from "../schemas/form";

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
} = checkout;

const initialValues = {
  [nama.name]: "",
  [surName.name]: "",
  [userName.name]: "",
  [email.name]: "",
  [phoneNumber.name]: "",
  [password.name]: "",
  [repeatPassword.name]: "",
  [roles.name]: [],
  [sites.name]: [],
  [random.name]: true,
  [active.name]: true,
  [lockout.name]: true,
  [photoProfile.name]: "",
};

export default initialValues;
