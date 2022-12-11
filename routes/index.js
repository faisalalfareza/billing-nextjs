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

/** 
  All of the routes for the NextJS Material Dashboard 2 PRO are added here,
  You can add a new route, customize the routes and delete the routes here.

  Once you add a new route on this file it will be visible automatically on
  the Sidenav.

  For adding a new route you can follow the existing routes in the routes array.
  1. The `type` key with the `collapse` value is used for a route.
  2. The `type` key with the `title` value is used for a title inside the Sidenav. 
  3. The `type` key with the `divider` value is used for a divider between Sidenav items.
  4. The `name` key is used for the name of the route on the Sidenav.
  5. The `key` key is used for the key of the route (It will help you with the key prop inside a loop).
  6. The `icon` key is used for the icon of the route on the Sidenav, you have to add a node.
  7. The `collapse` key is used for making a collapsible item on the Sidenav that contains other routes
  inside (nested routes), you need to pass the nested routes inside an array as a value for the `collapse` key.
  8. The `route` key is used to store the route location which is used for the react router.
  9. The `href` key is used to store the external links location.
  10. The `title` key is only for the item with the type of `title` and its used for the title text on the Sidenav.
*/

// NextJS Material Dashboard 2 PRO components
import React, { useState, useEffect } from "react";
import MDAvatar from "../components/MDAvatar";

// @mui icons
import Icon from "@mui/material/Icon";

// Images
import profilePicture from "../assets/images/team-3.jpg";

const main = [
  {
    type: "collapse",
    name: "Brooklyn Alice",
    key: "username",
    icon: <MDAvatar src={profilePicture.src} alt="Brooklyn Alice" size="sm" />,
    collapse: [
      {
        name: "Logout",
        key: "logout",
        route: "/authentication/sign-in",
      },
    ],
  },
  
  { type: "divider", key: "divider-0" },
  {
    type: "collapse",
    name: "Dashboards",
    nameOnHeader: "Dashboards",
    key: "dashboards",
    route: "/dashboards",
    permission: "Pages.Tenant.Dashboard",
    icon: <Icon fontSize="medium">dashboard</Icon>,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "Company Officer",
    nameOnHeader: "Company Officer",
    key: "company-officer",
    route: "/app/company-officer",
    permission: "Pages.Tenants.CompanyOfficer",
    icon: <Icon fontSize="medium">person_add</Icon>,
    noCollapse: true,
  },

  { type: "divider", key: "divider-1" },
  { type: "title", title: "Faktur Pajak (FP)", key: "title-fp" },
  {
    type: "collapse",
    name: "Nomor Seri FP",
    nameOnHeader: "Nomor Seri Faktur Pajak (NSFP)",
    key: "nsfp",
    permission: "Pages.Tenants.GenerateNoSeriFP",
    icon: <Icon fontSize="medium">apps</Icon>,
    collapse: [
      { name: "Generate", nameOnHeader: "Generate Faktur Pajak", key: "generate", route: "/app/nsfp/generate", permission: "Pages.Tenants.GenerateNoSeriFP.Create" },
      { name: "Upload Batch", nameOnHeader: "Upload Batch Faktur Pajak", key: "upload-batch", route: "/app/nsfp/upload-batch", permission: "Pages.Tenants.GenerateNoSeriFP.Create" },
      { name: "List", nameOnHeader: "List Faktur Pajak", key: "list", route: "/app/nsfp/list", permission: "Pages.Tenants.GenerateNoSeriFP.List" },
    ],
  },
  {
    type: "collapse",
    name: "Faktur Pajak",
    key: "fp",
    permission: "Pages.Tajak",
    icon: <Icon fontSize="medium">content_paste</Icon>,
    collapse: [
      { name: "Input", key: "", route: "", permission: "Pages.Tenants.FakturPajak.Input" },
      { name: "Upload", key: "", route: "", permission: "Pages.Tenants.FakturPajak.CreateUpload" },
      { name: "List", key: "", route: "", permission: "Pages.Tenants.FakturPajak.List" },
      { name: "Export to CSV", key: "", route: "", permission: "" },
    ],
  },

  { type: "divider", key: "divider-2" },
  { type: "title", title: "Surat Setoran Pajak (SSP)", key: "title-ssp" },
  {
    type: "collapse",
    name: "Surat Setoran Pajak",
    key: "ssp",
    permission: "Pages.Tenants.SSP",
    icon: <Icon fontSize="medium">receipt_long</Icon>,
    collapse: [
      { name: "SSP by Booking Code", key: "", route: "", permission: "Pages.Tenants.SSP.ListBookCode" },
      { name: "SSP by Month", key: "", route: "", permission: "Pages.Tenants.SSP.ListMonth" }
    ],
  },
]; 

let filtered = [];
main.forEach(e => {
  if (e.noCollapse) {
    filtered.push({
      nameOnHeader: (e.nameOnHeader != undefined ? e.nameOnHeader : e.name),
      key: e.key,
      route: e.route
    });
  } else {
    filtered.push({
      nameOnHeader: (e.nameOnHeader != undefined ? e.nameOnHeader : e.name),
      key: e.key
    });
    if ((e.collapse != undefined) && (e.collapse.length > 0)) {
      e.collapse.forEach(e_c => {
        filtered.push({
          nameOnHeader: (e_c.nameOnHeader != undefined ? e_c.nameOnHeader : e_c.name),
          childOf: e.key,
          key: e_c.key,
          route: e_c.route
        });
      });
    }
  }
});

const routes = {
  main,
  filtered
}

export default routes;
