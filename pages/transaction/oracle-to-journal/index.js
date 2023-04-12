import Card from "@mui/material/Card";
// @mui material components
import { Grid } from "@mui/material";
// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";

// NextJS Material Dashboard 2 PRO layout
import DashboardLayout from "/layout/LayoutContainers/DashboardLayout";
import DashboardNavbar from "/layout/Navbars/DashboardNavbar";
import { useMaterialUIController } from "/context";
import * as React from "react";

// Data
import { useState } from "react";
import SiteDropdown from "../../../pagesComponents/dropdown/Site";
// import templateWaterReading from "../assets/template/template-water-reading.xlsx";

export default function OracleToJournal(props){
    const [controller] = useMaterialUIController();
    const [customerResponse, setCustomerResponse] = useState({
      rowData: [],
      totalRows: undefined,
      totalPages: undefined,
    });

    const form = {
        formId: "oracle-to-journal",
        formField: {
            period: {
                name: "period",
                label: "period",
                placeholder: "Type Period",
                type: "text",
                isRequired: true,
                errorMsg: "Period is required",
                defaultValue: ""
            }
        }
    };

    const { period } = form.formField;

    const [site, setSite] = useState(null);

    const handleSite = (siteVal) => {
        setSite(siteVal);
        localStorage.setItem("site", JSON.stringify(siteVal));
    };

    return (
        <DashboardLayout>
            <DashboardNavbar/>
            <MDBox
                p={3}
                color="light"
                bgColor="info"
                variant="gradient"
                borderRadius="lg"
                shadow="lg"
                opacity={1}
            >
                <Grid container spacing={3}>
                <Grid item xs={12} sm={12}>
                    <SiteDropdown onSelectSite={handleSite} site={site} />
                </Grid>
                </Grid>
            </MDBox>
            <MDBox py={3}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Card>
                            <MDBox p={3} lineHeight={1}>
                                <Grid container alignItems="center">
                                    <Grid item xs={12} md={8}>
                                        <MDBox mb={1}>
                                            <MDTypography variant="h6">Transaction Oracle Journal</MDTypography>
                                            <MDTypography variant="body2" color="text">
                                                Billing Transaction to Oracle
                                            </MDTypography>
                                        </MDBox>
                                    </Grid>
                                </Grid>
                            </MDBox>
                            <MDBox p={3} lineHeight={1}>
                                <Grid container alignItems="center">
                                    <Grid item xs={12}>
                                        <Grid item xs={12} md={6}>
                                            <Autocomplete
                                                // disableCloseOnSelect
                                                key={cluster.name}
                                                options={dataCluster}
                                                value={values.cluster}
                                                getOptionLabel={(option) =>
                                                option.clusterCode +
                                                " - " +
                                                option.clusterName
                                                }
                                                onChange={(e, value) =>
                                                setFieldValue(
                                                    cluster.name,
                                                    value !== null
                                                    ? value
                                                    : initialValues[cluster.name]
                                                )
                                                }
                                                renderInput={(params) => (
                                                <FormField
                                                    {...params}
                                                    type={cluster.type}
                                                    label={
                                                    cluster.label +
                                                    (cluster.isRequired ? " *" : "")
                                                    }
                                                    name={cluster.name}
                                                    placeholder={cluster.placeholder}
                                                    InputLabelProps={{ shrink: true }}
                                                    error={
                                                    errors.cluster && touched.cluster
                                                    }
                                                    success={checkingSuccessInput(
                                                    cluster,
                                                    errors.cluster
                                                    )}
                                                />
                                                )}
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </MDBox>
                        </Card>
                    </Grid>
                </Grid>
            </MDBox>
        </DashboardLayout>
    )
}