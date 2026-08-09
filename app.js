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
const rsiTrendElement = document.getElementById("rsi-trend");
const mm111TrendElement = document.getElementById("mm111-trend");
const mm350TrendElement = document.getElementById("mm350-trend");
const fearTrendElement = document.getElementById("fear-trend");
const rsiAverageElement =
    document.getElementById("rsi-average");

const mm111AverageElement =
    document.getElementById("mm111-average");

const mm350AverageElement =
    document.getElementById("mm350-average");
const fearAverageElement =
    document.getElementById("fear-average");
const rainbowEvolutionElement =
    document.getElementById("rainbow-evolution");
const piCycleEvolutionElement =
    document.getElementById("picycle-evolution");
const piCycleAverageElement = document.getElementById("picycle-average");
const mvrvElement =
document.getElementById("mvrv");

const mvrvAverageElement =
document.getElementById("mvrv-average");
// =====================================================
// INDICATEURS
// =====================================================

const indicatorRsi = document.getElementById("indicator-rsi");
const indicatorMm111 = document.getElementById("indicator-mm111");
const indicatorMm350 = document.getElementById("indicator-mm350");
const indicatorPiCycle = document.getElementById("indicator-picycle");
const indicatorRainbow = document.getElementById("indicator-rainbow");
const indicatorMvrv = document.getElementById("indicator-mvrv");
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
const kpiMvrv =
document.getElementById("kpi-mvrv");


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
let piCycleAverage7 = null;
let rainbowValue = null;
let fearGreedValue = null;
let rsiHistory = [];
let mm111History = [];
let mm350History = [];
let fearGreedHistory = [];
let rainbowHistory =
    JSON.parse(
        localStorage.getItem("rainbowHistory")
    ) || [];
let piCycleHistory = [];
let mvrvValue = null;
let mvrvHistory = [];
let rainbowScore = null;
// =====================================================
// CYCLES BTC HISTORIQUES
// =====================================================

const cycle2021 = {

    date: "10/11/2021",

    price: 59000,

    phase: "🔴 Euphorie"

};


const cycle2025 = {

    date: "06/10/2025",

    price: 106000,

    phase: "🔴 Euphorie"

};
// =====================================================
// INDICATEURS HISTORIQUES DES SOMMETS
// =====================================================

const cycle2021Indicators = {

    rsi: 74,
    mm111: 42000,
    mm350: 30000,
    piCycle: 96,
    rainbow: "Surchauffe / risque",
    mvrv: 3.2,
    fearGreed: 84

};


const cycle2025Indicators = {

    rsi: 78,
    mm111: 85000,
    mm350: 60000,
    piCycle: 94,
    rainbow: "Surchauffe / risque",
    mvrv: 3.5,
    fearGreed: 90

};

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
// COULEURS TABLEAU CYCLE
// =====================================================

function setCycleColor(
    element,
    state
) {

    if (!element) {
        return;
    }


    element.classList.remove(
        "cycle-buy",
        "cycle-neutral",
        "cycle-sell"
    );


    if (state === "buy") {

        element.classList.add(
            "cycle-buy"
        );

    }


    if (state === "neutral") {

        element.classList.add(
            "cycle-neutral"
        );

    }


    if (state === "sell") {

        element.classList.add(
            "cycle-sell"
        );

    }

}
// =====================================================
// SCORE COMPORTEMENT DU CYCLE (30 POINTS)
// =====================================================

function calculateCycleBehaviorScore() {

    let score = 0;
console.log(
    "DEBUG COMPORTEMENT CYCLE",
    {
        prix: currentPrice,
        mm111: mm111Value,
        mm350: mm350Value
    }
);

    // =====================================
    // 1 - SORTIE DU CREUX (10 points)
    // =====================================

    if (
        btcPrices.length
    ) {

        const recentLow =
            Math.min(
                ...btcPrices.map(
                    p => p.price
                )
            );


        const recovery =
            (
                (currentPrice - recentLow) /
                recentLow
            ) * 100;


        if (recovery > 50) {

    score += 10;

}
else if (recovery > 20) {

    score += 5;

}
else if (recovery > 5) {

    score += 2;

}

    }



    // =====================================
    // 2 - REPRISE DE TENDANCE (10 points)
    // =====================================

    if (
        currentPrice &&
        mm111Value &&
        mm350Value
    ) {


        if (
            currentPrice > mm111Value
        ) {

            score += 5;

        }


        if (
            currentPrice > mm350Value
        ) {

            score += 5;

        }

    }


// =====================================
// 3 - ACCELERATION (10 points)
// =====================================

if (
    btcPrices.length > 90
) {

    const price30 =
        btcPrices[
            btcPrices.length - 30
        ].price;


    const price90 =
        btcPrices[
            btcPrices.length - 90
        ].price;



    const variation30 =
        (
            (currentPrice - price30)
            /
            price30
        ) * 100;



    const variation90 =
        (
            (currentPrice - price90)
            /
            price90
        ) * 100;

console.log(
    "DEBUG VARIATIONS CYCLE",
    {
        variation30: variation30,
        variation90: variation90,
        price30: price30,
        price90: price90
    }
);

  if (variation30 > 5) {
    score += 5;
}

if (variation90 > 10) {
    score += 5;
}

}


console.log(
    "DEBUG DETAIL COMPORTEMENT",
    {
        score: score,
        prix: currentPrice
    }
);


return score;
    }
