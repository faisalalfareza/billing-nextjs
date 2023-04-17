import Swal from "sweetalert2";

export const alertService = {
  success,
  error,
  info,
  warn,
};

const alertType = {
  Success: "success",
  Error: "error",
  Info: "info",
  Warning: "warning",
};

function success(options: any) { Swal.fire({ ...options, icon: alertType.Success }) }
function error(options: any) { Swal.fire({ ...options, icon: alertType.Error }) }
function info(options: any) { Swal.fire({ ...options, icon: alertType.Info }) }
function warn(options: any) { Swal.fire({ ...options, icon: alertType.Warning }) }