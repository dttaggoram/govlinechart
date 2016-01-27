$( ".tab ol li" ).click(function() {
	$( ".tab ol li.active").removeClass('active');
	$( this ).addClass("active");
});

$( "#minutesbutton" ).click(function() {
	$( "#minutes").removeClass("hidden");
	$( "#hours" ).addClass("hidden");
	$( "#days" ).addClass("hidden");
});
$( "#hoursbutton" ).click(function() {
	$( "#hours").removeClass("hidden");
	$( "#minutes" ).addClass("hidden");
	$( "#days" ).addClass("hidden");
});
$( "#daysbutton" ).click(function() {
	$( "#days").removeClass("hidden");
	$( "#hours" ).addClass("hidden");
	$( "#minutes" ).addClass("hidden");
});


function getUrlVars()
    {
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for(var i = 0; i < hashes.length; i++)
        {
            hash = hashes[i].split('=');

            if($.inArray(hash[0], vars)>-1)
            {
                vars[hash[0]]+=","+hash[1];
            }
            else
            {
                vars.push(hash[0]);
                vars[hash[0]] = hash[1];
            }
        }

        return vars;
    }

var service = getUrlVars()["id"];

var margin = {top: 50, right: 200, bottom: 40, left: 110},
    width = 960 - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;

var parseTime = d3.time.format("%H:%M %s").parse,
    formatter = d3.time.format("%H:%M"),
    bisecttime = d3.bisector(function(d) { return d.time; }).left;