// =====================================================
// SCORE STRUCTURE DU MARCHE (30 POINTS)
// =====================================================

function calculateMarketStructureScore() {

    let score = 0;


    // =====================================
    // 1 - POSITION PRIX VS MM111 (10 points)
    // =====================================

    if (
        currentPrice &&
        mm111Value
    ) {

        const ratio111 =
            currentPrice /
            mm111Value;


        if (
            ratio111 >= 1
        ) {

            score += 10;

        }
        else if (
            ratio111 >= 0.90
        ) {

            score += 5;

        }

    }



    // =====================================
    // 2 - POSITION PRIX VS MM350 (10 points)
    // =====================================

    if (
        currentPrice &&
        mm350Value
    ) {

        const ratio350 =
            currentPrice /
            mm350Value;


        if (
            ratio350 >= 1
        ) {

            score += 10;

        }
        else if (
            ratio350 >= 0.80
        ) {

            score += 5;

        }

    }



    // =====================================
    // 3 - ALIGNEMENT MM111 / MM350 (10 points)
    // =====================================

    if (
        mm111Value &&
        mm350Value
    ) {

        const ratioMM =
            mm111Value /
            mm350Value;


        if (
            ratioMM >= 1
        ) {

            score += 10;

        }
        else if (
            ratioMM >= 0.90
        ) {

            score += 5;

        }

    }


    console.log(
        "DEBUG STRUCTURE MARCHE",
        {
            score: score,
            prix: currentPrice,
            mm111: mm111Value,
            mm350: mm350Value
        }
    );


    return score;

}
// =====================================================
// SCORE TEMPS DEPUIS SOMMET (40 POINTS)
// =====================================================

function calculateCycleTimeScore() {

    let score = 0;


    const cycleTopDate =
        new Date(
            "2025-10-06"
        );


    const today =
        new Date();


    const monthsSinceTop =
        (
            (today - cycleTopDate)
            /
            (
                1000 *
                60 *
                60 *
                24 *
                30
            )
        );


    // =====================================
    // 0 - 12 mois
    // Phase post sommet
    // =====================================

    if (
        monthsSinceTop < 12
    ) {

        score = 10;

    }


    // =====================================
    // 12 - 24 mois
    // Accumulation / reprise
    // =====================================

    else if (
        monthsSinceTop < 24
    ) {

        score = 20;

    }


    // =====================================
    // 24 - 36 mois
    // Expansion
    // =====================================

    else if (
        monthsSinceTop < 36
    ) {

        score = 30;

    }


    // =====================================
    // 36 mois +
    // Euphorie possible
    // =====================================

    else {

        score = 40;

    }


    return score;

}
// =====================================================
// CALCUL PHASE DU CYCLE BTC
// =====================================================

