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

const gaugeCursor = document.getElementById("gauge-cursor");
const signalStatus = document.getElementById("signal-status");
const signalScoreElement = document.getElementById("signal-score");


// KPI
const rsiElement = document.getElementById("rsi");
const mm111Element = document.getElementById("mm111");
const mm350Element = document.getElementById("mm350");
const piCycleElement = document.getElementById("picycle");
const rainbowElement = document.getElementById("rainbow");
const fearGreedElement = document.getElementById("fear-greed");


// INDICATEURS
const indicatorRsi = document.getElementById("indicator-rsi");
const indicatorMm111 = document.getElementById("indicator-mm111");
const indicatorMm350 = document.getElementById("indicator-mm350");
const indicatorPiCycle = document.getElementById("indicator-picycle");
const indicatorRainbow = document.getElementById("indicator-rainbow");
const indicatorFear = document.getElementById("indicator-fear");


// KPI CARDS
const kpiRsi = document.getElementById("kpi-rsi");
const kpiMm111 = document.getElementById("kpi-mm111");
const kpiMm350 = document.getElementById("kpi-mm350");
const kpiPiCycle = document.getElementById("kpi-picycle");
const kpiRainbow = document.getElementById("kpi-rainbow");
const kpiFear = document.getElementById("kpi-fear");


// =====================================================
// VARIABLES
// =====================================================

let btcPrices = [];

let chartPoints = [];
let chartHoverIndex = null;
let chartEventsInitialized = false;

let currentPrice = null;

let average7 = null;
let average30 = null;

let rsiValue = null;
let mm111Value = null;
let mm350Value = null;
let piCycleValue = null;
let rainbowValue = null;
let fearGreedValue = null;


// =====================================================
// OUTILS
// =====================================================

function formatPrice(value) {

    if (!Number.isFinite(value)) {
        return "-";
    }

    return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0
    }).format(value);
}


function formatNumber(value, decimals = 2) {

    if (!Number.isFinite(value)) {
        return "-";
    }

    return value.toFixed(decimals);
}


function average(values) {

    const validValues = values.filter(
        value => Number.isFinite(value)
    );

    if (!validValues.length) {
        return null;
    }

    return (
        validValues.reduce(
            (sum, value) => sum + value,
            0
        ) / validValues.length
    );
}


// =====================================================
// COULEUR KPI
// =====================================================

function setState(element, state) {

    if (!element) {
        return;
    }

    element.classList.remove(
        "buy",
        "neutral",
        "sell"
    );

    element.classList.add(state);
}


// =====================================================
// PRIX BTC + HISTORIQUE
// =====================================================

async function getBTCData() {

    try {

        console.log(
            "BTC SIGNAL : récupération des données..."
        );


        const url =
            "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart" +
            "?vs_currency=eur" +
            "&days=30" +
            "&interval=daily";


        const response = await fetch(
            url,
            {
                cache: "no-store"
            }
        );


        if (!response.ok) {

            throw new Error(
                "CoinGecko : " +
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
                "Aucune donnée BTC reçue"
            );
        }


        btcPrices =
            data.prices.map(
                item => ({
                    timestamp: item[0],
                    price: Number(item[1])
                })
            ).filter(
                item =>
                    Number.isFinite(item.price)
            );


        currentPrice =
            btcPrices[
                btcPrices.length - 1
            ].price;


        // -------------------------------------------------
        // MOYENNE 7 JOURS
        // -------------------------------------------------

        const last7 =
            btcPrices
                .slice(-7)
                .map(item => item.price);


        average7 =
            average(last7);


        // -------------------------------------------------
        // MOYENNE 30 JOURS
        // -------------------------------------------------

        const last30 =
            btcPrices
                .slice(-30)
                .map(item => item.price);


        average30 =
            average(last30);


        updatePriceDisplay();

        drawBTCChart();

        calculateIndicators();

        updateIndicators();

        calculateScore();


        console.log(
            "BTC SIGNAL : données récupérées",
            btcPrices.length
        );


    } catch (error) {

        console.error(
            "Erreur BTC :",
            error
        );


        if (priceElement) {
            priceElement.textContent =
                "Erreur";
        }
    }
}


// =====================================================
// AFFICHAGE PRIX
// =====================================================

