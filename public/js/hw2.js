$(document).ready(function() {
    var density = {
      "臺北市": 9861.00,
      "嘉義市": 4486.54,
      "新竹市": 4246.80,
      "基隆市": 2795.44,
      "新北市": 1942.14
      ,
      "桃園市": 1798.88,
      "臺中市": 1260.63,
      "彰化縣": 1191.86,
      "高雄市": 940.40,
      "臺南市": 860.48,
      "金門縣": 907.59,
      "澎湖縣": 820.45,
      "雲林縣": 533.84,
      "連江縣": 448.72,
      "新竹縣": 387.29,
      "苗栗縣": 303.33,
      "屏東縣": 298.55,
      "嘉義縣": 267.92,
      "宜蘭縣": 212.76,
      "南投縣": 121.79,
      "花蓮縣": 71.01,
      "臺東縣": 62.43
    };
    d3.json("/data/county.topojson", function(topodata) {
      var features = topojson.feature(topodata, topodata.objects.county).features;
      
      var path = d3.geo.path().projection(
        d3.geo.mercator().center([121,24]).scale(6000).translate([150, 250])
      );

      d3.select("svg").selectAll("path").data(features)
        .enter().append("path").attr("d",path);
      
      //設定人口密度資訊
      for(i=features.length - 1; i >= 0; i-- ) {
          features[i].properties.density = density[features[i].properties.C_Name];
      }

      var color = d3.scale.linear().domain([0,10000]).range(["#fdec8b","#df5c2a"]);
      d3.select("svg").selectAll("path")
        .data(features)
        .attr({
          class: 'states',
          d: path,
          fill: function(d) {
            return color(d.properties.density);
          }
        })
        .style({'stroke':'#9b9b97'})
        .on('mouseout', function(d, i){
          d3.select('svg').selectAll('path')
            .style({'fill-opacity': .6})
          
        })
        .on('mouseover', function(d, i){
          var currentState = this;
          d3.select(this).style('fill-opacity', 1);
          $("#name").text(d.properties.C_Name);
          $("#density").text(d.properties.density);
        })
    });
  });
  