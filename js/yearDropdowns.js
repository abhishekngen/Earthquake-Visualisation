export const yearDropdowns = (parent, onOptionSelectedYearStart, onOptionSelectedYearEnd, props) => {
    const {
        yearStartOptionsList,
        yearEndOptionsList,
    } = props;

    // Update options for start year dropdown, removing any options that are invalid (i.e. years that occur after the currently selected end year)
    const yearStartSelect = parent.select('#yearStart');
    const yearStartOptions = yearStartSelect.selectAll('option').data(yearStartOptionsList, d => d);
    yearStartOptions.enter().append('option')
        .merge(yearStartOptions)
        .attr('value', d => d)
        .text(d => d);
    yearStartOptions.exit().remove();

    // Update options for end year dropdown, removing any options that are invalid (i.e. years that occur before currently selected start year)
    const yearEndSelect = parent.select('#yearEnd');
    const yearEndOptions = yearEndSelect.selectAll('option').data(yearEndOptionsList, d => d);
    yearEndOptions.enter().append('option')
        .merge(yearEndOptions)
        .attr('value', d => d)
        .text(d => d);
    yearEndOptions.exit().remove();

    // Set on change functions for dropdowns
    yearStartSelect.on('change', onOptionSelectedYearStart);
    yearEndSelect.on('change', onOptionSelectedYearEnd);

  };