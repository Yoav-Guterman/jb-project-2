"use strict";

(async () => {
    const getSingleCoin = async coin => getData(`https://api.coingecko.com/api/v3/coins/${coin}`);
    const getData = url => fetch(url).then(response => response.json());

    const generateCoins = coins => {
        return coins
            .map(
                coin => `
                    <div class="card">
                        <div class="card-body card-flex">
                            <div class="card-title-container">
                                <h4 class="card-title">${coin.symbol}</h4>
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="flexSwitchCheckDefault">
                                    <label class="form-check-label" for="flexSwitchCheckDefault"></label>
                                </div>
                            </div>
                            <p class="card-text">${coin.name}</p>
                            <button id="${coin.id}" type="button" class="btn btn-primary btn-popover">
                                More Info
                            </button>
                        </div>
                    </div>
                `
            )
            .join("");
    };

    const generateMoreInfo = singleCoinData => {
        const coinPriceToUSD = singleCoinData.market_data.current_price.usd;
        const coinPriceToEUR = singleCoinData.market_data.current_price.eur;
        const coinPriceToILS = singleCoinData.market_data.current_price.ils;
        const coinImage = singleCoinData.image.thumb;

        return `
            <div>
                <img src="${coinImage}" alt="${singleCoinData.name}" style="width: 50px; height: 50px;">
                <p>Price in USD: $${coinPriceToUSD}</p>
                <p>Price in EUR: €${coinPriceToEUR}</p>
                <p>Price in ILS: ₪${coinPriceToILS}</p>
            </div>
        `;
    };

    const initializePopovers = () => {
        document.querySelectorAll("#coins-container .btn-popover").forEach(button => {
            button.addEventListener("click", async function () {
                // Check if a popover instance already exists
                let popoverInstance = bootstrap.Popover.getInstance(this);

                if (popoverInstance) {
                    // If popover exists, check if it's visible and toggle
                    if (this.getAttribute("aria-expanded") === "true") {
                        popoverInstance.hide(); // Hide the popover
                    } else {
                        popoverInstance.show(); // Show the popover
                    }
                } else {
                    // First time: Fetch data and initialize the popover
                    const singleCoinData = await getSingleCoin(this.id);
                    const popoverContent = generateMoreInfo(singleCoinData);

                    // Create the popover
                    popoverInstance = new bootstrap.Popover(this, {
                        content: popoverContent,
                        title: `${singleCoinData.name} Details`,
                        html: true,
                        trigger: "manual", // Manual control over toggling
                        placement: "bottom"
                    });

                    // Show the popover
                    popoverInstance.show();
                }
            });
        });
    };

    const renderCoins = coinsHTML => {
        document.getElementById("coins-container").innerHTML = coinsHTML;
    };

    // MAIN FUNCTION
    const onload = async () => {
        try {
            // Fetch and filter coins data
            const allCoinsData = await getData("https://api.coingecko.com/api/v3/coins/list");
            const getFirst100CoinsData = allCoinsData.slice(0, 100);

            // Generate HTML for coins
            const coinsHTML = generateCoins(getFirst100CoinsData);

            // Render coins
            renderCoins(coinsHTML);

            // Initialize popovers for the buttons
            initializePopovers();
        } catch (e) {
            console.warn(e);
        }
    };

    document.getElementById('searchForm').addEventListener('submit', async (event) => {
        event.preventDefault()
        const coinSearch = document.getElementById('searchBar').value
        console.log(coinSearch)
        const allCoinsData = await getData("https://api.coingecko.com/api/v3/coins/list")
        const getFirstSearched100CoinsData = allCoinsData.filter(coin => coin.name.includes(coinSearch)).splice(0, 100)
        console.log(getFirstSearched100CoinsData)
        const coinsSearchedHTML = generateCoins(getFirstSearched100CoinsData)

        renderCoins(coinsSearchedHTML);

        initializePopovers();

    })

    onload();
})();
