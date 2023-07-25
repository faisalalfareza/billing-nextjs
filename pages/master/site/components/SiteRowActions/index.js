import { useState } from "react";
import { useCookies } from "react-cookie";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import axios from "axios";

import Icon from "@mui/material/Icon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import getConfig from "next/config";

import MDBox from "/components/MDBox";
import MDButton from "/components/MDButton";

const { publicRuntimeConfig } = getConfig();

function SiteRowActions({ record, openModalonEdit, onDeleted }) {
  const [{ accessToken, encryptedAccessToken }] = useCookies();
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
      title: "Delete Company Site",
      text:
        "Are you sure to delete " +
        record.siteName +
        "? this will remove it permanently from their related company.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        deleteSite(record);
      }
    });
  };
  const handleDelete = async (record) => {
    const url = `${publicRuntimeConfig.apiUrl}/api/services/app/Site/DeleteSite`;
    const config = {
      headers: { Authorization: "Bearer " + accessToken },
      params: {
        coCode: record.coCode,
        officerName: record.officerName,
      },
    };

    axios.delete(url, config).then((res) => {
      Swal.fire({
        title: "Site Deleted",
        text:
          "Site " +
          record.siteName +
          " has been deleted from " +
          record.coName +
          ".",
        icon: "success",
        showConfirmButton: true,
        timerProgressBar: true,
        timer: 3000,
      }).then(() => setTimeout(() => onDeleted(), 0));
    });
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

// Setting default value for the props of SiteRowActions
SiteRowActions.defaultProps = {
  record: undefined,
};

// Typechecking props for the SiteRowActions
SiteRowActions.propTypes = {
  record: PropTypes.any.isRequired,
  openModalonEdit: PropTypes.func,
  onDeleted: PropTypes.func,
};

export default SiteRowActions;
