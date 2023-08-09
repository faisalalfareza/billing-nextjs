import React, { useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { FileUpload } from "primereact/fileupload";
import { ProgressBar } from "primereact/progressbar";
import { Button } from "primereact/button";
import { Tooltip } from "primereact/tooltip";
import { Tag } from "primereact/tag";
import { useCookies } from "react-cookie";
import { alertService } from "/helpers";

export default function UploadImage() {
  const [{ accessToken, encryptedAccessToken }] = useCookies();
  const toast = useRef(null);
  const [totalSize, setTotalSize] = useState(0);
  const fileUploadRef = useRef(null);

  const onTemplateSelect = (e) => {
    let _totalSize = totalSize;
    let files = e.files;

    Object.keys(files).forEach((key) => {
      _totalSize += files[key].size || 0;
    });

    setTotalSize(_totalSize);
  };

  const onTemplateUpload = (e) => {
    console.log("upload", e);
    let _totalSize = 0;

    e.files.forEach((file) => {
      _totalSize += file.size || 0;
    });
    if (e.xhr) {
      console.log("xhr", e.xhr.response);
      let response = JSON.parse(e.xhr.response);
      if (response.success) {
      } else {
        alertService.error({ title: "Error", text: response.error.message });
      }
    }
    setTotalSize(_totalSize);
    toast.current.show({
      severity: "info",
      summary: "Success",
      detail: "File Uploaded",
    });
  };

  const onTemplateRemove = (file, callback) => {
    setTotalSize(totalSize - file.size);
    callback();
  };

  const onTemplateClear = () => {
    setTotalSize(0);
  };

  const headerTemplate = (options) => {
    const { className, chooseButton, uploadButton, cancelButton } = options;
    const value = totalSize / 10000;
    const formatedValue =
      fileUploadRef && fileUploadRef.current
        ? fileUploadRef.current.formatSize(totalSize)
        : "0 B";

    return (
      <div
        className={className}
        style={{
          backgroundColor: "transparent",
          display: "flex",
          alignItems: "center",
        }}
      >
        {chooseButton}
        {uploadButton}
        {cancelButton}
        <div className="flex align-items-center gap-3 ml-auto">
          <span>{formatedValue} / 1 MB</span>
          <ProgressBar
            value={value}
            showValue={false}
            style={{ width: "10rem", height: "12px" }}
          ></ProgressBar>
        </div>
      </div>
    );
  };

  const itemTemplate = (file, props) => {
    return (
      <div className="flex align-items-center flex-wrap">
        <div className="flex align-items-center" style={{ width: "40%" }}>
          <img
            alt={file.name}
            role="presentation"
            src={file.objectURL}
            width={100}
          />
          <span className="flex flex-column text-left ml-3">
            {file.name}
            <small>{new Date().toLocaleDateString()}</small>
          </span>
        </div>
        <Tag
          value={props.formatSize}
          severity="warning"
          className="px-3 py-2"
        />
        <Button
          type="button"
          icon="pi pi-times"
          className="p-button-outlined p-button-rounded p-button-danger ml-auto"
          onClick={() => onTemplateRemove(file, props.onRemove)}
        />
      </div>
    );
  };

  const emptyTemplate = () => {
    return (
      <div className="flex align-items-center flex-column">
        <i
          className="pi pi-image mt-3 p-5"
          style={{
            fontSize: "5em",
            borderRadius: "50%",
            backgroundColor: "var(--surface-b)",
            color: "var(--surface-d)",
          }}
        ></i>
        <span
          style={{ fontSize: "1.2em", color: "var(--text-color-secondary)" }}
          className="my-5"
        >
          Drag and Drop Image Here
        </span>
      </div>
    );
  };

  const chooseOptions = {
    icon: "pi pi-fw pi-images",
    iconOnly: true,
    className: "custom-choose-btn p-button-rounded p-button-outlined",
  };
  const uploadOptions = {
    icon: "pi pi-fw pi-cloud-upload",
    iconOnly: true,
    className:
      "custom-upload-btn p-button-success p-button-rounded p-button-outlined",
  };
  const cancelOptions = {
    icon: "pi pi-fw pi-times",
    iconOnly: true,
    className:
      "custom-cancel-btn p-button-danger p-button-rounded p-button-outlined",
  };

  const uploadHandle = async () => {
    let response = await fetch("/api/master/site/getlistmastersite", {
      method: "POST",
      body: JSON.stringify({
        accessToken: accessToken,
        params: {
          MaxResultCount: 1000,
          SkipCount: 0,
        },
      }),
    });
  };

  const onTemplateBeforeSend = (e) => {
    console.log("onTemplateBeforeSend", e);
    let at =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjIiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiYWRtaW4iLCJBc3BOZXQuSWRlbnRpdHkuU2VjdXJpdHlTdGFtcCI6IjliOGI4ODA3LTVmNTEtNDg1OC1hMjllLTU1OTUwNTNjMThmMCIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6WyIwNDg0Yzg0MmVkODM0MTU0YjM0YzRjZmUyNjFjY2QxOSIsIjIyYWM4ZmEwMDI0NDQzOWQ4NmQwMjM0ZDFmOWFmYzA5IiwiNmM4MjI4ZTFiMjA1NDM1YThmZTY0MTIzMTY2NGVlNzYiLCJhY2RkMDEzNjA3ZjA0ZGNlODgxMGY5MTBhYWRmOGJkMSIsImI5NDYzMTM4OThmNzQxYmFiNjU1YTUyYjhlYmQwNTgyIiwiMTFiOGUzOTlhZmQxNGQwNjlmNDJmYWIwZjJmMmM1ZDQiLCJBZG1pbiIsIjM3YzBhZWUzNTY1ODQyMDNhYTQxZTc2MzhhNWNiNDFiIiwiMTQxYjFmYzcyMzEyNGI0MWEwMGI4YjVmNGExNDlkMDciXSwiaHR0cDovL3d3dy5hc3BuZXRib2lsZXJwbGF0ZS5jb20vaWRlbnRpdHkvY2xhaW1zL3RlbmFudElkIjoiMSIsInN1YiI6IjIiLCJqdGkiOiI2OTlkMjk1YS1jMGNlLTQ4ZGQtOTI0Ny00ZDYzYjgwNGJkNTgiLCJpYXQiOjE2OTExMzQ0ODUsIm5iZiI6MTY5MTEzNDQ4NSwiZXhwIjoxNjkxMjIwODg1LCJpc3MiOiJEZW1vIiwiYXVkIjoiRGVtbyJ9.HXCh3iXut6Xm5vM9-ZPUU1N684RqcEO5yH7MM2Ahpx8";
    e.xhr.setRequestHeader("Authorization", "Bearer " + accessToken);
  };

  return (
    <div>
      <Toast ref={toast}></Toast>

      <Tooltip target=".custom-choose-btn" content="Choose" position="bottom" />
      <Tooltip target=".custom-upload-btn" content="Upload" position="bottom" />
      <Tooltip target=".custom-cancel-btn" content="Clear" position="bottom" />

      <FileUpload
        ref={fileUploadRef}
        name="photo"
        url="http://18.140.60.145:1010/api/services/app/MasterBilling/ProsesUploadImage"
        // multiple
        accept="html/*"
        maxFileSize={200000}
        onUpload={onTemplateUpload}
        onSelect={onTemplateSelect}
        onError={onTemplateClear}
        onClear={onTemplateClear}
        headerTemplate={headerTemplate}
        itemTemplate={itemTemplate}
        emptyTemplate={emptyTemplate}
        chooseOptions={chooseOptions}
        uploadOptions={uploadOptions}
        cancelOptions={cancelOptions}
        onBeforeSend={onTemplateBeforeSend}
        // withCredentials="true"
      />
    </div>
  );
}