function calculateCyclePhase() {


    const timeScore =
        calculateCycleTimeScore();


    const behaviorScore =
        calculateCycleBehaviorScore();


    const marketScore =
        calculateMarketStructureScore();



    const cycleScore =
        timeScore +
        behaviorScore +
        marketScore;



    console.log(
        "DEBUG CYCLE",
        {
            temps: timeScore,
            comportement: behaviorScore,
            structure: marketScore,
            total: cycleScore
        }
    );



    if (
        cycleScore < 25
    ) {

        return "🟢 Accumulation";

    }


    if (
        cycleScore < 50
    ) {

        return "🔵 Reprise";

    }


    if (
        cycleScore < 75
    ) {

        return "🟠 Expansion";

    }


    return "🔴 Euphorie";


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
calculateScore();
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
// MVRV
// =================================================

await getMVRV();

// =================================================
// AFFICHAGE DES INDICATEURS
// =================================================

updateIndicators();


// =================================================
// SCORE
// =================================================

calculateScore();
        // =================================================
// TABLEAU CYCLES
// =================================================

updateCycleTable();


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
data.data?.currentZone ??
data.currentZone ??
data.zone ??
data.data?.zone;
console.log("ZONE RAINBOW COMPLETE", zone);


       if (!zone) {

    throw new Error(
        "Zone Rainbow introuvable"
    );
}
        console.log(
    "DEBUG RAINBOW CALCUL",
    currentPrice,
    zone.lowerBound,
    zone.upperBound
);
if (
    Number.isFinite(currentPrice) &&
    Number.isFinite(zone.lowerBound) &&
    Number.isFinite(zone.upperBound)
) {

    rainbowScore =
    (
        (currentPrice - zone.lowerBound) /
        (zone.upperBound - zone.lowerBound)
    ) * 100;

} else {

    console.log("RAINBOW SCORE IMPOSSIBLE");

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
rainbowHistory.push(
    rainbowValue
);


if (
    rainbowHistory.length > 7
) {

    rainbowHistory.shift();

}


localStorage.setItem(
    "rainbowHistory",
    JSON.stringify(rainbowHistory)
);




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
if (
    rainbowHistory.length >= 2 &&
    rainbowEvolutionElement
) {

    rainbowEvolutionElement.textContent =
        "Evolution 7j : " +
        rainbowHistory[0] +
        " → " +
        rainbowValue;

}

   // =================================================
// ACHAT
// =================================================

if (
    zone.includes("blue") ||
    zone.includes("accumulate") ||
    zone.includes("buy") ||
    zone.includes("green")
) {

    setIndicator(
    indicatorRainbow,
    kpiRainbow,
    "buy",
    rainbowValue +
    (
        Number.isFinite(rainbowScore)
            ? " (" + rainbowScore.toFixed(0) + "%)"
            : ""
    )
);


// =================================================
// SURVEILLANCE
// =================================================

} else if (

    zone.includes("yellow") ||
    zone.includes("orange")

) {

    setIndicator(
        indicatorRainbow,
        kpiRainbow,
        "neutral",
        rainbowValue +
(
    Number.isFinite(rainbowScore)
        ? " (" + rainbowScore.toFixed(0) + "%)"
        : ""
)
    );


// =================================================
// VENTE
// =================================================

} else if (

    zone.includes("red") ||
    zone.includes("fomo") ||
    zone.includes("sell") ||
    zone.includes("maximum")

) {

    setIndicator(
        indicatorRainbow,
        kpiRainbow,
        "sell",
        rainbowValue +
(
    Number.isFinite(rainbowScore)
        ? " (" + rainbowScore.toFixed(0) + "%)"
        : ""
)
    );


// =================================================
// NEUTRE
// =================================================

} else {

    setIndicator(
        indicatorRainbow,
        kpiRainbow,
        "neutral",
        rainbowValue +
(
    Number.isFinite(rainbowScore)
        ? " (" + rainbowScore.toFixed(0) + "%)"
        : ""
)
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
// CALCUL PI CYCLE - 7 DERNIERS JOURS REELS
// =================================================


// =================================================
// PI CYCLE TOP CLASSIQUE
// =================================================

if (
    Number.isFinite(mm111Value) &&
    Number.isFinite(mm350Value)
) {

    piCycleValue =
        (
            mm111Value /
            (mm350Value * 2)
        ) * 100;

} else {

    piCycleValue = null;

}


// =================================================
// HISTORIQUE PI CYCLE 7 JOURS REELS
// =================================================

if (btcPrices.length >= 350) {

    let piHistory = [];


    for (
        let i = 350;
        i < btcPrices.length;
        i++
    ) {

        const pricesHistory =
            btcPrices
                .slice(0, i + 1)
                .map(item => item.price);


        const mm111 =
    calculateMovingAverage(
        pricesHistory,
        111
    );

const mm350 =
    calculateMovingAverage(
        pricesHistory,
        350
    );


if (
    Number.isFinite(mm111) &&
    Number.isFinite(mm350)
) {

    piHistory.push(
        (
            mm111 /
            (mm350 * 2)
        ) * 100
    );

}

    }


    piCycleAverage7 =
        average(
            piHistory.slice(-7)
        );

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

if (
    piCycleAverageElement &&
    Number.isFinite(piCycleAverage7)
) {

    piCycleAverageElement.textContent =
        "Moy. 7j : " +
        piCycleAverage7.toFixed(1) +
        "%";

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

   const rsi7DaysAgo =
    calculateKpiAverage7Days(
        14,
        calculateRSI
    );

    if (
        Number.isFinite(rsi7DaysAgo)
    ) {

        const variation =
            (
                (rsiValue - rsi7DaysAgo) /
                rsi7DaysAgo
            ) * 100;


        rsiElement.innerHTML =
            rsiValue.toFixed(1) +
            " <small>" +
            (
                variation >= 0
                    ? "+" + variation.toFixed(1) + "%"
                    : variation.toFixed(1) + "%"
            ) +
            "</small>";


        if (
            rsiAverageElement
        ) {

            rsiAverageElement.textContent =
                "Moy. 7j : " +
                rsi7DaysAgo.toFixed(1);

        }


    } else {

        rsiElement.textContent =
            rsiValue.toFixed(1);

    }


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

const mm1117DaysAgo =
    calculateKpiAverage7Days(
        111,
        calculateMovingAverage
    );

    if (
        Number.isFinite(mm1117DaysAgo)
    ) {

        const variation =
            (
                (mm111Value - mm1117DaysAgo) /
                mm1117DaysAgo
            ) * 100;


        const ratioMM111 =
    (currentPrice / mm111Value) * 100;


mm111Element.innerHTML =
    formatPrice(mm111Value) +
    " <small>" +
    ratioMM111.toFixed(1) +
    "%</small>";


        if (
            mm111AverageElement
        ) {

            mm111AverageElement.textContent =
    "Moy. 7j : " +
    formatPrice(mm1117DaysAgo) +
    " " +
    (
        variation >= 0
            ? "+" + variation.toFixed(1) + "%"
            : variation.toFixed(1) + "%"
    );

        }


    } else {

        mm111Element.textContent =
            formatPrice(mm111Value);

    }


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

    const mm3507DaysAgo =
        calculateKpiAverage7Days(
            350,
            calculateMovingAverage
        );

    const variation =
        (
            (mm350Value - mm3507DaysAgo) /
            mm3507DaysAgo
        ) * 100;


   const ratioMM350 =
    (currentPrice / mm350Value) * 100;


mm350Element.innerHTML =
    formatPrice(mm350Value) +
    " " +
    ratioMM350.toFixed(1) +
    "%";


    // Affichage moyenne 7 jours
    if (mm350AverageElement) {

    mm350AverageElement.textContent =
        "Moy. 7j : " +
        formatPrice(mm3507DaysAgo) +
        " " +
        (
            variation >= 0
                ? "+" + variation.toFixed(1) + "%"
                : variation.toFixed(1) + "%"
        );

}
} else if (mm350Element) {

    mm350Element.textContent = "-";

}

// =================================================
// AFFICHAGE PI CYCLE
// =================================================

console.log(
    "DEBUG PI CYCLE",
    {
        prix: currentPrice,
        mm111: mm111Value,
        mm350: mm350Value,
        pi: piCycleValue,
        moyenne7j: piCycleAverage7
    }
);


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


if (
    piCycleAverageElement &&
    Number.isFinite(piCycleAverage7)
) {

    piCycleAverageElement.textContent =
        "Moy. 7j : " +
        piCycleAverage7.toFixed(1) +
        "%";

}


// =================================================
// ETAT PI CYCLE
// =================================================

if (
    Number.isFinite(piCycleValue)
) {

    if (
        piCycleValue >= 90
    ) {

        setIndicator(
            indicatorPiCycle,
            kpiPiCycle,
            "sell",
            "Risque de sommet"
        );


    } else if (
        piCycleValue >= 70
    ) {

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
            "Situation favorable"
        );

    }

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
// AFFICHAGE MVRV
// =====================================================

function updateMVRVDisplay() {


    if (
        mvrvElement &&
        Number.isFinite(mvrvValue)
    ) {

        mvrvElement.textContent =
            mvrvValue.toFixed(2);

    }


    if (
        mvrvAverageElement &&
        mvrvHistory.length
    ) {

        mvrvAverageElement.textContent =
            "Moy. 7j : " +
            average(mvrvHistory).toFixed(2);

    }

}
// =====================================================
// MVRV - COINMETRICS
// =====================================================

async function getMVRV() {

    try {

        const response = await fetch(
            "https://community-api.coinmetrics.io/v4/timeseries/asset-metrics?assets=btc&metrics=CapMVRVCur",
            {
                cache: "no-store"
            }
        );


        if (!response.ok) {

            throw new Error(
                "MVRV API : " + response.status
            );

        }


        const data =
            await response.json();


       const last7 =
    data.data.slice(-7);


mvrvHistory =
    last7.map(item =>
        Number(item.CapMVRVCur)
    );


mvrvValue =
    mvrvHistory[
        mvrvHistory.length - 1
    ];


if (
    Number.isFinite(mvrvValue)
) {

    console.log(
        "MVRV actuel :",
        mvrvValue
    );

    console.log(
        "MVRV historique 7j :",
        mvrvHistory
    );

}


        updateMVRVDisplay();


    } catch(error) {

        console.error(
            "Erreur MVRV :",
            error
        );


        mvrvValue = null;

    }

}
// =====================================================
// FEAR & GREED
// =====================================================

async function getFearGreed() {

    try {

        const response =
            await fetch(
                "https://api.alternative.me/fng/?limit=7",
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


       // ===============================
// VALEUR ACTUELLE
// ===============================

fearGreedValue =
    Number(
        data.data[0].value
    );


// ===============================
// HISTORIQUE 7 JOURS REELS
// ===============================

fearGreedHistory =
    data.data
        .slice(0, 7)
        .map(
            item => Number(item.value)
        );

        // ===============================
        // AFFICHAGE FEAR & GREED
        // ===============================

        if (
            Number.isFinite(fearGreedValue)
        ) {


            let variationText = "";


            if (
                fearGreedHistory.length >= 2
            ) {

                const average7 =
                    average(
                        fearGreedHistory
                    );


                if (
                    Number.isFinite(average7) &&
                    average7 !== 0
                ) {

                    const variation =
                        (
                            (fearGreedValue - average7) /
                            average7
                        ) * 100;


                    variationText =
                        variation >= 0
                            ? " +" + variation.toFixed(1) + "%"
                            : " " + variation.toFixed(1) + "%";

                }

            }


            if (
                fearGreedElement
            ) {

                fearGreedElement.innerHTML =
                    fearGreedValue +
                    " <small>" +
                    variationText +
                    "</small>";

            }


           if (
    fearAverageElement &&
    fearGreedHistory.length > 0
) {

    fearAverageElement.textContent =
        "Moy. 7j : " +
        average(fearGreedHistory).toFixed(1);

}

        } else {


            if (
                fearGreedElement
            ) {

                fearGreedElement.textContent =
                    "-";

            }


            if (
                fearAverageElement
            ) {

                fearAverageElement.textContent =
                    "Moy. 7j : -";

            }

        }


    } catch (error) {


        console.error(
            "Erreur Fear & Greed :",
            error
        );


        fearGreedValue =
            null;


        if (
            fearGreedElement
        ) {

            fearGreedElement.textContent =
                "-";

        }


        if (
        fearAverageElement
    ) {

        fearAverageElement.textContent =
            "Moy. 7j : -";

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
// =================================================
// VALEUR KPI IL Y A 7 JOURS
// =================================================

function calculateKpi7DaysAgo(
    period,
    calculator
) {

    if (
        !btcPrices.length ||
        btcPrices.length < period + 7
    ) {
        return null;
    }


    const oldPrices =
    btcPrices
        .slice(0, -7)
        .map(
            item => item.price
        );


    return calculator(
        oldPrices,
        period
    );

}
// =================================================
// MOYENNE REELLE DES 7 DERNIERS JOURS
// =================================================

function calculateKpiAverage7Days(period, calculator) {

    let values = [];

    for (let day = 0; day < 7; day++) {

        const endIndex =
            btcPrices.length - day;

        const history =
            btcPrices
                .slice(0, endIndex)
                .map(item => item.price);


        const value =
            calculator(
                history,
                period
            );


        if (Number.isFinite(value)) {
            values.push(value);
        }

    }

    return average(values);
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


       if (ratio < 0.85) {

    setIndicator(
        indicatorMm111,
        kpiMm111,
        "buy",
        "Achat fort"
    );

} else if (ratio < 1.00) {

    setIndicator(
        indicatorMm111,
        kpiMm111,
        "buy",
        "Achat"
    );

} else if (ratio < 1.15) {

    setIndicator(
        indicatorMm111,
        kpiMm111,
        "neutral",
        "Neutre"
    );

} else if (ratio < 1.30) {

    setIndicator(
        indicatorMm111,
        kpiMm111,
        "neutral",
        "Surveillance"
    );

} else {

            setIndicator(
                indicatorMm111,
                kpiMm111,
               "sell",
"Vente"
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


    if (ratio < 0.75) {

        setIndicator(
            indicatorMm350,
            kpiMm350,
            "buy",
            "Achat fort"
        );

    } else if (ratio < 1.00) {

        setIndicator(
            indicatorMm350,
            kpiMm350,
            "buy",
            "Achat"
        );

    } else if (ratio < 1.25) {

        setIndicator(
            indicatorMm350,
            kpiMm350,
            "neutral",
            "Neutre"
        );

    } else if (ratio < 1.50) {

        setIndicator(
            indicatorMm350,
            kpiMm350,
            "neutral",
            "Surveillance"
        );

    } else {

        setIndicator(
            indicatorMm350,
            kpiMm350,
            "sell",
            "Vente"
        );

    }

}
    // =================================================
// PI CYCLE
// =================================================

if (
    Number.isFinite(piCycleValue)
) {

    if (piCycleValue > 100) {

        setIndicator(
            indicatorPiCycle,
            kpiPiCycle,
            "sell",
            "Sommet potentiel"
        );

    } else if (piCycleValue >= 90) {

        setIndicator(
            indicatorPiCycle,
            kpiPiCycle,
            "neutral",
            "Risque élevé"
        );

    } else if (piCycleValue >= 75) {

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
// MVRV
// =================================================

if (
    Number.isFinite(mvrvValue)
) {

    if (
        mvrvValue < 1
    ) {

        setIndicator(
            indicatorMvrv,
            kpiMvrv,
            "buy",
            "Sous-évalué"
        );

    } else if (
        mvrvValue >= 3.5
    ) {

        setIndicator(
            indicatorMvrv,
            kpiMvrv,
            "sell",
            "Risque de sommet"
        );

    } else if (
        mvrvValue >= 2.5
    ) {

        setIndicator(
            indicatorMvrv,
            kpiMvrv,
            "neutral",
            "Surveillance"
        );

    } else {

        setIndicator(
            indicatorMvrv,
            kpiMvrv,
            "neutral",
            "Neutre"
        );

    }

} else {

    setIndicator(
        indicatorMvrv,
        kpiMvrv,
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
    fearGreedValue,
     mvrvValue
});

    // =================================================
    // RSI
    // =================================================

    if (Number.isFinite(rsiValue)) {

        let score;


      if (rsiValue <= 25) {

    score = 100;

} else if (rsiValue >= 75) {

    score = 0;

} else {

    score = 100 - ((rsiValue - 25) * 2);

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


       if (ratio <= 0.85) {

    score = 100;

} else if (ratio >= 1.30) {

    score = 0;

} else {

    score = 100 - ((ratio - 0.85) * 222);

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


       if (ratio <= 0.75) {

    score = 100;

} else if (ratio >= 1.50) {

    score = 0;

} else {

    score = 100 - ((ratio - 0.75) * 133);

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


     if (piCycleValue > 100) {

    score = 0;

} else if (piCycleValue >= 90) {

    score = 25;

} else if (piCycleValue >= 75) {

    score = 60;

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
    zone.includes("blue") ||
    zone.includes("accumulate")
) {

    score = 100;

} else if (
    zone.includes("green")
) {

    score = 75;

} else if (
    zone.includes("yellow")
) {

    score = 50;

} else if (
    zone.includes("orange")
) {

    score = 25;

} else if (
    zone.includes("red") ||
    zone.includes("fomo") ||
    zone.includes("maximum")
) {

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
    // FEAR & GREED
    // =================================================

    if (
        Number.isFinite(
            fearGreedValue
        )
    ) {

        let score;


        if (fearGreedValue <= 10) {

    score = 100;

} else if (fearGreedValue >= 90) {

    score = 0;

} else {

    score = 100 - ((fearGreedValue - 10) * 1.25);

}


scores.push({
    value: score,
    weight: 1
});
    }
// =================================================
// MVRV
// =================================================

if (
    Number.isFinite(
        mvrvValue
    )
) {

    let score;


    if (mvrvValue < 1) {

        score = 100;

    } else if (mvrvValue >= 3) {

        score = 0;

    } else {

        score =
            100 -
            ((mvrvValue - 1) * 50);

    }


    scores.push({
        value: score,
        weight: 3
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
console.log("DETAIL SCORE", scores);
console.log("SCORE FINAL", finalScore);

updateMainSignal(
finalScore
);


if (rainbowElement) {

    console.log(
        "AFFICHAGE RAINBOW",
        rainbowValue,
        rainbowScore
    );

    rainbowElement.textContent =
        rainbowValue +
        (
            Number.isFinite(rainbowScore)
                ? " (" + rainbowScore.toFixed(0) + "%)"
                : ""
        );

}


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
        kpiMvrv,
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
    selectedDate.toLocaleString(
        "fr-FR",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
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
// AFFICHAGE TABLEAU CYCLES
// =====================================================
function updateCycleTable() {

    document.getElementById(
        "cycle-2021-date"
    ).textContent =
        cycle2021.date;


    document.getElementById(
        "cycle-2025-date"
    ).textContent =
        cycle2025.date;


    document.getElementById(
        "cycle-2021-price"
    ).textContent =
        formatPrice(
            cycle2021.price
        );


    document.getElementById(
        "cycle-2025-price"
    ).textContent =
        formatPrice(
            cycle2025.price
        );


const phase2021 =
    document.getElementById(
        "cycle-2021-phase"
    );

const phase2025 =
    document.getElementById(
        "cycle-2025-phase"
    );


if (phase2021) {

    phase2021.textContent =
        cycle2021.phase;

}


if (phase2025) {

    phase2025.textContent =
        cycle2025.phase;

}
   const phaseCurrent =
document.getElementById(
"cycle-current-phase"
);

const cycleScoreElement =
document.getElementById(
"cycle-score"
);


const cycleScore =
    calculateCycleTimeScore() +
    calculateCycleBehaviorScore() +
    calculateMarketStructureScore();


if (phaseCurrent) {

    phaseCurrent.textContent =
    calculateCyclePhase();

}


if (cycleScoreElement) {

    cycleScoreElement.textContent =
    cycleScore + " / 100";

}
    // =====================================================
// RSI TABLEAU CYCLE
// =====================================================

const cycleCurrentRsi =
document.getElementById(
    "cycle-current-rsi"
);


if (cycleCurrentRsi) {

    cycleCurrentRsi.textContent =
    rsiValue.toFixed(1);

}
    // =====================================================
// RSI HISTORIQUE CYCLES
// =====================================================

const cycle2021Rsi =
document.getElementById(
"cycle-2021-rsi"
);

const cycle2025Rsi =
document.getElementById(
"cycle-2025-rsi"
);


if (cycle2021Rsi) {

    cycle2021Rsi.textContent =
    cycle2021Indicators.rsi;

}


if (cycle2025Rsi) {

    cycle2025Rsi.textContent =
    cycle2025Indicators.rsi;

}
// COULEURS RSI

setCycleColor(
    cycle2021Rsi,
    cycle2021Indicators.rsi > 70
    ? "sell"
    : "neutral"
);


setCycleColor(
    cycle2025Rsi,
    cycle2025Indicators.rsi > 70
    ? "sell"
    : "neutral"
);


setCycleColor(
    cycleCurrentRsi,
    rsiValue > 70
    ? "sell"
    : rsiValue < 30
    ? "buy"
    : "neutral"
);
// =====================================================
// MM111 TABLEAU CYCLE
// =====================================================

const cycleCurrentMm111 =
document.getElementById(
"cycle-current-mm111"
);


if (cycleCurrentMm111) {

    cycleCurrentMm111.textContent =
    formatPrice(mm111Value);

}
// =====================================================
// MM111 HISTORIQUE CYCLES
// =====================================================

const cycle2021Mm111 =
document.getElementById(
"cycle-2021-mm111"
);

const cycle2025Mm111 =
document.getElementById(
"cycle-2025-mm111"
);


if (cycle2021Mm111) {

    cycle2021Mm111.textContent =
    formatPrice(
        cycle2021Indicators.mm111
    );

}


if (cycle2025Mm111) {

    cycle2025Mm111.textContent =
    formatPrice(
        cycle2025Indicators.mm111
    );

}
    // COULEURS MM111

setCycleColor(
    cycle2021Mm111,
    cycle2021.price > cycle2021Indicators.mm111
    ? "sell"
    : "neutral"
);


setCycleColor(
    cycle2025Mm111,
    cycle2025.price > cycle2025Indicators.mm111
    ? "sell"
    : "neutral"
);


setCycleColor(
    cycleCurrentMm111,
    currentPrice > mm111Value
    ? "sell"
    : "buy"
);
// =====================================================
// MM350 TABLEAU CYCLE
// =====================================================

const cycleCurrentMm350 =
document.getElementById(
"cycle-current-mm350"
);


if (cycleCurrentMm350) {

    cycleCurrentMm350.textContent =
    formatPrice(mm350Value);

}
    // =====================================================
// MM350 HISTORIQUE CYCLES
// =====================================================

const cycle2021Mm350 =
document.getElementById(
"cycle-2021-mm350"
);

const cycle2025Mm350 =
document.getElementById(
"cycle-2025-mm350"
);


if (cycle2021Mm350) {

    cycle2021Mm350.textContent =
    formatPrice(
        cycle2021Indicators.mm350
    );

}


if (cycle2025Mm350) {

    cycle2025Mm350.textContent =
    formatPrice(
        cycle2025Indicators.mm350
    );

}
   // COULEURS MM350

setCycleColor(
    cycle2021Mm350,
    cycle2021.price > cycle2021Indicators.mm350
    ? "sell"
    : "neutral"
);


setCycleColor(
    cycle2025Mm350,
    cycle2025.price > cycle2025Indicators.mm350
    ? "sell"
    : "neutral"
);


setCycleColor(
    cycleCurrentMm350,
    currentPrice > mm350Value
    ? "sell"
    : "buy"
); 
    // =====================================================
// PI CYCLE TABLEAU CYCLE
// =====================================================

const cycleCurrentPi =
document.getElementById(
"cycle-current-pi"
);


if (cycleCurrentPi) {

    cycleCurrentPi.textContent =
    piCycleValue.toFixed(1) + "%";

}
    // =====================================================
// PI CYCLE HISTORIQUE CYCLES
// =====================================================

const cycle2021Pi =
document.getElementById(
"cycle-2021-pi"
);

const cycle2025Pi =
document.getElementById(
"cycle-2025-pi"
);


if (cycle2021Pi) {

    cycle2021Pi.textContent =
    cycle2021Indicators.piCycle + "%";

}


if (cycle2025Pi) {

    cycle2025Pi.textContent =
    cycle2025Indicators.piCycle + "%";

}
    // COULEURS PI CYCLE

setCycleColor(
    cycle2021Pi,
    cycle2021Indicators.piCycle >= 90
    ? "sell"
    : "neutral"
);


setCycleColor(
    cycle2025Pi,
    cycle2025Indicators.piCycle >= 90
    ? "sell"
    : "neutral"
);


setCycleColor(
    cycleCurrentPi,
    piCycleValue >= 90
    ? "sell"
    : piCycleValue < 70
    ? "buy"
    : "neutral"
);
// =====================================================
// RAINBOW TABLEAU CYCLE
// =====================================================

const cycleCurrentRainbow =
document.getElementById(
"cycle-current-rainbow"
);


if (cycleCurrentRainbow) {

    cycleCurrentRainbow.textContent =
    rainbowValue || "-";

}
    console.log(
    "DEBUG TABLEAU MVRV",
    mvrvValue
);
    // =====================================================
// RAINBOW HISTORIQUE CYCLES
// =====================================================

const cycle2021Rainbow =
document.getElementById(
"cycle-2021-rainbow"
);

const cycle2025Rainbow =
document.getElementById(
"cycle-2025-rainbow"
);


if (cycle2021Rainbow) {

    cycle2021Rainbow.textContent =
    cycle2021Indicators.rainbow;

}


if (cycle2025Rainbow) {

    cycle2025Rainbow.textContent =
    cycle2025Indicators.rainbow;

}
// COULEURS RAINBOW

setCycleColor(
    cycle2021Rainbow,
    "sell"
);


setCycleColor(
    cycle2025Rainbow,
    "sell"
);


setCycleColor(
    cycleCurrentRainbow,
    rainbowValue &&
    (
        rainbowValue.includes("Accumulate") ||
        rainbowValue.includes("Accumulation")
    )
    ? "buy"
    : "sell"
);
// =====================================================
// MVRV TABLEAU CYCLE
// =====================================================

const cycleCurrentMvrv =
document.getElementById(
"cycle-current-mvrv"
);

if (cycleCurrentMvrv) {

    cycleCurrentMvrv.textContent =
    Number.isFinite(mvrvValue)
    ? mvrvValue.toFixed(2)
    : "-";


}
 // =====================================================
// MVRV HISTORIQUE CYCLES
// =====================================================

const cycle2021Mvrv =
document.getElementById(
"cycle-2021-mvrv"
);

const cycle2025Mvrv =
document.getElementById(
"cycle-2025-mvrv"
);


if (cycle2021Mvrv) {

    cycle2021Mvrv.textContent =
    cycle2021Indicators.mvrv.toFixed(2);

}


if (cycle2025Mvrv) {

    cycle2025Mvrv.textContent =
    cycle2025Indicators.mvrv.toFixed(2);

}   
  // COULEURS MVRV

setCycleColor(
    cycle2021Mvrv,
    cycle2021Indicators.mvrv >= 3
    ? "sell"
    : "neutral"
);


setCycleColor(
    cycle2025Mvrv,
    cycle2025Indicators.mvrv >= 3
    ? "sell"
    : "neutral"
);


setCycleColor(
    cycleCurrentMvrv,
    mvrvValue >= 3
    ? "sell"
    : mvrvValue < 1.5
    ? "buy"
    : "neutral"
);  
  // =====================================================
// FEAR GREED TABLEAU CYCLE
// =====================================================

const cycleCurrentFear =
document.getElementById(
"cycle-current-fear"
);


if (cycleCurrentFear) {

    cycleCurrentFear.textContent =
    fearGreedValue;

}
    // =====================================================
// FEAR GREED HISTORIQUE CYCLES
// =====================================================

const cycle2021Fear =
document.getElementById(
"cycle-2021-fear"
);

const cycle2025Fear =
document.getElementById(
"cycle-2025-fear"
);


if (cycle2021Fear) {

    cycle2021Fear.textContent =
    cycle2021Indicators.fearGreed;

}


if (cycle2025Fear) {

    cycle2025Fear.textContent =
    cycle2025Indicators.fearGreed;

}
    // COULEURS FEAR & GREED

setCycleColor(
    cycle2021Fear,
    cycle2021Indicators.fearGreed >= 75
    ? "sell"
    : cycle2021Indicators.fearGreed <= 25
    ? "buy"
    : "neutral"
);


setCycleColor(
    cycle2025Fear,
    cycle2025Indicators.fearGreed >= 75
    ? "sell"
    : cycle2025Indicators.fearGreed <= 25
    ? "buy"
    : "neutral"
);


setCycleColor(
    cycleCurrentFear,
    fearGreedValue >= 75
    ? "sell"
    : fearGreedValue <= 25
    ? "buy"
    : "neutral"
);
    }
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
