import React, { useState, useEffect } from "react";

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

// Data
import axios from "axios";
import getConfig from 'next/config';
import { useCookies } from 'react-cookie';
const { publicRuntimeConfig } = getConfig();


function CompanyOfficer() {
  const [{ accessToken, encryptedAccessToken }] = useCookies();
  const [isLoadingRefresh, setLoadingRefresh] = useState(false);

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
  const changeModalAddOrEdit = () => {
    setModalAddOrEditOpen(!modalAddOrEditOpen);
    getCompanyOfficerTasklist();
  };

  useEffect(() => {
    getCompanyOfficerTasklist();
  }, []);

  const [companyOfficerList, setCompanyOfficer] = useState([]);
  const getCompanyOfficerTasklist = async (e) => {
    if (e) e.preventDefault();
    setLoadingRefresh(true);

    const url = `${publicRuntimeConfig.apiUrl}/api/services/app/CompanyOfficer/GetCompanyOfficerTasklist`;
    const config = {headers: {Authorization: "Bearer " + accessToken}};
    axios
      .get(url, config)
      .then(res => {
        let companyOfficerList = res.data.result;
        setCompanyOfficer(companyOfficerList);

        setLoadingRefresh(false);
      }).catch((error) => setLoadingRefresh(false));
  };

  const setCompanyOfficerList = () => {
    return {
      columns: [
        { Header: "Company Name", accessor: "coName" },
        { Header: "Officer Name", accessor: "officerName" },
        { Header: "Officer Title", accessor: "title" },
        { 
          Header: "Action", accessor: "action", align: "center", sorted: true,
          Cell: ({ value }) => {
            return (
              <DataTableRowActions 
                record={value} 
                openModalonEdit={openModalAddOrEditOnEdit} 
                onDeleted={getCompanyOfficerTasklist} 
              />
            )
          }
        },
      ],
      rows: companyOfficerList
    }
  };
  setCompanyOfficerList().rows.map(e => e['action'] = e);


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
          <DataTable table={setCompanyOfficerList()} canSearch noEndBorder />
        </Card>

        <AddOrEditCompanyOfficerModal 
          isOpen={modalAddOrEditOpen} 
          params={modalAddOrEditOpenOnEditParams} 
          onModalChanged={changeModalAddOrEdit} 
        />

      </MDBox>
      {/* <Footer /> */}
    </DashboardLayout>
  );
}

export default CompanyOfficer;
