/**
=========================================================
* NextJS Material Dashboard 2 PRO - v2.0.0
=========================================================

* Product Page: https://www.creative-tim.com/product/nextjs-material-dashboard-pro
* Copyright 2022 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useState } from "react";
import Swal from "sweetalert2";

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Icon from "@mui/material/Icon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";

// NextJS Material Dashboard 2 PRO components
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDButton from "/components/MDButton";


function DataTableRowActions({ record, openModalonEdit }) {
  const [menu, setMenu] = useState(false);

  const openMenu = (event) => setMenu(event.currentTarget);
  const closeMenu = () => setMenu(false);

  const editOfficer = () => setTimeout(() => openModalonEdit(record.action), 0);
  const deleteOfficer = () => {
    // const swalWithBootstrapButtons = Swal.mixin({
    //   customClass: {
    //     confirmButton: 'btn btn-success',
    //     cancelButton: 'btn btn-danger'
    //   },
    //   buttonsStyling: false
    // });
    Swal.fire({
      title: 'Delete Company Officer',
      text: "Are you sure to delete "+record.action.officerName+"? this will remove it permanently from their related company.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Officer Deleted',
          text: "Officer "+record.action.officerName+" has been deleted from "+record.action.coName+".",
          icon: 'success',
          showConfirmButton: true,
          timer: 3000,
          timerProgressBar: true,
        })
      }
    })
  };

  return (
    <MDBox display="flex" alignItems="center">
      <MDButton
        variant={menu ? "contained" : "outlined"}
        color="dark" size="small"
        onClick={openMenu}
        aria-haspopup="true"
      >
        Actions&nbsp;
        <Icon>keyboard_arrow_down</Icon>
      </MDButton>
      <Menu
        anchorEl={menu}
        anchorReference={null}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        // transformOrigin={{ vertical: "top", horizontal: "left" }}
        open={Boolean(menu)}
        onClose={closeMenu}
        keepMounted
      >
        <MenuItem onClick={editOfficer}>Edit Officer</MenuItem>
        <Divider sx={{ margin: "0.5rem 0" }} />
        <MenuItem onClick={deleteOfficer}>
          <MDTypography variant="button" color="error" fontWeight="regular">
            Delete Officer
          </MDTypography>
        </MenuItem>
      </Menu>
    </MDBox>
  );
}

// Setting default value for the props of DataTableRowActions
DataTableRowActions.defaultProps = {
  record: undefined,
};

// Typechecking props for the DataTableRowActions
DataTableRowActions.propTypes = {
  record: PropTypes.any.isRequired,
  openModalonEdit: PropTypes.func,
};

export default DataTableRowActions;
