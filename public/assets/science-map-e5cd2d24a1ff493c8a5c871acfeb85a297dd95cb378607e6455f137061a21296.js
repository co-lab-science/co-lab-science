var w=window.innerWidth,h=400,dataset={nodes:[{name:"Biochemistry"},{name:"Cell Biology"},{name:"Molecular Biology"},{name:"Developmental and Reproductive Biology"},{name:"Immunology"},{name:"Bioinformatics"},{name:"Oncology"},{name:"Cell and Nuclear Division"},{name:"Computational Biology"},{name:"Epigenetics"},{name:"Enzymes"},{name:"Genetics"},{name:"Genomics"},{name:"Transcriptomics"},{name:"Proteomics"},{name:"Pharmacology"},{name:"Pathology"},{name:"Population, Ecological, and Evolutionary Genetics"},{name:"Receptors and Membrane Biology"},{name:"Synthetic Biology"},{name:"Systems Biology"},{name:"Toxicology"},{name:"Virology"},{name:"Biological Techniques"},{name:"Co-Lab"}],edges:[{source:0,target:1},{source:0,target:11},{source:0,target:7},{source:0,target:10},{source:0,target:15},{source:0,target:19},{source:0,target:22},{source:0,target:4},{source:0,target:3},{source:0,target:8},{source:0,target:16},{source:0,target:18},{source:0,target:19},{source:0,target:20},{source:0,target:21},{source:0,target:22},{source:1,target:0},{source:1,target:23},{source:1,target:2},{source:2,target:1},{source:2,target:11},{source:2,target:9},{source:2,target:11},{source:2,target:12},{source:2,target:23},{source:2,target:5},{source:2,target:8},{source:2,target:19},{source:3,target:0},{source:4,target:0},{source:5,target:2},{source:6,target:0},{source:6,target:2},{source:6,target:11},{source:7,target:0},{source:8,target:0},{source:8,target:2},{source:8,target:11},{source:9,target:2},{source:9,target:12},{source:10,target:0},{source:11,target:0},{source:11,target:2},{source:11,target:17},{source:11,target:6},{source:11,target:12},{source:11,target:24},{source:12,target:2},{source:12,target:9},{source:12,target:11},{source:12,target:13},{source:12,target:14},{source:13,target:12},{source:13,target:14},{source:14,target:12},{source:14,target:13},{source:15,target:0},{source:16,target:0},{source:17,target:11},{source:18,target:0},{source:19,target:0},{source:19,target:2},{source:20,target:0},{source:21,target:0},{source:22,target:0},{source:23,target:1},{source:23,target:2},{source:23,target:11},{source:24,target:1},{source:24,target:11}]},force=d3.layout.force().nodes(dataset.nodes).links(dataset.edges).size([w,h]).linkDistance([80]).charge([-3e3]).start(),svg=d3.select(".intro-graphic").append("svg").attr("width",w).attr("height",h).call(d3.behavior.zoom().on("zoom",function(){svg.attr("transform","translate("+d3.event.translate+") scale("+d3.event.scale+")")})).append("g"),edges=svg.selectAll("line").data(dataset.edges).enter().append("line").attr("target",function(t){return JSON.stringify(t.target.index)}).attr("source",function(t){return JSON.stringify(t.source.index)}).style({stroke:function(){return"#ccc"}}).style("stroke-width",.1),nodes=svg.selectAll("circle").data(dataset.nodes).enter().append("circle").attr("aid",function(t,e){return e}).style({fill:"white",stroke:"#ccc"}).attr("r",6).call(force.drag),titles=svg.selectAll("text").data(dataset.nodes).enter().append("text").text(function(t,e){return dataset.nodes[e].name}).attr("aid",function(t,e){return e}).attr("font-family","helvetica").attr("font-size","8px").attr("fill","gray").call(force.drag);force.on("tick",function(){edges.attr("x1",function(t){return t.source.x}).attr("y1",function(t){return t.source.y}).attr("x2",function(t){return t.target.x}).attr("y2",function(t){return t.target.y}),nodes.attr("cx",function(t){return t.x}).attr("cy",function(t){return t.y}),titles.attr("x",function(t){return t.x+16}).attr("y",function(t){return t.y+5})}),$("li,circle,text").on("click",function(){var t=JSON.stringify(this.getAttribute("aid")),e=$("line[source="+t+"]").length,r=$("text[aid="+t+"]").text();$("circle").css({fill:"white",stroke:"#ccc","stroke-width":1,r:6}),$("circle[aid="+t+"]").css({stroke:"#1b79be","stroke-width":3,r:12});for(var a=0;a<e;a++){var o=1==e?$("line[source="+t+"]").attr("target"):$("line[source="+t+"]:eq("+a+")").attr("target");$("circle[aid="+o+"]").css({stroke:"#1b79be"})}$("text").css({"font-size":"8px"}),$("text[aid="+t+"]").css({"font-size":"12px"}),$("line").css({stroke:"#ccc","stroke-width":"0.1"}),$("line[source="+t+"]").css({stroke:"#1b79be","stroke-width":"1",opacity:"0.2"}),$(".js-to-labs").html("explore <strong>"+r+"</strong>"),$(".js-to-labs").click(function(){window.location.href="/labs?search="+r})});