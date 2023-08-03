import MDBox from "components/MDBox";
import Grid from "@mui/material/Grid";
import MDTypography from "/components/MDTypography";
import Card from "@mui/material/Card";
import UploadImage from "../UploadImage";

export default function BasicInfo(props) {
  return (
    <Card sx={{ p: 2, width: "100%", mt: 2 }}>
      <Grid container alignItems="center" spacing={2}>
        <Grid item xs={12}>
          <MDBox>
            <MDTypography variant="body">Create New Users</MDTypography>
            <MDTypography variant="caption">
              - Let&prime;s start with the basic information
            </MDTypography>
          </MDBox>
        </Grid>
        <Grid item xs={4}>
          <UploadImage />
        </Grid>
        <Grid item xs={8}></Grid>
        {/* <Grid item xs={12} sm={12}>
                        <FormField
                          type="text"
                          label="Unit Code"
                          disabled
                          name="unitCode"
                          value={formValues.unitCode}
                          placeholder="Type Unit Code"
                          error={errors.unitCode && touched.unitCode}
                          success={checkingSuccessInput(
                            formValues.unitCode,
                            errors.unitCode
                          )}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <FormField
                          InputLabelProps={{ shrink: true }}
                          disabled
                          type="text"
                          label="Unit No"
                          name="unitNo"
                          value={formValues.unitNo}
                          placeholder="Type Unit No"
                          error={errors.unitNo && touched.unitNo}
                          success={checkingSuccessInput(
                            formValues.unitNo,
                            errors.unitNo
                          )}
                        />
                      </Grid> */}
      </Grid>
    </Card>
  );
}
