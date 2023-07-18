import Autocomplete from "@mui/material/Autocomplete";
import { TextField } from "@mui/material";
import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { typeNormalization } from "/helpers/utils";


export default function SiteDropdown(props) {
  const [{ accessToken, encryptedAccessToken }] = useCookies();
  let [first, setFirst] = useState(false);
  const [dataSite, setDataSite] = useState([]);
  
  useEffect(() => {
    !first && getSite();
    setFirst(true), first = true;
  }, []);

  const getSite = async () => {
    let response = await fetch("/api/master/period/getdropdownsite", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());

    setDataSite(response.result);
  };
  const handleSiteChange = (value) => {
    props.onSelectSite(value);
  };


  return (
    <Autocomplete
      id="site-dropdown"
      
      options={dataSite}
      noOptionsText="No results"
      getOptionLabel={(option) => option.siteName ? (`${option.siteId} - ${option.siteName}`) : ""}
      isOptionEqualToValue={(option, value) => option.siteId === value.siteId}
      key={(option) => option.siteId} value={props.site}
      
      renderInput={(params) => (
        <TextField
          {...params}
          label="Site Name"
          variant="standard"
          sx={{
            label: { color: "#FFFFFF" },
            input: { color: "#FFFFFF" },
            div: { borderBottom: "1px solid #FFFFFF" },
            button: { color: "#FFFFFF" },
          }}
        />
      )}
      onChange={(e, value) => handleSiteChange(value)}
    />
  );
}
