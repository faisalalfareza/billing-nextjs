import React, { useState } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import MDBox from "/components/MDBox";
import MDTypography from "/components/MDTypography";
import MDButton from "/components/MDButton";
import { useCookies } from "react-cookie";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import logoQuestion from "/assets/images/question-answer.svg";

export default function Adjust(props) {
  const { isOpen, parentCallback, close } = props;
  const [modal, setModal] = useState(isOpen);
  const [{ accessToken, encryptedAccessToken }] = useCookies();

  const toggle = () => setModal(!modal);
  const yesAction = () => {
    parentCallback(true);
    close();
  };
  const noAction = () => {
    parentCallback(false);
    close();
  };

  const closeBtn = (
    <IconButton onClick={noAction} aria-label="close">
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
      <ModalBody sx={{ m: 0 }}>
        <MDBox sx={{ textAlign: "center" }}>
          <MDBox component="img" src={logoQuestion.src} width={"50%"} />
          <MDTypography variant="h5">Are you sure?</MDTypography>
          <MDTypography variant="body">
            Are you sure want to make another adjustment?
          </MDTypography>
        </MDBox>
      </ModalBody>
      <ModalFooter>
        <MDButton color="secondary" onClick={noAction}>
          No
        </MDButton>
        <MDButton color="primary" onClick={yesAction}>
          Yes
        </MDButton>
      </ModalFooter>
    </Modal>
  );
}
