export const earthquakeBarchart = (parent, props) => {
    // unpack my props
    const {
      margin,
      xTickLabels,
      yAxisLabel,
      earthquakesPerYear,
      startYear,
      endYear,
      barChartDisplayType,
      continentColourScale,
      selectedContinent,
      setSelectedContinent
    } = props;
  
    const continents = ['Oceania', 'Asia', 'North America', 'South America', 'Europe', 'Africa'];

    const width = +parent.attr('width');
    const height = +parent.attr('height');
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
  
    // Chart taking care of inner margins
    const chart = parent.selectAll('.barchart').data([null]);
    const chartEnter = chart
      .enter().append('g')
        .attr('class','barchart')
        .attr('transform', `translate(${margin.left},${margin.top})`);
  
    // Initialise scales
    const xScale = d3.scaleBand()
      .domain(continents)
      .range([0, innerWidth])
      .paddingInner(0.2);
  
    const yScale = d3.scaleLinear()
      .range([innerHeight, 0]);

    // Initialise axes
    const xAxis = d3.axisBottom(xScale)
      .ticks(xTickLabels)
      .tickSizeOuter(0)
      .tickPadding(10);
      
    const yAxis = d3.axisLeft(yScale)
      .ticks(6)
      .tickSizeOuter(0)
      .tickPadding(10);

    // Adjust domain of y-axis given user selection from dropdown 
    if(barChartDisplayType == "earthquakeNumber"){
        yScale.domain([0, 250]);
    }
    else if(barChartDisplayType == "avgDepth"){
        yScale.domain([0, 350]);
    }
    else{
        yScale.domain([5, 10]);
    }
  
    // Append empty x-axis group and move it to the bottom of the chart, and add x-axis title
    const xAxisG = chartEnter
      .append('g')
        .attr('class','axis x-axis')
        .attr('transform', `translate(0,${innerHeight})`);
    xAxisG.call(xAxis);
    xAxisG.append('text')
        .attr('class', 'axis-title')
        .attr('x', innerWidth/2)
        .attr('y', 55)
        .style('text-anchor', 'middle')
        .text('Continents');
  
    // Append y-axis group
    const yAxisG = chart.select('.axis-y-axis');
    const yAxisGEnter = chartEnter
      .append('g')
        .attr('class','axis-y-axis');
    yAxisG.merge(yAxisGEnter).call(yAxis);
      
    // Append y-axis title
    yAxisGEnter
      .append('text')
        .attr('class', 'axis-title')
        .attr('x', -30)
        .attr('y', -25);
    
    yAxisG.merge(yAxisGEnter).select('.axis-title').text(yAxisLabel);

    // Calculate number of earthquakes, average magnitude and average depth per continent, storing in hashmaps
    let earthquakeCounts = new Map();
    let earthquakeAverageDepth = new Map();
    let earthquakeAverageMagnitude = new Map();
    
    continents.forEach(d => {
        let earthquakeCount = 0;
        let totalMagnitude = 0;
        let totalDepth = 0;
        for(let year = startYear; year <= endYear; year++){
            earthquakeCount += earthquakesPerYear.get(year).get(d)[0];
            totalDepth += earthquakesPerYear.get(year).get(d)[1]
            totalMagnitude += earthquakesPerYear.get(year).get(d)[2];
        }
        earthquakeCounts.set(d, earthquakeCount);
        if(earthquakeCount == 0){
            earthquakeAverageMagnitude.set(d, 5);
            earthquakeAverageDepth.set(d, 0);
        }
        else{
            earthquakeAverageMagnitude.set(d, totalMagnitude/earthquakeCount);
            earthquakeAverageDepth.set(d, totalDepth/earthquakeCount);
        }
    });
    
      
    // Plot data
    const bars = chartEnter.merge(chart)
      .selectAll('.bar').data(continents);
    const barsEnter = bars
      .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d))
        .attr('width', xScale.bandwidth())
        .attr('fill', d => continentColourScale(d))
        .on('click', function (event, d) {setSelectedContinent(d);});

    // Merge to add tooltips to display value of bar and update opacity/y-value dependent on time-range update and continent selection
    barsEnter.merge(bars)
    .on('mouseover', (event, d) => {
        d3.select('#tooltip')
          .style('display', 'block')
          .style('left', (event.pageX + 15) + 'px')   
          .style('top', (event.pageY + 15) + 'px')
          .html(`
            <div class="tooltip-title">Value: ${
                barChartDisplayType == "earthquakeNumber" ? earthquakeCounts.get(d) : (barChartDisplayType == "avgMagnitude" ? Math.floor(earthquakeAverageMagnitude.get(d)*10)/10 : Math.floor(earthquakeAverageDepth.get(d)*10)/10)
            }</div>
            <div class="tooltip-text"><i>(Click to focus on continent)</i></div>
          `);
      })
      .on('mousemove', (event, d) => {
        d3.select('#tooltip')
          .style('display', 'block')
          .style('left', (event.pageX + 15) + 'px')   
          .style('top', (event.pageY + 15) + 'px')
          .html(`
          <div class="tooltip-title">Value: ${
            barChartDisplayType == "earthquakeNumber" ? earthquakeCounts.get(d) : (barChartDisplayType == "avgMagnitude" ? Math.floor(earthquakeAverageMagnitude.get(d)*10)/10 : Math.floor(earthquakeAverageDepth.get(d)*10)/10)
            }</div>
            <div class="tooltip-text"><i>(Click to focus on continent)</i></div>
          `);
      })
      .on('mouseleave', () => {
        d3.select('#tooltip').style('display', 'none');
      })
        .transition(1000)
        .attr('opacity', d => {
            if(selectedContinent != "" && d != selectedContinent){
                return 0.3;
            }
            return 1;
        })
        .attr('height', d => {
            return barChartDisplayType == "earthquakeNumber" ? innerHeight - yScale(earthquakeCounts.get(d)) : (barChartDisplayType == "avgMagnitude" ? innerHeight - yScale(earthquakeAverageMagnitude.get(d)) : innerHeight - yScale(earthquakeAverageDepth.get(d)));
        })
        .attr('y', d => barChartDisplayType == "earthquakeNumber" ? yScale(earthquakeCounts.get(d)) : (barChartDisplayType == "avgMagnitude" ? yScale(earthquakeAverageMagnitude.get(d)): yScale(earthquakeAverageDepth.get(d))));

  };
  
  