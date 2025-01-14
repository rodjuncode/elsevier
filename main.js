const VIS_CONTAINER_ID = "vis";

const CHART_BOX_WIDTH = 400;
const CHART_BOX_HEIGHT = 450;
const CHART_FRAME_MIN_HEIGHT = 120;
const CHART_BOX_BASE_MARGIN = 20;
const CHART_BOX_RADIUS = 20;

// ############
// functions
// ############
const VW = () =>
  Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) -
  5;
const VH = () =>
  Math.max(
    document.documentElement.clientHeight || 0,
    window.innerHeight || 0
  ) - 5;

const CHART_BOX_WIDTH_WITH_MARGIN = () =>
  CHART_BOX_WIDTH + CHART_BOX_BASE_MARGIN;
const CHART_BOX_HEIGHT_WITH_MARGIN = () =>
  CHART_BOX_HEIGHT + CHART_BOX_BASE_MARGIN;

const CHART_BOX_COLS = () => Math.floor(VW() / CHART_BOX_WIDTH_WITH_MARGIN());
const CHART_BOX_ROWS = (d) => Math.ceil(d.length / CHART_BOX_COLS());

const CHART_BOX_LEFT_MARGIN = () =>
  Math.ceil((VW() - CHART_BOX_COLS() * CHART_BOX_WIDTH_WITH_MARGIN()) / 2);
const CHART_BOX_TOP_MARGIN = () => CHART_BOX_BASE_MARGIN;

var data, vis, unidades, anos, pesquisadores;
var sortMode = "tipo";

// ############
// setup()
// ############

d3.json("data/data.json").then((d) => {
  data = _.values(d);
  console.log(data);
  draw();
});

const tipoScale = d3
  .scaleOrdinal()
  .domain(["Ambos", "Career", "Singleyr", "Nao participou"])
  .range([0, 1, 2, 3]);

window.addEventListener("resize", draw);

// ############
// draw()
// ############

function draw() {
  d3.select("body > #" + VIS_CONTAINER_ID + " > *").remove();

  const vis = d3
    .select("body > #" + VIS_CONTAINER_ID)
    .append("svg")
    .attr("width", "100%")
    .attr(
      "height",
      CHART_BOX_ROWS(data) * CHART_BOX_HEIGHT_WITH_MARGIN() +
        CHART_BOX_TOP_MARGIN()
    );

  // unidades agrupadas
  unidades = vis
    .selectAll("g")
    .data(data)
    .join("g")
    .attr("id", (d) => d.unidade_sem_espaco)
    .attr("transform", (d, i) => {
      return (
        "translate(" +
        (CHART_BOX_LEFT_MARGIN() +
          (i % CHART_BOX_COLS()) * CHART_BOX_WIDTH_WITH_MARGIN()) +
        "," +
        (CHART_BOX_TOP_MARGIN() +
          Math.floor(i / CHART_BOX_COLS()) * CHART_BOX_HEIGHT_WITH_MARGIN()) +
        ")"
      );
    });

  // area de fundo para a visualização
  unidades
    .append("rect")
    .attr("x", 0)
    .attr(
      "y",
      (d) =>
        CHART_BOX_HEIGHT -
        d.anos[d.anos.length - 1].pessoas.length * 16 -
        CHART_FRAME_MIN_HEIGHT
    )
    .attr("width", CHART_BOX_WIDTH)
    .attr(
      "height",
      (d) =>
        CHART_FRAME_MIN_HEIGHT + d.anos[d.anos.length - 1].pessoas.length * 16
    )
    .attr("rx", CHART_BOX_RADIUS)
    .attr("ry", CHART_BOX_RADIUS)
    .attr("fill", "#fff");

  // titulo da unidade
  unidades
    .append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("font-size", "2em")
    .text((d) => d.unidade_sem_espaco);

  // grupo para coluna de anos
  anos = unidades
    .selectAll("g")
    .data((d) => d.anos)
    .join("g")
    .attr("class", (d) => d.ano_aux)
    .attr("transform", (d, i) => "translate(" + (50 + i * 50) + ",360)");

  anos
    .append("text")
    .attr("x", -15)
    .attr("y", 50)
    .text((d) => d.ano_aux);

  // // pesquisadores
  // pesquisadores = anos.selectAll('circle')
  //     // .data(d => d.pessoas.filter(d => d.tipo != "Nao participou"))
  //     .data(d => d.pessoas)
  //     .join('circle')
  //     .attr('cx', 0)
  //     .attr('cy', (d, i) => -i*20)
  //     .attr('r', 7)
  //     .attr('fill', '#ff0000')

  // pesquisadores
  pesquisadores = anos
    .selectAll("g.pesquisador")
    .data((d) =>
      d.pessoas.sort((a, b) =>
        d3.ascending(tipoScale(a.tipo), tipoScale(b.tipo))
      )
    )
    .join("g")
    .attr("class", "pesquisador")
    .attr("transform", (d, i) => "translate(0," + -i * 16 + ")")
    .append((d) => {
      if (d.sexo == "F")
        return document.createElementNS("http://www.w3.org/2000/svg", "circle");
      if (d.sexo == "M")
        return document.createElementNS("http://www.w3.org/2000/svg", "rect");
    })
    .attr("r", 5)
    .attr("x", -5)
    .attr("y", -5)
    .attr("width", 10)
    .attr("height", 10)
    .attr("fill", (d) =>
      d.tipo == "Nao participou" || d.tipo == "Career" ? "none" : "#FF9292"
    )
    .attr("stroke", (d) =>
      d.tipo == "Career" || d.tipo == "Ambos" ? "#000" : "none"
    )
    .attr("stroke-width", 1);

  //  sortResearchers();
}

function sortResearchers() {
  if (sortMode == "tipo") {
    sortMode = "nome";
    anos
      .selectAll("g.pesquisador")
      .sort((a, b) => d3.ascending(a.nome_y, b.nome_y))
      .transition()
      .ease(d3.easeCubicInOut)
      .duration(500)
      .attr("transform", (d, i) => "translate(0," + -i * 16 + ")");
  } else {
    sortMode = "tipo";
    anos
      .selectAll("g.pesquisador")
      .sort((a, b) => d3.ascending(tipoScale(a.tipo), tipoScale(b.tipo)))
      .transition()
      .ease(d3.easeCubicInOut)
      .duration(500)
      .attr("transform", (d, i) => "translate(0," + -i * 16 + ")");
  }
  // console.log('oi')
  // anos.each(function(d) {
  //     d3.select(this).selectAll('g.pesquisador')
  //         .data(d.pessoas.sort((a, b) => d3.ascending(a.tipo, b.tipo)))
  //         .join('g')
  //         .transition().ease(d3.easeCubicInOut).duration(500)
  //         .attr('transform', (d, i) => 'translate(0,' + (-i * 16) + ')');
  // });
}

// function switchMode() {
//     pesquisadores = anos.selectAll('g')
//         .data(d => d.pessoas.sort((a,b) => d3.ascending(a.tipo,b.tipo)))
//         .transition().delay(100).duration(2000)
//         .attr('transform', (d, i) => 'translate(0,' + (-i*16) + ')');
// }

//https://d3-graph-gallery.com/graph/interactivity_transition.html

// pesquisadores.sort((a,b) => d3.ascending(a.min_ano, b.min_ano))
// .transition().ease(d3.easeCubicInOut)
// .duration(500)
// .attr('transform', (d, i) => 'translate(0,' + (5) + ')')
