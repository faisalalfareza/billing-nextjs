import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import Checkbox from "@mui/material/Checkbox";
import { Block } from "notiflix/build/notiflix-block-aio";
import { typeNormalization, capitalizeFirstLetter } from "/helpers/utils";
import { alertService } from "/helpers";
import { useCookies } from "react-cookie";
import MDBox from "components/MDBox";
import Grid from "@mui/material/Grid";
import MDTypography from "/components/MDTypography";
import { Card } from "@mui/material";

export default function Sites({ formData }) {
  const [{ accessToken, encryptedAccessToken }] = useCookies();
  const [loading, setLoading] = useState(false);
  const [listSite, setListSites] = useState([]);
  const { formField, values, errors, touched, setFieldValue, setFieldTouched } =
    formData;
  const { sites } = formField;
  const { sites: sitesV } = values;
  const [selectedSites, setSelectedSites] = useState(sitesV);

  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    setFieldValue("sites", selectedSites);
    setFieldTouched("sites", true);
    console.log(selectedSites);
  }, [selectedSites]);
  const error = selectedSites.filter((v) => v).length < 1;

  const sitesBlockLoadingName = "block-sites";
  const fetchData = async (subs) => {
    Block.standard(`.${sitesBlockLoadingName}`, `Getting Sites`),
      setLoading(true);
    let response = await fetch("/api/user-management/users/getdropdownsite", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
      }),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    response = typeNormalization(await response.json());
    if (response.error)
      alertService.error({
        title: "Error",
        text: response.error.error.message,
      });
    else {
      let data = response.result;
      setListSites(data);
    }
    Block.remove(`.${sitesBlockLoadingName}`), setLoading(false);
  };

  const onCategoryChange = (e) => {
    const { id, checked, name } = e.target;
    console.log(`onCategoryChange`, id);
    setSelectedSites([...selectedSites, id]);
    if (!checked) {
      setSelectedSites(selectedSites.filter((item) => item !== id));
    }
  };

  return (
    <Card sx={{ p: 2, width: "100%", mt: 2 }}>
      <Grid
        container
        alignItems="center"
        spacing={2}
        className={sitesBlockLoadingName}
      >
        <Grid item xs={12}>
          <MDBox>
            <MDTypography variant="body">User Site</MDTypography>
            <MDTypography variant="caption" ml={2}>
              - Assign Site to your account
            </MDTypography>
          </MDBox>
        </Grid>
        <FormControl
          required
          error={error}
          component="fieldset"
          sx={{ m: 3 }}
          variant="standard"
          name={sites.name}
          value={sitesV}
        >
          <FormGroup>
            {listSite.map((e, i) => {
              let name = e.siteId + " - " + e.siteName;
              return (
                <FormControlLabel
                  key={i}
                  control={
                    <Checkbox
                      id={e.siteId.toString()}
                      name={e.siteName}
                      value={e}
                      onChange={onCategoryChange}
                      checked={selectedSites.includes(e.siteId.toString())}
                    />
                  }
                  label={name}
                />
              );
            })}
          </FormGroup>
          <FormHelperText>Choose minimal 1 site</FormHelperText>
        </FormControl>
      </Grid>
    </Card>
  );
}
