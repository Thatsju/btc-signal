// =====================================================
// BTC SIGNAL - APP.JS
// VERSION AVEC HISTORIQUE 400 JOURS
// SOURCE PRIX : COINBASE
// FEAR & GREED : ALTERNATIVE.ME
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
// =====================================================
// PRIX BTC EN DIRECT - COINBASE
// =====================================================

async function updateLivePrice() {

    try {

        const response = await fetch(
            "https://api.exchange.coinbase.com/products/BTC-EUR/ticker",
            {
                cache: "no-store"
            }
        );

        if (!response.ok) {
            throw new Error(
                "Prix BTC : " + response.status
            );
        }

        const data = await response.json();

        const livePrice = Number(data.price);

        if (!Number.isFinite(livePrice)) {
            return;
        }

        currentPrice = livePrice;

updatePriceDisplay();

// recalcul du signal en temps réel
calculateRealtimeScore();

    } catch (error) {

        console.error(
            "Erreur prix BTC :",
            error
        );

    }
}
async function getBTCData() {

    try {

        console.log(
            "BTC SIGNAL : récupération des données..."
        );

        const now = Date.now();

        const oneDay = 86400 * 1000;
        const oneHour = 3600 * 1000;

        // =================================================
        // HISTORIQUE KPI : 400 JOURS
        // =================================================

        const start400 =
            now - (400 * oneDay);

        // =================================================
        // HISTORIQUE COURBE : 7 JOURS HORAIRES
        // =================================================

        const start7 =
            now - (7 * 24 * oneHour);


        // =================================================
        // URL 1 : 400 JOURS QUOTIDIENS
        // =================================================
const splitDate =
    now - (200 * oneDay);


// Première moitié : -400 jours à -200 jours
const urlOld =
    "https://api.exchange.coinbase.com/products/BTC-EUR/candles" +
    "?granularity=86400" +
    "&start=" +
    encodeURIComponent(
        new Date(start400).toISOString()
    ) +
    "&end=" +
    encodeURIComponent(
        new Date(splitDate).toISOString()
    );


// Deuxième moitié : -200 jours à maintenant
const urlRecent =
    "https://api.exchange.coinbase.com/products/BTC-EUR/candles" +
    "?granularity=86400" +
    "&start=" +
    encodeURIComponent(
        new Date(splitDate).toISOString()
    ) +
    "&end=" +
    encodeURIComponent(
        new Date(now).toISOString()
    );


        // =================================================
        // URL 2 : 7 JOURS HORAIRES
        // =================================================

        const url2 =
            "https://api.exchange.coinbase.com/products/BTC-EUR/candles" +
            "?granularity=3600" +
            "&start=" +
            encodeURIComponent(
                new Date(start7).toISOString()
            ) +
            "&end=" +
            encodeURIComponent(
                new Date(now).toISOString()
            );


        // =================================================
        // APPELS API
        // =================================================

       const [
    responseOld,
    responseRecent,
    responseHourly
] = await Promise.all([

    fetch(urlOld, {
        cache: "no-store"
    }),

    fetch(urlRecent, {
        cache: "no-store"
    }),

    fetch(url2, {
        cache: "no-store"
    })

]);


if (!responseOld.ok) {

    throw new Error(
        "Coinbase historique ancien : " +
        responseOld.status
    );

}


if (!responseRecent.ok) {

    throw new Error(
        "Coinbase historique récent : " +
        responseRecent.status
    );

}


if (!responseHourly.ok) {

    throw new Error(
        "Coinbase horaire : " +
        responseHourly.status
    );

}



      const oldData =
    await responseOld.json();

const recentData =
    await responseRecent.json();

const data2 =
    await responseHourly.json();


// Fusion des 400 jours

const data1 = [
    ...oldData,
    ...recentData
];


        // =================================================
        // COMBINAISON
        // =================================================

        // =================================================
// DONNEES KPI : 400 JOURS QUOTIDIENS
// =================================================

btcPrices =
    data1
        .map(item => ({

            timestamp:
                Number(item[0]) * 1000,

            price:
                Number(item[4])

        }))
        .filter(item =>

            Number.isFinite(item.timestamp) &&
            Number.isFinite(item.price)

        )
        .sort(
            (a, b) =>
                a.timestamp -
                b.timestamp
        );


// =================================================
// DONNEES COURBE : 7 JOURS HORAIRES
// =================================================

window.hourlyBTC =
    data2
        .map(item => ({

            timestamp:
                Number(item[0]) * 1000,

            price:
                Number(item[4])

        }))
        .filter(item =>

            Number.isFinite(item.timestamp) &&
            Number.isFinite(item.price)

        )
        .sort(
            (a, b) =>
                a.timestamp -
                b.timestamp
        );

        if (btcPrices.length < 350) {

            throw new Error(
                "Historique BTC insuffisant"
            );

        }


        // =================================================
        // PRIX ACTUEL
        // =================================================

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
        // AFFICHAGE PRIX
        // =================================================

        updatePriceDisplay();


        // =================================================
        // CALCUL INDICATEURS
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
        // AFFICHAGE DES INDICATEURS
        // =================================================

        updateIndicators();


        // =================================================
        // SCORE
        // =================================================
function calculateRealtimeScore() {

    if (!Number.isFinite(currentPrice)) {
        return;
    }

    calculateScore();

}


        // =================================================
// GRAPHIQUE 7 JOURS HORAIRES
// =================================================

if (
    window.hourlyBTC &&
    window.hourlyBTC.length
) {

    drawBTCChart(
        window.hourlyBTC
    );



} else {

    drawBTCChart(window.hourlyBTC);

}

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
// RAINBOW CHART
// =====================================================

async function getRainbowData() {

    try {

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
        // RECHERCHE ZONE ACTUELLE
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


if (typeof zone === "object" && zone !== null) {

    rainbowValue =
        zone.name ??
        zone.label ??
        zone.zone ??
        zone.title ??
        JSON.stringify(zone);

} else {

    rainbowValue =
        String(zone);

}


if (rainbowElement) {

    rainbowElement.textContent =
        rainbowValue;

}


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
    // ACHAT
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
    // VENTE
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
    // NEUTRE
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


    if (priceElement) {

        priceElement.textContent =
            formatPrice(currentPrice);

    }


    if (average7Element) {

        average7Element.textContent =
            formatPrice(average7);

    }


    if (average30Element) {

        average30Element.textContent =
            formatPrice(average30);

    }


    if (
        Number.isFinite(average7) &&
        changeElement
    ) {

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
    // RAINBOW
    // =================================================

    // Le Rainbow sera récupéré
    // séparément avec getRainbowData().

    rainbowValue = null;


    // =================================================
    // AFFICHAGE RSI
    // =================================================

    if (
        Number.isFinite(rsiValue) &&
        rsiElement
    ) {

        rsiElement.textContent =
            rsiValue.toFixed(1);

    } else if (rsiElement) {

        rsiElement.textContent =
            "-";

    }


    // =================================================
    // AFFICHAGE MM111
    // =================================================

    if (
        Number.isFinite(mm111Value) &&
        mm111Element
    ) {

        mm111Element.textContent =
            formatPrice(mm111Value);

    } else if (mm111Element) {

        mm111Element.textContent =
            "-";

    }


    // =================================================
    // AFFICHAGE MM350
    // =================================================

    if (
        Number.isFinite(mm350Value) &&
        mm350Element
    ) {

        mm350Element.textContent =
            formatPrice(mm350Value);

    } else if (mm350Element) {

        mm350Element.textContent =
            "-";

    }


    // =================================================
    // AFFICHAGE PI CYCLE
    // =================================================

    if (
        Number.isFinite(piCycleValue) &&
        piCycleElement
    ) {

        piCycleElement.textContent =
            piCycleValue.toFixed(1) + "%";

    } else if (piCycleElement) {

        piCycleElement.textContent =
            "-";

    }


    // =================================================
    // AFFICHAGE RAINBOW
    // =================================================

    if (rainbowElement) {

        rainbowElement.textContent =
            "-";

    }

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

            if (fearGreedElement) {

                fearGreedElement.textContent =
                    fearGreedValue;

            }

        } else {

            if (fearGreedElement) {

                fearGreedElement.textContent =
                    "-";

            }

        }


    } catch (error) {

        console.error(
            "Erreur Fear & Greed :",
            error
        );


        fearGreedValue =
            null;


        if (fearGreedElement) {

            fearGreedElement.textContent =
                "-";

        }

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


    // =================================================
    // PREMIERE MOYENNE
    // =================================================

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


    // =================================================
    // MOYENNE LISSÉE
    // =================================================

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

    if (rainbowValue) {

        updateRainbowState();

    } else {

        setIndicator(
            indicatorRainbow,
            kpiRainbow,
            "neutral",
            "En attente"
        );

    }


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
console.log("CALCUL SCORE LANCE");
    const scores = [];
console.log("DEBUG SCORE", {
    rsiValue,
    mm111Value,
    mm350Value,
    piCycleValue,
    rainbowValue,
    fearGreedValue
});

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


scores.push({
    value: score,
    weight: 1
});
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


scores.push({
    value: score,
    weight: 2
});
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


scores.push({
    value: score,
    weight: 2
});
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


scores.push({
    value: score,
    weight: 3
});
    }


    // =================================================
    // RAINBOW
    // =================================================

    if (rainbowValue) {

        const zone =
            rainbowValue.toLowerCase();


        let score = 50;


        if (
            zone.includes("fire") ||
            zone.includes("accumulate") ||
            zone.includes("buy") ||
            zone.includes("blue") ||
            zone.includes("green")
        ) {

            score = 100;

        } else if (
            zone.includes("fomo") ||
            zone.includes("sell") ||
            zone.includes("maximum") ||
            zone.includes("red")
        ) {

            score = 0;

        }


scores.push({
    value: score,
    weight: 2
});
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


scores.push({
    value: score,
    weight: 1
});
    }


    // =================================================
    // SCORE FINAL
    // =================================================

    let finalScore = 50;


   if (scores.length) {

    let total = 0;
    let totalWeight = 0;


    scores.forEach(item => {

        total +=
            item.value *
            item.weight;


        totalWeight +=
            item.weight;

    });


    finalScore =
        total /
        totalWeight;



    }


    finalScore =
        Math.round(
            finalScore
        );

console.log("SCORES UTILISES", scores);
console.log("SCORE FINAL", finalScore);
    
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
        (100 - score) + "%";

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


    drawBTCChart(window.hourlyBTC);

        }
    );


    chartCanvas.addEventListener(
        "mouseleave",
        function() {

            chartHoverIndex =
                null;


    drawBTCChart(window.hourlyBTC);

        }
    );

}


