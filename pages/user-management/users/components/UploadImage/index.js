import React, {useRef, useState} from 'react';
import {Toast} from 'primereact/toast';
import {FileUpload} from 'primereact/fileupload';
import {ProgressBar} from 'primereact/progressbar';
import {Button} from 'primereact/button';
import {Tooltip} from 'primereact/tooltip';
import {Tag} from 'primereact/tag';
import {useCookies} from 'react-cookie';
import {alertService} from '/helpers';
import getConfig from 'next/config';

export default function UploadImage(props) {
  const {max_file_size, pictureUrl, type, url, onSelectImage} = props;
  const {publicRuntimeConfig} = getConfig();
  let megaByte = max_file_size ? max_file_size / 1048576 : 0;
  let urlC = url ? '/api/user-management/users/' + url.toLowerCase() : '';
  // let urlC = url
  //   ? publicRuntimeConfig.apiUrl + '/api/services/app/MasterBilling/' + url
  //   : '';
  const [{accessToken, encryptedAccessToken}] = useCookies();
  const toast = useRef(null);
  const [totalSize, setTotalSize] = useState(0);
  const [imageTemp, setImageTemp] = useState('');
  const fileUploadRef = useRef(null);

  const onTemplateSelect = e => {
    let _totalSize = totalSize;
    let files = e.files;

    Object.keys(files).forEach(key => {
      _totalSize += files[key].size || 0;
    });

    setTotalSize(_totalSize);
  };

  const onTemplateUpload = e => {
    console.log('upload', e);
    let _totalSize = 0;

    e.files.forEach(file => {
      _totalSize += file.size || 0;
    });
    if (e.xhr) {
      console.log('xhr', e.xhr.response);
      let response = JSON.parse(e.xhr.response);
      console.log('response', response);
      let res = response.result;
      if (res.success) {
        let urlTemp =
          publicRuntimeConfig.apiUrl + '/' + pictureUrl + '/' + res.result;
        console.log('urlTemp', urlTemp);
        onSelectImage(res.result);
        setImageTemp(urlTemp);
        toast.current.show({
          severity: 'info',
          summary: 'Success',
          detail: 'File Uploaded',
        });
      } else {
        let err = response.error.error;
        alertService.error({
          title: err.message,
          text: err.details,
        });
      }
    }
    setTotalSize(_totalSize);
  };

  const onTemplateRemove = (file, callback) => {
    setTotalSize(totalSize - file.size);
    callback();
  };

  const onTemplateClear = () => {
    setTotalSize(0);
  };

  const headerTemplate = options => {
    const {className, chooseButton, uploadButton, cancelButton} = options;
    const value = totalSize / 10000;
    const formatedValue =
      fileUploadRef && fileUploadRef.current
        ? fileUploadRef.current.formatSize(totalSize)
        : '0 B';

    return (
      <div
        className={className}
        style={{
          backgroundColor: 'transparent',
          display: 'flex',
          alignItems: 'center',
        }}>
        {chooseButton}
        {uploadButton}
        {cancelButton}
        <div className="flex align-items-center gap-3 ml-auto">
          <span>
            {formatedValue} / {megaByte} MB
          </span>
          <ProgressBar
            value={value}
            showValue={false}
            style={{width: '10rem', height: '12px'}}></ProgressBar>
        </div>
      </div>
    );
  };

  const itemTemplate = (file, props) => {
    return (
      <div className="flex align-items-center flex-wrap">
        <div className="flex align-items-center" style={{width: '40%'}}>
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
        {imageTemp == '' && (
          <>
            <i
              className="pi pi-image mt-3 p-5"
              style={{
                fontSize: '5em',
                borderRadius: '50%',
                backgroundColor: 'var(--surface-b)',
                color: 'var(--surface-d)',
              }}></i>
            <span
              style={{
                fontSize: '1.2em',
                color: 'var(--text-color-secondary)',
              }}
              className="my-5">
              <br />
              Drag and Drop Image Here
            </span>
          </>
        )}
        {imageTemp != '' && (
          <img role="presentation" src={imageTemp} width={100} />
        )}
      </div>
    );
  };

  const chooseOptions = {
    icon: 'pi pi-fw pi-images',
    iconOnly: true,
    className: 'custom-choose-btn p-button-rounded p-button-outlined',
  };
  const uploadOptions = {
    icon: 'pi pi-fw pi-cloud-upload',
    iconOnly: true,
    className:
      'custom-upload-btn p-button-success p-button-rounded p-button-outlined',
  };
  const cancelOptions = {
    icon: 'pi pi-fw pi-times',
    iconOnly: true,
    className:
      'custom-cancel-btn p-button-danger p-button-rounded p-button-outlined',
  };

  const uploadHandle = async () => {
    let response = await fetch('/api/master/site/getlistmastersite', {
      method: 'POST',
      body: JSON.stringify({
        accessToken: accessToken,
        params: {
          MaxResultCount: 1000,
          SkipCount: 0,
        },
      }),
    });
  };

  const onTemplateBeforeSend = e => {
    e.xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
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
        url={urlC}
        // multiple
        accept={type}
        auto
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
      />
    </div>
  );
}
