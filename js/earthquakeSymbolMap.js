export const earthquakeSymbolMap = (parent, props) => {
  const { 
    countries,
    symbolsData,
    colourScale,
    startYear,
    endYear,
    margin,
    selectedContinent,
    setSelectedContinent,
    selectedMagnitudes,
    selectedDepths
  } = props;

  const width = +parent.attr('width');
  const height = +parent.attr('height');

  // Define projection and scale its size 
  const projection = d3.geoNaturalEarth1().scale(width/2/Math.PI, height/2/Math.PI).translate([width/2, height/2]);
  const pathGenerator = d3.geoPath().projection(projection);

  // Create map group 
  const map = parent.selectAll('g.map').data([null])
  const mapEnter = map.enter().append('g').attr('class', 'map').attr('transform', `translate(${margin.left},${margin.top})`);

  // Zoom interactivity
  parent.call(d3.zoom()
    .scaleExtent([1, 8])
    .translateExtent([[0, 0], [width, height]])
    .on('zoom', event => mapEnter.merge(map).attr('transform', event.transform)));

  // Earth's border
  mapEnter.append('path')
    .attr('class', 'sphere')
    .attr('d', pathGenerator({type: 'Sphere'}));

  // Append paths 
  const countryPaths = mapEnter.selectAll('path.country').data(countries.features);
  countryPaths
      .enter().append('path')
        .attr('class','country')
        .attr('d', pathGenerator)
        .append('title')
        .text(d => d.properties.name);

  // Depth scale for circle radii 
  const depthScale = d3.scaleSqrt()
  .domain([0, 630])
  .range([0, 18]);

  // Append circles to map
  const points = mapEnter.merge(map)
    .selectAll('.point').data(symbolsData);
  const pointsEnter = points
  .enter().append('circle')
    .attr('class', 'point')
    .attr("cx", d => projection([d.longitude,d.latitude])[0])
    .attr("cy", d => projection([d.longitude,d.latitude])[1])
    .attr("fill", d => {
      let magnitude = d.magnitude - Math.floor(d.magnitude);
      if(magnitude < 0.5){
        magnitude = Math.floor(d.magnitude);
      }
      else{
        magnitude = Math.floor(d.magnitude) + 0.5;
      }
      return colourScale(magnitude); // Colour of circle indicates magnitude of corresponding earthquake
    })
    .on('mouseover', (event, d) => { // Tooltip to display extra information about selected earthquake
      d3.select('#tooltip')
        .style('display', 'block')
        .style('left', (event.pageX + 15) + 'px')   
        .style('top', (event.pageY + 15) + 'px')
        .html(`
          <div class="tooltip-title">${d.location}</div>
          <div class="tooltip-text">${d.continent} | ${d.year} </div>
          <div class="tooltip-text">Depth: ${d.depth} | Magnitude: ${d.magnitude}</div>
          <div class="tooltip-text"><i>(Click to focus on continent)</i></div>
        `);
    })
    .on('mouseleave', () => {
      d3.select('#tooltip').style('display', 'none');
    })
    .on('click', function (event, d) {setSelectedContinent(d.continent);});


  //Update radii of circles based on depth and whether or not it should be present on map given selected time range
  pointsEnter.merge(points)
  .transition()
    .attr("r", function(d) {
      let depth = Math.floor(d.depth / 100) * 100;
      let magnitude = d.magnitude - Math.floor(d.magnitude);
      if(magnitude < 0.5){
        magnitude = Math.floor(d.magnitude);
      }
      else{
        magnitude = Math.floor(d.magnitude) + 0.5;
      }
      if(d.year >= startYear && d.year <= endYear && (selectedContinent == "" || d.continent == selectedContinent) && selectedMagnitudes.includes(magnitude) && selectedDepths.includes(depth)){

       return depthScale(d.depth);
      }
      else{
        return 0;
      }
    });
}