d3.json("data/apmtest.json", function(data) {
var date = new Date();
var categories = ['Mins','Hours','Days'];
var minutes = [];
var hours = [];
var days = [];

for (i = 0; i < 60; i++) {
    minutes.push(date-(60*60*1000)+(i*60*1000));
}

for (i = 0; i < 24; i++) {
    hours.push(date-(24*60*60*1000)+(i*60*60*1000));
}

for (i = 0; i < 30; i++) {
    days.push(date-(30*24*60*60*1000)+(i*24*60*60*1000));
}

dataset = categories.map(function (a) {
	if(a=='Mins'){datetime = minutes; user = data.userCountMins; load = data.loadTimeMins; site = data.siteCountMins;} 
	if(a=='Hours'){datetime = hours; user = data.userCountHours; load = data.loadTimeHours; site = data.siteCountHours;} 
	if(a=='Days'){datetime = days; user = data.userCountDays; load = data.loadTimeDays; site = data.siteCountDays;}
	var c = -1; var d = -1; var e = -1; var useraverage=0; var loadaverage=0; var siteaverage=0;
  return {
	name: a,
	datetimes: datetime,
	0: datetime.map(function (b) {c++; useraverage += user[c]; return {time: b, value: user[c]}; }),
	1: datetime.map(function (f) {d++; loadaverage += load[d]; return {time: f, value: load[d]}; }),
	2: datetime.map(function (g) {e++; siteaverage += site[e]; return {time: g, value: site[e]}; }),
  user: useraverage,
  load: loadaverage,
  site: siteaverage
	}
});

console.log(dataset);

for (var v = 0; v < 3; v++) {

if (v==0) {l=59} if (v==1) {l=23} if (v==2) {l=29}
if (v==0) {h="#minutes"} if (v==1) {h="#hours"} if (v==2) {h="#days"}


data = dataset[v]

var j;
for (u = 0; u < 3; u++) {
if (u==0) {j="user"} if (u==1) {j="load"} if (u==2) {j="site"}

var svg = d3.select(h).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

if(v == 0) {
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(d3.time.minutes, 10);
}

if(v == 1) {
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(d3.time.hours, 3)
    .tickFormat(d3.time.format('%H:%M'));
}

if(v == 2) {
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(d3.time.weeks,1)
    .tickFormat(d3.time.format('%a %d'));
}

var yAxis = d3.svg.axis()
    .scale(y)
    .ticks(2)
    .orient("left");

var line = d3.svg.line()
    .x(function(d) { return x(d.time) })
    .y(function(d) { return y(d.value) });

var yaxistitle = ["User Count","Load Time","Site Count"];
var xaxistitle = ["Last 60 Minutes","Last 24 Hours","Last 30 Days"];

x.domain([new Date(data.datetimes[0]), new Date(data.datetimes[l])]);
y.domain([0,d3.max(data[u], function(d) { return d.value; })]);


 svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("id","timeincidents")
      .attr("x", width/2)
      .attr("y", 30)
      .style("text-anchor", "middle")
      .text(xaxistitle[v]);
 
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("id","numberincidents")
      .attr("transform", "rotate(-90)")
      .attr("x", -30)
      .attr("y", 6)
      .attr("dy", "-4em")
      .style("text-anchor", "end")
      .text(yaxistitle[u]);

  var box = svg.append("g");

    box.append("text")
      .attr("class","bold-large highlight")
      .attr("width", margin.right)
      .attr("height", height)
      .attr("x",(width+(margin.right/2)))
      .attr("y",(height/2))
      .style("text-anchor", "middle")
      .text(function(){
        if (u==0) return parseInt(data.user/data[0].length);
        if (u==1) return parseInt(data.load/data[0].length);
        if (u==2) return parseInt(data.site/data[0].length);
      });

    box.append("text")
      .attr("class","bold-small")
      .attr("width", margin.right)
      .attr("height", height)
      .attr("x",(width+(margin.right/2)))
      .attr("y",(height/2)+20)
      .style("text-anchor", "middle")
      .text('Average');

    box.append("text")
      .attr("class","bold-small")
      .attr("width", margin.right)
      .attr("height", height)
      .attr("x",(width+(margin.right/2)))
      .attr("y",(height/2)+40)
      .style("text-anchor", "middle")
      .text(yaxistitle[u]);

  svg.append("path")
      .datum(data[u])
      .attr("class", "line")
      .attr("d", line);

  var focus = svg.append("g")
      .attr("class", "focus focus-" + j)
      .style("display", "none");


  focus.append("circle")
      .attr("r", 6);

  focus.append("rect")
      .attr("height", height)
      .attr("width", 2);      

  focus.append("text")
      .attr("x", 9)
      .attr("dy", "-1em");

    svg.append("rect")
      .attr("class", "overlay " + v + "-" + h + "-" + j)
      .attr("width", width)
      .attr("height", height)
      .on("mouseout", function() { d3.selectAll(".focus").style("display", "none"); })
      .on("mousemove", function()
          {

    var self = d3.select(this),
        c = self.attr('class');
        replace = c.replace("overlay ", "");
        split = replace.split("-");
        
        if (split[0]==0) {l=59} if (split[0]==1) {l=23} if (split[0]==2) {l=29}
        if (split[2]=="user") {k=0} if (split[2]=="load") {k=1} if (split[2]=="site") {k=2}
    
    var x = d3.time.scale()
            .range([0, width]);

    var y = d3.scale.linear()
    .range([height, 0]);
        
    x.domain([new Date(dataset[split[0]][k][0].time), new Date(dataset[split[0]][k][l].time)]);
    y.domain([0,d3.max(dataset[split[0]][k], function(d) { return d.value; })]);


    var v = split[0],
        h = split[1],
        j = split[2],
        x0 = x.invert(d3.mouse(this)[0]),
        i = bisecttime(dataset[split[0]][k], x0, 1),
        d0 = dataset[split[0]][k][i - 1];
        d1 = dataset[split[0]][k][i],
        d = x0 - d0.time > d1.time - x0 ? d1 : d0;
    d3.select(h + " .focus-" + j).style("display", null);
    d3.select(h + " .focus-" + j + " circle").attr("transform", "translate(" + x(d.time) + "," + y(d.value) + ")");
    d3.select(h + " .focus-" + j + " text").attr("transform", "translate(" + x(d.time) + "," + y(d.value) + ")");
    d3.select(h + " .focus-" + j + " rect").attr("transform", "translate(" + x(d.time) + ",0)");
    d3.select(h + " .focus-" + j + " text").text(function() { return  d.value  });
  });

    }
  }
});