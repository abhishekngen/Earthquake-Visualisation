import { loadAndProcessData } from './loadAndProcessData.js'
import { earthquakeSymbolMap } from './earthquakeSymbolMap.js'
import { earthquakeBarchart } from './earthquakeBarchart.js';
import { earthquakePieChart } from './earthquakePieChart.js';
import { yearDropdowns } from './yearDropdowns.js';
import { colourLegend } from './colourLegend.js';

// Svg D3 selections
const svg0 = d3.select('#svg0');
const svg0_5 = d3.select('#svg0_5');
const svg1 = d3.select('#svg1');
const svg2 = d3.select('#svg2');
const svg3 = d3.select('#svg3');
const svg3_5 = d3.select('#svg3_5');

// Variable declarations
let countries, symbolsData, continentMap, earthquakesPerYear;
let selectedYear = 2001;
let startYear = 2001;
let endYear = 2022;
let barChartDisplayType = "avgDepth";
let barChartYAxis = "Average Depth";
let selectedContinent = "";
const continents = ['Oceania', 'Asia', 'North America', 'South America', 'Europe', 'Africa'];
let yearStartOptionsList = [];
let yearEndOptionsList = [];
for(let i = 2001; i<2023; i++){ // Populate yearStartOptionsList
  yearStartOptionsList.push(i);
}
for(let i = 2022; i>2000; i--){ // Populate yearEndOptionsList
  yearEndOptionsList.push(i);
}
let selectedMagnitudes = [6, 6.5, 7, 7.5, 8, 8.5, 9];
let selectedDepths = [0, 100, 200, 300, 400, 500, 600];

//Scale declarations
const continentColourScale = d3.scaleOrdinal()
  .domain(continents)
  .range(d3.schemeCategory10);
const magnitudeColourScale = d3.scaleOrdinal();
magnitudeColourScale.domain([6.5, 7, 7.5, 8, 8.5, 9]);
magnitudeColourScale.range(d3.schemeOranges[magnitudeColourScale.domain().length]);
const depthScale = d3.scaleOrdinal().domain([0, 100, 200, 300, 400, 500, 600]).range(d3.schemeOranges[magnitudeColourScale.domain().length]);

//Function declarations
const setSelectedMagnitudes = (magnitude) => { // When user filters out a certain earthquake magnitude from world map
  if(selectedMagnitudes.includes(magnitude)){
    selectedMagnitudes = selectedMagnitudes.filter(d => d != magnitude);
  }
  else{
    selectedMagnitudes.push(magnitude);
  }
  updateVis();
}

const setSelectedDepths = (depth) => { // When user filters out a certain earthquake depth from world map
  if(selectedDepths.includes(depth)){
    selectedDepths = selectedDepths.filter(d => d != depth);
  }
  else{
    selectedDepths.push(depth);
  }
  updateVis();
}

const setSelectedContinent = (continent) => { // When user selects a certain continent to be highlighted across all views
  if(selectedContinent == ""){
    selectedContinent = continent;
  }
  else{
    selectedContinent = "";
  }
  updateVis();
}

const onOptionSelectedYearStart = (event) => { // When user selects a start year for the time range of data displayed across all views
  startYear = +event.target.value;

  yearEndOptionsList = [];
  for(let i = 2022; i >= startYear; i--){
    yearEndOptionsList.push(i);
  }
  updateVis();
}

const onOptionSelectedYearEnd = (event) => { // When user selects an end year for the time range of data displayed across all views
  endYear = +event.target.value;

  yearStartOptionsList = [];
  for(let i = 2001; i <= endYear; i++){
    yearStartOptionsList.push(i);
  }
  updateVis();
}


const updateVis = () => {

  // Update year dropwdowns to only display years that are physically possible to select (i.e. cannot select an end year that is smaller than start year)
  const dropdownDiv = d3.select('#dropdownDiv');
  yearDropdowns(dropdownDiv, onOptionSelectedYearStart, onOptionSelectedYearEnd, {yearStartOptionsList: yearStartOptionsList, yearEndOptionsList: yearEndOptionsList});

  // Update colour legends
  colourLegend(svg0, {showColours: true, colourScale: magnitudeColourScale, circleRadius: 10, spacing: 35, textOffset: 20, checkBoxes: true, setSelectedColour: setSelectedMagnitudes, magnitudeText: true, depthText: false, rectWidth: 150, rectHeight: 220, checkBoxOffset: 50});
  colourLegend(svg0_5, {showColours: false, colourScale: depthScale, circleRadius: 10, spacing: 30, textOffset: 0, checkBoxes: true, setSelectedColour: setSelectedDepths, magnitudeText: false, depthText: true, rectWidth: 150, rectHeight: 220, checkBoxOffset: 90});
  colourLegend(svg3_5, {showColours: true, colourScale: continentColourScale, circleRadius: 10, spacing: 35, textOffset: 20, magnitudeText: false, depthText: false, rectWidth: 180, rectHeight: 220});

  // Update earthquake dot map
  svg1.call(earthquakeSymbolMap, {countries, symbolsData, colourScale: magnitudeColourScale, startYear, endYear, margin: { top: 0, bottom: 0, left: 0, right: 0 }, selectedContinent, setSelectedContinent, selectedMagnitudes: selectedMagnitudes, selectedDepths: selectedDepths});

  // Update earthquake bar chart
  svg2.call(earthquakeBarchart, {
    margin: { top: 80, bottom: 60, left: 100, right: 10 },
    xTickLabels: continents,
    yAxisLabel: barChartYAxis,
    earthquakesPerYear: earthquakesPerYear,
    startYear: startYear,
    endYear: endYear,
    barChartDisplayType: barChartDisplayType,
    continentColourScale: continentColourScale,
    selectedContinent: selectedContinent,
    setSelectedContinent: setSelectedContinent
  });

  // Update earthquake pie chart 
  svg3.call(earthquakePieChart, {
    margin: { top: 40, bottom: 20, left: 20, right: 20 },
    earthquakesPerYear: earthquakesPerYear,
    selectedYear: selectedYear,
    startYear: startYear,
    endYear: endYear,
    continentColourScale: continentColourScale,
    selectedContinent: selectedContinent,
    setSelectedContinent: setSelectedContinent
  });

};

// Get data from csv files 
loadAndProcessData().then(loadedData => {

  // Extracted data 
  countries   = loadedData[0];
  symbolsData = loadedData[1];
  continentMap = loadedData[2];
  earthquakesPerYear = loadedData[3];

  // Set y-axis dropdown for bar chart 
  const select = d3.select('#barchart-yAxis-selection')
  select.on('change', function(event) {
    barChartDisplayType = event.target.value;
    if(barChartDisplayType == "earthquakeNumber"){
      barChartYAxis = "Number of Earthquakes";
    }
    else if(barChartDisplayType == "avgDepth"){
      barChartYAxis = "Average Depth";
    }
    else{
      barChartYAxis = "Average Magnitude";
    }
    updateVis();
  });

  // Initialise visualisation 
  updateVis();
});

