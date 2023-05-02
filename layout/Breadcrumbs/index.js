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

import React, { useState, useEffect } from "react";
import Link from "next/link";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @mui material components
import { Breadcrumbs as MuiBreadcrumbs } from "@mui/material";
import Icon from "@mui/material/Icon";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";

function Breadcrumbs({ icon, title, route, light }) {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true) }, []);

  if (!hydrated) {
      // Returns null on first render, so the client and server match
      return null;
  }
  
  const routes = route.slice(0, -1);
  // const smallTitle = title.match(/-/g).length > 0 ? title.replace("-", " ") : title;
  // const focusTitle = itle.match(/-/g).length > 0 ? title.replace("-", " ")+"───" : title;

  return (
    <MDBox mr={{ xs: 0, xl: 8 }}>
      <MuiBreadcrumbs
        sx={{
          "& .MuiBreadcrumbs-separator": {
            color: ({ palette: { white, grey } }) =>
              light ? white.main : grey[600],
          },
        }}
      >
        <Link href="/">
          <a>
            <MDTypography
              component="span"
              variant="body2"
              color={light ? "white" : "dark"}
              opacity={light ? 0.8 : 0.5}
              sx={{ lineHeight: 0 }}
            >
              <Icon>{icon}</Icon>
            </MDTypography>
          </a>
        </Link>
        {routes.map((el, i) => (
          // <Link href={`/${el.name}`} key={i}>
          //   <a>
          <MDTypography
            key={"bread" + i}
            component="span"
            variant="button"
            fontWeight="regular"
            textTransform="capitalize"
            color={light ? "white" : "dark"}
            opacity={light ? 0.8 : 0.5}
            sx={{ lineHeight: 0 }}
          >
            {el.nameOnHeader != undefined
              ? el.nameOnHeader
              : el.name != undefined
              ? el.name
              : el}
          </MDTypography>
          //   </a>
          // </Link>
        ))}
        <MDTypography
          variant="button"
          fontWeight="regular"
          textTransform="capitalize"
          color={light ? "white" : "dark"}
          sx={{ lineHeight: 0 }}
        >
          {title}
        </MDTypography>
      </MuiBreadcrumbs>
      <MDTypography
        fontWeight="bold"
        textTransform="capitalize"
        variant="h6"
        color={light ? "white" : "dark"}
        noWrap
      >
        {title}
      </MDTypography>
    </MDBox>
  );
}

// Setting default values for the props of Breadcrumbs
Breadcrumbs.defaultProps = {
  light: false,
  title: "",
};

// Typechecking props for the Breadcrumbs
Breadcrumbs.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  route: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
  light: PropTypes.bool,
};

export default Breadcrumbs;
