export const loadAndProcessData = () =>
  Promise
    .all([
      d3.json('./data/countries-50m.json'),
      d3.json('./data/country-by-continent.json'),
      d3.csv('./data/earthquake_data.csv')
    ])
    .then(([topoData, continentData, csvData]) => {     
      
      // Hashmap to quickly obtain corresponding continent from country using country-by-continent JSON file
      var continentMap = new Map(continentData.map(d => [d.country, d.continent]));

      // Conversion from TopoJSON to GeoJSON
      const countries = topojson.feature(topoData, topoData.objects.countries);

      // Remove any earthquake data entries that have no location, magnitude, depth or country (indicated by location string having a comma)
      let filteredCsvData = csvData.filter(d => d.location != "" && d.magnitude != "" && d.depth != "" && d.location.split(',').length - 1 == 1);

      // Parse CSV earthquake data 
      filteredCsvData.forEach(d => {
        d.longitude = +d.longitude;
        d.latitude = +d.latitude;
        d.magnitude = +d.magnitude;
        d.depth = +d.depth;

        // Obtain country of earthquake (if not explicitly stored in country field, will be stored in location string)
        if(d.country == '' || d.country == null){
          const country = d.location.split(',')[1].trim();
          if(country == 'California' || country == "Hawaii" || country == "Alaska"){
            d.country = "United States of America"; // Location strings for American earthquakes sometimes put state as country incorrectly
          }
          d.country = country
        }
        d.continent = continentMap.get(d.country); // Obtain continent from continent hashmap
        d.year = d.date_time.split(" ")[0].trim();
        d.year = d.year.split("/")[2].trim();
        d.year = +d.year; // Obtain year of earthquake from date
      });

      filteredCsvData = filteredCsvData.filter(d => d.continent != null); // Remove any entries with no known continent

      // Make hashmap for number of earthquakes, total depth and total magnitude of earthquakes per year per continent
      const earthquakesPerYear = new Map();
      for(let i = 2001; i < 2023; i++){
        let numberOfEarthquakes = new Map([["Oceania", [0, 0, 0]], ["Asia", [0, 0, 0]], ["North America", [0, 0, 0]], ["South America", [0, 0, 0]], ["Europe", [0, 0, 0]], ["Africa", [0, 0, 0]]]);
        filteredCsvData.forEach(d => {
          if(d.year == i){
            numberOfEarthquakes.set(d.continent, [numberOfEarthquakes.get(d.continent)[0] + 1, numberOfEarthquakes.get(d.continent)[1] + d.depth, numberOfEarthquakes.get(d.continent)[2] + d.magnitude]);
          }
        });
        earthquakesPerYear.set(i, numberOfEarthquakes);
      }

      
      // Return array containing GeoJSON and symbols data as well as hashmap to obtain continent from given country
      return [countries, filteredCsvData, continentMap, earthquakesPerYear];
    });

