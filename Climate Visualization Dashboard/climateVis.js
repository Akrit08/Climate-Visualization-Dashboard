// Declare constants
const CHART_COLOR = "rgb(0,128,128)";
const SVG_COLOR = "rgba(0, 120, 180, 0.8)";
const PADDING = 6;
const MAX_COLOR = 0;
const MIN_COLOR = 255;
const MAX_ARC = 5;
const MIN_ARC = 2;

const OPTIONS = [
  "Minimum Temperature",
  "Maximum Temperature",
  "Evaporation",
  "Sunshine",
];

// Determine variables for the size of the arc and radius
var arcWidth = 800;
var arcHeight = 550;
var outerRad = arcWidth / 3;
var innerRad = arcWidth / 3.2;

// Determine variables as global variables
var position = [outerRad, outerRad + PADDING];
var filterOption;
var filteredData;
var scaleColor;
var rawData;
var sortedYears;
var minOfOption;
var maxOfOption;
var colorDisplay;
var selectedOption;
var selectedYear;

$("body").ready(init);

/**
 * Initialize by taking the csv file and calling the
 * required functions
 */
function init() {
  d3.csv("Sydney_city_dataset.csv").then((data) => {
    rawData = data;
    selectOptions();
    draw();
    // On change in the options or years, draws a new
    // cyclic representation
    $("#options, #years").on("change", function () {
      // Calls function draw
      draw();
    });
  });
}

/**
 * Draws the cylic representation of the required data based on
 * the option selected and the year selected
 */
function draw() {
  selectedOption = $("#options option:selected").val();
  selectedYear = $("#years option:selected").val();
  // Determines the outer radius and inner radius
  outerRad = arcWidth / 3;
  innerRad = arcWidth / 3.2;

  // Removes the svg when a different option or year is chosen
  d3.selectAll("svg").remove();

  // Returns the year by filtering raw data
  oneYear = rawData.filter((each) => {
    return new Date(each.Date).getFullYear() == selectedYear;
  });

  // Creates SVG element
  var svg = d3
    .select("#space")
    .append("svg")
    .attr("width", 700)
    .style("padding-top", 50)
    .attr("height", arcHeight);

  // Creates Pie Layout of the data
  var pie = d3
    .pie()
    .value(function (d, i) {
      return d;
    })
    .padAngle(0.02)
    .sort(null);

  // Returns values of the selected option for one year
  var filteredOptionOneYr = oneYear.map((eachval) => {
    return eachval[selectedOption];
  });

  // Gets the minimum and maximum among the selected option
  minOfOption = Math.min(...filteredOptionOneYr);
  maxOfOption = Math.max(...filteredOptionOneYr);
  // Scales the color of the obtained minimum and maximum values
  // with the Min Color and Max Color
  scaleColor = d3
    .scaleLinear()
    .domain([minOfOption, maxOfOption])
    .range([MIN_COLOR, MAX_COLOR]);

  for (var i = 0; i < 12; i++) {
    // Returns months of the selected year
    function callback(eachval, i) {
      return new Date(eachval.Date).getUTCMonth() == i;
    }

    // Filters the selected year and gets the months of the year
    // by calling the callback function
    filteredData = oneYear.filter((eachval) => callback(eachval, i));

    // Returns the values of the selected option of the year
    filterOption = filteredData.map((eachval) => {
      return parseFloat(eachval[selectedOption]);
    });

    // Draws a Cyclic Representation
    cyclicRep(pie, filterOption, svg, position, i);
    // Calls the function indexOption
    indexOption();
  }
}
/**
 * Displays the index title and the indexes of the selected data
 */
function indexOption() {
  // Prints text
  $("#index").html("<b>Description</b>");
  // Prints texts and data in the right column under the box 'Description'
  $("#indexDisplay")
    .append("text")
    .attr("dy", "0em")
    .html(
      "<br><b> Minimum of " +
        selectedOption +
        "<br>" +
        minOfOption +
        "</b><br><br> <b>Maximum of " +
        selectedOption +
        "<br>" +
        maxOfOption +
        "</b><br><b>" +
        "<br> The data is represented for all 12 months. " +
        "The outermost circle represents the 1st month, " +
        "and as we go towards the center, the month increases. " +
        "1st Day is the first right arc from the middle line. And " +
        "as it goes around the circle the day increases. " +
        "<br><br> If " +
        "the arc is comparatively darker in that circle," +
        " then the value of the data is comparatively higher." +
        "<br><br>Note:<br>If there is no circle between or within other circles, " +
        "then it is because there is no data for that month of the year" +
        " in the dataset.<br> And if the data is too low, then the arc of" +
        " that data is not displayed." +
        ""
    );
}

