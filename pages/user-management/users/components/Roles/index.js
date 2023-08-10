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

export default function Roles({ formData, onSelectRoles }) {
  const [{ accessToken, encryptedAccessToken }] = useCookies();
  const [loading, setLoading] = useState(false);
  const [listRole, setListRoles] = useState([]);
  const { formField, values, errors, touched, setFieldValue } = formData;
  const { roles } = formField;
  const { roles: rolesV } = values;
  const [selectedRoles, setSelectedRoles] = useState(rolesV);

  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    // const result = listRole.filter(role => selectedRoles.includes(role.id));
    setFieldValue("roles", selectedRoles);
  }, [selectedRoles]);
  const error = selectedRoles.filter((v) => v).length < 1;

  const rolesBlockLoadingName = "block-roles";
  const fetchData = async (subs) => {
    Block.standard(`.${rolesBlockLoadingName}`, `Getting Roles`),
      setLoading(true);
    let response = await fetch("/api/user-management/users/getroles", {
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
      let data = response.result.items;
      setListRoles(data);
    }
    Block.remove(`.${rolesBlockLoadingName}`), setLoading(false);
  };

  const onCategoryChange = (e) => {
    const { id, checked } = e.target;
    console.log(`onCategoryChange`, e.target);
    setSelectedRoles([...selectedRoles, +id]);
    if (!checked) {
      setSelectedRoles(selectedRoles.filter((item) => item !== +id));
    }
  };

  return (
    <Card sx={{ p: 2, width: "100%", mt: 2 }}>
      <Grid container alignItems="center" spacing={2}>
        <Grid item xs={12}>
          <MDBox>
            <MDTypography variant="body">Create New Users</MDTypography>
            <MDTypography variant="caption" ml={2}>
              - Let&prime;s start with the basic information
            </MDTypography>
          </MDBox>
        </Grid>
        <FormControl
          required
          error={error}
          component="fieldset"
          sx={{ m: 3 }}
          variant="standard"
          name={roles.name}
          value={rolesV}
        >
          <FormGroup>
            {listRole.map((e, i) => {
              return (
                <FormControlLabel
                  key={i}
                  control={
                    <Checkbox
                      id={e.id.toString()}
                      name={e.name}
                      value={e}
                      onChange={onCategoryChange}
                      checked={selectedRoles.includes(e.id)}
                    />
                  }
                  label={e.name}
                />
              );
            })}
          </FormGroup>
          <FormHelperText>Choose minimal 1 role</FormHelperText>
        </FormControl>
      </Grid>
    </Card>
  );
}
