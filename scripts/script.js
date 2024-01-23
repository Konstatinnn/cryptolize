const mainCoins = document.querySelector(".main__coins");
const mainGraphic = document.querySelector(".main__graphic");
const mainCup = document.querySelector(".main__cup");
const mainFear = document.querySelector(".main__fear");
const graphicDays = document.querySelector(".main__days");
const load = document.querySelector(".loader");
const error = document.querySelector(".error");
const days = document.querySelectorAll("[data-time]");
const coinsPercent = document.querySelector(".main__total-coins-percent");
const totalAmount = document.querySelector(".main__totalAmount");
const test = document.querySelector(".test");

let currentCoinId = "bitcoin";
let currentCoinTitle = "Bitcoin";
let currentNumberDays = 1;

//***** loader
function loader(div, switcher = true) {
  switcher
    ? document.querySelector(div).classList.add("loader")
    : document.querySelector(div).classList.remove("loader");
}

//***** Add bottom line of chosen day
function bottomLineStyle(choosenDay) {
  days.forEach((item) => item.classList.remove("chosen-days"));
  choosenDay.classList.add("chosen-days");
}

//***** Coins event listener
mainCoins.addEventListener("click", function (e) {
  let choosenCoin = "";
  let chosenCoinName = currentCoinTitle;

  if (e.target.parentElement.getAttribute("data-coin") === null) {
    choosenCoin = e.target.getAttribute("data-coin");
    chosenCoinName = e.target.getAttribute("data-name");
  } else {
    choosenCoin = e.target.parentElement.getAttribute("data-coin");
    chosenCoinName = e.target.parentElement.getAttribute("data-name");
  }

  if (choosenCoin == null) return;
  if (currentCoinId == choosenCoin) return;

  currentCoinId = choosenCoin;
  currentCoinTitle = chosenCoinName;
  currentNumberDays = 1;

  bottomLineStyle(days[0]);
  getCoinData(currentCoinId, currentNumberDays);
});

//***** Days event listener
graphicDays.addEventListener("click", function (e) {
  if (e.target.getAttribute("data-time") === null) return;
  if (currentNumberDays == +e.target.getAttribute("data-time")) return;

  removeCoinGraphic();
  removeErrorFetch(".main__graphic-error");
  currentNumberDays = +e.target.getAttribute("data-time");

  bottomLineStyle(e.target);
  getCoinData(currentCoinId, currentNumberDays);
});

