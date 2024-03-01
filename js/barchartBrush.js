class BarchartBrush {

    /**
     * Class constructor with basic chart configuration
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, _data) {
      // Configuration object with defaults
      this.config = {
        parentElement: _config.parentElement,
        containerWidth: _config.containerWidth || 710,
        containerHeight: _config.containerHeight || 200,
        margin: _config.margin || {top: 10, right: 5, bottom: 25, left: 40},
        reverseOrder: _config.reverseOrder || false,
        tooltipPadding: _config.tooltipPadding || 15
      }
      this.data = _data;
      this.initVis();
    }
    
    /**
     * Initialize scales/axes and append static elements, such as axis titles
     */
    initVis() {
      let vis = this;

      vis.data = vis.data.filter(d => d.poverty_perc !== -1);
  
      // Calculate inner chart size. Margin specifies the space around the actual chart.
      vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
      vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
  
      // Initialize scales and axes
      // Important: we flip array elements in the y output range to position the rectangles correctly
      vis.yScale = d3.scaleLinear()
          .range([vis.height, 0]) 
  
      vis.xScale = d3.scaleBand()
          .range([0, vis.width])
          .paddingInner(0.1);
  
      vis.xAxis = d3.axisBottom(vis.xScale)
          .tickSizeOuter(0);
  
      vis.yAxis = d3.axisLeft(vis.yScale)
          .ticks(6)
          .tickSizeOuter(0)
          .tickFormat(d => d + '%');
  
      // Define size of SVG drawing area
      vis.svg = d3.select(vis.config.parentElement)
          .attr('width', vis.config.containerWidth)
          .attr('height', vis.config.containerHeight);
  
      // SVG Group containing the actual chart; D3 margin convention
      vis.chart = vis.svg.append('g')
          .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
  
      // Append empty x-axis group and move it to the bottom of the chart
      vis.xAxisG = vis.chart.append('g')
          .attr('class', 'axis x-axis')
          .attr('transform', `translate(0,${vis.height})`);
      
      // Append y-axis group 
      vis.yAxisG = vis.chart.append('g')
          .attr('class', 'axis y-axis');

      // Add brush element
      vis.brush = d3.brushX()
          .extent([[0, 0], [vis.width, vis.height]])
          .on("end", brushed);

      // Append brush group
      vis.brushG = vis.chart.append("g")
          .attr("class", "brush")
          .call(vis.brush);

      // Function to handle brushing
      function brushed(event) {
          if (!event.selection) return;
          const [x0, x1] = event.selection.map(vis.xScale.invert);
          // Filter data based on brush selection
          const brushedData = vis.data.filter(d => vis.xScale(vis.xValue(d)) >= x0 && vis.xScale(vis.xValue(d)) <= x1);
          // Update visualization with brushed data
          vis.updateBrushedVis(brushedData);
      }
    }
  
    /**
     * Prepare data and scales before we render it
     */
    updateVis() {
      let vis = this;
  
      vis.data.sort((a, b) => a.poverty_perc - b.poverty_perc);
      
      // Reverse column order depending on user selection
      if (vis.config.reverseOrder) {
        vis.data.reverse();
      }
  
      // Specificy x- and y-accessor functions
      vis.xValue = d => d.display_name;
      vis.yValue = d => d.poverty_perc;
  
      // Set the scale input domains
      vis.xScale.domain(vis.data.map(vis.xValue));
      vis.yScale.domain([0, d3.max(vis.data, vis.yValue)]);
  
      vis.renderVis();
    }
  
    /**
     * Bind data to visual elements
     */
    renderVis() {
      let vis = this;
  
      // Add rectangles
      let bars = vis.chart.selectAll('.bar')
          .data(vis.data, vis.xValue)
        .join('rect');
      
      bars.style('opacity', 0.5)
        .transition().duration(1000)
          .style('opacity', 1)
          .attr('class', 'bar')
          .attr('x', d => vis.xScale(vis.xValue(d)))
          .attr('width', vis.xScale.bandwidth())
          .attr('height', d => vis.height - vis.yScale(vis.yValue(d)))
          .attr('y', d => vis.yScale(vis.yValue(d)))
      
      // Tooltip event listeners
      bars
          .on('mouseover', (event,d) => {
            d3.select('#tooltip')
              .style('opacity', 1)
              .html(`<div class="tooltip-label">County</div>${d.display_name}<br><div class="tooltip-label">Poverty Percentage</div>${d.poverty_perc}`);
          })
          .on('mousemove', (event) => {
            d3.select('#tooltip')
              .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
              .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
          })
          .on('mouseleave', () => {
            d3.select('#tooltip').style('opacity', 0);
          });
  
  
      vis.yAxisG.call(vis.yAxis);
    }

    /**
     * Update visualization with brushed data
     */
    updateBrushedVis(brushedData) {
        let vis = this;

        // Update x-scale domain with brushed data
        vis.xScale.domain(brushedData.map(vis.xValue));

        // Update x-axis
        vis.xAxisG.transition().duration(500).call(vis.xAxis);

        // Update bars
        let bars = vis.chart.selectAll('.bar')
            .data(brushedData, vis.xValue);

        bars.exit().remove();

        bars.enter().append('rect')
            .attr('class', 'bar')
            .merge(bars)
            .style('opacity', 0.5)
            .transition().duration(500)
            .style('opacity', 1)
            .attr('x', d => vis.xScale(vis.xValue(d)))
            .attr('width', vis.xScale.bandwidth())
            .attr('height', d => vis.height - vis.yScale(vis.yValue(d)))
            .attr('y', d => vis.yScale(vis.yValue(d)));
    }
}
