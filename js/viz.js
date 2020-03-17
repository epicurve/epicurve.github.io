var beta = 0.000554;
var beta_external = 0.01 * beta;
var m = 3;
var gamma = 0.01;
var rho = gamma / beta;
var dt = 0.1;
var T = 10000;
var v = 0;
var mu = 0.5;
var N = 500;
var y0 = 0.1;

var data_frequency = T / 50;

var w = 0;
var x = 100-y0;
var y = y0;
var z = 0;
var dw, dx, dy, dz;

var ws = [];
var xs = [];
var ys = [];
var zs = [];
// var data = [];

var day = 0;
var start_date = new Date(2020, 1, 1);
for (t = 0; t < T; t++) {
    dx = -beta * x * y - beta_external * (m-1) * x * y - v * x;
    dw = beta * x * y + beta_external * (m-1) * x * y - mu * w;
    dy = mu * w - gamma * y;
    dz = gamma * y + v * x;

    w += dw * dt;
    x += dx * dt;
    y += dy * dt;
    z += dz * dt;

    if (t % data_frequency == 0) {
      var date = new Date(2020, 1, 1 + day);
      ws.push({date: date, measurement: w});
      xs.push({date: date, measurement: x});
      ys.push({date: date, measurement: y});
      zs.push({date: date, measurement: z});
      // data.push(y)
      day += 1;
    }
}
var end_date = new Date(2020, 1, 1 + day);

// barWidth = width / data.length - padding;

// let svg = d3.select('body')
//             .append('svg')
//             .attr('width', width)
//             .attr('height', height);

// svg.selectAll('rect')
//   .data(data)
//   .enter()
//     .append('rect')
//     .attrs({
//       x: (d, i) => i * (width / data.length),
//       y: d => height - d,
//       width: barWidth,
//       height: d => d,
//       fill: 'green'
// });

// svg.selectAll('text')
//   .data(data)
//   .enter()
//     .append('text')
//     .text((d) => d)
//     .attrs({
//       x: (d,i) => i * (width / data.length) + barWidth / 2 - 10,
//       y: (d) => height - d + 20
// });

//------------------------1. PREPARATION------------------------//
//-----------------------------SVG------------------------------//
const width = 960;
const height = 500;
const margin = 5;
const padding = 5;
const adj = 30;
// we are appending SVG first
const svg = d3.select("div#container").append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "-"
          + adj + " -"
          + adj + " "
          + (width + adj *3) + " "
          + (height + adj*3))
    .style("padding", padding)
    .style("margin", margin)
    .classed("svg-content", true);

//-----------------------------DATA-----------------------------//
const timeConv = d3.timeParse("%d-%b-%Y");
const dataset = d3.csv("data/data.csv");
// dataset.then(function(data) {
//     var slices = data.columns.slice(1).map(function(id) {
//         return {
//             id: id,
//             values: data.map(function(d){
//                 return {
//                     date: timeConv(d.date),
//                     measurement: +d[id]
//                 };
//             })
//         };
//     });

slices = [
  {id: "waiting", values: ws},
  {id: "infected", values: ys},
];
// console.log(slices);
// console.log(slices2);

// slices = slices2;

//----------------------------SCALES----------------------------//
const xScale = d3.scaleTime().range([0,width]);
const yScale = d3.scaleLinear().rangeRound([height, 0]);
dates = [start_date, end_date]
xScale.domain(dates);
yScale.domain([(0), d3.max(slices, function(c) {
    return d3.max(c.values, function(d) {
        return d.measurement + 4; });
        })
    ]);

//-----------------------------AXES-----------------------------//
const yaxis = d3.axisLeft()
    .ticks((slices[0].values).length)
    .scale(yScale);

const xaxis = d3.axisBottom()
    .ticks(d3.timeDay.every(1))
    .tickFormat(d3.timeFormat('%b %d'))
    .scale(xScale);

//----------------------------LINES-----------------------------//
const line = d3.line()
    .x(function(d) { return xScale(d.date); })
    .y(function(d) { return yScale(d.measurement); });

let id = 0;
const ids = function () {
    return "line-"+id++;
}

//---------------------------TOOLTIP----------------------------//
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute");

//-------------------------2. DRAWING---------------------------//
//-----------------------------AXES-----------------------------//
svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xaxis);

svg.append("g")
    .attr("class", "axis")
    .call(yaxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("dy", ".75em")
    .attr("y", 6)
    .style("text-anchor", "end")
    .text("Frequency");

//----------------------------LINES-----------------------------//
const lines = svg.selectAll("lines")
    .data(slices)
    .enter()
    .append("g");

    lines.append("path")
    .attr("class", ids)
    .attr("d", function(d) { return line(d.values); });

    lines.append("text")
    .attr("class","serie_label")
    .datum(function(d) {
        return {
            id: d.id,
            value: d.values[d.values.length - 1]}; })
    .attr("transform", function(d) {
            return "translate(" + (xScale(d.value.date) + 10)
            + "," + (yScale(d.value.measurement) + 5 )+ ")"; })
    .attr("x", 5)
    .text(function(d) { return ("Serie ") + d.id; });

//---------------------------POINTS-----------------------------//
    lines.selectAll("points")
    .data(function(d) {return d.values})
    .enter()
    .append("circle")
    .attr("cx", function(d) { return xScale(d.date); })
    .attr("cy", function(d) { return yScale(d.measurement); })
    .attr("r", 1)
    .attr("class","point")
    .style("opacity", 1);

//---------------------------EVENTS-----------------------------//
    lines.selectAll("circles")
    .data(function(d) { return(d.values); } )
    .enter()
    .append("circle")
    .attr("cx", function(d) { return xScale(d.date); })
    .attr("cy", function(d) { return yScale(d.measurement); })
    .attr('r', 10)
    .style("opacity", 0)
    .on('mouseover', function(d) {
        tooltip.transition()
    .delay(30)
        .duration(200)
        .style("opacity", 1);
        tooltip.html(d.measurement)
        .style("left", (d3.event.pageX + 25) + "px")
        .style("top", (d3.event.pageY) + "px");
        const selection = d3.select(this).raise();
        selection
        .transition()
        .delay("20")
        .duration("200")
        .attr("r", 6)
        .style("opacity", 1)
        .style("fill","#ed3700");
    })
    .on("mouseout", function(d) {
        tooltip.transition()
        .duration(100)
        .style("opacity", 0);
        const selection = d3.select(this);
        selection
        .transition()
        .delay("20")
        .duration("200")
        .attr("r", 10)
        .style("opacity", 0);
    });

// });
