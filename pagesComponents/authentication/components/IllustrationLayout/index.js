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

import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";

import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";

import { useMaterialUIController } from "/context";

import DefaultNavbar from "/layout/Navbars/DefaultNavbar";
import PageLayout from "/layout/LayoutContainers/PageLayout";

import Footer from "/pagesComponents/authentication/components/Footer";

import pageRoutes from "/routes/page.routes";

import brandWhite from "../../../../assets/images/app-logo-on-dark.png";
import brandBuilding from "../../../../assets/images/bg-login.svg";

function IllustrationLayout({
  header,
  formTitle,
  formDescription,
  illustration,
  children,
}) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  return (
    <PageLayout background="white">
      {/* <DefaultNavbar
        routes={pageRoutes}
        action={{
          type: "external",
          route:
            "https://creative-tim.com/product/nextjs-material-dashboard-pro",
          label: "buy now",
        }}
      /> */}
      <Grid
        container
        justifyContent="center"
        // placeContent="center"
        sx={{
          backgroundColor: ({ palette: { background, white } }) =>
            darkMode ? background.default : white.main,
        }}
      >
        {/* <Grid item xs={12} lg={6}>
          <MDBox
            display={{ xs: "none", lg: "flex" }}
            width="calc(100% - 2rem)"
            height="calc(100vh - 2rem)"
            borderRadius="lg"
            ml={2}
            mt={2}
            sx={{ backgroundImage: `url(${illustration.src || illustration})` }}
          >
            <Grid container alignItems="center">
              <Grid item xs={12} sm={3} pl={5} pr={5}>
                <MDBox component="img" src={brandWhite.src} width={"5rem"} />
              </Grid>
              <Grid item xs={12} sm={9} mt={3} pl={5} pr={5}>
                <MDBox>
                  <MDTypography variant="h6" color="white" lineHeight="0">
                    Engine 3
                  </MDTypography>
                </MDBox>
                <MDBox mb={1}>
                  <MDTypography variant="h1" color="white" letterSpacing="-3px">
                    Billing Residence Application
                  </MDTypography>
                </MDBox>
                <MDBox mb={2}>
                  <MDTypography
                    variant="body2"
                    color="white"
                    fontWeight="regular"
                    lineHeight="1"
                  >
                    Manage company officers, tax invoices along with serial
                    numbers, and tax deposit letters.
                  </MDTypography>
                </MDBox>
              </Grid>
            </Grid>
          </MDBox>
        </Grid> */}
        <Grid
          item
          xs={11}
          sm={8}
          md={6}
          lg={4}
          xl={3}
          sx={{ mx: "auto" }}
          zIndex="1"
        >
          <MDBox
            display="flex"
            flexDirection="column"
            justifyContent="center"
            height="100vh"
          >
            <MDBox
              py={3}
              px={3}
              textAlign="center"
              bgColor="primary"
              borderRadius="lg"
              variant="gradient"
              shadow="xl"
              pr={0.5}
              zIndex="1"
            >
              {!header ? (
                <>
                  <MDBox mb={1} textAlign="center">
                    <MDTypography variant="h4" fontWeight="bold" color="light">
                      {formTitle}
                    </MDTypography>
                  </MDBox>
                  <MDTypography variant="body2" color="text" lineHeight="1">
                    {formDescription}
                  </MDTypography>
                </>
              ) : (
                header
              )}
            </MDBox>
            <MDBox
              p={3}
              pt={8}
              mt={-6}
              ml={-4}
              mr={-4}
              shadow="lg"
              bgColor="white"
              borderRadius="xl"
            >
              {children}
            </MDBox>
          </MDBox>
        </Grid>

        <MDBox
          component="img"
          src={brandBuilding.src}
          width={"100%"}
          position="absolute"
          alignSelf="flex-end"
          opacity={0.2}
        />
      </Grid>
      <Footer dark />
    </PageLayout>
  );
}

// Setting default values for the props of IllustrationLayout
IllustrationLayout.defaultProps = {
  header: "",
  formTitle: "",
  formDescription: "",
  illustration: "",
};

// Typechecking props for the IllustrationLayout
IllustrationLayout.propTypes = {
  header: PropTypes.node,
  formTitle: PropTypes.string,
  formDescription: PropTypes.string,
  children: PropTypes.node.isRequired,
  illustration: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
    .isRequired,
};

export default IllustrationLayout;