function updatePriceDisplay() {

    if (!Number.isFinite(currentPrice)) {
        return;
    }


    priceElement.textContent =
        formatPrice(currentPrice);


    average7Element.textContent =
        formatPrice(average7);


    average30Element.textContent =
        formatPrice(average30);


    // -------------------------------------------------
    // DIFFERENCE AVEC MOYENNE 7 JOURS
    // -------------------------------------------------

    if (Number.isFinite(average7)) {

        const percentage =
            (
                (currentPrice - average7) /
                average7
            ) * 100;


        changeElement.textContent =
            (percentage >= 0 ? "+" : "") +
            percentage.toFixed(2) +
            "%";


        changeElement.classList.remove(
            "up",
            "down"
        );


        changeElement.classList.add(
            percentage >= 0
                ? "up"
                : "down"
        );
    }
}


// =====================================================
// COURBE BTC 7 JOURS
// =====================================================

function drawBTCChart() {

    if (!chartCanvas) {
        return;
    }

    const context = chartCanvas.getContext("2d");
    const container = chartCanvas.parentElement;

    const width = container.clientWidth;
    const height = container.clientHeight;

    if (width <= 0 || height <= 0) {
        return;
    }

    const dpr = window.devicePixelRatio || 1;

    // =================================================
    // CANVAS
    // =================================================

    chartCanvas.width = width * dpr;
    chartCanvas.height = height * dpr;

    chartCanvas.style.width = width + "px";
    chartCanvas.style.height = height + "px";

    context.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

    context.clearRect(
        0,
        0,
        width,
        height
    );

    // =================================================
    // DONNEES : 30 JOURS
    // =================================================

    const points = btcPrices
        .slice(-30)
        .filter(point =>
            Number.isFinite(point.price)
        );

    if (points.length < 2) {
        return;
    }

    const prices = points.map(
        point => point.price
    );

    // =================================================
    // ECHELLE
    // =================================================

    let minPrice = Math.min(...prices);
    let maxPrice = Math.max(...prices);

    const rawRange =
        maxPrice - minPrice;

    const margin =
        rawRange > 0
            ? rawRange * 0.12
            : maxPrice * 0.01;

    minPrice -= margin;
    maxPrice += margin;

    const range =
        maxPrice - minPrice || 1;

    // =================================================
    // MARGES
    // =================================================

    const paddingLeft = 12;
    const paddingRight = 18;
    const paddingTop = 18;
    const paddingBottom = 28;

    const chartWidth =
        width -
        paddingLeft -
        paddingRight;

    const chartHeight =
        height -
        paddingTop -
        paddingBottom;

    // =================================================
    // COORDONNEES
    // =================================================

    const coordinates = points.map(
        (point, index) => {

            const x =
                paddingLeft +
                (
                    index /
                    (points.length - 1)
                ) *
                chartWidth;

            const normalized =
                (
                    point.price -
                    minPrice
                ) / range;

            const y =
                paddingTop +
                (
                    1 - normalized
                ) *
                chartHeight;

            return {
                x: x,
                y: y,
                price: point.price,
                timestamp: point.timestamp
            };
        }
    );

    // On garde les coordonnées pour la souris
    chartPoints = coordinates;

    // =================================================
    // GRILLE
    // =================================================

    context.lineWidth = 1;

    context.strokeStyle =
        "rgba(255,255,255,0.06)";

    const gridLines = 4;

    for (
        let i = 0;
        i <= gridLines;
        i++
    ) {

        const y =
            paddingTop +
            (
                i / gridLines
            ) *
            chartHeight;

        context.beginPath();

        context.moveTo(
            paddingLeft,
            y
        );

        context.lineTo(
            width - paddingRight,
            y
        );

        context.stroke();
    }

    // =================================================
    // ZONE SOUS LA COURBE
    // =================================================

    const gradient =
        context.createLinearGradient(
            0,
            paddingTop,
            0,
            height
        );

    gradient.addColorStop(
        0,
        "rgba(24,216,155,0.28)"
    );

    gradient.addColorStop(
        0.55,
        "rgba(24,216,155,0.10)"
    );

    gradient.addColorStop(
        1,
        "rgba(24,216,155,0)"
    );

    context.beginPath();

    coordinates.forEach(
        (point, index) => {

            if (index === 0) {

                context.moveTo(
                    point.x,
                    point.y
                );

            } else {

                context.lineTo(
                    point.x,
                    point.y
                );
            }
        }
    );

    const lastPoint =
        coordinates[
            coordinates.length - 1
        ];

    const firstPoint =
        coordinates[0];

    context.lineTo(
        lastPoint.x,
        height - paddingBottom
    );

    context.lineTo(
        firstPoint.x,
        height - paddingBottom
    );

    context.closePath();

    context.fillStyle =
        gradient;

    context.fill();

    // =================================================
    // COURBE
    // =================================================

    context.beginPath();

    coordinates.forEach(
        (point, index) => {

            if (index === 0) {

                context.moveTo(
                    point.x,
                    point.y
                );

            } else {

                context.lineTo(
                    point.x,
                    point.y
                );
            }
        }
    );

    context.strokeStyle =
        "#18d89b";

    context.lineWidth = 3;

    context.lineJoin =
        "round";

    context.lineCap =
        "round";

    context.shadowColor =
        "rgba(24,216,155,0.35)";

    context.shadowBlur = 8;

    context.stroke();

    context.shadowBlur = 0;

    // =================================================
    // POINT FINAL
    // =================================================

    const last =
        coordinates[
            coordinates.length - 1
        ];

    context.beginPath();

    context.arc(
        last.x,
        last.y,
        10,
        0,
        Math.PI * 2
    );

    context.strokeStyle =
        "rgba(24,216,155,0.25)";

    context.lineWidth = 3;

    context.stroke();

    context.beginPath();

    context.arc(
        last.x,
        last.y,
        5,
        0,
        Math.PI * 2
    );

    context.fillStyle =
        "#ffffff";

    context.fill();

    // =================================================
    // PRIX ACTUEL
    // =================================================

    context.font =
        "bold 12px Arial";

    context.textAlign =
        "right";

    context.textBaseline =
        "middle";

    context.fillStyle =
        "#18d89b";

    context.fillText(
        formatPrice(last.price),
        width - paddingRight,
        Math.max(
            paddingTop,
            Math.min(
                height - paddingBottom,
                last.y - 14
            )
        )
    );

    // =================================================
// DATES
// =================================================

context.font =
    "10px Arial";

context.fillStyle =
    "rgba(255,255,255,0.45)";

context.textBaseline =
    "top";

context.textAlign =
    "center";

// Nombre de dates affichées
const dateCount = 7;

for (
    let i = 0;
    i < dateCount;
    i++
) {

    const index =
        Math.round(
            (
                i /
                (dateCount - 1)
            ) *
            (points.length - 1)
        );

    const point =
        coordinates[index];

    const date =
        new Date(
            points[index].timestamp
        );

    const label =
        date.toLocaleDateString(
            "fr-FR",
            {
                day: "2-digit",
                month: "short"
            }
        );

    context.fillText(
        label,
        point.x,
        height - 18
    );
}

    // =================================================
    // CURSEUR INTERACTIF
    // =================================================

    if (
        chartHoverIndex !== null &&
        chartPoints[chartHoverIndex]
    ) {

        const selected =
            chartPoints[
                chartHoverIndex
            ];

        // -------------------------------------------------
        // LIGNE VERTICALE
        // -------------------------------------------------

        context.beginPath();

        context.moveTo(
            selected.x,
            paddingTop
        );

        context.lineTo(
            selected.x,
            height - paddingBottom
        );

        context.strokeStyle =
            "rgba(255,255,255,0.25)";

        context.lineWidth = 1;

        context.setLineDash([
            4,
            4
        ]);

        context.stroke();

        context.setLineDash([]);

        // -------------------------------------------------
        // POINT SELECTIONNE
        // -------------------------------------------------

        context.beginPath();

        context.arc(
            selected.x,
            selected.y,
            7,
            0,
            Math.PI * 2
        );

        context.fillStyle =
            "#18d89b";

        context.fill();

        context.beginPath();

        context.arc(
            selected.x,
            selected.y,
            3,
            0,
            Math.PI * 2
        );

        context.fillStyle =
            "#ffffff";

        context.fill();

        // -------------------------------------------------
        // INFORMATIONS
        // -------------------------------------------------

        const selectedDate =
            new Date(
                selected.timestamp
            );

        const dateLabel =
            selectedDate.toLocaleDateString(
                "fr-FR",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );

        const priceLabel =
            formatPrice(
                selected.price
            );

        // -------------------------------------------------
        // POSITION DE LA BULLE
        // -------------------------------------------------

        const boxWidth = 125;
        const boxHeight = 58;

        let boxX =
            selected.x + 12;

        let boxY =
            selected.y - boxHeight - 12;

        if (
            boxX + boxWidth >
            width - 5
        ) {

            boxX =
                selected.x -
                boxWidth -
                12;
        }

        if (boxY < 5) {

            boxY =
                selected.y + 12;
        }

        // -------------------------------------------------
        // BULLE
        // -------------------------------------------------

        context.fillStyle =
            "rgba(10,18,25,0.94)";

        context.strokeStyle =
            "rgba(24,216,155,0.35)";

        context.lineWidth = 1;

        context.beginPath();

        context.roundRect(
            boxX,
            boxY,
            boxWidth,
            boxHeight,
            8
        );

        context.fill();
        context.stroke();

        // -------------------------------------------------
        // DATE
        // -------------------------------------------------

        context.font =
            "10px Arial";

        context.fillStyle =
            "rgba(255,255,255,0.55)";

        context.textAlign =
            "left";

        context.textBaseline =
            "top";

        context.fillText(
            dateLabel,
            boxX + 10,
            boxY + 9
        );

        // -------------------------------------------------
        // PRIX
        // -------------------------------------------------

        context.font =
            "bold 15px Arial";

        context.fillStyle =
            "#18d89b";

        context.fillText(
            priceLabel,
            boxX + 10,
            boxY + 28
        );
    }
}
function calculateIndicators() {

    const prices =
        btcPrices.map(
            item => item.price
        );


    // -------------------------------------------------
    // RSI
    // -------------------------------------------------

    rsiValue =
        calculateRSI(prices, 14);


    // -------------------------------------------------
    // MM111
    // -------------------------------------------------

    mm111Value =
        calculateMovingAverage(
            prices,
            111
        );


    // -------------------------------------------------
    // MM350
    // -------------------------------------------------

    mm350Value =
        calculateMovingAverage(
            prices,
            350
        );


    /*
     * Pour l'instant, l'historique récupéré
     * est limité à 30 jours.
     *
     * Les MM111 et MM350 ne peuvent donc
     * pas encore être calculées correctement.
     *
     * Elles resteront "-" jusqu'à ce que
     * nous branchions une source historique
     * suffisamment longue.
     */


    if (!Number.isFinite(mm111Value)) {
        mm111Value = null;
    }


    if (!Number.isFinite(mm350Value)) {
        mm350Value = null;
    }


    // -------------------------------------------------
    // PI CYCLE
    // -------------------------------------------------

    /*
     * Placeholder volontaire.
     *
     * Le Pi Cycle nécessite une source historique
     * adaptée avec les moyennes 111D et 350D x 2.
     *
     * Nous ne mettons PAS une fausse donnée.
     */

    piCycleValue = null;


    // -------------------------------------------------
    // RAINBOW
    // -------------------------------------------------

    /*
     * Placeholder volontaire.
     *
     * Nous brancherons une source Rainbow fiable
     * dans une étape séparée.
     */

    rainbowValue = null;


    // -------------------------------------------------
    // FEAR & GREED
    // -------------------------------------------------

    /*
     * Le Fear & Greed sera récupéré séparément.
     */

    fearGreedValue = null;


    // -------------------------------------------------
    // AFFICHAGE
    // -------------------------------------------------

    if (Number.isFinite(rsiValue)) {

        rsiElement.textContent =
            rsiValue.toFixed(1);
    }


    mm111Element.textContent =
        Number.isFinite(mm111Value)
            ? formatPrice(mm111Value)
            : "-";


    mm350Element.textContent =
        Number.isFinite(mm350Value)
            ? formatPrice(mm350Value)
            : "-";


    piCycleElement.textContent =
        "-";


    rainbowElement.textContent =
        "-";


    fearGreedElement.textContent =
        "-";
}


