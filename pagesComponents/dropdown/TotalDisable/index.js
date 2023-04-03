import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import { NumericFormat } from "react-number-format";

export default function TotalDisable(props) {
  return (
    <MDBox
      sx={{ width: 1 }}
      bgColor="grey-100"
      borderRadius="lg"
      display="flex"
      justifyContent="space-between"
      alignItems={{
        xs: "flex-start",
        sm: "center",
      }}
      flexDirection={{
        xs: "column",
        sm: "row",
      }}
      py={1}
      pl={{ xs: 1, sm: 2 }}
      pr={1}
    >
      <MDTypography variant="button" fontWeight="medium" color="text">
        {props.title}
      </MDTypography>
      <MDBox mt={{ xs: 1, sm: 0 }}>
        <NumericFormat
          displayType="text"
          value={props.value}
          decimalSeparator=","
          prefix="Rp "
          thousandSeparator="."
        />
      </MDBox>
    </MDBox>
  );
}
