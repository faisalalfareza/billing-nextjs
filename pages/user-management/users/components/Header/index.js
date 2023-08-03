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

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";

function Header({ tabValue, tabHandler, children }) {
  return (
    <>
      <Grid container sx={{ px: 6, my: 8 }}>
        <Grid item xs={12}>
          <MDBox minWidth={{ xs: "22rem", md: "25rem" }} mx="auto" mt={6}>
            <AppBar position="static">
              <Tabs value={tabValue} onChange={tabHandler}>
                <Tab
                  value="1"
                  id="basicInfo"
                  label={
                    <MDBox py={0.5} px={2} color="inherit">
                      Basic Info
                    </MDBox>
                  }
                />
                <Tab
                  id="roles"
                  value="2"
                  label={
                    <MDBox py={0.5} px={2} color="inherit">
                      Roles
                    </MDBox>
                  }
                />
                <Tab
                  id="site"
                  value="3"
                  label={
                    <MDBox py={0.5} px={2} color="inherit">
                      Site
                    </MDBox>
                  }
                />
              </Tabs>
            </AppBar>
          </MDBox>
          {children}
        </Grid>
      </Grid>
    </>
  );
}

// Typechecking props for the Header
Header.propTypes = {
  tabValue: PropTypes.number.isRequired,
  tabHandler: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export default Header;
