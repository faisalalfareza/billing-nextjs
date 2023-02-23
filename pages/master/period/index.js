import DashboardLayout from "/layout/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/layout/Navbars/DashboardNavbar";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Grid from "@mui/material/Grid";
import { Autocomplete, TextField } from "@mui/material";
import { Link } from "@mui/material";
import MDButton from "/components/MDButton";
import MDInput from "/components/MDInput";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
import { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import { Formik, Form } from "formik";
import FormField from "/pagesComponents/FormField";
import * as Yup from "yup";
import axios from "axios";
import DataTable from "/layout/Tables/DataTable";
import PeriodRowActions from "./components/PeriodRowActions";
import AddOrEditPeriod from "./components/AddOrEditPeriod";
import Icon from "@mui/material/Icon";
import MDBadgeDot from "/components/MDBadgeDot";
import Swal from "sweetalert2";

export default function MasterPeriod(props) {
  const { dataProject, dataSite } = props;
  const [listSite, setListSite] = useState([]);
  const [site, setSite] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [modalParams, setModalParams] = useState(undefined);

  useEffect(() => {
    let currentSite = JSON.parse(localStorage.getItem("site"));
    console.log("currentSite-----------", currentSite);
    if (currentSite == null) {
      Swal.fire({
        title: "Info!",
        text: "Please choose Site first",
        icon: "info",
      });
    } else {
      setSite(currentSite);
    }
  }, []);
  useEffect(() => {
    fetchData();
  }, [site]);

  //dari sini
  const [isLoading, setLoading] = useState(false);

  const setSiteList = () => {
    return {
      columns: [
        { Header: "Period No", accessor: "periodNumber" },
        { Header: "Period Name", accessor: "periodName" },
        { Header: "Start Date", accessor: "startDate" },
        { Header: "End Date", accessor: "endDate" },
        { Header: "Close Date", accessor: "closeDate" },

        {
          Header: "Status",
          accessor: "isActive",
          Cell: ({ value }) => {
            return (
              <MDBadgeDot
                color={value ? "success" : "danger"}
                size="sm"
                badgeContent={value ? "Active" : "Inactive"}
              />
            );
          },
        },
        {
          Header: "Action",
          accessor: "action",
          align: "center",
          sorted: true,
          Cell: ({ value }) => {
            return (
              <PeriodRowActions
                record={value}
                openModalonEdit={openModalAddOrEditOnEdit}
                onDeleted={fetchData}
              />
            );
          },
        },
      ],
      rows: listSite,
    };
  };

  const openModalAddOrEditOnEdit = (record) => {
    setModalParams(record);
    setOpenModal(!openModal);
  };

  const changeModalAddOrEdit = () => {
    setOpenModal(!openModal);
    fetchData();
  };

  const openModalAddOrEditOnAdd = () => {
    setModalParams(undefined);
    setOpenModal(!openModal);
  };
  const handleClose = () => setOpenModal(false);
  const chooseSite = (val) => {
    setSite(val);
    localStorage.setItem("site", JSON.stringify(val));
    // fetchData();
  };

  const fetchData = async (data) => {
    const url = `${publicRuntimeConfig.apiUrl}/api/services/app/MasterBilling/GetListMasterPeriod`;
    axios
      .get(url, {
        params: {
          SiteId: site?.siteId,
          // SiteName: site?.siteName,
          MaxResultCount: 1000,
          SkipCount: 0,
        },
      })
      .then((response) => {
        // handle success
        const result = response.data.result.items;
        const list = [];
        const row = result.map((e, i) => {
          list.push({
            no: i + 1,
            closeDate: e.closeDate,
            endDate: e.endDate,
            isActive: e.isActive,
            periodName: e.periodName,
            periodNumber: e.periodNumber,
            siteId: e.siteId,
            startDate: e.startDate,
            siteName: e.siteName,
            periodId: e.periodId,
            action: {
              closeDate: e.closeDate,
              endDate: e.endDate,
              isActive: e.isActive,
              periodName: e.periodName,
              periodNumber: e.periodNumber,
              siteId: e.siteId,
              startDate: e.startDate,
              siteName: e.siteName,
              periodId: e.periodId,
            },
          });
        });
        setListSite(list);
        console.log("list------", list);
      })
      .catch((error) => {
        // handle error
      });
  };
  //sampai sini

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox
        p={3}
        color="light"
        bgColor="info"
        variant="gradient"
        borderRadius="lg"
        shadow="lg"
        opacity={1}
        mb={2}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} sm={12}>
            <Autocomplete
              options={dataSite}
              key="site-dropdown"
              value={site}
              getOptionLabel={(option) =>
                option.siteName ? option.siteId + " - " + option.siteName : ""
              }
              onChange={(e, value) => {
                chooseSite(value);
              }}
              noOptionsText="No results"
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Site Name"
                  variant="standard"
                  color="dark"
                />
              )}
            />
          </Grid>
        </Grid>
      </MDBox>
      {/* tasklist */}
      <MDBox pb={3}>
        <Card>
          <MDBox p={3} lineHeight={1}>
            <Grid container alignItems="center">
              <Grid item xs={12} md={8}>
                <MDBox mb={1}>
                  <MDTypography variant="h5">Master Period List</MDTypography>
                </MDBox>
                <MDBox mb={2}>
                  <MDTypography variant="body2" color="text">
                    For period data maintenance
                  </MDTypography>
                </MDBox>
              </Grid>
              <Grid item xs={12} md={4} sx={{ textAlign: "right" }}>
                <Grid container alignItems="right" spacing={1}>
                  <Grid item xs={12} md={12}>
                    <MDButton
                      variant="gradient"
                      color="primary"
                      onClick={openModalAddOrEditOnAdd}
                    >
                      <Icon>add</Icon>&nbsp; Add New Period
                    </MDButton>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </MDBox>
          <DataTable table={setSiteList()} canSearch />
        </Card>
        <AddOrEditPeriod
          site={site}
          isOpen={openModal}
          params={modalParams}
          onModalChanged={changeModalAddOrEdit}
        />
      </MDBox>
    </DashboardLayout>
  );
}

export async function getStaticProps(context) {
  const urlP = `${publicRuntimeConfig.apiUrl}/api/services/app/BillingSystems/GetDropdownProject`;
  const resProject = await fetch(urlP);
  let listProject = await resProject.json();
  const dataProject = listProject.result;
  const resSite = await fetch(
    `${publicRuntimeConfig.apiUrl}/api/services/app/BillingSystems/GetDropdownSite`
  );
  let listSite = await resSite.json();
  const dataSite = listSite.result;
  return {
    props: {
      dataProject,
      dataSite,
    },
    revalidate: 60,
  };
}