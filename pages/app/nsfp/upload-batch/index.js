import React, { useMemo } from "react";
import * as Yup from "yup";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDButton from "/components/MDButton";
import MDDropzone from "/components/MDDropzone";

// NextJS Material Dashboard 2 PRO examples
import DashboardLayout from "/layout/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/layout/Navbars/DashboardNavbar";
import Footer from "/layout/Footer";
import DataTable from "/layout/Tables/DataTable";


function UploadBatchFakturPajak() {
  const submitForm = async (values, actions) => {
  };

  const taskList = {
    columns: [
      { Header: "Company Code", accessor: "coCode" },
      { Header: "Company Name", accessor: "coName" },
      { Header: "No. Seri", accessor: "noSeri" },
      { Header: "FP Trans Code", accessor: "fpTransCode" },
      { Header: "FP Stat Code", fpStatCode: "noSeri" },
      { Header: "Message", accessor: "message" },
    ],
    rows: [
      {
        coCode: "MSV",
        coName: "PT. MAHKOTA SENTOSA UTAMA",
        officerName: "Mulianto Lie",
        title: "Presiden Director",
        noSeri: "001-22-00000001",
        fpTransCode: "01",
        fpStatCode: "1",
        message: "-"
      },
      {
        coCode: "IS",
        coName: "PT Indo Sejati",
        officerName: "Bambang Pamungkas",
        title: "Poucher",
        noSeri: "001-22-00000002",
        fpTransCode: "01",
        fpStatCode: "1",
        message: "-"
      },
    ],
  };


  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <MDBox p={3} lineHeight={1}>
                <Grid container alignItems="center">
                  <Grid item xs={12} md={8}>
                    <MDBox mb={1}>
                      <MDTypography variant="h5">
                        Upload Through Template
                      </MDTypography>
                    </MDBox>
                    <MDBox mb={2}>
                      <MDTypography variant="body2" color="text">
                        Used to upload tax invoices through the available upload templates.
                      </MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={12} md={4} sx={{ textAlign: "right" }}>
                    <MDButton variant="outlined" color="dark">
                      Download Template
                    </MDButton>
                  </Grid>
                  <Grid item xs={12}>
                    <MDBox mt={3}>
                      <MDBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
                        <MDTypography
                          component="label"
                          variant="button"
                          fontWeight="regular"
                          color="text"
                        >
                          Template Upload Batch Faktur Pajak
                        </MDTypography>
                      </MDBox>
                      {useMemo(
                        () => (
                          <MDDropzone options={{ addRemoveLinks: true }} />
                        ),
                        [],
                      )}
                    </MDBox>
                  </Grid>
                </Grid>
              </MDBox>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <DataTable table={taskList} canSearch noEndBorder />
              <MDBox pb={3} px={3}>
                <Grid item xs={12}>
                  <MDBox display="flex" flexDirection={{ xs: "column", sm: "row" }} justifyContent="flex-end">
                    <MDButton variant="outlined" color="secondary">
                      Cancel
                    </MDButton>
                    <MDBox ml={{ xs: 0, sm: 1 }} mt={{ xs: 1, sm: 0 }}>
                      <MDButton type="submit" variant="gradient" color="primary" sx={{ height: "100%" }}>
                        Upload
                      </MDButton>
                    </MDBox>
                  </MDBox>
                </Grid>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      {/* <Footer /> */}
    </DashboardLayout>
  );
}

export default UploadBatchFakturPajak;
