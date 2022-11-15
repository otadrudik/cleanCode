// noinspection JSUnusedGlobalSymbols

function renderMultiSelectValueLabelFilter(placeholder, call, dtoIn, transformFunction, isMulti = true, twoLineOptions = true, scheme = "", selectOnlyOne = false) {
  const MultiValueLabel = (props) => {
    return <components.MultiValueLabel {...props}>{props.data.label}</components.MultiValueLabel>;
  };
  const SingleValue = (props) => <components.SingleValue {...props}>{props.data.label}</components.SingleValue>;
  const optionLabel = twoLineOptions ? this.getOptionLabel : null;
  return (
    <NecsMultiSelectDropDownFilter
      call={call}
      placeholder={placeholder}
      dtoIn={dtoIn}
      transform={transformFunction}
      components={{ MultiValueLabel, SingleValue }}
      filterOption={FilterOptionsUtils.getCustomFilter}
      getOptionLabel={optionLabel}
      scheme={scheme}
      isMulti={isMulti}
      selectOnlyOne={selectOnlyOne}
    />
  );
}