// =====================================================
// GRAPHIQUE
// =====================================================

function drawBTCChart(chartData = btcPrices) {
    if (!chartCanvas) {
        return;
    }


    const context =
        chartCanvas.getContext("2d");


    const container =
        chartCanvas.parentElement;


    if (!container) {
        return;
    }


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


    // =================================================
// DONNEES 7 JOURS / DONNEES HORAIRES
// =================================================

const points =
chartData
.slice(-168)
.filter(point =>
Number.isFinite(
point.price
)
);

if (points.length < 2) {
    return;
}
    // =================================================
// ESPACEMENT DU GRAPHIQUE
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
// ECHELLE DES PRIX
// =================================================

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
    // =================================================
    // COORDONNEES
    // =================================================

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
                    ) /
                    range;


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
        // DATE
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


        // -------------------------------------------------
        // PRIX
        // -------------------------------------------------

        const priceLabel =
            formatPrice(
                selected.price
            );


        // -------------------------------------------------
        // BOX
        // -------------------------------------------------

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


        if (
            typeof context.roundRect ===
            "function"
        ) {

            context.roundRect(
                boxX,
                boxY,
                boxWidth,
                boxHeight,
                8
            );

        } else {

            context.rect(
                boxX,
                boxY,
                boxWidth,
                boxHeight
            );

        }


        context.fill();
        context.stroke();


        // -------------------------------------------------
        // DATE BOX
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
        // PRIX BOX
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


// =====================================================
// RESIZE
// =====================================================

window.addEventListener(
    "resize",
    () => {

       if (
    window.hourlyBTC &&
    window.hourlyBTC.length
) {

    drawBTCChart(
        window.hourlyBTC
    );

}

    }
);


// =====================================================
// LANCEMENT
// =====================================================
setupKpiCards();

setupChartInteraction();

// Chargement initial
getBTCData();

// Prix BTC toutes les 30 secondes
setInterval(() => {
    updateLivePrice();
}, 30000);

// Tous les indicateurs toutes les 30 secondes
setInterval(() => {
    getBTCData();
}, 30000);
