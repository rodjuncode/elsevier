const VIS_CONTAINER_ID = "vis";

let CHART_BOX_WIDTH = 600;
const CHART_BOX_HEIGHT = () => CHART_BOX_WIDTH * 1.2;
const CHART_FRAME_WIDTH = () => CHART_BOX_WIDTH * 0.8;
const CHART_FRAME_HEIGHT = () => CHART_FRAME_WIDTH() * 1.15;
const CHART_BOX_BASE_MARGIN = () => CHART_BOX_WIDTH * 0.05;
const CHART_BOX_RADIUS = () => CHART_BOX_WIDTH * 0.05;
const CHART_COL_WIDTH = () => CHART_BOX_WIDTH * 0.1;
const CHART_COL_HEIGHT = () => CHART_BOX_WIDTH * 0.036;

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
    CHART_BOX_WIDTH + CHART_BOX_BASE_MARGIN();
const CHART_BOX_HEIGHT_WITH_MARGIN = () =>
    CHART_BOX_HEIGHT() + CHART_BOX_BASE_MARGIN();

const CHART_BOX_COLS = () => Math.floor(VW() / CHART_BOX_WIDTH_WITH_MARGIN());
const CHART_BOX_ROWS = (d) => Math.ceil(d.length / CHART_BOX_COLS());

const CHART_BOX_LEFT_MARGIN = () =>
    Math.ceil((VW() - CHART_BOX_COLS() * CHART_BOX_WIDTH_WITH_MARGIN()) / 2);
const CHART_BOX_TOP_MARGIN = () => CHART_BOX_BASE_MARGIN();

var data, vis, unidades, anos, pesquisadores, linhas;
var sortMode = "tipo";

// ############
// setup()
// ############

