import React, { useState } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDButton from "/components/MDButton";
import DataTable from "/layout/Tables/DataTable";
import { useEffect } from "react";
import { useCookies } from "react-cookie";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import getConfig from "next/config";

export default function ViewLogo(props) {
  const { isOpen, params, close } = props;
  const [modal, setModal] = useState(isOpen);
  const [isImage, setIsImage] = useState(false);
  const [{ accessToken, encryptedAccessToken }] = useCookies();

  const { publicRuntimeConfig } = getConfig();

  useEffect(() => {}, [params]);
  const toggle = () => setModal(!modal);

  const closeBtn = (
    <IconButton onClick={close} aria-label="close">
      <CloseIcon />
    </IconButton>
  );
  return (
    <Modal
      isOpen={modal}
      toggle={toggle}
      {...props}
      backdrop="false"
      keyboard="true"
      size="lg"
    >
      <ModalHeader toggle={toggle} close={closeBtn}>
        <MDBox mb={1}>
          <MDTypography variant="h5">
            View Logo `{params?.siteName}`
          </MDTypography>
        </MDBox>
      </ModalHeader>
      <ModalBody>
        <MDBox component="img" src={params?.logo} alt={params?.siteName} />
      </ModalBody>
      <ModalFooter>
        <MDButton variant="outlined" color="secondary" onClick={close}>
          Cancel
        </MDButton>
      </ModalFooter>
    </Modal>
  );
}
