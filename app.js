// =====================================================
// BTC SIGNAL - APP.JS
// VERSION AVEC HISTORIQUE 400 JOURS
// SOURCE PRIX : COINBASE
// FEAR & GREED : ALTERNATIVE.ME
// RAINBOW : BITCOIN.COM
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


// =====================================================
// KPI
// =====================================================

const rsiElement = document.getElementById("rsi");
const mm111Element = document.getElementById("mm111");
const mm350Element = document.getElementById("mm350");
const piCycleElement = document.getElementById("picycle");
const rainbowElement = document.getElementById("rainbow");
const fearGreedElement = document.getElementById("fear-greed");


// =====================================================
// INDICATEURS
// =====================================================

const indicatorRsi = document.getElementById("indicator-rsi");
const indicatorMm111 = document.getElementById("indicator-mm111");
const indicatorMm350 = document.getElementById("indicator-mm350");
const indicatorPiCycle = document.getElementById("indicator-picycle");
const indicatorRainbow = document.getElementById("indicator-rainbow");
const indicatorFear = document.getElementById("indicator-fear");


// =====================================================
// KPI CARDS
// =====================================================

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
// ETAT COULEUR
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
// RECUPERATION PRIX BTC
// COINBASE - 400 JOURS
// =====================================================

async function getBTCData() {

    try {

        console.log(
            "BTC SIGNAL : récupération des données..."
        );


        const now =
            Date.now();


        const oneDay =
            86400 * 1000;


        const start400 =
            now - (400 * oneDay);


        // =================================================
        // HISTORIQUE COINBASE
        // =================================================

        const firstStart =
            start400;


        const firstEnd =
            start400 + (200 * oneDay);


        const secondStart =
            firstEnd;


        const secondEnd =
            now;


        const url1 =
            "https://api.exchange.coinbase.com/products/BTC-EUR/candles" +
            "?granularity=86400" +
            "&start=" +
            encodeURIComponent(
                new Date(firstStart).toISOString()
            ) +
            "&end=" +
            encodeURIComponent(
                new Date(firstEnd).toISOString()
            );


        const url2 =
            "https://api.exchange.coinbase.com/products/BTC-EUR/candles" +
            "?granularity=86400" +
            "&start=" +
            encodeURIComponent(
                new Date(secondStart).toISOString()
            ) +
            "&end=" +
            encodeURIComponent(
                new Date(secondEnd).toISOString()
            );


        const [
            response1,
            response2
        ] = await Promise.all([
            fetch(url1, {
                cache: "no-store"
            }),
            fetch(url2, {
                cache: "no-store"
            })
        ]);


        if (!response1.ok) {

            throw new Error(
                "Coinbase historique 1 : " +
                response1.status
            );
        }


        if (!response2.ok) {

            throw new Error(
                "Coinbase historique 2 : " +
                response2.status
            );
        }


        const data1 =
            await response1.json();


        const data2 =
            await response2.json();


        const combined =
            [
                ...data1,
                ...data2
            ];


        if (
            !Array.isArray(combined) ||
            combined.length === 0
        ) {

            throw new Error(
                "Aucune donnée BTC reçue"
            );
        }


        // Coinbase retourne :
        //
        // [timestamp, low, high, open, close, volume]


        btcPrices =
            combined
                .map(item => ({

                    timestamp:
                        Number(item[0]) * 1000,

                    price:
                        Number(item[4])

                }))
                .filter(item =>
                    Number.isFinite(
                        item.timestamp
                    ) &&
                    Number.isFinite(
                        item.price
                    )
                );


        // =================================================
        // SUPPRESSION DES DOUBLONS
        // =================================================

        const unique =
            new Map();


        btcPrices.forEach(item => {

            unique.set(
                item.timestamp,
                item
            );

        });


        btcPrices =
            Array.from(
                unique.values()
            ).sort(
                (a, b) =>
                    a.timestamp -
                    b.timestamp
            );


        if (btcPrices.length < 30) {

            throw new Error(
                "Historique BTC insuffisant"
            );
        }


        currentPrice =
            btcPrices[
                btcPrices.length - 1
            ].price;


        // =================================================
        // MOYENNE 7 JOURS
        // =================================================

        average7 =
            average(
                btcPrices
                    .slice(-7)
                    .map(item => item.price)
            );


        // =================================================
        // MOYENNE 30 JOURS
        // =================================================

        average30 =
            average(
                btcPrices
                    .slice(-30)
                    .map(item => item.price)
            );


        // =================================================
        // AFFICHAGE
        // =================================================

        updatePriceDisplay();


        // =================================================
        // INDICATEURS
        // =================================================

        calculateIndicators();


        // =================================================
        // RAINBOW
        // =================================================

        await getRainbowData();


        // =================================================
        // FEAR & GREED
        // =================================================

        await getFearGreed();


        // =================================================
        // AFFICHAGE INDICATEURS
        // =================================================

        updateIndicators();


        // =================================================
        // SCORE
        // =================================================

        calculateScore();


        // =================================================
        // GRAPHIQUE
        // =================================================

        drawBTCChart();


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
// RAINBOW
// =====================================================

async function getRainbowData() {

    try {

        console.log(
            "BTC SIGNAL : récupération Rainbow..."
        );


        const response =
            await fetch(
                "https://charts.bitcoin.com/api/v1/charts/rainbow",
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Rainbow API : " +
                response.status
            );
        }


        const data =
            await response.json();


        console.log(
            "BTC SIGNAL : Rainbow",
            data
        );


        // =================================================
        // RECHERCHE DE LA ZONE ACTUELLE
        // =================================================

        const zone =
            data.currentZone ??
            data.data?.currentZone ??
            data.zone ??
            data.data?.zone;


        if (!zone) {

            throw new Error(
                "Zone Rainbow introuvable"
            );
        }


        rainbowValue =
            String(zone);


        // =================================================
        // AFFICHAGE RAINBOW
        // =================================================

        if (rainbowElement) {

            rainbowElement.textContent =
                rainbowValue;
        }


        // =================================================
        // ETAT RAINBOW
        // =================================================

        updateRainbowState();


    } catch (error) {

        console.error(
            "Erreur Rainbow :",
            error
        );


        rainbowValue =
            null;


        if (rainbowElement) {

            rainbowElement.textContent =
                "-";
        }


        setIndicator(
            indicatorRainbow,
            kpiRainbow,
            "neutral",
            "En attente"
        );
    }
}


// =====================================================
// ETAT RAINBOW
// =====================================================

function updateRainbowState() {

    if (!rainbowValue) {
        return;
    }


    const zone =
        rainbowValue.toLowerCase();


    // =================================================
    // ZONES FAVORABLES
    // =================================================

    if (
        zone.includes("fire") ||
        zone.includes("accumulate") ||
        zone.includes("buy") ||
        zone.includes("blue") ||
        zone.includes("green")
    ) {

        setIndicator(
            indicatorRainbow,
            kpiRainbow,
            "buy",
            rainbowValue
        );


    // =================================================
    // ZONES DE VENTE
    // =================================================

    } else if (
        zone.includes("fomo") ||
        zone.includes("sell") ||
        zone.includes("maximum") ||
        zone.includes("red")
    ) {

        setIndicator(
            indicatorRainbow,
            kpiRainbow,
            "sell",
            rainbowValue
        );


    // =================================================
    // ZONES NEUTRES
    // =================================================

    } else {

        setIndicator(
            indicatorRainbow,
            kpiRainbow,
            "neutral",
            rainbowValue
        );
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
// CALCUL DES INDICATEURS
// =====================================================

function calculateIndicators() {

    const prices =
        btcPrices.map(
            item => item.price
        );


    // =================================================
    // RSI
    // =================================================

    rsiValue =
        calculateRSI(
            prices,
            14
        );


    // =================================================
    // MM111
    // =================================================

    mm111Value =
        calculateMovingAverage(
            prices,
            111
        );


    // =================================================
    // MM350
    // =================================================

    mm350Value =
        calculateMovingAverage(
            prices,
            350
        );


    // =================================================
    // PI CYCLE
    // =================================================

    if (
        Number.isFinite(mm111Value) &&
        Number.isFinite(mm350Value)
    ) {

        const piTarget =
            mm350Value * 2;


        piCycleValue =
            (
                currentPrice /
                piTarget
            ) * 100;

    } else {

        piCycleValue =
            null;
    }


    // =================================================
    // AFFICHAGE RSI
    // =================================================

    if (Number.isFinite(rsiValue)) {

        rsiElement.textContent =
            rsiValue.toFixed(1);

    } else {

        rsiElement.textContent =
            "-";
    }


    // =================================================
    // AFFICHAGE MM111
    // =================================================

    if (Number.isFinite(mm111Value)) {

        mm111Element.textContent =
            formatPrice(mm111Value);

    } else {

        mm111Element.textContent =
            "-";
    }


    // =================================================
    // AFFICHAGE MM350
    // =================================================

    if (Number.isFinite(mm350Value)) {

        mm350Element.textContent =
            formatPrice(mm350Value);

    } else {

        mm350Element.textContent =
            "-";
    }


    // =================================================
    // AFFICHAGE PI CYCLE
    // =================================================

    if (Number.isFinite(piCycleValue)) {

        piCycleElement.textContent =
            piCycleValue.toFixed(1) + "%";

    } else {

        piCycleElement.textContent =
            "-";
    }


    // =================================================
    // IMPORTANT :
    // PAS DE RESET DU RAINBOW ICI
    // =================================================
}


// =====================================================
// FEAR & GREED
// =====================================================

async function getFearGreed() {

    try {

        const response =
            await fetch(
                "https://api.alternative.me/fng/?limit=1",
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Fear & Greed : " +
                response.status
            );
        }


        const data =
            await response.json();


        if (
            !data.data ||
            !data.data.length
        ) {

            throw new Error(
                "Fear & Greed vide"
            );
        }


        fearGreedValue =
            Number(
                data.data[0].value
            );


        if (
            Number.isFinite(
                fearGreedValue
            )
        ) {

            fearGreedElement.textContent =
                fearGreedValue;

        } else {

            fearGreedElement.textContent =
                "-";
        }


    } catch (error) {

        console.error(
            "Erreur Fear & Greed :",
            error
        );


        fearGreedValue =
            null;


        fearGreedElement.textContent =
            "-";
    }
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


    return average(
        values.slice(-period)
    );
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

            losses +=
                Math.abs(
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
                averageGain *
                (period - 1) +
                gain
            ) / period;


        averageLoss =
            (
                averageLoss *
                (period - 1) +
                loss
            ) / period;
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

    // =================================================
    // RSI
    // =================================================

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


    // =================================================
    // MM111
    // =================================================

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

    } else {

        setIndicator(
            indicatorMm111,
            kpiMm111,
            "neutral",
            "En attente"
        );
    }


    // =================================================
    // MM350
    // =================================================

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

    } else {

        setIndicator(
            indicatorMm350,
            kpiMm350,
            "neutral",
            "En attente"
        );
    }


    // =================================================
    // PI CYCLE
    // =================================================

    if (
        Number.isFinite(piCycleValue)
    ) {

        if (piCycleValue >= 95) {

            setIndicator(
                indicatorPiCycle,
                kpiPiCycle,
                "sell",
                "Risque de sommet"
            );

        } else if (piCycleValue >= 85) {

            setIndicator(
                indicatorPiCycle,
                kpiPiCycle,
                "neutral",
                "Surveillance"
            );

        } else {

            setIndicator(
                indicatorPiCycle,
                kpiPiCycle,
                "buy",
                "Favorable"
            );
        }

    } else {

        setIndicator(
            indicatorPiCycle,
            kpiPiCycle,
            "neutral",
            "En attente"
        );
    }


    // =================================================
    // RAINBOW
    // =================================================

    // Rainbow est géré directement par :
    // getRainbowData()
    // et
    // updateRainbowState()


    // =================================================
    // FEAR & GREED
    // =================================================

    if (
        Number.isFinite(
            fearGreedValue
        )
    ) {

        if (
            fearGreedValue <= 25
        ) {

            setIndicator(
                indicatorFear,
                kpiFear,
                "buy",
                "Peur extrême"
            );

        } else if (
            fearGreedValue >= 75
        ) {

            setIndicator(
                indicatorFear,
                kpiFear,
                "sell",
                "Avidité extrême"
            );

        } else {

            setIndicator(
                indicatorFear,
                kpiFear,
                "neutral",
                "Neutre"
            );
        }

    } else {

        setIndicator(
            indicatorFear,
            kpiFear,
            "neutral",
            "En attente"
        );
    }
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

    const scores = [];


    // =================================================
    // RSI
    // =================================================

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


    // =================================================
    // MM111
    // =================================================

    if (Number.isFinite(mm111Value)) {

        const ratio =
            currentPrice /
            mm111Value;


        let score;


        if (ratio < 0.90) {

            score = 100;

        } else if (ratio > 1.15) {

            score = 0;

        } else {

            score = 50;
        }


        scores.push(score);
    }


    // =================================================
    // MM350
    // =================================================

    if (Number.isFinite(mm350Value)) {

        const ratio =
            currentPrice /
            mm350Value;


        let score;


        if (ratio < 0.80) {

            score = 100;

        } else if (ratio > 1.25) {

            score = 0;

        } else {

            score = 50;
        }


        scores.push(score);
    }


    // =================================================
    // PI CYCLE
    // =================================================

    if (
        Number.isFinite(
            piCycleValue
        )
    ) {

        let score;


        if (piCycleValue >= 95) {

            score = 0;

        } else if (
            piCycleValue >= 85
        ) {

            score = 50;

        } else {

            score = 100;
        }


        scores.push(score);
    }


    // =================================================
    // FEAR & GREED
    // =================================================

    if (
        Number.isFinite(
            fearGreedValue
        )
    ) {

        let score;


        if (
            fearGreedValue <= 25
        ) {

            score = 100;

        } else if (
            fearGreedValue >= 75
        ) {

            score = 0;

        } else {

            score = 50;
        }


        scores.push(score);
    }


    // =================================================
    // SCORE FINAL
    // =================================================

    let finalScore = 50;


    if (scores.length) {

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


    chartCanvas.style.cursor =
        "crosshair";


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

            chartHoverIndex =
                null;


            drawBTCChart();
        }
    );
}