// =====================================================
// MOYENNE MOBILE
// =====================================================

function calculateMovingAverage(
    values,
    period
) {

    if (
        !Array.isArray(values) ||
        values.length < period
    ) {

        return null;
    }


    const selected =
        values.slice(-period);


    return average(selected);
}


// =====================================================
// RSI
// =====================================================

function calculateRSI(
    prices,
    period = 14
) {

    if (
        !Array.isArray(prices) ||
        prices.length <= period
    ) {

        return null;
    }


    let gains = 0;
    let losses = 0;


    for (
        let i = 1;
        i <= period;
        i++
    ) {

        const difference =
            prices[i] -
            prices[i - 1];


        if (difference >= 0) {

            gains += difference;

        } else {

            losses += Math.abs(
                difference
            );
        }
    }


    let averageGain =
        gains / period;


    let averageLoss =
        losses / period;


    for (
        let i = period + 1;
        i < prices.length;
        i++
    ) {

        const difference =
            prices[i] -
            prices[i - 1];


        const gain =
            difference > 0
                ? difference
                : 0;


        const loss =
            difference < 0
                ? Math.abs(difference)
                : 0;


        averageGain =
            (
                (
                    averageGain *
                    (period - 1)
                ) +
                gain
            ) /
            period;


        averageLoss =
            (
                (
                    averageLoss *
                    (period - 1)
                ) +
                loss
            ) /
            period;
    }


    if (averageLoss === 0) {
        return 100;
    }


    const relativeStrength =
        averageGain /
        averageLoss;


    return (
        100 -
        (
            100 /
            (1 + relativeStrength)
        )
    );
}


