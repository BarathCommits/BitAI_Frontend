#!/bin/bash

# 🚀 SafeBrowser Wallet Installation Script
# This script opens installation pages for essential Web3 wallets

echo "🚀 SafeBrowser Wallet Installation Helper"
echo "=========================================="
echo ""

# Function to open URL in default browser
open_url() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        open "$1"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        xdg-open "$1"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        # Windows
        start "$1"
    else
        echo "Please manually open: $1"
    fi
}

echo "📱 Essential Ethereum/EVM Wallets:"
echo "1. MetaMask (Most Popular)"
echo "2. Coinbase Wallet (Major Exchange)"
echo "3. Rabby (Multi-chain DeFi)"
echo "4. Trust Wallet (Binance)"
echo "5. TokenPocket (Multi-chain)"
echo ""

echo "☀️ Essential Solana Wallets:"
echo "6. Phantom (Most Popular Solana)"
echo "7. Solflare (Your Requested Wallet!)"
echo "8. Backpack (Solana-native)"
echo "9. Glow (Mobile-first)"
echo ""

read -p "Enter wallet number to install (1-9) or 'all' for all: " choice

case $choice in
    1|"MetaMask")
        echo "Opening MetaMask installation..."
        open_url "https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn"
        ;;
    2|"Coinbase")
        echo "Opening Coinbase Wallet installation..."
        open_url "https://chrome.google.com/webstore/detail/coinbase-wallet-extension/hnfanknocfeofbddgcijnmhnfnkdnaad"
        ;;
    3|"Rabby")
        echo "Opening Rabby Wallet installation..."
        open_url "https://chrome.google.com/webstore/detail/rabby-wallet/acmacodkjbdgmoleebolmdjonilkdbch"
        ;;
    4|"Trust")
        echo "Opening Trust Wallet installation..."
        open_url "https://chrome.google.com/webstore/detail/trust-wallet/egjidjbpglichdcondbcbdnbeeppgdph"
        ;;
    5|"TokenPocket")
        echo "Opening TokenPocket installation..."
        open_url "https://chrome.google.com/webstore/detail/tokenpocket/mfgccjchihfkkindfppnaooecgfneiii"
        ;;
    6|"Phantom")
        echo "Opening Phantom installation..."
        open_url "https://chrome.google.com/webstore/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa"
        ;;
    7|"Solflare")
        echo "Opening Solflare installation (Your requested wallet!)..."
        open_url "https://chrome.google.com/webstore/detail/solflare-wallet/bhhhlbepdkbapadjdnnojkbgioiodbic"
        ;;
    8|"Backpack")
        echo "Opening Backpack installation..."
        open_url "https://chrome.google.com/webstore/detail/backpack/aflkmfhebedbjioipglgcbcmnbpgliof"
        ;;
    9|"Glow")
        echo "Opening Glow installation..."
        open_url "https://glow.app/"
        ;;
    "all")
        echo "Opening all wallet installation pages..."
        echo "Installing MetaMask..."
        open_url "https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn"
        sleep 2
        echo "Installing Coinbase Wallet..."
        open_url "https://chrome.google.com/webstore/detail/coinbase-wallet-extension/hnfanknocfeofbddgcijnmhnfnkdnaad"
        sleep 2
        echo "Installing Rabby Wallet..."
        open_url "https://chrome.google.com/webstore/detail/rabby-wallet/acmacodkjbdgmoleebolmdjonilkdbch"
        sleep 2
        echo "Installing Trust Wallet..."
        open_url "https://chrome.google.com/webstore/detail/trust-wallet/egjidjbpglichdcondbcbdnbeeppgdph"
        sleep 2
        echo "Installing TokenPocket..."
        open_url "https://chrome.google.com/webstore/detail/tokenpocket/mfgccjchihfkkindfppnaooecgfneiii"
        sleep 2
        echo "Installing Phantom..."
        open_url "https://chrome.google.com/webstore/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa"
        sleep 2
        echo "Installing Solflare (Your requested wallet!)..."
        open_url "https://chrome.google.com/webstore/detail/solflare-wallet/bhhhlbepdkbapadjdnnojkbgioiodbic"
        sleep 2
        echo "Installing Backpack..."
        open_url "https://chrome.google.com/webstore/detail/backpack/aflkmfhebedbjioipglgcbcmnbpgliof"
        sleep 2
        echo "Installing Glow..."
        open_url "https://glow.app/"
        ;;
    *)
        echo "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "✅ Installation page opened!"
echo ""
echo "📋 Next Steps:"
echo "1. Click 'Add to Chrome' on each wallet"
echo "2. Follow the setup wizard"
echo "3. Create a new wallet or import existing"
echo "4. Test in SafeBrowser at http://localhost:3001"
echo ""
echo "🔍 Test wallet detection:"
echo "Open wallet-detection-test.html in your browser"
echo ""
echo "🎉 Happy wallet testing!"