/**
 * Displays the options in the dropdown menu with the required css
 */
function selectOptions() {
  // Properties to display the text displayed at top
  $("#optionSpace")
    .css("padding", 20)
    .css("padding-left", 280)
    .html("<select id='options'></select>");
  // Displays the given options
  OPTIONS.forEach(function (d, i) {
    $("#optionSpace > #options").append(
      `<option value='${d}' > ${d} </option>`
    );
  });
  // Calls the function selectYears
  selectYears();
}

/**
 * Returns the years and displays in the dropdown menu for selecting year
 */
function selectYears() {
  var uniqYears = [];
  // Filters the raw data to obtain the unique years
  uniqYears = rawData.filter((each) => {
    let date = new Date(each.Date);
    return date.getMonth() == "05" && date.getDate() == "01";
  });
  // Maps the unique years to get only the year of the data
  uniqYears = uniqYears.map((each) => {
    let date = new Date(each.Date);
    return date.getFullYear();
  });
  // Changes unique years which is in Set to Array
  uniqYears = Array.from(new Set(uniqYears));
  // Sorts unique years in ascending order
  uniqYears = uniqYears.sort(function (x, y) {
    return d3.ascending(x, y);
  });
  // Displays the text with options at top
  $("#optionSpace").append(
    " <b>of Sydney City on</b> <select id='years'></select>"
  );
  // Displays option of the years
  uniqYears.forEach(function (d, i) {
    $("#optionSpace > #years").append(`<option value='${d}' > ${d} </option>`);
  });
}

/**
 * Draws the Cyclic Representation of the selected option and the year with the
 * given parameters
 *
 * @param {*} pie
 * @param {*} data
 * @param {*} svg
 * @param {*} position
 * @param {*} i
 */
function cyclicRep(pie, data, svg, position, i) {
  // Values of inner radius and outer radius
  innerRad -= PADDING * 3;
  outerRad -= PADDING * 3;
  // Properties of arc
  var arc = d3
    .arc()
    .innerRadius(innerRad)
    .outerRadius(outerRad)
    .cornerRadius(3);

  // Creates a layout with given properties
  var div = d3
    .select("body")
    .append("div")
    .style("position", "absolute")
    .style("z-index", "100")
    .style("background-color", "#cccccc")
    .style("opacity", 1);

  // Displays the required data in the arcs
  var arcs = svg
    .selectAll("g.arc")
    .data(pie(data))
    .enter()
    .append("g")
    .attr("transform", `translate(${position[0]}, ${position[1]})`);

  // Displays the color based on the respective data in the arcs
  arcs
    .append("path")
    .attr("fill", (d, i) => {
      colorDisplay = `rgb(${scaleColor(d.value)},${scaleColor(
        d.value
      )},${scaleColor(d.value)})`;
      return colorDisplay;
    })
    .attr("d", arc)
    // Displays cursor as pointer when hovering
    .style("cursor", "pointer")
    // Displays animation when mouse is over the arcs
    .on("mouseover", function (event, d) {
      // Transitions and reduces the opacity
      d3.select(this).transition().duration(10).attr("opacity", "0.7");
      // Displays the data with texts
      div
        .html(
          "" +
            dateHover[d.index] +
            "<br>" +
            selectedOption +
            ": " +
            dataHover[d.index]
        )
        // Positions the displayed data
        .style("top", event.clientY + 2 + "px")
        .style("left", event.clientX + 20 + "px");
    })
    // Displays animation when mouse is out of the arcs
    .on("mouseout", function (event) {
      d3.select(this).transition().duration(400).attr("opacity", "1");
      div.html("");
    });
  // Displays data or value of the arc when hovering above that arc
  var dataHover = filterOption.filter((each) => {
    return each;
  });
  // Displays date of the arc when hovering above that arc
  var dateHover = filteredData.map((each, i) => {
    date = new Date(each.Date).toDateString();
    return date;
  });
  // Displays the background color of the svg
  svg.style("background-color", SVG_COLOR);
}
