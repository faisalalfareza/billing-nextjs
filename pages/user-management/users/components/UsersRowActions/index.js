import { useState } from "react";
import PropTypes from "prop-types";

import Icon from "@mui/material/Icon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import MDBox from "/components/MDBox";
import MDButton from "/components/MDButton";
function UsersRowActions({ record, openModalonEdit, onDeleted }) {
  let [menu, setMenu] = useState(null);
  const open = Boolean(menu);

  const openMenu = (event) => setMenu(event.currentTarget);
  const closeMenu = () => {
    setMenu(null), (menu = null);
  };

  const handleEdit = () => {
    closeMenu(), setTimeout(() => openModalonEdit(record), 0);
  };

  return (
    <MDBox display="flex" alignItems="center">
      <MDButton
        variant={open ? "contained" : "outlined"}
        color="dark"
        size="small"
        onClick={openMenu}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      >
        Actions&nbsp;
        <Icon>keyboard_arrow_down</Icon>
      </MDButton>
      {open && (
        <Menu
          anchorEl={menu}
          // anchorReference={null}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          open={open}
          onClose={closeMenu}
          // keepMounted
        >
          <MenuItem onClick={handleEdit}>Edit</MenuItem>
        </Menu>
      )}
    </MDBox>
  );
}

// Setting default value for the props of UsersRowActions
UsersRowActions.defaultProps = {
  record: undefined,
};

// Typechecking props for the UsersRowActions
UsersRowActions.propTypes = {
  record: PropTypes.any.isRequired,
  openModalonEdit: PropTypes.func,
  onDeleted: PropTypes.func,
};

export default UsersRowActions;
