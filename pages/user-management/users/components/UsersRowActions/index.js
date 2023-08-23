import { useState } from "react";
import PropTypes from "prop-types";

import Icon from "@mui/material/Icon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import MDBox from "/components/MDBox";
import MDButton from "/components/MDButton";
import Swal from "sweetalert2";
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
  const confirmDelete = () => {
    Swal.fire({
      title: "Delete User",
      text:
        "Are you sure to delete " +
        record.siteName +
        "? this will remove it permanently from their related user.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        handleDelete(record);
      }
    });
  };

  const handleDelete = async (record) => {
    let response = await fetch("/api/user-management/users/delete", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
        params: {
          Id: record.id,
        },
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
      alertService.success({
        title: "Successfully deleted",
      });
    }
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
          <MenuItem onClick={confirmDelete}>Delete</MenuItem>
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
