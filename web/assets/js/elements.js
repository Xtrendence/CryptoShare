let buttonWindowClose = document.getElementById("button-window-close");
let buttonWindowMinimize = document.getElementById("button-window-minimize");
let buttonWindowMaximize = document.getElementById("button-window-maximize");

let divTitlebar = document.getElementById("titlebar");
let divAppContent = document.getElementById("app-content");

let DOMCache = document.getElementById("dom-cache");

let audioPop = document.getElementById("audio-pop");
let audioSwitch = document.getElementById("audio-switch");

let divBackground = document.getElementById("background");

let divLoading = document.getElementById("loading-overlay");

let divPageLogin = document.getElementById("login-page");
let divPageApp = document.getElementById("app-page");

let inputLoginAPI = document.getElementById("input-login-api");
let inputLoginUsername = document.getElementById("input-login-username");
let inputLoginPassword = document.getElementById("input-login-password");
let inputCreateUsername = document.getElementById("input-create-username");
let inputCreatePassword = document.getElementById("input-create-password");
let inputCreateRepeatPassword = document.getElementById("input-create-repeat-password");

let buttonNewAccount = document.getElementById("button-new-account");
let buttonLoginAccount = document.getElementById("button-login-account");
let buttonExistingAccount = document.getElementById("button-existing-account");
let buttonCreateAccount = document.getElementById("button-create-account");

let loginToggleTheme = document.getElementById("login-toggle-theme");

let divNavbarWrapper = document.getElementById("navbar-wrapper");
let divNavbar = document.getElementById("navbar");

let divSideMenuOverlay = document.getElementById("side-menu-overlay");
let divSideMenuWrapper = document.getElementById("side-menu-wrapper");
let divSideMenuContainer = document.getElementById("side-menu-container");
let divSideMenuTop = document.getElementById("side-menu-top");
let divSideMenuBottom = document.getElementById("side-menu-bottom");

let buttonSideMenuClose = document.getElementById("button-side-menu-close");

let divPageChatBot = document.getElementById("chatbot-page");
let divChatList = document.getElementById("chat-list");
let divChatStatus = document.getElementById("chat-status");
let divChatOptions = document.getElementById("chat-options");

let buttonChatMenu = document.getElementById("button-chat-menu");
let buttonChatHelp = document.getElementById("button-chat-help");
let buttonMessageSend = document.getElementById("button-message-send");

let inputMessage = document.getElementById("input-message");

let divPageDashboard = document.getElementById("dashboard-page");
let divDashboardBudgetList = document.getElementById("dashboard-budget-list");
let divDashboardHoldingsList = document.getElementById("dashboard-holdings-list");
let divDashboardWatchlistList = document.getElementById("dashboard-watchlist-list");

let buttonDashboardBudgetTransactions = document.getElementById("button-dashboard-budget-transactions");
let buttonDashboardBudgetEdit = document.getElementById("button-dashboard-budget-edit");
let buttonDashboardWatchlistAdd = document.getElementById("button-dashboard-watchlist-add");

let spanDashboardHoldings = document.getElementById("span-dashboard-holdings");

let divPageMarket = document.getElementById("market-page");
let divMarketPageNavigationWrapper = document.getElementById("market-page-navigation-wrapper");
let divMarketListCrypto = document.getElementById("market-list-crypto");
let divMarketListStocks = document.getElementById("market-list-stocks");

let buttonMarketInfo = document.getElementById("button-market-info");
let buttonMarketSearch = document.getElementById("button-market-search");
let buttonMarketCrypto = document.getElementById("button-market-crypto");
let buttonMarketStocks = document.getElementById("button-market-stocks");
let buttonMarketPrevious = document.getElementById("button-market-previous");
let buttonMarketNext = document.getElementById("button-market-next");

let spanMarketPage = document.getElementById("span-market-page");

let spanHoldingsUsername = document.getElementById("span-holdings-username");
let spanHoldingsValue = document.getElementById("span-holdings-value");

