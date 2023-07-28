import { useMemo, useEffect, useState, useRef } from "react";

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// react-table components
import {
  useTable,
  usePagination,
  useGlobalFilter,
  useAsyncDebounce,
  useSortBy,
} from "react-table";

// regenerator-runtime
import "regenerator-runtime/runtime.js";

// @mui material components
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Icon from "@mui/material/Icon";
import Autocomplete from "@mui/material/Autocomplete";

// NextJS Material Dashboard 2 PRO components
import MDBox from "../../../components/MDBox";
import MDTypography from "../../../components/MDTypography";
import MDInput from "../../../components/MDInput";
import MDPagination from "../../../components/MDPagination";

// NextJS Material Dashboard 2 PRO examples
import DataTableHeadCell from "./DataTableHeadCell";
import DataTableBodyCell from "./DataTableBodyCell";

function DataTable({
  title,
  description,
  canEntriesPerPage,
  entriesPerPage,
  canSearch,
  serverSideSearch,
  showTotalEntries,
  table,
  pagination,
  isSorted,
  noEndBorder,

  manualPagination,
  totalRows,
  totalPages,
  recordsPerPage,
  skipCount,
  pageChangeHandler,
  recordsPerPageChangeHandler,
  keywordsChangeHandler,
}) {
  const defaultValue = entriesPerPage.defaultValue
    ? entriesPerPage.defaultValue
    : 10;
  const entries = entriesPerPage.entries
    ? entriesPerPage.entries.map((el) => el.toString())
    : ["5", "10", "15", "20", "25"];
  const columns = useMemo(() => table.columns, [table]);
  const data = useMemo(() => table.rows, [table]);

  const currentPage = manualPagination
    ? skipCount > 0
      ? Math.ceil(skipCount / recordsPerPage)
      : 0
    : 0;

  const tableInstance = useTable(
    manualPagination
      ? {
          columns,
          data,
          initialState: {
            pageIndex: currentPage,
            pageSize: recordsPerPage,
          },
          manualPagination: manualPagination,
          pageCount: totalPages,
        }
      : {
          columns,
          data,
          initialState: {
            pageIndex: 0,
          },
        },
    useGlobalFilter,
    useSortBy,
    usePagination
  );
  const previousPageCustom = () => {
    if (manualPagination) pageChangeHandler(skipCount - recordsPerPage);
    else previousPage();
  };
  const nextPageCustom = () => {
    if (manualPagination) pageChangeHandler(skipCount + recordsPerPage);
    else nextPage();
  };
  const navigatePageCustom = (option) => {
    if (manualPagination) {
      const param =
        Number(option) > 0 ? Math.ceil(Number(option) * recordsPerPage) : 0;
      pageChangeHandler(param);
    } else gotoPage(Number(option));
  };
  const searchCustom = (value, key = undefined) => {
    setSearch(value);
    if (!manualPagination) onSearchChange(value);
    if (manualPagination && key == "Enter") {
      keywordsChangeHandler(value);
      navigatePageCustom(0);
    }
  };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    rows,
    page,
    pageOptions,
    canPreviousPage,
    canNextPage,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    setGlobalFilter,
    state: { pageIndex, pageSize, globalFilter },
  } = tableInstance;

  // Set the default value for the entries per page when component mounts
  useEffect(() => {
    setPageSize(defaultValue || 10);
  }, [defaultValue, setPageSize]);

  // Set the entries per page value based on the select value
  const setEntriesPerPage = (value) => {
    setPageSize(value);
    if (manualPagination) {
      recordsPerPageChangeHandler(value);
      navigatePageCustom(0);
    }
  };

  // Render the paginations
  const renderPagination = pageOptions.map((option) => (
    <MDPagination
      item
      key={option}
      onClick={() => navigatePageCustom(option)}
      active={pageIndex === option}
    >
      {option + 1}
    </MDPagination>
  ));

  // Handler for the input to set the pagination index
  const handleInputPagination = ({ target: { value } }) =>
    value > pageOptions.length || value < 0
      ? navigatePageCustom(0) /* gotoPage(0) */
      : navigatePageCustom(value); /* gotoPage(Number(value)); */

  // Customized page options starting from 1
  const customizedPageOptions = pageOptions.map((option) => option + 1);

  // Setting value for the pagination input
  const handleInputPaginationValue = ({ target: value }) =>
    navigatePageCustom(value.value - 1); /* gotoPage(Number(value.value - 1)) */

  // Search input value state
  const [search, setSearch] = useState(globalFilter);

  // Search input state handle
  const onSearchChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined);
  }, 100);

  // A function that sets the sorted value for the table
  const setSortedValue = (column) => {
    let sortedValue;

    if (isSorted && column.isSorted) {
      sortedValue = column.isSortedDesc ? "desc" : "asce";
    } else if (isSorted) {
      sortedValue = "none";
    } else {
      sortedValue = false;
    }

    return sortedValue;
  };

  // Setting the entries starting point
  const entriesStart =
    pageIndex === 0 ? pageIndex + 1 : pageIndex * pageSize + 1;

  // Setting the entries ending point
  let entriesEnd;

  if (pageIndex === 0) {
    entriesEnd = pageSize;
  } else if (pageIndex === pageOptions.length - 1) {
    entriesEnd = rows.length;
  } else {
    entriesEnd = pageSize * (pageIndex + 1);
  }

  const isActions =
    title || description || (canEntriesPerPage && entriesPerPage) || canSearch;

  const [width, setWidth] = useState();

  // useRef allows us to "store" the div in a constant,
  // and to access it via observedDiv.current
  const observedDiv = useRef(null);

  useEffect(
    () => {
      if (!observedDiv.current) {
        // we do not initialize the observer unless the ref has
        // been assigned
        return;
      }

      // we also instantiate the resizeObserver and we pass
      // the event handler to the constructor
      const resizeObserver = new ResizeObserver(() => {
        if (observedDiv.current && (observedDiv.current.offsetWidth !== width)) {
          setWidth(observedDiv.current.offsetWidth);
        }
      });

      // the code in useEffect will be executed when the component
      // has mounted, so we are certain observedDiv.current will contain
      // the div we want to observe
      resizeObserver.observe(observedDiv.current);

      // if useEffect returns a function, it is called right before the
      // component unmounts, so it is the right place to stop observing
      // the div
      return function cleanup() {
        resizeObserver.disconnect();
      };
    },
    // only update the effect if the ref element changed
    [observedDiv.current]
  );

  return (
    <TableContainer sx={{ boxShadow: "none" }}>
      {isActions ? (
        <MDBox
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          p={3}
          sx={{
            width: width,
          }}
        >
          {(title || description) && (
            <MDBox>
              {title && (
                <MDBox>
                  <MDTypography variant="h5">{title}</MDTypography>
                </MDBox>
              )}
              {description && (
                <MDBox>
                  <MDTypography variant="button" color="text">
                    {description}
                  </MDTypography>
                </MDBox>
              )}
            </MDBox>
          )}
          {!title && canEntriesPerPage && entriesPerPage && (
            <MDBox display="flex" alignItems="center">
              <Autocomplete
                disableClearable
                value={pageSize.toString()}
                options={entries}
                onChange={(event, newValue) =>
                  setEntriesPerPage(parseInt(newValue, 10))
                }
                // size="small"
                sx={{ width: "5rem" }}
                renderInput={(params) => <MDInput {...params} />}
              />
              <MDTypography variant="caption" color="secondary">
                &nbsp;&nbsp;entries per page
              </MDTypography>
            </MDBox>
          )}
          {canSearch && (
            <MDBox width="20.5rem" ml="auto">
              <MDInput
                placeholder={
                  pageOptions.length > 0
                    ? `Search${
                        manualPagination && serverSideSearch
                          ? " from " +
                            totalRows +
                            " entries. Press enter to submit ~"
                          : " from " + rows.length + " entries ~"
                      }`
                    : `Search ...`
                }
                label="Search here"
                // label={`Search by${
                //   serverSideSearch != false && serverSideSearch.length > 0
                //     ? " " + serverSideSearch.join(", ").toString()
                //     : " keywords"
                // }`}
                value={search}
                // size="small"
                fullWidth
                onChange={({ currentTarget }) =>
                  searchCustom(currentTarget.value)
                }
                onKeyPress={({ key }) => searchCustom(search, key)}
              />
            </MDBox>
          )}
        </MDBox>
      ) : null}
      <Table
        {...getTableProps()}
        sx={{ marginTop: isActions ? 0 : 2 }}
        ref={observedDiv}
        id="table-data"
      >
        <MDBox component="thead">
          {headerGroups.map((headerGroup, key) => (
            <TableRow key={key} {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column, key) => (
                <DataTableHeadCell
                  key={key}
                  {...column.getHeaderProps(
                    isSorted && column.getSortByToggleProps()
                  )}
                  // width="auto"
                  // width={column.width ? column.width : "auto"}
                  align={column.align ? column.align : "left"}
                  sorted={setSortedValue(column)}
                >
                  {column.render("Header")}
                </DataTableHeadCell>
              ))}
            </TableRow>
          ))}
        </MDBox>
        <TableBody {...getTableBodyProps()}>
          {page.map((row, key) => {
            prepareRow(row);
            return (
              <TableRow key={key} {...row.getRowProps()}>
                {row.cells.map((cell) => (
                  <DataTableBodyCell
                    key={key}
                    width={cell.column.customWidth ? cell.column.customWidth : "max-content"}
                    noBorder={noEndBorder && rows.length - 1 === key}
                    align={cell.column.align ? cell.column.align : "left"}
                    {...cell.getCellProps()}
                  >
                    {cell.render("Cell")}
                  </DataTableBodyCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <MDBox
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        p={!showTotalEntries && pageOptions.length === 1 ? 0 : 3}
      >
        {showTotalEntries && (
          <MDBox mb={{ xs: 3, sm: 0 }}>
            <MDTypography
              variant="button"
              color="secondary"
              fontWeight="regular"
            >
              Showing {entriesStart} to {entriesEnd} of{" "}
              {manualPagination ? totalRows : rows.length} entries
            </MDTypography>
          </MDBox>
        )}
        {pageOptions.length > 1 && (
          <MDPagination
            variant={pagination.variant ? pagination.variant : "gradient"}
            color={pagination.color ? pagination.color : "dark"}
          >
            {canPreviousPage && (
              <MDPagination
                item
                onClick={() => previousPageCustom() /* previousPage() */}
              >
                <Icon sx={{ fontWeight: "bold" }}>chevron_left</Icon>
              </MDPagination>
            )}
            {renderPagination.length > 6 ? (
              <MDBox width="5rem" mx={1}>
                <MDInput
                  inputProps={{
                    type: "number",
                    min: 1,
                    max: customizedPageOptions.length,
                  }}
                  value={customizedPageOptions[pageIndex]}
                  onChange={(handleInputPagination, handleInputPaginationValue)}
                />
              </MDBox>
            ) : (
              renderPagination
            )}
            {canNextPage && (
              <MDPagination
                item
                onClick={() => nextPageCustom() /* nextPage() */}
              >
                <Icon sx={{ fontWeight: "bold" }}>chevron_right</Icon>
              </MDPagination>
            )}
          </MDPagination>
        )}
      </MDBox>
    </TableContainer>
  );
}

// Setting default values for the props of DataTable
DataTable.defaultProps = {
  title: "",
  description: "",
  canEntriesPerPage: false,
  // entriesPerPage: { defaultValue: 10, entries: [5, 10, 15, 20, 25] },
  entriesPerPage: false,
  canSearch: false,
  serverSideSearch: false,
  showTotalEntries: true,
  pagination: { variant: "gradient", color: "dark" },
  isSorted: false,
  noEndBorder: true,

  manualPagination: false,
  totalRows: 0,
  totalPages: 0,
  recordsPerPage: 10,
  skipCount: 0,
};

// Typechecking props for the DataTable
DataTable.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  canEntriesPerPage: PropTypes.bool,
  entriesPerPage: PropTypes.oneOfType([
    PropTypes.shape({
      defaultValue: PropTypes.number,
      entries: PropTypes.arrayOf(PropTypes.number),
    }),
    PropTypes.bool,
  ]),
  canSearch: PropTypes.bool,
  serverSideSearch: PropTypes.oneOfType([PropTypes.array, PropTypes.bool]),
  showTotalEntries: PropTypes.bool,
  table: PropTypes.objectOf(PropTypes.array).isRequired,
  pagination: PropTypes.shape({
    variant: PropTypes.oneOf(["contained", "gradient"]),
    color: PropTypes.oneOf([
      "primary",
      "secondary",
      "info",
      "success",
      "warning",
      "error",
      "dark",
      "light",
    ]),
  }),
  isSorted: PropTypes.bool,
  noEndBorder: PropTypes.bool,

  manualPagination: PropTypes.bool,
  totalRows: PropTypes.number,
  totalPages: PropTypes.number,
  recordsPerPage: PropTypes.number,
  skipCount: PropTypes.number,
  pageChangeHandler: PropTypes.func,
  recordsPerPageChangeHandler: PropTypes.func,
  keywordsChangeHandler: PropTypes.func,
};

export default DataTable;
