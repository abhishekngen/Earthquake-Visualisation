export const colourLegend = (parent, props) => {
    const { 
      showColours,
      colourScale, 
      circleRadius,
      spacing,
      textOffset,
      checkBoxes,
      setSelectedColour,
      magnitudeText,
      depthText,
      rectWidth,
      rectHeight,
      checkBoxOffset
    } = props;

    // Append title
    const parentEnter = parent.selectAll('text.legend_label').data([null]).enter();
    if(magnitudeText){
        parentEnter.append('text').text('Displayed Magnitudes:').attr('x', 125).attr('y', 20).attr('class', 'legend_label').style('text-anchor', 'middle').style('font-size', '15px');
    }
    else if(depthText){
        parentEnter.append('text').text('Displayed Depths:').attr('x', 125).attr('y', 25).attr('class', 'legend_label').style('text-anchor', 'middle').style('font-size', '15px');
    }
    else{
        parentEnter.append('text').text('Continent Colours:').attr('x', 140).attr('y', 25).attr('class', 'legend_label').style('text-anchor', 'middle').style('font-size', '15px');
    }

    // Append group for colour legend rectangle
    const gSelect = parent.selectAll('g.colourBar').data([null])
    const gEnter = gSelect.enter().append('g').attr('class', 'colourBar').attr('transform', `translate(50,40)`);
    gEnter.append('rect')
        .attr('class', 'colourBarRect')
        .attr('width', rectWidth)
        .attr('height', rectHeight)
        .attr("rx", 6)
        .attr("ry", 6)
        .attr('x', 0)
        .attr('y', 0);
    const group = gEnter.merge(gSelect);

    // Get domain data of colour scale
    const groups = group.selectAll('g.legend').data(colourScale.domain());

    // Append groups for each row in colour legend
    const groupsEnter = groups
      .enter().append('g')
        .attr('class','legend')
        .attr('transform', (d, i) => `translate(30, ${i * spacing + 20})`);

    // Append circles
    const circle = groups.select('circle');
    groupsEnter.append('circle')
        .attr('r', showColours ? circleRadius: 2)
        .merge(circle)
        .attr('opacity', function(d) {
            if(depthText){
                return 0;
            }
            return 1;
        })
        .attr('fill', colourScale); 

    // Append text labels 
    groupsEnter.append('text')
        .text(d => {
            if(magnitudeText){
                return d + ` - ${d+0.5}`;
            }
            else if(depthText){
                return d + ` - ${d+100}km`;
            }
            return d;
        })
        .attr('x', textOffset)
        .style('font-size', 15);

    // Append checkboxes if needed (as foreign objects since inside SVG)
    if(checkBoxes){
        groupsEnter.append('foreignObject').attr('width', 20).attr('height', 20).attr('x', textOffset + checkBoxOffset).attr('y', -9).append('xhtml:input')
        .attr('type', 'checkbox').attr('class', 'check').property('checked', true).on('change', function(event, d){
            setSelectedColour(d);
        });
    }
  }
  
  
  