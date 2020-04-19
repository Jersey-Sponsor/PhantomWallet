self.addEventListener('message', (event) => {

  api1 = event.data.api1;
  api2 = event.data.api2;
  currentAddress = event.data.currentAddress;

  getAuctions();

});

function getBuyDropdown() {

  // preload nft list for buying dropdown bootbox
  buyCustomNFT = api2

  // double sort item & mint
  buyCustomNFT.sort(function (a, b) {

    if (parseFloat(a.item) < parseFloat(b.item)) return 1;
    if (parseFloat(a.item) > parseFloat(b.item)) return -1;

    if (parseFloat(a.mint) > parseFloat(b.mint)) return 1;
    if (parseFloat(a.mint) < parseFloat(b.mint)) return -1;

  });

  countExpired = 0;
  fetchBuyNFTDropdown = '<div id="loader-nftlist-modal" style="display:none;" class="block-loader center"><div class="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div><select multiple style="margin: .5em auto;" id="select-nft-buy">';

  for (i = 0; i < buyCustomNFT.length; i ++) {

    buyType = buyCustomNFT[i].type
    buyName = (buyCustomNFT[i].name).substr(2)
    buyMint = buyCustomNFT[i].mint
    buyItem = buyCustomNFT[i].item
    buyMinDate = buyCustomNFT[i].mint_date
    var date = new Date(buyMinDate * 1000);
    var year = date.getFullYear();
    var month = ("0" + (date.getMonth() + 1)).slice(-2)
    var day = ("0" + (date.getDate())).slice(-2)
    buyMintDateFormatted = year + "-" + month + "-" + day;
    buyRarity = formatRarity(buyCustomNFT[i].rarity)
    buyId = buyCustomNFT[i].id
    buyPriceRaw = mergedAuctionsFinal.filter(function (el) {
      return el.tokenId == api2[i].id;
    });
    buyCurrency = buyPriceRaw[0].quoteSymbol
    buyPrice = (buyPriceRaw[0].price)/(Math.pow(10,formatDecimals(buyCurrency)));
    buyPriceCustomReal = (buyPriceRaw[0].price)/(Math.pow(10,formatDecimals(buyCurrency)));
    buyCreator = buyPriceRaw[0].creatorAddress

    if ((((buyPriceRaw[0].endDate)*1000) - (new Date()).getTime() < 0) && buyCreator != currentAddress) {
      countExpired++
      continue;
    }

    if (buyCreator == currentAddress) {
      classCreator = "classCreator";
      buyPriceCustom = 0;
      buyMyitems = 'filter-myItems';
    } else {
      classCreator = '';
      buyPriceCustom = (buyPriceRaw[0].price)/(Math.pow(10,formatDecimals(buyCurrency)));
      buyMyitems = '';
    }

    lenAuctionsBuy = buyCustomNFT.length - countExpired;

    if (((buyPriceRaw[0].endDate)*1000) - (new Date()).getTime() < 0) {
      expiredItem = ' • Expired'
    } else {
      expiredItem = ''
    }

    fetchBuyNFTDropdown += '<option value="' + buyCustomNFT[i].id + '" class=" ' + classCreator + ' filter-type filter-type-' + buyType + ' filter-rarity filter-rarity-' + buyRarity + ' filter-currency filter-currency-' + buyCurrency +  ' ' + buyMyitems + '" price="' + buyPriceCustom + '"priceReal="' + buyPriceCustomReal + '" creatorAddress="' + buyCreator + '" item="' + buyItem + '" mint="' + buyMint + '" rarity="' + buyRarity + '">' + buyName + ' • Mint #' + buyMint + ' • Minted on ' + buyMintDateFormatted + ' • ' + buyRarity + ' • ' + numberWithCommas(buyPrice) + ' ' + buyCurrency + expiredItem + '</option>'
  }
  fetchBuyNFTDropdown += '</select>'

  postMessage({fetchBuyNFTDropdown: fetchBuyNFTDropdown});

}

