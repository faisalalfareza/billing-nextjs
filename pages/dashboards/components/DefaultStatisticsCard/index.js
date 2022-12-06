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
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDBadge from "/components/MDBadge";

// NextJS Material Dashboard 2 PRO contexts
import { useMaterialUIController } from "/context";

function DefaultStatisticsCard({ coName, coCode, count, percentage, dropdown }) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  return (
    <Card>
      <MDBox p={2}>
        <Grid container>
          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={12} sm={9}>
                <MDBox mb={0.5} pr={0.5} lineHeight={1}> 
                  <MDTypography
                    variant="button"
                    fontWeight="medium"
                    color="text"
                    textTransform="uppercase"
                    lineHeight="1"
                  >
                    {coName}
                  </MDTypography>
                </MDBox>
              </Grid>
              <Grid item xs={12} sm={3} textAlign="right">
                {/* <MDBox
                  width={{ xs: "100%", sm: "50%", md: "25%" }}
                  mt={{ xs: 1, sm: 0 }}
                > */}
                  <MDBadge
                    variant="contained"
                    color="secondary"
                    badgeContent={coCode}
                    container
                  />
                {/* </MDBox> */}
              </Grid>
            </Grid>
            <MDBox lineHeight={1}>
              <MDTypography variant="h5" fontWeight="bold" textAlign="right">
                {count}
              </MDTypography>
              <MDTypography
                variant="button"
                fontWeight="bold"
                color={percentage.color}
              >
                {percentage.value}&nbsp;
                <MDTypography
                  variant="button"
                  fontWeight="regular"
                  color={darkMode ? "text" : "secondary"}
                >
                  {percentage.label}
                </MDTypography>
              </MDTypography>
            </MDBox>
          </Grid>
          {/* <Grid item xs={5}>
            {dropdown && (
              <MDBox width="100%" textAlign="right" lineHeight={1}>
                <MDTypography
                  variant="caption"
                  color="secondary"
                  fontWeight="regular"
                  sx={{ cursor: "pointer" }}
                  onClick={dropdown.action}
                >
                  {dropdown.value}
                </MDTypography>
                {dropdown.menu}
              </MDBox>
            )}
          </Grid> */}
        </Grid>
      </MDBox>
    </Card>
  );
}

// Setting default values for the props of DefaultStatisticsCard
DefaultStatisticsCard.defaultProps = {
  percentage: {
    color: "success",
    value: "",
    label: "",
  },
  dropdown: false,
};

// Typechecking props for the DefaultStatisticsCard
DefaultStatisticsCard.propTypes = {
  coName: PropTypes.string.isRequired,
  coCode: PropTypes.string.isRequired,
  count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  percentage: PropTypes.shape({
    color: PropTypes.oneOf([
      "primary",
      "secondary",
      "info",
      "success",
      "warning",
      "error",
      "dark",
      "white",
    ]),
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    label: PropTypes.string,
  }),
  dropdown: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.shape({
      action: PropTypes.func,
      menu: PropTypes.node,
      value: PropTypes.string,
    }),
  ]),
};

export default DefaultStatisticsCard;
