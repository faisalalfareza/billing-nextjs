import { TextField } from "@mui/material";
import { useState } from "react";
import { NumericFormat } from "react-number-format";

export default function NumberInput(props) {
  const [value, setValue] = useState("");
  return (
    <NumericFormat
      placeholder="Number Format Input looses focus"
      isNumericString={true}
      valueIsNumericString={true}
      value={value}
      onValueChange={(vals) => setValue(vals.formattedValue)}
      {...props}
      customInput={TextField}
      fullWidth
      variant="standard"
      thousandSeparator="."
      decimalSeparator=","
      allowNegative={false}
      decimalScale={2}
      prefix="Rp. "
    />
  );
}
