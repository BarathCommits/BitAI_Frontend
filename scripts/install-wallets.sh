#!/bin/bash

# 🚀 BitAI Wallet Installation Script
# This script opens installation pages for essential Web3 wallets
#
# Usage:
#   ./scripts/install-wallets.sh
#   WALLET_CHOICE=1 ./scripts/install-wallets.sh
#
# Environment Variables:
#   WALLET_CHOICE: Wallet number (1-9) or 'all' (default: prompts user)
#   NON_INTERACTIVE: Set to 1 to skip interactive prompts

set -euo pipefail  # Exit on error, undefined vars, and pipe failures

echo "🚀 BitAI Wallet Installation Helper"
echo "=========================================="
echo ""

# Function to open URL in default browser with error handling
open_url() {
    local url=$1
    local opened=false
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v open &> /dev/null; then
            if open "$url" 2>/dev/null; then
                opened=true
            fi
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v xdg-open &> /dev/null; then
            if xdg-open "$url" 2>/dev/null; then
                opened=true
            fi
        fi
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        # Windows
        if command -v start &> /dev/null; then
            if start "$url" 2>/dev/null; then
                opened=true
            fi
        fi
    fi
    
    if [ "$opened" = false ]; then
        echo "⚠️  Could not open browser automatically. Please manually open: $url"
        return 1
    fi
    
    return 0
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

# Get user choice
if [ "${NON_INTERACTIVE:-0}" = "1" ]; then
    choice="${WALLET_CHOICE:-}"
    if [ -z "$choice" ]; then
        echo "Error: WALLET_CHOICE must be set in non-interactive mode"
        exit 1
    fi
else
read -p "Enter wallet number to install (1-9) or 'all' for all: " choice
fi

case $choice in
    1|"1"|"MetaMask"|"metamask")
        echo "Opening MetaMask installation..."
        if ! open_url "https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn"; then
            exit 1
        fi
        ;;
    2|"2"|"Coinbase"|"coinbase")
        echo "Opening Coinbase Wallet installation..."
        if ! open_url "https://chrome.google.com/webstore/detail/coinbase-wallet-extension/hnfanknocfeofbddgcijnmhnfnkdnaad"; then
            exit 1
        fi
        ;;
    3|"3"|"Rabby"|"rabby")
        echo "Opening Rabby Wallet installation..."
        if ! open_url "https://chrome.google.com/webstore/detail/rabby-wallet/acmacodkjbdgmoleebolmdjonilkdbch"; then
            exit 1
        fi
        ;;
    4|"4"|"Trust"|"trust")
        echo "Opening Trust Wallet installation..."
        if ! open_url "https://chrome.google.com/webstore/detail/trust-wallet/egjidjbpglichdcondbcbdnbeeppgdph"; then
            exit 1
        fi
        ;;
    5|"5"|"TokenPocket"|"tokenpocket")
        echo "Opening TokenPocket installation..."
        if ! open_url "https://chrome.google.com/webstore/detail/tokenpocket/mfgccjchihfkkindfppnaooecgfneiii"; then
            exit 1
        fi
        ;;
    6|"6"|"Phantom"|"phantom")
        echo "Opening Phantom installation..."
        if ! open_url "https://chrome.google.com/webstore/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa"; then
            exit 1
        fi
        ;;
    7|"7"|"Solflare"|"solflare")
        echo "Opening Solflare installation (Your requested wallet!)..."
        if ! open_url "https://chrome.google.com/webstore/detail/solflare-wallet/bhhhlbepdkbapadjdnnojkbgioiodbic"; then
            exit 1
        fi
        ;;
    8|"8"|"Backpack"|"backpack")
        echo "Opening Backpack installation..."
        if ! open_url "https://chrome.google.com/webstore/detail/backpack/aflkmfhebedbjioipglgcbcmnbpgliof"; then
            exit 1
        fi
        ;;
    9|"9"|"Glow"|"glow")
        echo "Opening Glow installation..."
        if ! open_url "https://glow.app/"; then
            exit 1
        fi
        ;;
    "all"|"All"|"ALL")
        echo "Opening all wallet installation pages..."
        echo "Installing MetaMask..."
        open_url "https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn" || true
        sleep 2
        echo "Installing Coinbase Wallet..."
        open_url "https://chrome.google.com/webstore/detail/coinbase-wallet-extension/hnfanknocfeofbddgcijnmhnfnkdnaad" || true
        sleep 2
        echo "Installing Rabby Wallet..."
        open_url "https://chrome.google.com/webstore/detail/rabby-wallet/acmacodkjbdgmoleebolmdjonilkdbch" || true
        sleep 2
        echo "Installing Trust Wallet..."
        open_url "https://chrome.google.com/webstore/detail/trust-wallet/egjidjbpglichdcondbcbdnbeeppgdph" || true
        sleep 2
        echo "Installing TokenPocket..."
        open_url "https://chrome.google.com/webstore/detail/tokenpocket/mfgccjchihfkkindfppnaooecgfneiii" || true
        sleep 2
        echo "Installing Phantom..."
        open_url "https://chrome.google.com/webstore/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa" || true
        sleep 2
        echo "Installing Solflare (Your requested wallet!)..."
        open_url "https://chrome.google.com/webstore/detail/solflare-wallet/bhhhlbepdkbapadjdnnojkbgioiodbic" || true
        sleep 2
        echo "Installing Backpack..."
        open_url "https://chrome.google.com/webstore/detail/backpack/aflkmfhebedbjioipglgcbcmnbpgliof" || true
        sleep 2
        echo "Installing Glow..."
        open_url "https://glow.app/" || true
        ;;
    *)
        echo "❌ Invalid choice: '$choice'. Please run the script again with a valid option (1-9 or 'all')."
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
echo "4. Test in BitAI at http://localhost:3001"
echo ""
echo "🎉 Happy wallet testing!"
