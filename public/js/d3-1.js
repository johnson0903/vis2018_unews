let reds = {
    3: ["#fee0d2", "#fc9272", "#de2d26"],
    4: ["#fee5d9", "#fcae91", "#fb6a4a", "#cb181d"],
    5: ["#fee5d9", "#fcae91", "#fb6a4a", "#de2d26", "#a50f15"],
    6: ["#fee5d9", "#fcbba1", "#fc9272", "#fb6a4a", "#de2d26", "#a50f15"],
    7: ["#fee5d9", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#99000d"],
    8: ["#fff5f0", "#fee0d2", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#99000d"],
    9: ["#fff5f0", "#fee0d2", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#a50f15", "#67000d"]
};
let cities;
let currentYear = 105;
var tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0)
var features;

// 讀取空屋資料
d3.json("./data/LowElectricityUtilization.json", inputData => {
    cities = inputData.cities;

    // 畫出台灣地圖
    d3.json("./data/county.topojson", drawTaiwanMap);
});

// 台灣空屋數地圖
function drawTaiwanEmptyHousehold() {
    isButtonClick = true
    let svg_taiwan = d3.select("#taiwan")

    svg_taiwan.selectAll("path")
      .attr("fill", function (d) {
          if (d.properties.info.household < 20000){
              return "#9EC4ED"
          } else if (d.properties.info.household < 60000){
              return "#4d7cae"
          } else {
              return "#375a7f"
          }
      })

    let taiwanLegend = svg_taiwan.selectAll(".taiwanLegend")
      .data([0,20000,60000])
      .attr("transform", function (d, i) {
          return "translate(600," + (i * 25 - 80) + ")"
      })

    taiwanLegend.select('text')
      .attr("x", 30)
      .attr("y", 15)
      //.attr("dy", ".35em")
      .text(function (d, i) {
          if (i == 0 ){
              return "<20000"
          } else if (i == 1) {
              return "20000~60000"
          }
          else {
              return ">60000"
          }
      })
      .attr("class", "textselected")
      .style("text-anchor", "start")
      .style("font-size", 16)

    taiwanLegend.select('rect')
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 20)
      .attr("height", 20)
      .style("fill", function (d, i) {
          if (i==0){
              return "#9EC4ED"
          } else if (i==1){
              return "#4d7cae"
          } else {
              return "#375a7f"
          }
      })
}

function drawTaiwanMap(topodata) {
    features = topojson.feature(topodata, topodata.objects.county).features;
    let svg_taiwan = d3.select('#taiwan');
    svg_taiwan.attr("transform", "translate(0, 10)");

    // 設定空屋率資訊到feature的properties
    for (let i = 0; i < features.length; i++) {
        features[i].properties.info = cities[currentYear][features[i].properties.C_Name];
    }

    svg_taiwan.selectAll("path")
      .data(features)
      .enter().append("path")
      .attr("d", d3.geoPath().projection(
        d3.geoMercator()
          .center([121, 24])
          .scale(8000)))
      .attr("stroke", "#67000d")
      .attr("stroke-width", 1)
      .attr("fill", "white")
    drawTaiwanRatio()
}
var isButtonClick = false
// 台灣縣市空屋比例地圖
function drawTaiwanRatio() {
    let svg_taiwan = d3.select('#taiwan');

    // 空屋率scale
    let ratioColorQScale = d3.scaleQuantile()
      .domain([6,12,15]).range(reds[3]);

    // 畫出path、設定縮放大小和中心、設定邊線顏色和各個縣市分層設色
    svg_taiwan.selectAll("path")
      .attr("fill", function(d) {
          return ratioColorQScale(d.properties.info.ratio)
      })
      .on("click", function (d) {
          showDetailInfo(d.properties.C_Name);
      })
      .on("mouseover", function (d,i) {
          d3.select(this).attr("stroke-width", 2);
          this.style.cursor="pointer";

          // 設定 tooltip
          let household = d.properties.info.household
          let ratio = d.properties.info.ratio
          tooltip.html(
            d.properties.C_Name + "<br/><br/>" +
            "空屋數: " + household + " 戶" + "<br/>" +
            "空屋率: " + ratio + "%"
          )
            .style("left", (d3.event.pageX + 20) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
          tooltip.transition()
            .duration(200).style("opacity", 0.9)
      })
      .on("mouseleave", function (d,i) {
          d3.select(this).attr("stroke-width", 1)
          tooltip.style("opacity", 0)
      })

    if (isButtonClick == true){
        let taiwanLegend = svg_taiwan.selectAll(".taiwanLegend")
          .data(ratioColorQScale.domain())
          .attr("transform", function (d, i) {
              return "translate(600," + (i * 25 - 80) + ")"
          })

        taiwanLegend.select('text')
          .attr("x", 30)
          .attr("y", 15)
          //.attr("dy", ".35em")
          .text(function (d, i) {
              if (d <= 6 ){
                  return "小於 10%"
              } else if (d <= 12) {
                  return "10 ~ 13%"
              }
              else {
                  return "大於 13%"
              }
          })
          .attr("class", "textselected")
          .style("text-anchor", "start")
          .style("font-size", 16)

        taiwanLegend.select('rect')
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", 20)
          .attr("height", 20)
          .style("fill", function (d, i) {
              return ratioColorQScale(d)
          })
    }
    let taiwanLegend = svg_taiwan.selectAll(".taiwanLegend")
      .data(ratioColorQScale.domain())
      .enter().append("g")
      .attr("class", "taiwanLegend")
      .attr("transform", function (d, i) {
          return "translate(600," + (i * 25 - 80) + ")"
      })

    taiwanLegend.append('text')
      .attr("x", 30)
      .attr("y", 15)
      //.attr("dy", ".35em")
      .text(function (d, i) {
          if (d <= 6 ){
              return "小於 10%"
          } else if (d <= 12) {
              return "10 ~ 13%"
          }
          else {
              return "大於 13%"
          }
      })
      .attr("class", "textselected")
      .style("text-anchor", "start")
      .style("font-size", 16)

    taiwanLegend.append('rect')
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 20)
      .attr("height", 20)
      .style("fill", function (d) {
          return ratioColorQScale(d)
      })
}


var isClicked = false

var margin = {top: 30, right: 20, bottom: 30, left: 50},
  width = 350 - margin.left - margin.right,
  height = 250 - margin.top - margin.bottom;

var oldEmptyXScale = d3.scaleLinear().range([0,width]);
var oldEmptyYScale = d3.scaleLinear().range([height,0]);
var newEmptyXScale = d3.scaleLinear().range([0,width]);
var newEmptyYScale = d3.scaleLinear().range([height,0]);

function showDetailInfo(cityName) {
    let oldEmptyLineChartSVG = d3.select("#old-empty-line-chart");
    oldEmptyLineChartSVG.append("text")
      .attr("text-anchor", "end")
      .attr("x", width + margin.left + margin.right)
      .attr("y", height + margin.top - 10)
      .text("(民國)")
      .style("font-size", "10px")
    oldEmptyLineChartSVG.append("text")
      .attr("text-anchor", "end")
      .attr("y",40)
      .attr("x", 80)
      .text("戶數")
      .style("font-size", "10px")

    let newEmptyLineChartSVG = d3.select("#new-empty-line-chart");
    newEmptyLineChartSVG.append("text")
      .attr("text-anchor", "end")
      .attr("x", width + margin.left + margin.right)
      .attr("y", height + margin.top - 10)
      .text("(民國)")
      .style("font-size", "10px")

    newEmptyLineChartSVG.append("text")
      .attr("text-anchor", "end")
      .attr("y",40)
      .attr("x", 80)
      .text("戶數")
      .style("font-size", "10px")

    let cityData = [];

    // 設定選好的縣市的空屋資料
    for (let year = 101; year <= 105; year++){
        let data = {
            "year": year,
            "newEmptyHousehold": cities[year][cityName].newEmptyHousehold,
            "oldEmptyHousehold": cities[year][cityName].oldEmptyHousehold
        };
        cityData.push(data)
    }

    // 設定scale
    oldEmptyXScale.domain([101,105]);
    newEmptyXScale.domain([101,105]);

    oldEmptyYScale.domain(d3.extent(cityData, d => d.oldEmptyHousehold));
    newEmptyYScale.domain(d3.extent(cityData, d => d.newEmptyHousehold));

    // 設定座標軸
    let oldEmptyXAxis = d3.axisBottom()
      .scale(oldEmptyXScale)
      .ticks(5)
      .tickFormat(d3.format("d"))
    let oldEmptyYAxis = d3.axisLeft()
      .scale(oldEmptyYScale)


    let newEmptyXAxis = d3.axisBottom()
      .scale(newEmptyXScale)
      .ticks(5)
      .tickFormat(d3.format("d"))
    let newEmptyYAxis = d3.axisLeft()
      .scale(newEmptyYScale)

    // 設定line
    let lamdaXScale = d => oldEmptyXScale(d.year)
    var oldEmptyline = d3.line()
      .x(lamdaXScale)
      .y(d => oldEmptyYScale(d.oldEmptyHousehold))

    let newLamdaXScale = d => oldEmptyXScale(d.year)
    var newEmptyline = d3.line()
      .x(newLamdaXScale)
      .y(d => newEmptyYScale(d.newEmptyHousehold))


    if (isClicked == false) {
        drawOldEmptyLine()
        drawNewEmptyLine()
        isClicked = true
    } else {
        updateLine()
    }

    function drawNewEmptyLine() {
        newEmptyLineChartSVG.append("text")
          .attr("class", "text-title")
          .attr("text-anchor", "end")
          .attr("y",20)
          .attr("x", 280)
          .text(cityName + "歷年新建餘屋數")
          .style("font-size", "18px")

        newEmptyLineChartSVG
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

        newEmptyLineChartSVG.select("g").append("g")
          .attr("id", "xAxisG")
          .attr("transform", "translate(0," + height + ")")
          .call(newEmptyXAxis)

        newEmptyLineChartSVG.select("g").append("g")
          .attr("id", "yAxisG").call(newEmptyYAxis)

        // 舊空屋折線
        newEmptyLineChartSVG.select("g").append("path")
          .attr("class", "line")
          .attr("d", newEmptyline(cityData))
          .attr("fill", "none")
          .attr("stroke", "#97de95")
          .attr("stroke-width", 2)

        // 舊空屋點
        newEmptyLineChartSVG.select("g").selectAll("circle")
          .data(cityData).enter().append("circle")
          .attr("r", 5)
          .attr("cx", d => newEmptyXScale(d.year))
          .attr("cy", d => newEmptyYScale(d.newEmptyHousehold))
          .attr("fill", "#08c299")
    }

    function drawOldEmptyLine() {

        oldEmptyLineChartSVG.append("text")
          .attr("class", "text-title")
          .attr("text-anchor", "end")
          .attr("y",20)
          .attr("x", 280)
          .text(cityName + "歷年非新建數")
          .style("font-size", "18px")

        oldEmptyLineChartSVG
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

        oldEmptyLineChartSVG.select("g").append("g")
          .attr("id", "oldXAxisG")
          .attr("transform", "translate(0," + height + ")")
          .call(oldEmptyXAxis)

        oldEmptyLineChartSVG.select("g").append("g")
          .attr("id", "oldYAxisG").call(oldEmptyYAxis)

        // 舊空屋折線
        oldEmptyLineChartSVG.select("g").append("path")
          .attr("class", "oldEmptyLine")
          .attr("d", oldEmptyline(cityData))
          .attr("fill", "none")
          .attr("stroke", "#fc9272")
          .attr("stroke-width", 2)

        // 舊空屋點
        oldEmptyLineChartSVG.select("g").selectAll("circle")
          .data(cityData).enter().append("circle")
          .attr("r", 5)
          .attr("cx", d => oldEmptyXScale(d.year))
          .attr("cy", d => oldEmptyYScale(d.oldEmptyHousehold))
          .attr("fill", "red")
    }

    function updateLine() {

        oldEmptyLineChartSVG.select(".text-title")
          .text(cityName + "歷年非新建數")

        newEmptyLineChartSVG.select(".text-title")
          .text(cityName + "歷年新建餘屋數")

        // 更新y軸資料範圍
        oldEmptyYScale.domain(d3.extent(cityData, d => d.oldEmptyHousehold))
        d3.select("#oldYAxisG")
          .transition()
          .duration(500)
          .call(oldEmptyYAxis)

        // 更新點資料
        oldEmptyLineChartSVG.selectAll("circle")
          .data(cityData)
          .transition().duration(500)
          .attr("r", 5)
          .attr("cx", d => oldEmptyXScale(d.year))
          .attr("cy", d => oldEmptyYScale(d.oldEmptyHousehold))

        // 更新折線
        d3.select(".oldEmptyLine")
          .transition().duration(500)
          .attr("d", oldEmptyline(cityData))



        // 更新y軸資料範圍
        newEmptyYScale.domain(d3.extent(cityData, d => d.newEmptyHousehold))
        d3.select("#yAxisG")
          .transition()
          .duration(500)
          .call(newEmptyYAxis)

        // 更新點資料
        newEmptyLineChartSVG.selectAll("circle")
          .data(cityData)
          .transition().duration(500)
          .attr("r", 5)
          .attr("cx", d => newEmptyXScale(d.year))
          .attr("cy", d => newEmptyYScale(d.newEmptyHousehold))

        // 更新折線
        d3.select(".line")
          .transition().duration(500)
          .attr("d", newEmptyline(cityData))
    }
}