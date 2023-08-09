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

const form = {
  formId: "user-user-management-form",
  formField: {
    nama: {
      name: "nama",
      label: "Name",
      type: "text",
      errorMsg: "Name is required.",
    },
    surName: {
      name: "surName",
      label: "Surname",
      type: "text",
      errorMsg: "Surname is required.",
    },
    userName: {
      name: "userName",
      label: "UserName",
      type: "text",
      errorMsg: "Surname is required.",
    },
    email: {
      name: "email",
      label: "Email Address",
      type: "email",
      errorMsg: "Email address is required.",
      invalidMsg: "Your email address is invalid",
    },
    phoneNumber: {
      name: "phoneNumber",
      label: "Phone Number",
      type: "tel",
      errorMsg: "Phone Number is required.",
    },
    password: {
      name: "password",
      label: "Password",
      type: "password",
      errorMsg: "Password is required.",
      invalidMsg: "Your password should be more than 6 characters.",
    },
    repeatPassword: {
      name: "repeatPassword",
      label: "Repeat Password",
      type: "password",
      errorMsg: "Password is required.",
      invalidMsg: "Your password doesn't match.",
    },
    roles: {
      name: "roles",
      label: "Roles",
    },
    site: {
      name: "site",
      label: "Site",
    },
  },
};

export default form;
