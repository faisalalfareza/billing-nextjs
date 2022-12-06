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

import React, { useState } from "react";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDButton from "/components/MDButton";

// NextJS Material Dashboard 2 PRO examples
import DashboardLayout from "/layout/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/layout/Navbars/DashboardNavbar";
import Footer from "/layout/Footer";
import DataTable from "/layout/Tables/DataTable";

import DataTableRowActions from "./components/DataTableRowActions";
import AddOrEditCompanyOfficerModal from "./components/AddOrEditCompanyOfficerModal";


function CompanyOfficer() {
  const [modalAddOrEditOpen, setModalAddOrEditOpen] = React.useState(false);
  const [modalAddOrEditOpenOnEditParams, setModalAddOrEditOpenOnEditParams] = React.useState(undefined);
  const openModalAddOrEditOnAdd = () => {
    setModalAddOrEditOpenOnEditParams(undefined);
    setModalAddOrEditOpen(!modalAddOrEditOpen);
  };
  const openModalAddOrEditOnEdit = (record) => {
    setModalAddOrEditOpenOnEditParams(record);
    setModalAddOrEditOpen(!modalAddOrEditOpen);
  };
  const changeModalAddOrEdit = () => setModalAddOrEditOpen(!modalAddOrEditOpen);

  const taskList = {
    columns: [
      { Header: "Company Name", accessor: "coName" },
      { Header: "Officer Name", accessor: "officerName" },
      { Header: "Officer Title", accessor: "title" },
      { 
        Header: "Action", accessor: "action", align: "center", sorted: true,
        Cell: ({ value }) => <DataTableRowActions record={value} openModalonEdit={openModalAddOrEditOnEdit} />
      },
    ],
    rows: [
      {
        coCode: "MSV",
        coName: "PT. MAHKOTA SENTOSA UTAMA",
        officerName: "Mulianto Lie",
        title: "Presiden Director",
      },
      {
        coCode: "IS",
        coName: "PT Indo Sejati",
        officerName: "Bambang Pamungkas",
        title: "Poucher",
      },
    ],
  };
  taskList.rows.map(e => e['action'] = e);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Card>
          <MDBox p={3} lineHeight={1}>
            <Grid container alignItems="center">
              <Grid item xs={12} md={8}>
                <MDBox mb={1}>
                  <MDTypography variant="h5">
                    List of Company Officer
                  </MDTypography>
                </MDBox>
                <MDBox mb={2}>
                  <MDTypography variant="body2" color="text">
                    Used to register users who are usually in charge of reporting tax from a company.
                  </MDTypography>
                </MDBox>
              </Grid>
              <Grid item xs={12} md={4} sx={{ textAlign: "right" }}>
                <MDButton variant="gradient" color="dark" onClick={openModalAddOrEditOnAdd}>
                  <Icon>add</Icon>&nbsp; Add New Officer
                </MDButton>
              </Grid>
            </Grid>
          </MDBox>
          <DataTable table={taskList} canSearch noEndBorder />
        </Card>

        <AddOrEditCompanyOfficerModal isOpen={modalAddOrEditOpen} params={modalAddOrEditOpenOnEditParams} onModalChanged={changeModalAddOrEdit} />

      </MDBox>
      {/* <Footer /> */}
    </DashboardLayout>
  );
}

export default CompanyOfficer;