let buttonHoldingsPerformance = document.getElementById("button-holdings-performance");
let buttonHoldingsAddCryptoAsset = document.getElementById("button-holdings-add-crypto-asset");
let buttonHoldingsAddStockAsset = document.getElementById("button-holdings-add-stock-asset");
let buttonHoldingsPerformanceSmall = document.getElementById("button-holdings-performance-small");
let buttonHoldingsAddCryptoAssetSmall = document.getElementById("button-holdings-add-crypto-asset-small");
let buttonHoldingsAddStockAssetSmall = document.getElementById("button-holdings-add-stock-asset-small");

let divPageHoldings = document.getElementById("holdings-page");
let divHoldingsList = document.getElementById("holdings-list");
let divHoldingsCardUsername = document.getElementById("holdings-card-username");
let divHoldingsCardValue = document.getElementById("holdings-card-value");

let divPageActivity = document.getElementById("activity-page");
let divActivityList = document.getElementById("activity-list");

let inputActivitySearch = document.getElementById("input-activity-search");
let buttonActivitySearch = document.getElementById("button-activity-search");

let buttonActivityHelp = document.getElementById("button-activity-help");
let buttonActivityTools = document.getElementById("button-activity-tools");
let buttonActivityAdd = document.getElementById("button-activity-add");

let divSettingsNavbar = document.getElementById("settings-navbar");
let divPageSettings = document.getElementById("settings-page");
let divSettingsDonate = document.getElementById("settings-section-donate");

let buttonsDonate = divSettingsDonate.getElementsByClassName("action-button");

let settingsToggleTheme = document.getElementById("settings-toggle-theme");
let settingsToggleSounds = document.getElementById("settings-toggle-sounds");

let buttonSettingsLogout = document.getElementById("button-settings-logout");
let buttonSettingsLogoutEverywhere = document.getElementById("button-settings-logout-everywhere");
let buttonSettingsPassword = document.getElementById("button-settings-password");
let buttonSettingsDeleteAccount = document.getElementById("button-settings-delete-account");
let buttonSettingsUserRegistration = document.getElementById("button-settings-user-registration");
let buttonSettingsStockAPIKey = document.getElementById("button-settings-stock-api-key");
let buttonSettingsStockAPIType = document.getElementById("button-settings-stock-api-type");
let buttonSettingsQRCode = document.getElementById("button-settings-qr-code");
let buttonSettingsReset = document.getElementById("button-settings-reset");
let buttonSettingsResetBudget = document.getElementById("button-settings-reset-budget");
let buttonSettingsResetTransactions = document.getElementById("button-settings-reset-transactions");
let buttonSettingsResetWatchlist = document.getElementById("button-settings-reset-watchlist");
let buttonSettingsResetHoldings = document.getElementById("button-settings-reset-holdings");
let buttonSettingsResetActivities = document.getElementById("button-settings-reset-activities");
let buttonSettingsResetChatBot = document.getElementById("button-settings-reset-chatbot");
let buttonSettingsImportSettings = document.getElementById("button-settings-import-settings");
let buttonSettingsImportBudget = document.getElementById("button-settings-import-budget");
let buttonSettingsImportTransactions = document.getElementById("button-settings-import-transactions");
let buttonSettingsImportWatchlist = document.getElementById("button-settings-import-watchlist");
let buttonSettingsImportHoldings = document.getElementById("button-settings-import-holdings");
let buttonSettingsImportActivities = document.getElementById("button-settings-import-activities");
let buttonSettingsExportSettings = document.getElementById("button-settings-export-settings");
let buttonSettingsExportBudget = document.getElementById("button-settings-export-budget");
let buttonSettingsExportTransactions = document.getElementById("button-settings-export-transactions");
let buttonSettingsExportWatchlist = document.getElementById("button-settings-export-watchlist");
let buttonSettingsExportHoldings = document.getElementById("button-settings-export-holdings");
let buttonSettingsExportActivities = document.getElementById("button-settings-export-activities");
let buttonSettingsDataWatchlist = document.getElementById("button-settings-data-watchlist");
let buttonSettingsDataHolding = document.getElementById("button-settings-data-holding");
let buttonSettingsDataActivity = document.getElementById("button-settings-data-activity");