// =====================================================
// ETATS DES INDICATEURS
// =====================================================

function updateIndicators() {

    // -------------------------------------------------
    // RSI
    // -------------------------------------------------

    if (Number.isFinite(rsiValue)) {

        if (rsiValue < 30) {

            setIndicator(
                indicatorRsi,
                kpiRsi,
                "buy",
                "Achat"
            );

        } else if (rsiValue > 70) {

            setIndicator(
                indicatorRsi,
                kpiRsi,
                "sell",
                "Vente"
            );

        } else {

            setIndicator(
                indicatorRsi,
                kpiRsi,
                "neutral",
                "Neutre"
            );
        }
    }


    // -------------------------------------------------
    // MM111
    // -------------------------------------------------

    if (Number.isFinite(mm111Value)) {

        const ratio =
            currentPrice /
            mm111Value;


        if (ratio < 0.90) {

            setIndicator(
                indicatorMm111,
                kpiMm111,
                "buy",
                "Achat"
            );

        } else if (ratio > 1.15) {

            setIndicator(
                indicatorMm111,
                kpiMm111,
                "sell",
                "Vente"
            );

        } else {

            setIndicator(
                indicatorMm111,
                kpiMm111,
                "neutral",
                "Neutre"
            );
        }
    }


    // -------------------------------------------------
    // MM350
    // -------------------------------------------------

    if (Number.isFinite(mm350Value)) {

        const ratio =
            currentPrice /
            mm350Value;


        if (ratio < 0.80) {

            setIndicator(
                indicatorMm350,
                kpiMm350,
                "buy",
                "Achat"
            );

        } else if (ratio > 1.25) {

            setIndicator(
                indicatorMm350,
                kpiMm350,
                "sell",
                "Vente"
            );

        } else {

            setIndicator(
                indicatorMm350,
                kpiMm350,
                "neutral",
                "Neutre"
            );
        }
    }


    // -------------------------------------------------
    // PI CYCLE
    // -------------------------------------------------

    setIndicator(
        indicatorPiCycle,
        kpiPiCycle,
        "neutral",
        "En attente"
    );


    // -------------------------------------------------
    // RAINBOW
    // -------------------------------------------------

    setIndicator(
        indicatorRainbow,
        kpiRainbow,
        "neutral",
        "En attente"
    );


    // -------------------------------------------------
    // FEAR & GREED
    // -------------------------------------------------

    setIndicator(
        indicatorFear,
        kpiFear,
        "neutral",
        "En attente"
    );
}


