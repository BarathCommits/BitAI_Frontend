#!/bin/bash

# Git commit and push script for Footer and Header updates

echo "🔍 Checking git status..."
git status

echo ""
echo "📦 Adding all changes..."
git add .

echo ""
echo "💾 Committing changes..."
git commit -m "Update footer and header: rebrand to bitAI, add X link, improve spacing

- Change header brand from bitPorta to bitAI
- Update footer with bitPorta company name and bitAI product
- Add X (Twitter) link: https://x.com/BitPorta
- Update email to bitporta10@gmail.com
- Remove GitHub and Discord links
- Change Browser section to Product section
- Apply blue-purple gradient to logo and company name
- Improve footer spacing and alignment with header
- Enable footer visibility in Layout component
- Use X icon instead of Twitter icon
- Optimize responsive layout and spacing
- Add baseline-browser-mapping dependency"

echo ""
echo "🚀 Pushing to remote..."
git push

echo ""
echo "✅ Done!"

