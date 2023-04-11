import Autocomplete from "@mui/material/Autocomplete";
import { TextField } from "@mui/material";
import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { typeNormalization } from "/helpers/utils";

export default function SiteDropdown(props) {
  const [dataSite, setDataSite] = useState([]);
  //   const [site, setSite] = useState(null);
  const [{ accessToken, encryptedAccessToken }] = useCookies();

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

    setDataSite(response.result);
  };

  const handleSiteChange = (value) => {
    props.onSelectSite(value);
  };

  return (
    <Autocomplete
      options={dataSite}
      key="site-dropdown"
      value={props.site}
      getOptionLabel={(option) =>
        option.siteName ? option.siteId + " - " + option.siteName : ""
      }
      onChange={(e, value) => {
        handleSiteChange(value);
      }}
      noOptionsText="No results"
      setCustomKey={(option) => option.siteId}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Site Name"
          variant="standard"
          color="dark"
        />
      )}
    />
  );
}
