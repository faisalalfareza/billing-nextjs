import * as React from "react";
import Box from "@mui/material/Box";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import Checkbox from "@mui/material/Checkbox";

export default function Roles(props) {
  const [state, setState] = React.useState({
    gilad: true,
    jason: false,
    antoine: false,
  });

  const handleChange = (event) => {
    setState({
      ...state,
      [event.target.name]: event.target.checked,
    });
  };

  const { gilad, jason, antoine } = state;
  const error = [gilad, jason, antoine].filter((v) => v).length !== 2;

  const fetchData = async (data) => {
    // Block.standard(`.${usersBlockLoadingName}`, `Getting Users Data`),
    //   setLoading(true);
    // const { scheme, keywords, recordsPerPage, skipCount } = customerRequest;
    // let response = await fetch("/api/user-management/users/getall", {
    //   method: "POST",
    //   body: JSON.stringify({
    //     accessToken: accessToken,
    //     params: {
    //       SiteId: site?.siteId,
    //       MaxResultCount: recordsPerPage,
    //       SkipCount: skipCount,
    //       Search: keywords,
    //     },
    //   }),
    // });
    // if (!response.ok) throw new Error(`Error: ${response.status}`);
    // response = typeNormalization(await response.json());
    // if (response.error)
    //   alertService.error({ title: "Error", text: response.error.message });
    // else {
    //   let data = response.result;
    //   const list = [];
    //   data.items.map((e, i) => {
    //     list.push({
    //       no: skipCount + i + 1,
    //       userName: e.userName,
    //       name: e.name,
    //       surname: e.surname,
    //       roles: e.roleNames.join(", "),
    //       email: e.emailAddress,
    //       bank: e.bank,
    //       isActive: e.isActive,
    //       lastLogin: e.lastLoginTime
    //         ? dayjs(e.lastLoginTime).format("DD MMMM YYYY")
    //         : "-",
    //       createDate: e.creationTime
    //         ? dayjs(e.creationTime).format("DD MMMM YYYY")
    //         : "-",
    //       action: e,
    //     });
    //   });
    //   setCustomerResponse((prevState) => ({
    //     ...prevState,
    //     rowData: list,
    //     totalRows: data.totalCount,
    //     totalPages: Math.ceil(data.totalCount / customerRequest.recordsPerPage),
    //   }));
    // }
    // Block.remove(`.${usersBlockLoadingName}`), setLoading(false);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <FormControl sx={{ m: 3 }} component="fieldset" variant="standard">
        <FormLabel component="legend">Assign responsibility</FormLabel>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox checked={gilad} onChange={handleChange} name="gilad" />
            }
            label="Gilad Gray"
          />
          <FormControlLabel
            control={
              <Checkbox checked={jason} onChange={handleChange} name="jason" />
            }
            label="Jason Killian"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={antoine}
                onChange={handleChange}
                name="antoine"
              />
            }
            label="Antoine Llorca"
          />
        </FormGroup>
        <FormHelperText>Be careful</FormHelperText>
      </FormControl>
      <FormControl
        required
        error={error}
        component="fieldset"
        sx={{ m: 3 }}
        variant="standard"
      >
        <FormLabel component="legend">Pick two</FormLabel>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox checked={gilad} onChange={handleChange} name="gilad" />
            }
            label="Gilad Gray"
          />
          <FormControlLabel
            control={
              <Checkbox checked={jason} onChange={handleChange} name="jason" />
            }
            label="Jason Killian"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={antoine}
                onChange={handleChange}
                name="antoine"
              />
            }
            label="Antoine Llorca"
          />
        </FormGroup>
        <FormHelperText>You can display an error</FormHelperText>
      </FormControl>
    </Box>
  );
}
