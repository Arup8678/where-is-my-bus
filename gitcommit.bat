@echo off
git add .
git -c user.name=Alpharup -c user.email=cosxisinx369@gmail.com commit -m "Deploy latest native Next.js API routes"
git push origin main
