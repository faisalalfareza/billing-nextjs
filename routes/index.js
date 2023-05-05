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

import Dashboard from "@mui/icons-material/Dashboard";
import Dns from "@mui/icons-material/Dns";
import AddBusiness from "@mui/icons-material/AddBusiness";
import CalendarToday from "@mui/icons-material/CalendarToday";
import CurrencyExchange from "@mui/icons-material/CurrencyExchange";
import HomeWork from "@mui/icons-material/HomeWork"; 
import CreditCard from "@mui/icons-material/CreditCard";
import CreditScore from "@mui/icons-material/CreditScore"; 
import ListAlt from "@mui/icons-material/ListAlt";
import FactCheck from "@mui/icons-material/FactCheck"; 
import FiberManualRecordOutlined from "@mui/icons-material/FiberManualRecordOutlined";

import MultipleStop from "@mui/icons-material/MultipleStop"; 
import WaterDamage from "@mui/icons-material/WaterDamage";
import Description from "@mui/icons-material/Description"; 
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread"; 
import Book from "@mui/icons-material/Book";

import Payments from "@mui/icons-material/Payments";
import AttachMoney from "@mui/icons-material/AttachMoney"; 
import Receipt from "@mui/icons-material/Receipt"; 
import MoneyOffIcon from "@mui/icons-material/MoneyOff"; 
import AccountBalanceWallet from "@mui/icons-material/AccountBalanceWallet";

import Source from "@mui/icons-material/Source"; 
import Today from "@mui/icons-material/Today";
import TableView from "@mui/icons-material/TableView";  
import Opacity from "@mui/icons-material/Opacity";

import MDAvatar from "../components/MDAvatar";
import profilePicture from "../assets/images/team-3.jpg";
import { capitalizeFirstLetter } from "../helpers/utils";

