import Autocomplete from "@mui/material/Autocomplete";
import { TextField } from "@mui/material";
import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { typeNormalization } from "/helpers/utils";

export default function ProjectDropdown({ textFieldProps, ...props }) {
  const [dataSite, setDataSite] = useState([]);
  const [{ accessToken, encryptedAccessToken }] = useCookies();

  const {
    form: { setTouched, setFieldValue },
  } = props;
  const { error, helperText, ...field } = fieldToTextField(props);
  const { name } = field;

  useEffect(() => {
    getSite();
  }, []);

  const getSite = async () => {
    let response = await fetch("/api/master/period/dropdownsite", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    console.log("up---", response.result);
    setDataSite(response.result);
  };

  const handleSiteChange = (value) => {
    props.onSelectSite(value);
  };

  return (
    // <Autocomplete
    //   options={dataSite}
    //   key="site-dropdown"
    //   value={props.site}
    //   getOptionLabel={(option) =>
    //     option.siteName ? option.siteId + " - " + option.siteName : ""
    //   }
    //   onChange={(e, value) => {
    //     handleSiteChange(value);
    //   }}
    //   noOptionsText="No results"
    //   renderInput={(params) => (
    //     <TextField
    //       {...params}
    //       label="Site Name"
    //       variant="standard"
    //       color="dark"
    //     />
    //   )}
    // />

    <Autocomplete
      {...props}
      {...field}
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