//***** Getting data of coins
(async function () {
  loader(".main__coins");
  let coins = [
    "bitcoin",
    "ethereum",
    "tether",
    "binancecoin",
    "solanas",
    "ripple",
    "usd-coin",
    "cardano",
    "avalanche-2",
    "dogecoin",
    "polkadot",
    "tron",
    "chainlink",
    "matic",
  ];
  try {
    const coinsData = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coins.join(
        "%2C"
      )}-network&order=market_cap_desc&per_page=100&page=1&sparkline=false&locale=en`
    );
    const coinsDataJson = await coinsData.json();
    // loader(".main__coins", false);
    coinsOut(coinsToHtml(coinsDataJson));
  } catch (error) {
    showErrorFetch(
      ".main__coins-error",
      "This <span class='error__text-color'>coingecko API is not free</span>, and there is a limit on the number of requests per minute. Please try again in 1-2 minutes. And sorry for the wait:("
    );
  } finally {
    loader(".main__coins", false);
  }
})();

//*****  Convert Json data of coins to array of html divs with correct data
function coinsToHtml(coins) {
  let coinsBlocks = coins.map((item) => {
    return `<div data-coin="${item.id}" data-name=${
      item.name
    } class="main__coin coin">
                  <img  src="${item.image}" alt="" class="coin__icon"/>
                  <div class="coin__text">${item.name}</div>
                  <div class="coin__price">$${item.current_price.toLocaleString()}</div>
                  <div class="coin__24h${
                    item.price_change_percentage_24h > 0
                      ? " color-grow"
                      : " color-fall"
                  }">$${item.price_change_percentage_24h.toFixed(2)}%</div>
                  <div class="coin__market-cup">$${item.market_cap.toLocaleString()}</div>
              </div>`;
  });
  return coinsBlocks;
}

//*****  Showing divs of coins
function coinsOut(coinsBlocks) {
  coinsBlocks.forEach((item) => {
    mainCoins.innerHTML += item;
  });
}

//***** Getting data on changes in the time and price of the selected coin
async function getCoinData(coinId, days) {
  removeErrorFetch(".main__graphic-error");
  removeCoinGraphic();
  loader(".main__graphic");
  try {
    let result = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
    );
    let data = await result.json();
    sortTimeAndPrice(data.prices);
  } catch (error) {
    showErrorFetch(
      ".main__graphic-error",
      "This <span class='error__text-color'>coingecko API is not free</span>, and there is a limit on the number of requests per minute. Please try again in 1-2 minutes. And sorry for the wait:("
    );
  } finally {
    loader(".main__graphic", false);
  }
}
getCoinData(currentCoinId, currentNumberDays);

//*****  Sorting times and prices
function sortTimeAndPrice(coinInfo) {
  let timeLines = [];
  let price = [];
  coinInfo.forEach((array) => {
    timeLines.push(new Date(array[0]));
    price.push(array[1]);
  });
  showCoinData(timeLines, price, currentCoinTitle);
}

//*****  Show the graphic of chosen coin
function showCoinData(xTable, yTable, coin = "bitcoin") {
  const data = [
    {
      hoverlabel: {
        bgcolor: "white",
        bordercolor: "#DFA916",
        font: {
          family: "Mukta",
          size: 14,
          color: "#000",
        },
      },
      x: xTable,
      y: yTable,
      type: "scatter",
      marker: {
        color: "#e0a40f",
        size: 7,
      },
    },
  ];
  const layout = {
    title: coin,
    colorway: ["red"],
    text: "test",
    margin: { pad: 40, r: 70, t: 95, l: 70 },
    plot_bgcolor: "#f5f5f5",
    font: {
      family: "Mukta",
      color: "#000",
    },

    color: "#000",
  };
  Plotly.newPlot(mainGraphic, data, layout, {
    responsive: true,
    displayModeBar: false,
    scrollZoom: true,
    responsive: true,
  });
}

//*****  RemoveCoinGraphic
function removeCoinGraphic() {
  if (mainGraphic.querySelector(".plot-container") == null) return;
  mainGraphic.removeChild(document.querySelector(".plot-container"));
}

function showErrorFetch(div, textError) {
  divError = document.querySelector(div);
  divError.style.opacity = 1;
  divError.innerHTML = textError;
}

function removeErrorFetch(div) {
  divError = document.querySelector(div);

  divError.style.opacity = 0;
}

function sortCoinsPersIds(coinsData) {
  const coinsIds = [];
  const coinsPercents = [];

  for (const key in coinsData) {
    coinsIds.push(key.toUpperCase());
    coinsPercents.push(+coinsData[key].toFixed());
  }
  // console.log(coinsPercents, coinsIds);
  showCoinsPercent(coinsPercents, coinsIds);
}

async function getTotalData() {
  loader(".main__cup");
  removeErrorFetch(".main__cup-error");
  try {
    const response = await fetch("https://api.coingecko.com/api/v3/global");
    const data = await response.json();
    //data.data.market_cap_percentage;
    totalAmount.innerHTML = `$ ${data.data.total_market_cap.usd.toLocaleString()}`;
    sortCoinsPersIds(data.data.market_cap_percentage);
    console.log("done");
  } catch (e) {
    console.log(e);
    showErrorFetch(
      ".main__cup-error",
      "This <span class='error__text-color'>coingecko API is not free</span>, and there is a limit on the number of requests per minute. Please try again in 1-2 minutes. And sorry for the wait:("
    );
  } finally {
    loader(".main__cup", false);
    console.log("1235");
  }
}
getTotalData();

function showCoinsPercent(coinPersents, coinsId) {
  const data = [
    {
      text: coinsId,
      hovertemplate: "%{x}: %{y}%<extra></extra>",
      textfont: {
        color: "white",
      },
      x: coinsId,
      y: coinPersents,
      type: "bar",
      marker: {
        color: "6c9286ea",
      },
      hoverlabel: {
        bordercolor: "#FFF",
        font: {
          color: "white",
        },
      },
    },
  ];

  const layout = {
    title: {
      text: "Market Cap %",
      y: 1,
      font: {
        size: 14,
        color: "",
      },
      textfont: {
        family: "Mukta",
      },
    },

    margin: { t: 15, b: 240, l: 15, r: 0 },
  };

  Plotly.newPlot(coinsPercent, data, layout, {
    responsive: true,
    displayModeBar: false,
  });
}

async function getIndex() {
  const result = await fetch("https://api.alternative.me/fng/");
  const data = await result.json();
  const index = data.data[0].value;
  showIndex(index);
}
getIndex();

function showIndex(index) {
  document.querySelector(".index").style.left = `calc(${+index}% - 22.5px)`;
  document.querySelector(
    ".just-test"
  ).innerHTML = `<span class='numberOfFear'>${index}</span>`;
}