// =====================================================
// APPLICATION ETAT INDICATEUR
// =====================================================

function setIndicator(
    indicator,
    kpi,
    state,
    text
) {

    if (indicator) {

        setState(
            indicator,
            state
        );


        const strong =
            indicator.querySelector(
                "strong"
            );


        if (strong) {
            strong.textContent =
                text;
        }
    }


    if (kpi) {

        setState(
            kpi,
            state
        );
    }
}


// =====================================================
// SCORE PRINCIPAL
// =====================================================

function calculateScore() {

    /*
     * IMPORTANT :
     *
     * Le score final sera basé sur les
     * 6 KPIs.
     *
     * Pi Cycle aura une priorité particulière
     * sur MM111 et MM350.
     *
     * Pour le moment, seuls les indicateurs
     * réellement disponibles participent au score.
     *
     * On évite donc d'inventer une valeur
     * pour les indicateurs non branchés.
     */


    const scores = [];


    // RSI
    if (Number.isFinite(rsiValue)) {

        let score;


        if (rsiValue < 30) {

            score = 100;

        } else if (rsiValue > 70) {

            score = 0;

        } else {

            score = 50;
        }


        scores.push(score);
    }


    /*
     * Tant que les autres sources ne sont pas
     * branchées, le score reste neutre.
     */

    let finalScore = 50;


    if (scores.length > 0) {

        finalScore =
            average(scores);
    }


    finalScore =
        Math.round(
            finalScore
        );


    updateMainSignal(
        finalScore
    );
}


