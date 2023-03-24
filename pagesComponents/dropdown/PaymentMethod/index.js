import Autocomplete from "@mui/material/Autocomplete";
import { TextField } from "@mui/material";
import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { typeNormalization } from "/helpers/utils";
import { fieldToTextField } from "formik-material-ui";

export default function PaymentMethodDropdown({ textFieldProps, ...props }) {
  const [dataPaymentMethod, setDataPaymentMethod] = useState([]);
  const [{ accessToken, encryptedAccessToken }] = useCookies();
  const {
    form: { setTouched, setFieldValue },
  } = props;
  const { error, helperText, ...field } = fieldToTextField(props);
  const { name } = field;

  useEffect(() => {
    getPaymentMethod();
  }, []);

  const getPaymentMethod = async () => {
    let response = await fetch("/api/cashier/billing/dropdownpayment", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    console.log("up---", response.result);
    setDataPaymentMethod(response.result);
  };

  const handleSiteChange = (value) => {
    props.onSelectSite(value);
  };

  return (
    <Autocomplete
      {...props}
      {...field}
      options={dataPaymentMethod}
      onChange={(_, value) => setFieldValue(name, value)}
      onBlur={() => setTouched({ [name]: true })}
      getOptionSelected={(item, current) => item.value === current.value}
      renderInput={(props) => (
        <TextField
          {...props}
          {...textFieldProps}
          helperText={helperText}
          error={error}
        />
      )}
    />
  );
}