function setMain(informations = getInformation(), profiles = getProfile()) {
  return [
    {
      type: "collapse",
      // name: "Brooklyn Alice",
      name: informations ? capitalizeFirstLetter(informations['user']['userName']) : "Brooklyn Alice",
      key: "username",
      // icon: <MDAvatar src={profilePicture.src} size="sm" />,
      icon: <MDAvatar src={profiles ? `data:image/png;base64, ${profiles}` : profilePicture.src} alt={informations ? capitalizeFirstLetter(informations['user']['name']) : "Brooklyn Alice"} size="sm" />,
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
      // permission: "Pages.Tenant.Dashboard",
      icon: <Dashboard fontSize="medium" />,
      noCollapse: true,
    },

    {
      type: "collapse",
      name: "Master",
      nameOnHeader: "Master",
      key: "master",
      // permission: "Pages.Tenants.GenerateNoSeriFP",
      icon: <Dns fontSize="medium" />,
      collapse: [
        {
          name: "Master Site",
          nameOnHeader: "Master Site",
          key: "site",
          route: "/master/site",
          // permission: "Pages.Tenants.GenerateNoSeriFP.Create",
          icon: <AddBusiness fontSize="medium" />,
        },
        {
          name: "Master Period",
          nameOnHeader: "Master Period",
          key: "period",
          route: "/master/period",
          // permission: "Pages.Tenants.GenerateNoSeriFP.Create",
          icon: <CalendarToday fontSize="medium" />,
        },

        {
          name: "Master Exchange Rate",
          nameOnHeader: "Master Exchange Rate",
          key: "exchange-rate",
          route: "/master/exchange-rate",
          icon: <CurrencyExchange fontSize="medium" />,
        },
        {
          name: "Master Unit Data",
          nameOnHeader: "Master Unit Data",
          key: "unit-data",
          route: "/master/unit-data",
          icon: <HomeWork fontSize="medium" />,
        },
        {
          name: "Master Billing Item",
          nameOnHeader: "Master Billing Item",
          key: "billing-item",
          route: "/master/billing-item",
          icon: <CreditCard fontSize="medium" />,
        },
        {
          name: "Master Billing Item Rate",
          nameOnHeader: "Master Billing Item Rate",
          key: "billing-item-rate",
          route: "/master/billing-item-rate",
          icon: <CreditScore fontSize="medium" />,
        },
        {
          name: "Master Mapping Template Invoice",
          nameOnHeader: "Master Mapping Template Invoice",
          key: "mapping-template-invoice",
          route: "/master/mapping-template-invoice",
          icon: <ListAlt fontSize="medium" />,
        },
        {
          name: "Master Unit Item",
          nameOnHeader: "Master Unit Item",
          key: "unit-item",
          route: "/master/unit-item",
          icon: <FactCheck fontSize="medium" />,
        },
        {
          name: "Master Oracle Mapping",
          nameOnHeader: "Master Oracle Mapping",
          key: "oracle-mapping",
          route: "/master/oracle-mapping", 
          icon: <FiberManualRecordOutlined fontSize="medium" />,
        },
      ],
    },

    {
      type: "collapse",
      name: "Transaction",
      nameOnHeader: "Transaction",
      key: "transaction",
      // permission: "Pages.Tenants.GenerateNoSeriFP",
      icon: <MultipleStop fontSize="medium" />,
      collapse: [
        {
          name: "Water Reading",
          nameOnHeader: "Water Reading",
          key: "water-reading",
          route: "/transaction/water-reading",
          // permission: "Pages.Tenants.GenerateNoSeriFP.Create",
          icon: <WaterDamage fontSize="medium" />,
        },
        {
          name: "Invoice",
          nameOnHeader: "Invoice",
          key: "invoice",
          route: "/transaction/invoice",
          // permission: "Pages.Tenants.GenerateNoSeriFP.List",
          icon: <Description fontSize="medium" />,
        },
        {
          name: "Warning Letter",
          nameOnHeader: "Warning Letter",
          key: "warning-letter",
          route: "/transaction/warning-letter",
          // permission: "Pages.Tenants.GenerateNoSeriFP.Create",
          icon: <MarkEmailUnreadIcon fontSize="medium" />,
        },
        {
          name: "Oracle To Journal",
          nameOnHeader: "Oracle To Journal",
          key: "oracle-to-journal",
          route: "/transaction/oracle-to-journal",
          // permission: "Pages.Tenants.GenerateNoSeriFP.Create",
          icon: <Book fontSize="medium" />,
        },
        
        // {
        //   name: "Billing Collection",
        //   nameOnHeader: "Billing Collection",
        //   key: "billing-collection",
        //   route: "/transaction/billing-collection",
        // },
        // {
        //   name: "Customer Complaint",
        //   nameOnHeader: "Customer Complaint",
        //   key: "customer-complaint",
        //   route: "/transaction/customer-complaint",
        // },
      ],
    },

    {
      type: "collapse",
      name: "Cashier System",
      nameOnHeader: "Cashier System",
      key: "cashier",
      // permission: "Pages.Tenants.GenerateNoSeriFP",
      icon: <Payments fontSize="medium" />,
      collapse: [
        {
          name: "Billing Payment",
          nameOnHeader: "Billing Payment",
          key: "billing-payment",
          route: "/cashier/billing-payment",
          // permission: "Pages.Tenants.GenerateNoSeriFP.Create",
          icon: <AttachMoney fontSize="medium" />,
        },
        {
          name: "Reprint OR",
          nameOnHeader: "Reprint Official Receipt",
          key: "reprint-or",
          route: "/cashier/reprint-or", 
          icon: <Receipt fontSize="medium" />,
        },
        {
          name: "Cancel Payment",
          nameOnHeader: "Cancel Payment",
          key: "cancel-payment",
          route: "/cashier/cancel-payment", 
          icon: <MoneyOffIcon fontSize="medium" />,
        },
        {
          name: "Upload Bulk Payment",
          nameOnHeader: "Upload Bulk Payment",
          key: "upload-bulk-payment",
          route: "/cashier/upload-bulk-payment",
          // permission: "Pages.Tenants.GenerateNoSeriFP.List",
          icon: <AccountBalanceWallet fontSize="medium" />,
        },
      ],
    },

    {
      type: "collapse",
      name: "Report",
      nameOnHeader: "Report",
      key: "report",
      // permission: "Pages.Tenants.GenerateNoSeriFP",
      icon: <Source fontSize="medium" />,
      collapse: [
        {
          name: "Report Invoice",
          nameOnHeader: "Report Invoice",
          key: "invoice",
          route: "/report/invoice",
          // permission: "Pages.Tenants.GenerateNoSeriFP.List",
          icon: <Description fontSize="medium" />,
        },
        {
          name: "Daily Report",
          nameOnHeader: "Report Daily",
          key: "daily",
          route: "/report/daily",
          // permission: "Pages.Tenants.GenerateNoSeriFP.Create",
          icon: <Today fontSize="medium" />,
        },

        {
          name: "Report Detail Statement",
          nameOnHeader: "Report Detail Statement",
          key: "detail-statement",
          route: "/report/detail-statement",
          icon: <TableView fontSize="medium" />,
        },
        {
          name: "Report Water Reading",
          nameOnHeader: "Report Water Reading",
          key: "water-reading",
          route: "/report/water-reading",
          icon: <WaterDamage fontSize="medium" />,
        },

        // {
        //   name: "Report Collection",
        //   nameOnHeader: "Report Collection",
        //   key: "collection",
        //   route: "/report/collection",
        //   permission: "Pages.Tenants.GenerateNoSeriFP.List",
        // },
        // {
        //   name: "Report Customer Complaint",
        //   nameOnHeader: "Report Customer Complaint",
        //   key: "customer-complaint",
        //   route: "/report/customer-complaint",
        //   permission: "Pages.Tenants.GenerateNoSeriFP.List",
        // },z
      ],
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
  // ("Routes (Before): ", main);
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
