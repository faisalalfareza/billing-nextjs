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
      required: true,
    },
    surName: {
      name: "surName",
      label: "Surname",
      type: "text",
      errorMsg: "Surname is required.",
      required: true,
    },
    userName: {
      name: "userName",
      label: "UserName",
      type: "text",
      errorMsg: "Username is required.",
      required: true,
    },
    email: {
      name: "email",
      label: "Email Address",
      type: "email",
      errorMsg: "Email address is required.",
      invalidMsg: "Your email address is invalid",
      required: true,
    },
    phoneNumber: {
      name: "phoneNumber",
      label: "Phone Number",
      type: "tel",
      errorMsg: "Phone Number is required.",
      required: true,
    },
    password: {
      name: "password",
      label: "Password",
      type: "password",
      errorMsg: "Password is required.",
      invalidMsg: "Your password should be more than 6 characters.",
      required: true,
    },
    repeatPassword: {
      name: "repeatPassword",
      label: "Repeat Password",
      type: "password",
      errorMsg: "Password is required.",
      invalidMsg: "Your password doesn't match.",
      required: true,
    },
    roles: {
      name: "roles",
      label: "Roles",
      errorMsg: "Roles is required.",
      required: true,
    },
    sites: {
      name: "sites",
      label: "Site",
      errorMsg: "Site is required.",
      required: true,
    },
    random: {
      name: "random",
      label: "Random Password",
    },
    active: {
      name: "active",
      label: "Active",
    },
    lockout: {
      name: "lockout",
      label: "Lockout",
    },
    photoProfile: {
      name: "photoProfile",
      label: "Photo Profile",
      errorMsg: "Photo Profile is Required",
    },
  },
};

export default form;
