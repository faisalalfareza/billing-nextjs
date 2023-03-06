import DashboardLayout from "/layout/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/layout/Navbars/DashboardNavbar";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import Grid from "@mui/material/Grid";
import { Autocomplete, TextField, Radio } from "@mui/material";
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
import Icon from "@mui/material/Icon";
import MDBadgeDot from "/components/MDBadgeDot";
import Swal from "sweetalert2";

export default function BillingPayment(props) {
  const { dataSite } = props;
  const [listCustomer, stListCustomer] = useState([]);
  const [site, setSite] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [modalParams, setModalParams] = useState(undefined);
  const [filterText, setFilterText] = useState("");

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
    // fetchData();
  }, [site]);

  //dari sini
  const [isLoading, setLoading] = useState(false);

  const handleCheck = (val) => {};

  const setSiteList = () => {
    return {
      columns: [
        {
          Header: "Choose",
          accessor: "actions",
          Cell: ({ value }) => {
            return (
              <Radio
                onChange={handleCheck(value)}
                value={value}
                name="radio-buttons"
                inputProps={{ "aria-label": "A" }}
              />
            );
          },
        },
        { Header: "No", accessor: "no" },
        { Header: "Project", accessor: "projectName" },
        { Header: "Cluster", accessor: "clusterName" },

        { Header: "Unit Name", accessor: "unitName" },
        { Header: "Unit Code", accessor: "unitCode" },
        { Header: "Unit No", accessor: "unitNo" },
        { Header: "Customer Name", accessor: "customerName" },
      ],
      rows: listCustomer,
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
    const url = `${publicRuntimeConfig.apiUrl}/api/services/app/CashierSystem/GetCustomerList`;
    axios
      .get(url, {
        params: {
          SiteId: site?.siteId,
          Search: filterText,
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
            projectName: e.projectName,
            clusterName: e.clusterName,
            customerName: e.customerName,
            unitName: e.unitName,
            unitCode: e.unitCode,
            unitNo: e.unitNo,
            action: {
              e,
            },
          });
        });
        stListCustomer(list);
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
                <MDBox>
                  <MDTypography variant="h5">Filter</MDTypography>
                </MDBox>
                <MDBox mb={2}>
                  <MDInput
                    variant="standard"
                    label="Customer Name / ID Client *"
                    onChange={(e) => {
                      setFilterText(e.target.value);
                      //   fetchData(filterText);
                    }}
                    fullWidth
                  />
                </MDBox>
              </Grid>
              <Grid item xs={12} md={4} sx={{ textAlign: "right" }}>
                <Grid container alignItems="right" spacing={1}>
                  <Grid item xs={12} md={12}>
                    <MDButton
                      variant="gradient"
                      color="primary"
                      onClick={() => {
                        fetchData();
                      }}
                    >
                      <Icon>search</Icon>&nbsp; Search
                    </MDButton>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </MDBox>
          <MDBox pl={3}>
            <MDTypography variant="h5">Search Result</MDTypography>
          </MDBox>
          <DataTable table={setSiteList()} canSearch />
          <MDBox p={3} alignItems="center" textAlign="center">
            <MDButton
              disabled
              variant="gradient"
              color="primary"
              onClick={() => {
                fetchData();
              }}
            >
              <Icon>search</Icon>&nbsp; Show This Unit
            </MDButton>
          </MDBox>
        </Card>
        {/* <AddOrEditPeriod
          site={site}
          isOpen={openModal}
          params={modalParams}
          onModalChanged={changeModalAddOrEdit}
        /> */}
      </MDBox>
      <MDBox mt={5} mb={9}>
        <Grid container justifyContent="center">
          <Grid item xs={12} lg={12}>
            <Card>
              <MDBox
                mt={-3}
                mb={-1}
                mx={4}
                textAlign="center"
                bgColor="primary"
                borderRadius="lg"
                // variant="gradient"
                shadow="xl"
                py={2}
              >
                <Grid container spacing={3}>
                  <Grid item xs={4}>
                    <MDTypography variant="h6" color="light">
                      CUSTOMER NAME
                    </MDTypography>
                    <MDTypography variant="body2" color="light">
                      Unit
                    </MDTypography>
                  </Grid>
                  <Grid item xs={4}>
                    <MDTypography variant="h6" color="light">
                      UNIT CODE
                    </MDTypography>
                    <MDTypography variant="body2" color="light">
                      Unit
                    </MDTypography>
                  </Grid>
                  <Grid item xs={4}>
                    <MDTypography variant="h6" color="light">
                      UNIT NO
                    </MDTypography>
                    <MDTypography variant="body2" color="light">
                      Unit
                    </MDTypography>
                  </Grid>
                </Grid>
                <MDBox mb={1} textAlign="center"></MDBox>
              </MDBox>
              <MDBox p={2}>
                <MDBox>
                  <MDBox
                    p={1}
                    mt={3}
                    width="100%"
                    display="flex"
                    justifyContent="space-between"
                  >
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <MDTypography variant="h5">
                          Payment Detail{" "}
                        </MDTypography>
                      </Grid>

                      <Grid item xs={6}>
                        <MDInput variant="standard" label="Cluster" fullWidth />
                      </Grid>
                      <Grid item xs={6}></Grid>
                      <Grid item xs={12}>
                        <MDButton variant="gradient" color="dark">
                          save
                        </MDButton>
                      </Grid>
                    </Grid>
                  </MDBox>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export async function getStaticProps(context) {
  const resSite = await fetch(
    `${publicRuntimeConfig.apiUrl}/api/services/app/BillingSystems/GetDropdownSite`
  );
  let listSite = await resSite.json();
  const dataSite = listSite.result;
  return {
    props: {
      dataSite,
    },
    revalidate: 60,
  };
}