function getAuctions() {

  mergedAuctionsFinal = api1

  // filter by start date
  mergedAuctionsFinal.sort((a,b) => (a.startDate < b.startDate) ? 1 : ((b.startDate < a.startDate) ? -1 : 0));

  lenAuctions = mergedAuctionsFinal.length;

  mergedAuctionsFinalNotExpired = mergedAuctionsFinal.filter(function (el) {
    return el.endDate > (((new Date()).getTime())/1000);
  });

  // filter by start date
  mergedAuctionsFinalNotExpired.sort((a,b) => (a.startDate < b.startDate) ? 1 : ((b.startDate < a.startDate) ? -1 : 0));

  // load buy dropdown after merged
  getBuyDropdown();

  fetchAuctions = '';
  tooltipAuction = '';

  // start building the search input
  fetchAuctions += '<div class="col-md-12 center" id="head-input-search">'
        +    '<div style="margin-top: .5em;margin-bottom:-.7em;">'
        +      '<p>Search for an item</p>'
        +    '</div>'
        +    '<form>'
        +      '<input id="input-search" type="search"placeholder="ITEM" class="search"><div id="count-search" style="display: inline-block;margin-left: 1em;">XXXXX items available</div>'
        +    '</form>'
        + '</div>'

  fetchAuctions += '<ul class="paginationTop pagination"></ul>'
  fetchAuctions += '<ul class="list">'

    // start full details
    for (i = 0; i < lenAuctions; i++) {

      singleDetailsAPINFT = api2.filter(function (el) {
        return el.id == mergedAuctionsFinal[i].tokenId;
      });

      // hide ended auctions
      if ((((mergedAuctionsFinal[i].endDate)*1000) - (new Date()).getTime() < 0)) {
        continue;
      }

      // catch all bogus auction count
      if (!singleDetailsAPINFT[0]) {
        continue;
      }

      creatorAddress = mergedAuctionsFinal[i].creatorAddress;
      if (creatorAddress.length > 20) {
        lastFiveAddr = creatorAddress.substr(creatorAddress.length - 5);
        firstFiveAddr = creatorAddress.substr(0, 5);
        addressFormated = firstFiveAddr + '...' + lastFiveAddr;
      } else {
        addressFormated = creatorAddress
      }
      //startDate = mergedAuctionsFinal[i].startDate;
      endDate = mergedAuctionsFinal[i].endDate;
      quoteSymbol = mergedAuctionsFinal[i].quoteSymbol;
      tokenID = mergedAuctionsFinal[i].tokenId;
      name = (singleDetailsAPINFT[0].name).replace(' • ', '');
      if (name.length > 29) {
        nameRaw = name.substr(0, 29) + '..';
      } else {
        nameRaw = name;
      }
      item = (singleDetailsAPINFT[0].item);
      priceRaw = (mergedAuctionsFinal[i].price)/(Math.pow(10,formatDecimals(quoteSymbol)));
      price = numberWithCommas(priceRaw);
      priceFormatted = ' BUY FOR ' + price + ' ' + quoteSymbol

      type = singleDetailsAPINFT[0].type;
      rarity = formatRarity(singleDetailsAPINFT[0].rarity);
      season = formatSeason(singleDetailsAPINFT[0].season);
      mintNumber = singleDetailsAPINFT[0].mint;
      mintDate = singleDetailsAPINFT[0].mint_date;
      mintLimit = singleDetailsAPINFT[0].mint_limit;
      if (mintLimit == 0) {
        mintLimit = 'Unlimited'
      }
      image = singleDetailsAPINFT[0].image;
      url = singleDetailsAPINFT[0].image;
      if ((singleDetailsAPINFT[0].description).length > 30) {
        description = '<br>' + singleDetailsAPINFT[0].description;
      } else {
        description = singleDetailsAPINFT[0].description;
      }
      var date = new Date(mintDate * 1000);
      var year = date.getFullYear();
      var month = ("0" + (date.getMonth() + 1)).slice(-2)
      var day = ("0" + (date.getDate())).slice(-2)
      mintDateFormatted = year + "-" + month + "-" + day;
      var timeleft = ((endDate)*1000) - (new Date()).getTime();
      if (((((timeleft / 1000) / 60) / 60) < 1) && ((((timeleft / 1000) / 60) / 60) > 0)) {
        var hoursleft = numberWithCommas(Math.ceil((((timeleft / 1000) / 60)))) + ' MINUTES LEFT';
      } else {
        if ((((timeleft / 1000) / 60) / 60) > 96) {
          var hoursleft = numberWithCommas(Math.ceil((((timeleft / 1000) / 60) / 60 / 24))) + ' DAYS LEFT';
        } else if (timeleft > 0){
          var hoursleft = numberWithCommas(Math.ceil((((timeleft / 1000) / 60) / 60))) + ' HOURS LEFT';
        } else {
          var hoursleft = 'ENDED';
        }
      }
      if (((((timeleft / 1000) / 60) / 60) < 1) && ((((timeleft / 1000) / 60) / 60) > 0)) {
        var hoursleftRaw = numberWithCommas(Math.ceil((((timeleft / 1000) / 60)))) + ' minutes';
      } else {
        if ((((timeleft / 1000) / 60) / 60) > 96) {
          var hoursleftRaw = numberWithCommas(Math.ceil((((timeleft / 1000) / 60) / 60 / 24))) + ' days';
        } else if (timeleft > 0){
          var hoursleftRaw =  numberWithCommas(Math.ceil((((timeleft / 1000) / 60) / 60))) + ' hours';
        } else {
          var hoursleftRaw = 'Ended';
        }
      }

      // tooltip construct
      tooltipAuction = ''
                  + '<div class="tooltip-container"><br>'
                  + '• <strong>Item: </strong>' + name + '<br><br>'
                  + '• <strong>Price: </strong>' + price + ' ' + quoteSymbol + '<br><br>'
                  + '• <strong>Current owner: </strong><a class="raw-link" href="https://www.22series.com/inventory?#' + creatorAddress + '" target="_blank">' + addressFormated + '</a><br><br>'
                  + '• <strong>Type: </strong>' + type + '<br><br>'
                  + '• <strong>Description: </strong>' + description + '<br><br>'
                  + '• <strong>Sale ends in: </strong>' + hoursleftRaw + '<br><br>'
                  + '• <strong>Mint number: </strong>#' + mintNumber + '<br><br>'
                  + '• <strong>Mint date: </strong>' + mintDateFormatted + '<br><br>'
                  + '• <strong>Rarity: </strong>' + rarity + '<br><br>'
                  + '• <strong>Season: </strong>' + season + '<br><br>'
                  + '• <strong>Mint limit: </strong>' + mintLimit + '<br><br>'
                  + '• <strong>Details: </strong><a class="raw-link" href="https://www.22series.com/part_info?id=' + tokenID + '" target="_blank">See the complete details</a><br><br>'
                  + '</div>';

      // auction contstruct
      fetchAuctions += '<li><div class="nft-class" tokenID='+tokenID+'>'
        + '<div class="nft-image" style="width:24em;" onclick="confirmBuyNFT(\'' + quoteSymbol + '\',\'' + tokenID + '\',\'' + priceRaw + '\',\'' + name + '\',\'' + mintNumber + '\',\'' + mintDateFormatted + '\',\'' + creatorAddress + '\')">'
        +   '<div style="display:none;" class="creatorAddress">'+creatorAddress+'</div>'
        +   '<div style="display:none;" class="filterBy">'+type+'</div>'
        +   '<button class="nft-order circulating">' + hoursleft + '</button>'
        +   '<button class="nft-order supply priceFilter">' + priceFormatted + '</button>'
        +   '<img src="' + image + '?width=256" alt="" style="height:12em;padding-top:3em;">'
        +   '<div class="nft-desc item-filter">'
        +     '<h3 style="display:inline-block;">' + nameRaw + '</h3><br>'
        +     '<div style="text-align:center;">'
        +       '<button class="nft-order price mint-number-filter" >#' + mintNumber + '</button>'
        +       '<button class="nft-order price">' + mintDateFormatted + '</button>'
        +       '<button class="nft-order price rarity-' + rarity.toLowerCase() + ' rarityFilter">' + rarity.toUpperCase() + '</button>'
        +       '<button class="tooltip nft-order info" data-tooltip-content="#tooltip_' + [i] + '">'
        +         '<i class="fas fa-info" style="width:1em;"></i>'
        +         '<div class="tooltip_templates"><span id="tooltip_' + i + '">' + tooltipAuction + '</span></div>'
        +       '</button>'
        +     '</div>'
        +   '</div>'
        + '</div>'
        +'</div></li>'

    }

    // complete ul list for list js
    fetchAuctions += '</ul>'
    fetchAuctions += '<ul class="paginationBottom pagination"></ul>'

    postMessage(fetchAuctions);

}

function formatSeason(season) {

  switch(season)
  {
    case 1: return 'Pre-season';
    default: return 'Unknown';
  }

}

function formatRarity(rarity) {

  switch(rarity)
  {
    case 1: return 'Consumer';
    case 2: return 'Industrial';
    case 3: return 'Professional';
    case 4: return 'Custom';
    case 5: return 'Collector';
    case 6: return 'Unique';
    default: return 'Common';
  }

}

function formatDecimals(symbol) {

  switch(symbol)
  {
    case 'SOUL': return 8;
    case 'KCAL': return 10;
    case 'GOATI': return 3;
    case 'GAS': return 8;
    case 'NEO': return 0;
    default: return 0;
  }

}

function roundDown(number, decimals) {
    decimals = decimals || 0;
    return ( Math.floor( number * Math.pow(10, decimals) ) / Math.pow(10, decimals) );
}

function numberWithCommas(x) {

    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".")

}