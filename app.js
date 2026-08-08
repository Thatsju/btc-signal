// =====================================================
// BTC SIGNAL - APP.JS
// NOUVEAU PROJET
// =====================================================


// =====================================================
// ELEMENTS HTML
// =====================================================

const priceElement = document.getElementById("btc-price");
const changeElement = document.getElementById("btc-change");

const average7Element = document.getElementById("average-7");
const average30Element = document.getElementById("average-30");

const chartCanvas = document.getElementById("btc-chart");


// =====================================================
// CONFIGURATION
// =====================================================

const BTC_API =
    "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart" +
    "?vs_currency=eur" +
    "&days=30" +
    "&interval=daily";


// =====================================================
// FORMAT PRIX
// =====================================================

function formatPrice(value) {

    return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0
    }).format(value);

}


// =====================================================
// MOYENNE
// =====================================================

function calculateAverage(values) {

    if (!values.length) {
        return 0;
    }

    const total = values.reduce(
        (sum, value) => sum + value,
        0
    );

    return total / values.length;

}


// =====================================================
// DESSIN DE LA COURBE
// =====================================================

function drawChart(values) {

    if (!chartCanvas || !values.length) {
        return;
    }

    const ctx = chartCanvas.getContext("2d");

    const width = chartCanvas.clientWidth;
    const height = chartCanvas.clientHeight;

    const dpr = window.devicePixelRatio || 1;

    chartCanvas.width = width * dpr;
    chartCanvas.height = height * dpr;

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    // -------------------------------------------------
    // ECHELLE
    // -------------------------------------------------

    const min = Math.min(...values);
    const max = Math.max(...values);

    const range =
        max - min || 1;


    // -------------------------------------------------
    // MARGES
    // -------------------------------------------------

    const paddingLeft = 10;
    const paddingRight = 10;
    const paddingTop = 15;
    const paddingBottom = 15;

    const chartWidth =
        width -
        paddingLeft -
        paddingRight;

    const chartHeight =
        height -
        paddingTop -
        paddingBottom;


    // -------------------------------------------------
    // COURBE
    // -------------------------------------------------

    ctx.beginPath();

    values.forEach(
        (value, index) => {

            const x =
                paddingLeft +
                (
                    index /
                    (values.length - 1)
                ) *
                chartWidth;

            const y =
                paddingTop +
                (
                    1 -
                    (
                        value - min
                    ) /
                    range
                ) *
                chartHeight;


            if (index === 0) {

                ctx.moveTo(x, y);

            } else {

                ctx.lineTo(x, y);

            }

        }
    );


    ctx.strokeStyle = "#18d89b";
    ctx.lineWidth = 3;

    ctx.stroke();

}


// =====================================================
// RECUPERATION BTC
// =====================================================

async function getBTCData() {

    try {

        console.log(
            "BTC Signal : récupération des données..."
        );


        const response =
            await fetch(
                BTC_API,
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "API Bitcoin : " +
                response.status
            );

        }


        const data =
            await response.json();


        if (
            !data.prices ||
            !Array.isArray(data.prices) ||
            data.prices.length === 0
        ) {

            throw new Error(
                "Aucune donnée Bitcoin reçue"
            );

        }


        // -------------------------------------------------
        // PRIX
        // -------------------------------------------------

        const prices =
            data.prices.map(
                item => Number(item[1])
            );


        const currentPrice =
            prices[prices.length - 1];


        priceElement.textContent =
            formatPrice(currentPrice);


        // -------------------------------------------------
        // EVOLUTION 24H
        // -------------------------------------------------

        if (prices.length >= 2) {

            const previousPrice =
                prices[prices.length - 2];

            const change =
                (
                    (
                        currentPrice -
                        previousPrice
                    ) /
                    previousPrice
                ) * 100;


            changeElement.textContent =
                (
                    change >= 0
                    ? "+"
                    : ""
                ) +
                change.toFixed(2) +
                " %";


            changeElement.classList.remove(
                "up",
                "down"
            );


            if (change >= 0) {

                changeElement.classList.add(
                    "up"
                );

            } else {

                changeElement.classList.add(
                    "down"
                );

            }

        }


        // -------------------------------------------------
        // MOYENNE 7 JOURS
        // -------------------------------------------------

        const last7 =
            prices.slice(-7);


        const average7 =
            calculateAverage(last7);


        average7Element.textContent =
            formatPrice(average7);


        // -------------------------------------------------
        // MOYENNE 30 JOURS
        // -------------------------------------------------

        const average30 =
            calculateAverage(prices);


        average30Element.textContent =
            formatPrice(average30);


        // -------------------------------------------------
        // COURBE
        // -------------------------------------------------

        drawChart(last7);


        console.log(
            "BTC Signal : données Bitcoin chargées"
        );


    } catch (error) {

        console.error(
            "Erreur BTC :",
            error
        );


        priceElement.textContent =
            "Erreur";


        average7Element.textContent =
            "-";


        average30Element.textContent =
            "-";

    }

}


// =====================================================
// KPIs
// =====================================================

function initKPIButtons() {

    const cards =
        document.querySelectorAll(
            ".kpi-card"
        );


    cards.forEach(
        card => {

            card.addEventListener(
                "click",
                () => {

                    card.classList.toggle(
                        "open"
                    );

                }
            );

        }
    );

}


// =====================================================
// LANCEMENT
// =====================================================

initKPIButtons();

getBTCData();


// =====================================================
// ACTUALISATION
// =====================================================

setInterval(
    getBTCData,
    60 * 1000
);
