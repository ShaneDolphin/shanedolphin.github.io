function initialise_map(my_data,map_data,week_no,filter) {

    my_data.map(m => m.radiusCount = Math.sqrt(m.TOTAL_COUNT));
    my_data.map(m => m.date = new Date(+m.ZDAY.substr(0,4), (+m.ZDAY.substr(4,2) - 1),+m.ZDAY.substr(6,2)));
    my_data = my_data.filter(f => +d3.timeFormat("%W")(f.date) === week_no);
    my_data.map(m => m.TOTAL_COUNT = +m.TOTAL_COUNT);

    if(filter.includes("top") === true){
        var types = ["hail","tornado","wind"];
        var top_percent = +filter.split("_")[1];
        var all_filtered = [];
        types.forEach(function(d){
            var filtered = JSON.parse(JSON.stringify(my_data));
            filtered = filtered.filter(f => f.type === d);
            if(filtered.length > 0){
                filtered = filtered.sort((a,b) => d3.descending(a.TOTAL_COUNT, b.TOTAL_COUNT));
                var top_val = filtered[parseInt(filtered.length * (top_percent/100))].TOTAL_COUNT;
                filtered = filtered.filter(f => f.TOTAL_COUNT >= top_val);
                all_filtered = all_filtered.concat(filtered);
            }
        });
        my_data = all_filtered;
    }


    //draw map
    var svg = draw_svg("chart_div");
    my_data = my_data.sort((a,b) => d3.ascending(a.TOTAL_COUNT, b.TOTAL_COUNT));
    draw_geomap(svg,my_data,map_data,"test_geo_map_1");



}

function draw_geomap(svg,my_data,map_data,my_class){

    var width = +svg.attr("width");
    var height = +svg.attr("height");
    var margins = {"left":10,"right":10,"top":10,"bottom":10};


    var my_chart = geomap_chart()
        .width(width)
        .height(height)
        .my_class(my_class)
        .map_data(map_data)
        .my_data(my_data)
        .margins(margins);

    my_chart(svg);
}


function draw_svg(div_id){

    var chart_div = document.getElementById(div_id);
    var width = chart_div.clientWidth;
    var height = chart_div.clientHeight;
    var svg = "";

    if(d3.select("." + div_id + "_svg")._groups[0][0] === null){
       svg = d3.select("#" + div_id)
          .append("svg")
          .attr("class",div_id + "_svg")
          .attr("width",width)
          .attr("height",height);

    } else {
        svg = d3.select("." + div_id + "_svg");
    }
    return svg;
}


