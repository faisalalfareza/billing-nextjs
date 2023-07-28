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
      sx={{
        textAlign: "center",
        fontFamily: "Open Sans, sans-serif",
      }}
    >
      <ModalBody sx={{ m: 0 }}>
        <MDBox
          sx={{
            textAlign: "center",
            paddingRight: 5,
            paddingLeft: 5,
            paddingTop: 5,
          }}
        >
          <MDBox component="img" src={logoQuestion.src} width={"50%"} />
          <MDTypography
            variant="h5"
            style={{ fontFamily: "Open Sans, sans-serif" }}
          >
            Are you sure?
          </MDTypography>
          <MDTypography variant="body">
            Are you sure want to make another adjustment?
          </MDTypography>
        </MDBox>
      </ModalBody>
      <ModalFooter>
        <MDBox
          sx={{
            justifyContent: "center",
            fontFamily: "Open Sans, sans-serif",
          }}
        >
          <MDButton
            color="secondary"
            onClick={noAction}
            style={{ marginRight: 7, fontFamily: "Open Sans, sans-serif" }}
          >
            No
          </MDButton>
          <MDButton
            color="primary"
            onClick={yesAction}
            style={{ fontFamily: "Open Sans, sans-serif" }}
          >
            Yes
          </MDButton>
        </MDBox>
      </ModalFooter>
    </Modal>
  );
}