// =====================================================
// GRAPHIQUE
// =====================================================

function drawBTCChart() {

    if (!chartCanvas) {
        return;
    }


    const context =
        chartCanvas.getContext("2d");


    const container =
        chartCanvas.parentElement;


    const width =
        container.clientWidth;


    const height =
        container.clientHeight;


    if (
        width <= 0 ||
        height <= 0
    ) {

        return;
    }


    const dpr =
        window.devicePixelRatio || 1;


    chartCanvas.width =
        width * dpr;


    chartCanvas.height =
        height * dpr;


    chartCanvas.style.width =
        width + "px";


    chartCanvas.style.height =
        height + "px";


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


    const points =
        btcPrices
            .slice(-30)
            .filter(point =>
                Number.isFinite(
                    point.price
                )
            );


    if (points.length < 2) {
        return;
    }


    const prices =
        points.map(
            point => point.price
        );


    let minPrice =
        Math.min(...prices);


    let maxPrice =
        Math.max(...prices);


    const rawRange =
        maxPrice -
        minPrice;


    const margin =
        rawRange > 0
            ? rawRange * 0.12
            : maxPrice * 0.01;


    minPrice -= margin;
    maxPrice += margin;


    const range =
        maxPrice -
        minPrice ||
        1;


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


    const coordinates =
        points.map(
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
                        1 -
                        normalized
                    ) *
                    chartHeight;


                return {

                    x,
                    y,
                    price:
                        point.price,

                    timestamp:
                        point.timestamp
                };
            }
        );


    chartPoints =
        coordinates;


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
                i /
                gridLines
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
    // ZONE SOUS COURBE
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
    // CURSEUR
    // =================================================

    if (
        chartHoverIndex !== null &&
        chartPoints[chartHoverIndex]
    ) {

        const selected =
            chartPoints[
                chartHoverIndex
            ];


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


        const boxWidth = 125;
        const boxHeight = 58;


        let boxX =
            selected.x + 12;


        let boxY =
            selected.y -
            boxHeight -
            12;


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


// =====================================================
// RESIZE
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
// LANCEMENT
// =====================================================

setupKpiCards();

setupChartInteraction();

getBTCData();
