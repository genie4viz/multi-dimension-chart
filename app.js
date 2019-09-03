// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

// Define the chart's margins as an object 
var margin = {
    top: 20,
    right: 40,
    bottom: 100,
    left: 100
};

// Define dimensions of the chart area
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Select body, append SVG area to it, and set its dimensions
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append a group area, then set its margins 
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

// function used for updating x-scale var upon click on axis label
function xScale(journalData, chosenXAxis) {
    //creating scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(journalData, d => d[chosenXAxis]) * 0.8,
        d3.max(journalData, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);
    return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
function YScale(journalData, chosenYAxis) {
    //creating scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(journalData, d => d[chosenYAxis]) * 0.8,
        d3.max(journalData, d => d[chosenYAxis]) * 1.2
        ])
        .range([height, 0]);
    return yLinearScale;
}
//function used for updating xAxis var upon click on axis label
function renderAxesX(newXScale, xAxis) {
    let bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}
//function used for updating xAxis var upon click on axis label
function renderAxesY(newYScale, yAxis) {
    let leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis;
}

//function used for updating circles group with a transition to new circles
function renderCircles(circleState, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    circleState.transition()
        .duration(1000)
        .attr('transform', d => `translate(${newXScale(d[chosenXAxis])}, ${newYScale(d[chosenYAxis])})`);
    return circleState;
}

//function used for updating cicles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circleState) {
    
    var toolTip = d3.tip()
        .attr("class", "tooltip")
        // .style("border", "solid")
        .style("background-color", "gray")
        .offset([80, -60])
        .html(function (d) {
            return (`${d.state}<br>${chosenXAxis}: ${d[chosenXAxis]}<br>${chosenYAxis}: ${d[chosenYAxis]}`);
        });

    circleState.call(toolTip);

    circleState
        .on("mouseover", function (data) {
            toolTip.show(data, this);
        })        
        .on("mouseout", function (data, index) {
            toolTip.hide(data, this);
        });

    return circleState;
}

d3.csv("./data.csv").then(function (journalData, error) {
    if (error) throw error;

    // parse data 
    journalData.forEach(function (data) {
        data.poverty = +data.poverty;
        data.povertyMoe = +data.povertyMoe;
        data.age = +data.age;
        data.ageMoe = +data.ageMoe;
        data.income = +data.income;
        data.incomeMoe = +data.incomeMoe;
        data.healthcare = +data.healthcare;
        data.healthcareLow = +data.healthcareLow;
        data.obesity = +data.obesity;
        data.obesityLow = +data.obesityLow;
        data.obesityHigh = +data.obesityHigh;
        data.smokes = +data.smokes;
        data.smokesLow = +data.smokesLow;
        data.smokesLow = +data.smokesLow;
        data.smokesHigh = +data.smokesHigh;
    });

    // xLinearScale function above csv import 
    var xLinearScale = xScale(journalData, chosenXAxis);

    // Create y scale function
    var yLinearScale = YScale(journalData, chosenYAxis);

    // Create initial axis functions 
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis 
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle-group")
        .data(journalData);

    var circleState = circlesGroup.enter()
        .append("g")
        .attr("cursor", "pointer")
        .attr('transform', d => `translate(${xLinearScale(d[chosenXAxis])}, ${yLinearScale(d[chosenYAxis])})`);
    
    circleState        
        .append("circle")
        .attr("cx", 5)
        .attr("cy", 5)
        .attr("r", 15)
        .attr("fill", "lightblue")
        .attr('opacity', 0.5);
        
    circleState
        .append("text")
        .attr("x", 5)
        .attr("y", 5)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "central")
        .attr("font-size", 10)
        .text(d => d["abbr"]);
    
    var labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .attr("font-weight", "bold")
        .classed("active", true)
        .attr("cursor", "pointer")
        .text("In Poverty (%)");

    labelsGroup.append("text")        
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .classed("active", true)
        .attr("cursor", "pointer")
        .text("Age (Median)");

    labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")
        .classed("active", true)
        .attr("cursor", "pointer")
        .text("Household Income (Median)");

    // append y axis
    labelsGroup.append("text")
        .attr("y", -width / 2 - 80)
        .attr("x", height / 2)
        .attr("value", "obesity")
        .attr("text-anchor", "middle")
        .attr("font-weight", "bold")
        .attr("dy", "3em")
        .classed("active", true)
        .attr("transform", "rotate(-90)")
        .attr("cursor", "pointer")
        .text("Obese (%)");

    labelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -width / 2 - 80)
        .attr("x", (height / 2))
        .attr("value", "smokes")
        .attr("dy", "2em")
        .attr("text-anchor", "middle")
        .classed("active", true)
        .attr("cursor", "pointer")
        .text("Smokes (%)");

    labelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -width / 2 - 80)
        .attr("x", (height / 2))
        .attr("value", "healthcare")
        .attr("dy", "1em")
        .attr("text-anchor", "middle")
        .classed("active", true)
        .attr("cursor", "pointer")
        .text("Lacks Healthcare (%)");

    // updateToolTip function above csv import
    circleState = updateToolTip(chosenXAxis, chosenYAxis, circleState);

    // x axis labels event listener
    labelsGroup.selectAll("text")
        .on("click", function () {
            //get value of selection
            var value = d3.select(this).attr("value");
            var ylabelValues = ["obesity", "smokes", "healthcare"];
            if (value !== chosenXAxis && value !== chosenYAxis) {
                //replaces chosenXAxis with value
                if (!ylabelValues.includes(value)) //x value
                    chosenXAxis = value;
                else
                    chosenYAxis = value;
                
                // updates x scale for new data 
                xLinearScale = xScale(journalData, chosenXAxis);
                yLinearScale = YScale(journalData, chosenYAxis);
                //update x axis with transition
                xAxis = renderAxesX(xLinearScale, xAxis);
                yAxis = renderAxesY(yLinearScale, yAxis);

                // updates circles with new values
                circleState = renderCircles(circleState, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
                //updates tooltips with new info
                circleState = updateToolTip(chosenXAxis, chosenYAxis, circleState);
                
                labelsGroup.selectAll("text")._groups[0].forEach(function(node){
                    if(d3.select(node).attr("value") === chosenXAxis || d3.select(node).attr("value") === chosenYAxis){
                        d3.select(node).attr('font-weight', 'bold');
                    }else {
                        d3.select(node).attr('font-weight', 'none');
                    }
                });
            }
        });
});




