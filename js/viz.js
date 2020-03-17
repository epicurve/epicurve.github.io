var sim_params = new Object();
sim_params.beta = 0.0010;
sim_params.gamma = 0.01;
sim_params.v = 0;
sim_params.mu = 0.5;
sim_params.m = 3

var display_params = new Object();

function sim_curve() {
  var beta = sim_params.beta
  var gamma = sim_params.gamma
  var beta_external = 0.01 * beta;
  var m = sim_params.m;
  var rho = gamma / beta;
  var dt = 0.1;
  var T = 10000;
  var v = sim_params.v;
  var mu = sim_params.mu;
  var N = 500;
  var y0 = 0.1;

  var num_points = 200;
  var data_frequency = T / num_points;

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

  var sim_data = [
    // {id: "waiting", values: ws},
    {id: "infected", values: ys},
    // {id: "healthy", values: xs},
    // {id: "removed", values: zs},
  ];
  return sim_data;
}

const line = d3.line()
    .x(function(d) { return xScale(d.date); })
    .y(function(d) { return yScale(d.measurement); });

function update_plot(sim_data) {
  d3.select("path.line-0").remove()

  // update_axis(sim_data)
  let id = 0;
  const ids = function () {
      return "line-"+id++;
  }

  //----------------------------LINES-----------------------------//
  const lines = svg.selectAll("lines")
      .data(sim_data)
      .enter()
      .append("g");

  lines.append("path")
  .attr("class", ids)
  .attr("d", function(d) { return line(d.values); });

  // lines.append("text")
  // .attr("class","serie_label")
  // .datum(function(d) {
  //     return {
  //         id: d.id,
  //         value: d.values[d.values.length - 1]}; })
  // .attr("transform", function(d) {
  //         return "translate(" + (xScale(d.value.date) + 10)
  //         + "," + (yScale(d.value.measurement) + 5 )+ ")"; })
  // .attr("x", 5)
  // .text(function(d) { return ("Serie ") + d.id; });

  //---------------------------POINTS-----------------------------//
  // lines.selectAll("points")
  // .data(function(d) {return d.values})
  // .enter()
  // .append("circle")
  // .attr("cx", function(d) { return xScale(d.date); })
  // .attr("cy", function(d) { return yScale(d.measurement); })
  // .attr("r", 1)
  // .attr("class","point")
  // .style("opacity", 1);

  //---------------------------EVENTS-----------------------------//

  // lines.selectAll("circles")
  // .data(function(d) { return(d.values); } )
  // .enter()
  // .append("circle")
  // .attr("cx", function(d) { return xScale(d.date); })
  // .attr("cy", function(d) { return yScale(d.measurement); })
  // .attr('r', 10)
  // .style("opacity", 0)
  // .on('mouseover', function(d) {
  //     tooltip.transition()
  // .delay(30)
  //     .duration(200)
  //     .style("opacity", 1);
  //     tooltip.html(d.measurement)
  //     .style("left", (d3.event.pageX + 25) + "px")
  //     .style("top", (d3.event.pageY) + "px");
  //     const selection = d3.select(this).raise();
  //     selection
  //     .transition()
  //     .delay("20")
  //     .duration("200")
  //     .attr("r", 6)
  //     .style("opacity", 1)
  //     .style("fill","#ed3700");
  // })
  // .on("mouseout", function(d) {
  //     tooltip.transition()
  //     .duration(100)
  //     .style("opacity", 0);
  //     const selection = d3.select(this);
  //     selection
  //     .transition()
  //     .delay("20")
  //     .duration("200")
  //     .attr("r", 10)
  //     .style("opacity", 0);
  // });
}

//------------------------1. PREPARATION------------------------//
//-----------------------------SVG------------------------------//
const width = 960;
const height = 500;
const margin = 5;
const padding = 5;
const adj = 30;
// we are appending SVG first
const container = d3.select("div#container")

function update() {
  beta = document.getElementById("beta_slider").value;
  gamma = document.getElementById("gamma_slider").value;
  sim_data = sim_curve();
  update_plot(sim_data);
}

function make_new_slider(sim_param_name, min, max, step) {
  function update() {
    sim_params[sim_param_name] = document.getElementById(sim_param_name).value;
    sim_data = sim_curve();
    update_plot(sim_data);
  }

  slider_input = container.append("div")
    .attr("class", "inputdiv");
  // slider_input.append("div").text(min);
  slider_input.append("div")
    .text(min + " < " + sim_param_name + " > " + max);
  // slider_input.append("div").text(min).attr("style", "width:150px; margin:0px");
  slider_input.append("input")
    .attr("type", "range")
    .attr("min", min)
    .attr("max", max)
    .attr("step", step)
    .attr("id", sim_param_name)
    .attr("value", sim_params[sim_param_name])
    .on("input", function input() {
      update();
    });
  // slider_input.append("div").text(max).attr("style", "width:150px");
}

make_new_slider("beta", 0.0001, 0.0010, 0.0001, )
make_new_slider("gamma", 0.01, 0.10, 0.01)
make_new_slider("mu", 0.0, 1.0, 0.1)
make_new_slider("v", 0.0, 0.01, 0.001)
make_new_slider("m", 0, 100, 10)

const svg = container.append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "-"
          + adj + " -"
          + adj + " "
          + (width + adj *3) + " "
          + (height + adj*3))
    .style("padding", padding)
    .style("margin", margin)
    .classed("svg-content", true);

sim_data = sim_curve();

const timeConv = d3.timeParse("%d-%b-%Y");

//----------------------------SCALES----------------------------//
var xScale;
var yScale;
var yaxis;
var xaxis;

function update_axis(sim_data) {
  xScale = d3.scaleTime().range([0,width]);
  yScale = d3.scaleLinear().rangeRound([height, 0]);
  L = sim_data[0].values.length
  dates = [sim_data[0].values[0].date, sim_data[0].values[L-1].date]
  xScale.domain(dates);
  yScale.domain([(0), d3.max(sim_data, function(c) {
      return d3.max(c.values, function(d) {
          return d.measurement + 4; });
          })
      ]);

  //-----------------------------AXES-----------------------------//
  yaxis = d3.axisLeft()
      .ticks(10) // (slices[0].values).length)
      .scale(yScale);

  xaxis = d3.axisBottom()
      .ticks(10)
      .tickFormat(d3.timeFormat('%b %d'))
      .scale(xScale);

  svg.select(".xaxis")
      .transition(t)
      .call(xaxis)

  svg.select(".yaxis")
      .transition(t)
      .call(yaxis)
}

//---------------------------TOOLTIP----------------------------//
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute");

//-------------------------2. DRAWING---------------------------//
//-----------------------------AXES-----------------------------//

update_axis(sim_data)

svg.append("g")
    .attr("class", "xaxis")
    .attr("transform", "translate(0," + height + ")")
    .call(xaxis);

svg.append("g")
    .attr("class", "yaxis")
    .call(yaxis)
    // .append("text")
    // .attr("transform", "rotate(-90)")
    // .attr("dy", ".75em")
    // .attr("y", 6)
    // .style("text-anchor", "end")
    // .text("Frequency");

update_plot(sim_data)
