import * as React from "react";
import {
  styled,
  Box,
  Popper,
  Checkbox,
  TextField,
  Autocomplete,
  Divider,
  ClickAwayListener,
  AutocompleteCloseReason,
} from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const PopperStyledComponent = styled(Popper)(({ theme }) => ({
  border: `1px solid ${
    theme.palette.mode === "light" ? "rgba(149, 157, 165, 0.2)" : "rgb(1, 4, 9)"
  }`,
}));

export default function ClusterMultiSelect(props: any) {
  const 
  {
    items,
  selectedValues,
  label,
  placeholder,
  selectAllLabel,
  noOptionsText,
  limitTags,
  onToggleOption,
  onClearOptions,
  onSelectAll,
  getOptionLabel
  }=props;
  const [value, setValue] = React.useState([]);
  const [checkAll, setCheckAll] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const checkAllChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCheckAll(event.target.checked);
    if (event.target.checked) {
      setValue(items);
    } else {
      setValue([]);
    }
  };

  const handleClickAway = (e) => {
    console.log("Handle Click Away");
    setOpen(false);
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box>
        <Autocomplete
          multiple
          disableCloseOnSelect
          limitTags={3}
          id="checkboxes-tags-demo"
          options={items}
          value={value}
          open={open}
          onChange={(event, newValue, reason) => {
            if (reason === "selectOption") {
              setValue(newValue);
            } else if (reason === "removeOption") {
              setCheckAll(false);
              setValue(newValue);
            } else if (reason === "clear") {
              setValue([]);
              setCheckAll(false);
            }
          }}
          onClose={(e: any, reason: AutocompleteCloseReason) => {
            console.log("On Close: ", reason);
            if (reason === "escape") {
              setOpen(false);
            }
          }}
          onOpen={() => {
            setOpen(true);
          }}
          PopperComponent={(param) => (
            <PopperStyledComponent {...param}>
              <Box {...param} />
              <Divider />
              <Box
                sx={{
                  backgroundColor: "white",
                  height: "45px",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
              >
                <Checkbox
                  checked={checkAll}
                  onChange={checkAllChange}
                  id="check-all"
                  sx={{ marginRight: "8px" }}
                  onMouseDown={(e) => e.preventDefault()}
                />
                Select All
              </Box>
            </PopperStyledComponent>
          )}
          getOptionLabel={getOptionLabel}
          renderOption={(props, option, { selected }) => (
            <li {...props}>
              <Checkbox
                icon={icon}
                checkedIcon={checkedIcon}
                style={{ marginRight: 8 }}
                checked={selected || checkAll}
              />
              {getOptionLabel(option)}
            </li>
          )}
          style={{ width: "100%" }}
          renderInput={(params) => (
            <TextField {...params} label={label} placeholder={placeholder} variant="standard" InputLabelProps={{ shrink: true }} />
          )}
        />
      </Box>
    </ClickAwayListener>
  );
}