d3.json("data/data.json").then((d) => {
    data = _.values(d);
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
    if (VW() < 500) {
        CHART_BOX_WIDTH = VW() * 0.9;
    }

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
        .attr("x", (CHART_BOX_WIDTH - CHART_FRAME_WIDTH()) / 2)
        .attr("y", (d) => (CHART_BOX_HEIGHT() - CHART_FRAME_HEIGHT()) / 2)
        .attr("width", CHART_FRAME_WIDTH())
        .attr("height", CHART_FRAME_HEIGHT())
        .attr("rx", CHART_BOX_RADIUS())
        .attr("ry", CHART_BOX_RADIUS())
        .attr("fill", "#fff");

    // linhas horizontais
    linhas = unidades
        .selectAll("line")
        .data((d) => d.anos[0].pessoas.sort((a, b) =>
            d3.descending(a.nome_y, b.nome_y)
        ))
        .join("line")
        .attr("x1", (d) => (CHART_BOX_WIDTH - CHART_FRAME_WIDTH()) / 2)
        .attr("y1", (d, i) => CHART_COL_HEIGHT() * -i + CHART_FRAME_HEIGHT() * 0.99)
        .attr("x2", (d) => (CHART_BOX_WIDTH + CHART_FRAME_WIDTH()) / 2)
        .attr("y2", (d, i) => CHART_COL_HEIGHT() * -i + CHART_FRAME_HEIGHT() * 0.99)
        .attr("stroke", "#FF9898")
        .attr("stroke-width", 1)
        .attr("transform", "scale(0,1)")
        .attr("class", (d) => d.nome_y.replace(/\s+/g, ''));



    // tamanho da unidade
    // labels
    unidades
        .append("text")
        .attr("x", CHART_BOX_WIDTH / 2 + CHART_BOX_WIDTH * .115 + CHART_BOX_WIDTH * .025)
        .attr("y", CHART_BOX_WIDTH * .032)
        .attr("font-size", CHART_BOX_WIDTH * 0.025)
        .attr("font-family", "Archivo Narrow")
        .text(0); // 0

    let maxTamanhoUnidade = d3.max(data.map(d => d.fte_atual));

    unidades
        .append("text")
        .attr("x", CHART_BOX_WIDTH / 2 + CHART_BOX_WIDTH * .33 + CHART_BOX_WIDTH * .025)
        .attr("y", CHART_BOX_WIDTH * .032)
        .attr("font-size", CHART_BOX_WIDTH * 0.025)
        .attr("font-family", "Archivo Narrow")
        .text(Math.floor(maxTamanhoUnidade)); // max

    unidades
        .append("text")
        .attr("x", CHART_BOX_WIDTH / 2 + CHART_BOX_WIDTH * .04 + CHART_BOX_WIDTH * .025)
        .attr("y", CHART_BOX_WIDTH * .07)
        .attr("font-size", CHART_BOX_WIDTH * 0.025)
        .attr("font-family", "Archivo Narrow")
        .text("Total de Pesquisadores na Unidade"); // labels    


    for (let i = 0; i < 5; i++) {
        unidades
            .append("rect")
            .attr("x", CHART_BOX_WIDTH / 2 + CHART_BOX_WIDTH * .1725 + CHART_BOX_WIDTH * .035 * i)
            .attr("y", CHART_BOX_WIDTH * .013)
            .attr("width", CHART_BOX_WIDTH * .02)
            .attr("height", CHART_BOX_WIDTH * .02)
            .attr("fill", (d) => d.fte_atual >= i * maxTamanhoUnidade / 5 ? "#FF5858" : "#DDD");
    }

    // titulo da unidade
    unidades
        .append("text")
        .attr("x", (CHART_BOX_WIDTH - CHART_FRAME_WIDTH()) / 2)
        .attr("y", CHART_BOX_WIDTH * 0.07)
        .attr("font-size", CHART_BOX_WIDTH * 0.08)
        .attr("font-weight", "bold")
        .attr("font-family", "Archivo")
        .text((d) => d.unidade_sem_espaco);

    // grupo para coluna de anos
    anos = unidades
        .selectAll("g")
        .data((d) => d.anos)
        .join("g")
        .attr("class", (d) => d.ano_aux)
        .attr(
            "transform",
            (d, i) =>
                "translate(" +
                ((CHART_BOX_WIDTH - CHART_FRAME_WIDTH()) / 2 +
                    (CHART_COL_WIDTH() + i * CHART_COL_WIDTH())) +
                "," +
                CHART_FRAME_HEIGHT() * 0.99 +
                ")"
        );

    anos
        .append("text")
        .attr("x", -CHART_BOX_WIDTH * 0.03)
        .attr("y", CHART_COL_WIDTH() * 0.75)
        .attr("font-size", CHART_BOX_WIDTH * 0.032)
        .attr("font-family", "Archivo Narrow")
        .text((d) => d.ano_aux);

    // pesquisadores
    pesquisadores = anos
        .selectAll("g.pesquisador")
        .data((d) =>
            d.pessoas.sort((a, b) =>
                d3.ascending(tipoScale(a.tipo), tipoScale(b.tipo))
            )
        )
        .join("g")
        .attr("class", (d) => "pesquisador " + d.nome_y.replace(/\s+/g, ''))
        .attr("transform", (d, i) => "translate(0," + -i * CHART_COL_HEIGHT() + ")")
        .append((d) => {
            if (d.sexo == "F")
                return document.createElementNS("http://www.w3.org/2000/svg", "rect");
            if (d.sexo == "M")
                return document.createElementNS("http://www.w3.org/2000/svg", "circle");
        })
        // .append("rect")
        .attr("r", CHART_BOX_WIDTH * 0.01)
        .attr("x", -CHART_BOX_WIDTH * 0.0075)
        .attr("y", -CHART_BOX_WIDTH * 0.0075)
        .attr("width", CHART_BOX_WIDTH * 0.015)
        .attr("height", CHART_BOX_WIDTH * 0.015)
        // .attr("class", "pesquisador hover-shadow-box-animation")
        .attr("class", "pesquisador")
        .attr("transform", "rotate(45)")
        .attr("fill", (d) =>
            d.tipo == "Nao participou"
                ? "none"
                : d.tipo == "Career"
                    ? "#FFF"
                    : "#FF9292"
        )
        .attr("stroke", (d) =>
            d.tipo == "Career" || d.tipo == "Ambos" ? "#BA0000" : "none"
        )
        .attr("stroke-width", 2)
        .attr("onmousemove", (d) => "highlightResearcher(this, '" + d.nome_y + "', '" + d.nome_y.replace(/\s+/g, '') + "');")
        .attr("onmouseout", (d) => "minimizeResearcher('" + d.nome_y.replace(/\s+/g, '') + "')");

}


function sortResearchers() {
    if (sortMode == "tipo") {
        sortMode = "nome";
        anos
            .selectAll("g.pesquisador")
            .sort((a, b) => d3.descending(a.nome_y, b.nome_y))
            .transition()
            .ease(d3.easeCubicInOut)
            .duration(500)
            .attr(
                "transform",
                (d, i) => "translate(0," + -i * CHART_COL_HEIGHT() + ")"
            );
    } else {
        sortMode = "tipo";
        anos
            .selectAll("g.pesquisador")
            .sort((a, b) => d3.ascending(tipoScale(a.tipo), tipoScale(b.tipo)))
            .transition()
            .ease(d3.easeCubicInOut)
            .duration(500)
            .attr(
                "transform",
                (d, i) => "translate(0," + -i * CHART_COL_HEIGHT() + ")"
            );
    }

    linhas
        .transition()
        .ease(d3.easeCubicInOut)
        .duration(300)
        .attr("transform", sortMode == "tipo" ? "scale(0,1)" : "scale(1,1)");
}


function highlightResearcher(evt, text, h) {
    let tooltip = document.getElementById("tooltip");
    tooltip.innerHTML = text;
    tooltip.style.display = "block";
    tooltip.style.left = evt.getBoundingClientRect().left + 20 + 'px';
    tooltip.style.top = evt.getBoundingClientRect().top + window.scrollY + 20 + 'px';

    d3.selectAll('.' + h).classed('shadow', true);
}
function minimizeResearcher(h) {
    var tooltip = document.getElementById("tooltip");
    tooltip.style.display = "none";
    d3.selectAll('.' + h).classed('shadow', false);
}
