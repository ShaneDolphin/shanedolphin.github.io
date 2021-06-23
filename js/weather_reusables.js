function geomap_chart() {

    var width=0,
        height=0,
        my_class="",
        margins = {},
        my_data = [],
        map_data = {},
        svg = "",
        colour_scales = {},
        radius_scales = {},
        types = ["hail","tornado","wind"],
        colours = {"hail":["#6baed6","#08306b"],"wind":["#74c476","#00441b"],"tornado":["#fc9272","#cb181d"]};

    function my(incoming_svg) {

        //svg needs to be external for zoom_to_bounds function
        svg = incoming_svg;

        types.forEach(function(d){
            var filtered = JSON.parse(JSON.stringify(my_data));
            filtered = filtered.filter(f => f.type === d);
            var colour_extent = d3.extent(filtered, d => d.TOTAL_COUNT);
            colour_scales[d] = d3.scaleLinear().range(colours[d]).domain(colour_extent);
            var radius_extent = d3.extent(my_data, d => d.radiusCount);
            radius_scales[d] = d3.scaleLinear().range([3,10]).domain(radius_extent);

        });

        //draw non-data elements
        if(d3.select(".map_svg" + my_class)._groups[0][0] === null) {
            svg.append("g").attr("class", "map_svg" + my_class);
            svg.append("rect").attr("class","zoom_rect zoom_rect"  + my_class).attr("id","in");
            svg.append("text").attr("class","zoom_text" + my_class).attr("id","in");
            svg.append("rect").attr("class","zoom_rect zoom_rect" + my_class).attr("id","out");
            svg.append("text").attr("class","zoom_text" + my_class).attr("id","out");
        }

        //map on map svg for zoom
        const map_svg = d3.select(".map_svg" + my_class);

        //initialise zoom
        const zoom = d3.zoom()
            .extent([[0,0],[width,height]])
            .translateExtent([[-100, -100], [width + 100, height + 100]])
            .scaleExtent([0.8, 15])
            .on("zoom", zoomed);

        svg.call(zoom);

        //draw zoom buttons
        d3.selectAll(".zoom_rect" + my_class)
            .attr("width",20)
            .attr("height",20)
            .attr("x", 10)
            .attr("y",function() { return (height - 32) + (this.id === "in" ? -25 : 0)})
            .on("mouseover",function(){d3.select(this).attr("cursor","pointer")})
            .on("mouseout",function(){d3.select(this).attr("cursor","default")})
            .on("click",function(){(this.id === "in" ? zoom_in() : zoom_out())});

        d3.selectAll(".zoom_text" + my_class)
            .attr("text-anchor","middle")
            .attr("pointer-events","none")
            .attr("x", 20)
            .attr("y",function() { return (height - 17) + (this.id === "in" ? -25 : 0)})
            .text(function(){ return (this.id === "in" ? "+" : "-")});


        const projection = d3.geoAlbersUsa().fitSize([width, height], map_data);
        const path = d3.geoPath().projection(projection);

        //data join for maps
        const map_group = map_svg.selectAll('.map_group' + my_class)
            .data(map_data.features)
            .join(function(group){
                var enter = group.append("g").attr("class","map_group" + my_class);
                enter.append("path").attr("class","map_path");
                return enter;
            });

        map_group.select(".map_path")
            .attr("d", path);

        my_data = my_data.filter(f => projection([+f.CENTERLON, +f.CENTERLAT]) !== null);
        //data join for dots
        const dot_group = map_svg.selectAll('.dot_group' + my_class)
          .data(my_data)
          .join(function(group){
              var enter = group.append("g").attr("class","dot_group" + my_class);
              enter.append("circle").attr("class","data_dot");
              return enter;
          });

        dot_group.select(".data_dot")
          .attr("fill-opacity", 0.2)
          .attr("fill",d => colour_scales[d.type](d.TOTAL_COUNT))
          .attr("cx", d => projection([+d.CENTERLON, +d.CENTERLAT])[0])
          .attr("cy",d => projection([+d.CENTERLON, +d.CENTERLAT])[1])
          .attr("r",d => radius_scales[d.type](d.radiusCount))
          .on("mouseover",function(event,d){
              var tooltip_text = "Total Count: " + d.TOTAL_COUNT + "<br>Type: " + d.type + "<br>" +  d3.timeFormat("%d %b %Y")(d.date);

              d3.select(".tooltip")
                .style("visibility","visible")
                .style("left",(event.x + 10) + "px")
                .style("top",event.y + "px")
                .html(tooltip_text)
          })
          .on("mouseout",function(){
              d3.select(".tooltip").style("visibility","hidden");
          });

        //zoom functions
        function zoomed(event) {
            const {transform} = event;
            map_svg.attr("transform", transform);
            map_svg.attr("stroke-width", 0.5 / transform.k/2);
        }

        function zoom_in() {
            svg.transition().duration(750).call(zoom.scaleBy, 1.5)
        }

        function zoom_out() {
            svg.transition().duration(750).call(zoom.scaleBy, 0.5)
        }

    }

    my.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        return my;
    };

    my.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        return my;
    };

    my.my_data = function(value) {
        if (!arguments.length) return my_data;
        my_data = value;
        return my;
    };

    my.map_data = function(value) {
        if (!arguments.length) return map_data;
        map_data = value;
        return my;
    };

    my.my_class = function(value) {
        if (!arguments.length) return my_class;
        my_class = value;
        return my;
    };

    my.margins = function(value) {
        if (!arguments.length) return margins;
        margins = value;
        return my;
    };

    return my;
}
