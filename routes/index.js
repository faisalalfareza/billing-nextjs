/** 
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

import React from "react";
import Icon from "@mui/material/Icon";
import MDAvatar from "../components/MDAvatar";
import profilePicture from "../assets/images/team-3.jpg";
import { capitalizeFirstLetter } from "../helpers/utils";

function setMain(informations = getInformation(), profiles = getProfile()) {
  return [
    {
      type: "collapse",
      name: "Brooklyn Alice",
      key: "username",
      icon: <MDAvatar src={profilePicture.src} size="sm" />,
      collapse: [
        {
          name: "Logout",
          key: "logout",
          route: "/authentication/sign-in",
          onClick: function () {
            return;
          },
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
      route: "/company-officer",
      permission: "Pages.Tenants.CompanyOfficer",
      icon: <Icon fontSize="medium">person_add</Icon>,
      noCollapse: true,
    },
    { type: "title", title: "Master", key: "title-master" },
    {
      type: "collapse",
      name: "Master",
      nameOnHeader: "Master",
      key: "master",
      permission: "Pages.Tenants.GenerateNoSeriFP",
      icon: <Icon fontSize="medium">apps</Icon>,
      collapse: [
        {
          name: "Master Site",
          nameOnHeader: "Site",
          key: "master-site",
          route: "/master/site",
          permission: "Pages.Tenants.GenerateNoSeriFP.Create",
        },
        {
          name: "Master Period",
          nameOnHeader: "Master Period",
          key: "master-period",
          route: "/master/period",
          permission: "Pages.Tenants.GenerateNoSeriFP.Create",
        },
        {
          name: "Master Exchange Rate",
          nameOnHeader: "Master Exchange Rate",
          key: "master-exchange-rate",
          route: "/app/nsfp/list",
          permission: "Pages.Tenants.GenerateNoSeriFP.List",
        },
        {
          name: "Master Unit Data",
          nameOnHeader: "Master Unit Data",
          key: "master-unit-data",
          route: "/app/nsfp/list",
          permission: "Pages.Tenants.GenerateNoSeriFP.List",
        },
        {
          name: "Master Billing Item",
          nameOnHeader: "Master Billing Item",
          key: "master-billing-item",
          route: "/app/nsfp/list",
          permission: "Pages.Tenants.GenerateNoSeriFP.List",
        },
        {
          name: "Master Billing Item Rate",
          nameOnHeader: "Master Billing Item Rate",
          key: "master-billing-item-rate",
          route: "/app/nsfp/list",
          permission: "Pages.Tenants.GenerateNoSeriFP.List",
        },
        {
          name: "Master Unit Item",
          nameOnHeader: "Master Unit Item",
          key: "master-unit-item",
          route: "/app/nsfp/list",
          permission: "Pages.Tenants.GenerateNoSeriFP.List",
        },
        {
          name: "Master Oracle Mapping",
          nameOnHeader: "Master Oracle Mapping",
          key: "master-oracle-mapping",
          route: "/app/nsfp/list",
          permission: "Pages.Tenants.GenerateNoSeriFP.List",
        },
      ],
    },
    {
      type: "collapse",
      name: "Transaction",
      nameOnHeader: "Transaction",
      key: "transaction",
      permission: "Pages.Tenants.GenerateNoSeriFP",
      icon: <Icon fontSize="medium">apps</Icon>,
      collapse: [
        {
          name: "Water Reading",
          nameOnHeader: "Water Reading",
          key: "water-reading",
          route: "/transaction/water-reading",
          permission: "Pages.Tenants.GenerateNoSeriFP.Create",
        },
        {
          name: "Warning Letter",
          nameOnHeader: "Warning Letter",
          key: "waning-letter",
          route: "/app/nsfp/upload-batch",
          permission: "Pages.Tenants.GenerateNoSeriFP.Create",
        },
        {
          name: "Invoice",
          nameOnHeader: "Invoice",
          key: "invoice",
          route: "/app/nsfp/list",
          permission: "Pages.Tenants.GenerateNoSeriFP.List",
        },
        {
          name: "Billing Collection",
          nameOnHeader: "Billing Collection",
          key: "billing-collection",
          route: "/app/nsfp/list",
          permission: "Pages.Tenants.GenerateNoSeriFP.List",
        },
        {
          name: "Customer Complaint",
          nameOnHeader: "Customer Complaint",
          key: "customer-complaint",
          route: "/app/nsfp/list",
          permission: "Pages.Tenants.GenerateNoSeriFP.List",
        },
        {
          name: "Oracle To Journal",
          nameOnHeader: "Oracle To Journal",
          key: "oracle-t-journal",
          route: "/app/nsfp/list",
          permission: "Pages.Tenants.GenerateNoSeriFP.List",
        },
      ],
    },
    {
      type: "collapse",
      name: "Cashier System",
      nameOnHeader: "Cashier System",
      key: "cashiersystem",
      permission: "Pages.Tenants.GenerateNoSeriFP",
      icon: <Icon fontSize="medium">apps</Icon>,
      collapse: [
        {
          name: "Billing Payment",
          nameOnHeader: "Billing Payment",
          key: "billing-payment",
          route: "/cashier/billing-payment",
          permission: "Pages.Tenants.GenerateNoSeriFP.Create",
        },
        {
          name: "Reprint OR",
          nameOnHeader: "Reprint OR",
          key: "reprint-or",
          route: "/cashier/reprint-or",
        },
        {
          name: "Cancel Payment",
          nameOnHeader: "Cancel Payment",
          key: "cancel-payment",
          route: "/app/nsfp/list",
          permission: "Pages.Tenants.GenerateNoSeriFP.List",
        },
        {
          name: "Upload Bulk Payment",
          nameOnHeader: "Upload Bulk Payment",
          key: "upload-bulk-payment",
          route: "/app/nsfp/list",
          permission: "Pages.Tenants.GenerateNoSeriFP.List",
        },
      ],
    },
    {
      type: "collapse",
      name: "Report",
      nameOnHeader: "Report",
      key: "report",
      permission: "Pages.Tenants.GenerateNoSeriFP",
      icon: <Icon fontSize="medium">apps</Icon>,
      collapse: [
        {
          name: "Daily Report",
          nameOnHeader: "Daily Report",
          key: "daily-report",
          route: "/app/nsfp/generate",
          permission: "Pages.Tenants.GenerateNoSeriFP.Create",
        },
        {
          name: "Report Detail Statement",
          nameOnHeader: "Report Detail Statement",
          key: "report-detail-statement",
          route: "/app/nsfp/upload-batch",
          permission: "Pages.Tenants.GenerateNoSeriFP.Create",
        },
        {
          name: "Report Invoice",
          nameOnHeader: "Report Invoice",
          key: "report-invoice",
          route: "/app/nsfp/list",
          permission: "Pages.Tenants.GenerateNoSeriFP.List",
        },
        {
          name: "Report Water Reading",
          nameOnHeader: "Report Water Reading",
          key: "report-water-reading",
          route: "/app/nsfp/list",
          permission: "Pages.Tenants.GenerateNoSeriFP.List",
        },
        {
          name: "Report Collection",
          nameOnHeader: "Report Collection",
          key: "report-collection",
          route: "/app/nsfp/list",
          permission: "Pages.Tenants.GenerateNoSeriFP.List",
        },
        {
          name: "Report Customer Complaint",
          nameOnHeader: "Report Customer Complaint",
          key: "report-customer-complaint",
          route: "/app/nsfp/list",
          permission: "Pages.Tenants.GenerateNoSeriFP.List",
        },
      ],
    },

    // { type: "divider", key: "divider-1" },
    { type: "title", title: "Faktur Pajak (FP)", key: "title-fp" },
    {
      type: "collapse",
      name: "Nomor Seri FP",
      nameOnHeader: "Nomor Seri Faktur Pajak (NSFP)",
      key: "nsfp",
      permission: "Pages.Tenants.GenerateNoSeriFP",
      icon: <Icon fontSize="medium">apps</Icon>,
      collapse: [
        {
          name: "Generate",
          nameOnHeader: "Generate Faktur Pajak",
          key: "generate",
          route: "/nsfp/generate",
          permission: "Pages.Tenants.GenerateNoSeriFP.Create",
        },
        {
          name: "Upload Batch",
          nameOnHeader: "Upload Batch Faktur Pajak",
          key: "upload-batch",
          route: "/nsfp/upload-batch",
          permission: "Pages.Tenants.GenerateNoSeriFP.Create",
        },
        {
          name: "List",
          nameOnHeader: "List Faktur Pajak",
          key: "list",
          route: "/nsfp/list",
          permission: "Pages.Tenants.GenerateNoSeriFP.List",
        },
      ],
    },
    {
      type: "collapse",
      name: "Faktur Pajak",
      nameOnHeader: "Faktur Pajak (FP)",
      key: "fp",
      permission: "Pages.Tenants.FakturPajak",
      icon: <Icon fontSize="medium">content_paste</Icon>,
      collapse: [
        {
          name: "Input",
          nameOnHeader: "Input Faktur Pajak",
          key: "input",
          route: "",
          permission: "Pages.Tenants.FakturPajak.Input",
        },
        {
          name: "Upload",
          nameOnHeader: "Upload Faktur Pajak",
          key: "upload",
          route: "",
          permission: "Pages.Tenants.FakturPajak.CreateUpload",
        },
        {
          name: "List",
          key: "list",
          nameOnHeader: "List Faktur Pajak",
          route: "",
          permission: "Pages.Tenants.FakturPajak.List",
        },
        {
          name: "Export to CSV",
          nameOnHeader: "Export Faktur Pajak to CSV",
          key: "export",
          route: "",
          permission: "",
        },
      ],
    },

    // { type: "divider", key: "divider-2" },
    { type: "title", title: "Surat Setoran Pajak (SSP)", key: "title-ssp" },
    {
      type: "collapse",
      name: "Surat Setoran Pajak",
      nameOnHeader: "Surat Setoran Pajak (SSP)",
      key: "ssp",
      permission: "Pages.Tenants.SSP",
      icon: <Icon fontSize="medium">receipt_long</Icon>,
      collapse: [
        {
          name: "SSP by Booking Code",
          key: "ssp-by-bookcode",
          route: "",
          permission: "Pages.Tenants.SSP.ListBookCode",
        },
        {
          name: "SSP by Month",
          key: "ssp-by-month",
          route: "",
          permission: "Pages.Tenants.SSP.ListMonth",
        },
      ],
    },

    { type: "divider", key: "divider-1" },
    {
      type: "title",
      title: "Components based on case studies",
      key: "title-comp",
    },
    {
      type: "collapse",
      name: "Pagination (Client & Server)",
      nameOnHeader: "Client & Server-side Pagination (Using react-table)",
      key: "paginations",
      route: "/others/paginations",
      icon: <Icon fontSize="medium">view_in_ar</Icon>,
      noCollapse: true,
    },
  ];
}
function setFilteredMain(permissions = getPermission(), main = setMain()) {
  let filteredMain = [];
  permissions &&
    main.forEach((p) => {
      if (p.type == "collapse" && p.permission != undefined) {
        //Parent
        if (checkPermission(p.permission)) {
          // Check parrent permissions

          let selected_c = [];
          if (p.collapse != undefined || !p.noCollapse) {
            // Child
            p.collapse.forEach((c) => {
              if (c.permission != undefined && checkPermission(c.permission))
                // Check child permissions
                selected_c.push(c);
            });
            p.collapse = selected_c;

            if (selected_c.length > 0) filteredMain.push(p);
          } else filteredMain.push(p);
        }
      } else filteredMain.push(p);
    });

  return filteredMain;
}
function setReformatedMain(filteredMain = setFilteredMain()) {
  let reformatedMain = [];
  filteredMain.forEach((e) => {
    if (e.noCollapse) {
      // No child
      reformatedMain.push({
        nameOnHeader: e.nameOnHeader != undefined ? e.nameOnHeader : e.name,
        key: e.key,
        route: e.route,
      });
    } else {
      // Childs
      reformatedMain.push({
        nameOnHeader: e.nameOnHeader != undefined ? e.nameOnHeader : e.name,
        key: e.key,
      });
      if (e.collapse != undefined && e.collapse.length > 0) {
        e.collapse.forEach((e_c) => {
          reformatedMain.push({
            nameOnHeader:
              e_c.nameOnHeader != undefined ? e_c.nameOnHeader : e_c.name,
            childOf: e.key,
            key: e_c.key,
            route: e_c.route,
          });
        });
      }
    }
  });

  return reformatedMain;
}

export default function setRoutes(
  permissions = getPermission(),
  main = setMain()
) {
  const filteredMain = setFilteredMain(permissions, main);
  const reformatedMain = setReformatedMain(filteredMain);

  // console.log("Permissions: ", permissions);
  // console.log("Routes (Before): ", main);
  // console.log("Routes (After): ", filteredMain);
  // console.log("Routes (After - Reformated): ", reformatedMain);

  return {
    main,
    filteredMain,
    reformatedMain,
  };
}

export function getInformation() {
  if (typeof window !== "undefined") {
    return JSON.parse(localStorage.getItem("informations"));
  }

  return;
}

export function getPermission() {
  if (typeof window !== "undefined") {
    return JSON.parse(localStorage.getItem("grantedPermissions"));
  }

  return;
}
export function checkPermission(testPermission, permissions = getPermission()) {
  if (permissions != null || permissions != undefined) {
    let checking =
      permissions[testPermission] &&
      ["true", true].indexOf(permissions[testPermission]) != -1;
    return checking;
  }

  return;
}

export function getProfile() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("profilePicture");
  }

  return;
}
