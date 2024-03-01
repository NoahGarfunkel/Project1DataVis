/**
 * Load data from CSV file asynchronously and render bar chart
 */
let barchart;
d3.csv('data/national_health_data.csv')
  .then(data => {
    data.forEach(d => {
      d.poverty_perc = +d.poverty_perc;
    });
    
    // Initialize chart and then show it
    barchart = new Barchart({ parentElement: '#chart'}, data);
    barchart.updateVis();
  })
  .catch(error => console.error(error));

  let barchartAir;
  d3.csv('data/national_health_data.csv')
  .then(data => {
    data.forEach(d => {
      d.air_quality = +d.air_quality;
    });
    
    // Initialize chart and then show it
    barchartAir = new BarchartAir({ parentElement: '#chartAir'}, data);
    barchartAir.updateVis();
  })
  .catch(error => console.error(error));

  d3.csv('data/national_health_data.csv')
  .then(data => {
    // Convert strings to numbers
    data.forEach(d => {
      d.poverty_perc = +d.poverty_perc;
      d.air_quality = +d.air_quality;
    });
    
    // Initialize chart
    const scatterplot = new Scatterplot({ parentElement: '#scatterplot'}, data);
    
    // Show chart
    scatterplot.updateVis();
  })
  .catch(error => console.error(error));

  Promise.all([
    d3.json('data/counties-10m.json'),
    d3.csv('data/national_health_data.csv')
  ]).then(data => {
    const geoData = data[0];
    const countyPovertyPercData = data[1];
  
    geoData.objects.counties.geometries.forEach(d => {
      for (let i = 0; i < countyPovertyPercData.length; i++) {
        if (d.id === countyPovertyPercData[i].cnty_fips) {
          d.properties.poverty_perc = +countyPovertyPercData[i].poverty_perc;
        }
      }
    });
  
    const choroplethMap = new ChoroplethMap({ 
      parentElement: '.choropleth',   
    }, geoData);
  })
  .catch(error => console.error(error));

  Promise.all([
    d3.json('data/counties-10m.json'),
    d3.csv('data/national_health_data.csv')
  ]).then(data => {
    const geoData = data[0];
    const countyAirQualityData = data[1];
  
    geoData.objects.counties.geometries.forEach(d => {
      for (let i = 0; i < countyAirQualityData.length; i++) {
        if (d.id === countyAirQualityData[i].cnty_fips) {
          d.properties.air_quality = +countyAirQualityData[i].air_quality;
        }
      }
    });
  
    const choroplethMap = new ChoroplethMap2({ 
      parentElement: '.choropleth2',   
    }, geoData);
  })
  .catch(error => console.error(error));

  let barchartCustomizable;

// Add an event listener to the dropdown to call the createBarChart function when the selection changes
document.getElementById('columnSelector').addEventListener('change', function() {
  // Get the selected column name from the dropdown
  var selectedColumn = this.value;
  // Call createBarChart with the selected column name
  createBarChart(selectedColumn);
});

// Modify the createBarChart function to accept the column name as a parameter
function createBarChart(columnName) {
  d3.select('#chartCustomizable').html('');

  d3.csv('data/national_health_data.csv')
    .then(data => {
      data.forEach(d => {
        d[columnName] = +d[columnName]; // Convert the column to a number
      });
      
      // Initialize chart and then show it
      barchartCustomizable = new BarchartCustomizable({ parentElement: '#chartCustomizable' }, data, columnName);
      barchartCustomizable.updateVis();
    })
    .catch(error => console.error(error));
}
createBarChart('poverty_perc');

let scatterplotCustomizable;

// Add event listeners to the dropdowns to call the createScatterplot function when their selection changes
document.getElementById('columnSelectorY').addEventListener('change', updateScatterplot);
document.getElementById('columnSelectorX').addEventListener('change', updateScatterplot);

// Function to update the scatterplot with the selected column names
function updateScatterplot() {
  // Get the selected column names from the dropdowns
  const selectedColumnY = document.getElementById('columnSelectorY').value;
  const selectedColumnX = document.getElementById('columnSelectorX').value;
  // Call createScatterplot with the selected column names
  createScatterplot(selectedColumnY, selectedColumnX);
}

// Modify the createScatterplot function to accept the column names as parameters
function createScatterplot(columnNameY, columnNameX) {

  d3.select('#scatterplotCustomizable').html('');

  d3.csv('data/national_health_data.csv')
    .then(data => {
      // Convert strings to numbers
      data.forEach(d => {
        d[columnNameY] = +d[columnNameY];
        d[columnNameX] = +d[columnNameX];
      });
      
      // Initialize scatterplot
      scatterplotCustomizable = new ScatterplotCustomizable({ parentElement: '#scatterplotCustomizable' }, data, columnNameY, columnNameX);
      
      // Show scatterplot
      scatterplotCustomizable.updateVis();
    })
    .catch(error => console.error(error));
}
// Initial call to createScatterplot with default column names
createScatterplot('air_quality', 'poverty_perc');

document.getElementById('columnSelectorMap').addEventListener('change', function() {
  // Get the selected column name from the dropdown
  var selectedColumn = this.value;
  // Call createBarChart with the selected column name
  createMap(selectedColumn);
});

function createMap(columnName) {
  d3.select('.choroplethCustomizable').html('');

  Promise.all([
    d3.json('data/counties-10m.json'),
    d3.csv('data/national_health_data.csv')
  ]).then(data => {
    const geoData = data[0];
    const countyData = data[1];

    geoData.objects.counties.geometries.forEach(d => {
      for (let i = 0; i < countyData.length; i++) {
        if (d.id === countyData[i].cnty_fips) {
          d.properties[columnName] = +countyData[i][columnName];
        }
      }
    });

    const choroplethMap = new ChoroplethMapCustomizable({ 
      parentElement: '.choroplethCustomizable',   
    }, geoData, columnName);
  })
  .catch(error => console.error(error));
}

createMap('poverty_perc');

let barchartBrush;
d3.csv('data/national_health_data.csv')
  .then(data => {
    data.forEach(d => {
      d.poverty_perc = +d.poverty_perc;
    });
    
    // Initialize chart and then show it
    barchartBrush = new BarchartBrush({ parentElement: '#chartBrush'}, data);
    barchartBrush.updateVis();
  })
  .catch(error => console.error(error));