// =====================================================
// SIGNAL PRINCIPAL
// =====================================================

function updateMainSignal(score) {

    if (!Number.isFinite(score)) {
        score = 50;
    }


    score =
        Math.max(
            0,
            Math.min(
                100,
                score
            )
        );


    if (signalScoreElement) {

        signalScoreElement.textContent =
            score;
    }


    if (gaugeCursor) {

        gaugeCursor.style.left =
            score + "%";
    }


    if (!signalStatus) {
        return;
    }


    signalStatus.classList.remove(
        "buy",
        "neutral",
        "sell"
    );


    if (score >= 65) {

        signalStatus.classList.add(
            "buy"
        );


        signalStatus.textContent =
            "Favorable à l'achat";

    } else if (score <= 35) {

        signalStatus.classList.add(
            "sell"
        );


        signalStatus.textContent =
            "Favorable à la vente";

    } else {

        signalStatus.classList.add(
            "neutral"
        );


        signalStatus.textContent =
            "Marché neutre";
    }
}


// =====================================================
// OUVERTURE DES KPI
// =====================================================

function setupKpiCards() {

    const cards = [
        kpiRsi,
        kpiMm111,
        kpiMm350,
        kpiPiCycle,
        kpiRainbow,
        kpiFear
    ];


    cards.forEach(
        card => {

            if (!card) {
                return;
            }


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
// REDESSIN DE LA COURBE
// =====================================================

window.addEventListener(
    "resize",
    () => {

        if (btcPrices.length) {
            drawBTCChart();
        }
    }
);
// =====================================================
// INTERACTION COURBE
// =====================================================

function setupChartInteraction() {

    if (!chartCanvas) {
        return;
    }

    if (chartEventsInitialized) {
        return;
    }

    chartEventsInitialized = true;

    chartCanvas.style.cursor = "crosshair";

    chartCanvas.addEventListener(
        "mousemove",
        function(event) {

            if (!chartPoints.length) {
                return;
            }

            const rect =
                chartCanvas.getBoundingClientRect();

            const mouseX =
                event.clientX -
                rect.left;

            let closestIndex = 0;

            let closestDistance =
                Math.abs(
                    chartPoints[0].x -
                    mouseX
                );

            for (
                let i = 1;
                i < chartPoints.length;
                i++
            ) {

                const distance =
                    Math.abs(
                        chartPoints[i].x -
                        mouseX
                    );

                if (
                    distance <
                    closestDistance
                ) {

                    closestDistance =
                        distance;

                    closestIndex =
                        i;
                }
            }

            chartHoverIndex =
                closestIndex;

            drawBTCChart();
        }
    );

    chartCanvas.addEventListener(
        "mouseleave",
        function() {

            chartHoverIndex = null;

            drawBTCChart();
        }
    );
}

// =====================================================
// LANCEMENT
// =====================================================

setupKpiCards();

setupChartInteraction();

getBTCData();
