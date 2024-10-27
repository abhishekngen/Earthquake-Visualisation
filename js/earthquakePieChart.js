export const earthquakePieChart = (parent, props) => {
    // unpack my props
    const {
      margin,
      earthquakesPerYear,
      selectedYear,
      startYear,
      endYear,
      continentColourScale,
      selectedContinent,
      setSelectedContinent
    } = props;

    const width = +parent.attr('width');
    const height = +parent.attr('height');
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Add title
    const parentEnter = parent.selectAll('text.axis-title').data([null]).enter();
    parentEnter.append('text').text('Percentages of Earthquakes per Continent').attr('x', 150).attr('y', 13).attr('class', 'axis-title').style('text-anchor', 'middle').style('font-size', '15px').style('fill', 'black');

    // Create chart group
    const chart = parent.selectAll('.piechart').data([null]);
    const chartEnter = chart
      .enter().append('g')
        .attr('class','piechart')
        .attr('transform', `translate(${width/2},${height/2})`);

    // Define arc values for when mouse is hovering over and not hovering over pie chart slice 
    const radius = Math.min(width, height) / 2 - 20;
    var arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius);

    var arcOver = d3.arc() // When mouse is hovering over pie chart slice
    .innerRadius(0)
    .outerRadius(radius + 10);

    const continents = ['Oceania', 'Asia', 'North America', 'South America', 'Europe', 'Africa'];

    // Construct pie chart data
    const pie = d3.pie()
    .value(function(d) {
        let total = 0;
        for(let year = startYear; year <= endYear; year++){
            total += earthquakesPerYear.get(year).get(d)[0]; 
        }
        return total;
    })
    .sort(function(a) { return d3.ascending(a);} ); // This make sure that group order remains the same in the pie chart

    const data_ready = pie(continents);

    // In order to calculate percentages of earthquake numbers
    let totalEarthquakeNumber = 0;
    data_ready.forEach(d => {
        totalEarthquakeNumber += d.value;
    });


    // Append pie chart slices
    const sliceGroups = chartEnter.merge(chart)
      .selectAll('g.sliceGroup').data(data_ready);

    const sliceGroupsEnter = sliceGroups
      .enter()
      .append('g')
      .attr('class', 'sliceGroup');
    const slices = sliceGroups.select('path');

    const slicesEnter = sliceGroupsEnter
      .append('path')
      .attr('class', 'slice')
      .on('click', function (event, d) {setSelectedContinent(d.data);})
        .attr("stroke", "white")
        .style("stroke-width", "2px");


    // Merge to update tooltips, opacity and arc angle based on time range and continent selection
    slices.merge(slicesEnter)
    .attr('fill', d => {
      return continentColourScale(d.data);
  })
  .on('mouseover', (event, d) => {
    d3.select('#tooltip')
      .style('display', 'block')
      .style('left', (event.pageX + 15) + 'px')   
      .style('top', (event.pageY + 15) + 'px')
      .html(`
      <div class="tooltip-title">${d.data}</div>
      <div class="tooltip-text">Percentage: ${Math.round((d.value/totalEarthquakeNumber)*1000)/10}%</div>
      <div class="tooltip-text"><i>(Click to focus on continent)</i></div>
      `);
    d3.select(event.target).attr('d', arcOver);
  })
  .on('mousemove', (event, d) => {
    d3.select('#tooltip')
      .style('display', 'block')
      .style('left', (event.pageX + 15) + 'px')   
      .style('top', (event.pageY + 15) + 'px')
      .html(`
        <div class="tooltip-title">${d.data}</div>
        <div class="tooltip-text">Percentage: ${Math.round((d.value/totalEarthquakeNumber)*1000)/10}%</div>
        <div class="tooltip-text"><i>(Click to focus on continent)</i></div>
      `);
      d3.select(event.target).attr('d', arcOver);
  })
  .on('mouseleave', () => {
    d3.select('#tooltip').style('display', 'none');
    d3.select(event.target).attr('d', arc);
  })
  .transition()
      .attr('opacity', d => {
        if(selectedContinent != "" && d.data != selectedContinent){
          return 0.3;
        }
        return 1;
      })
      .attrTween("d", arcTween);
 
    // Function to smoothly animate pie chart slice angle transition upon time-range change 
    function arcTween(d) {
        var i = d3.interpolate(this._current, d);
      
        this._current = i(0);
      
        return function(t) {
          return arc(i(t))
        }
    }
}

