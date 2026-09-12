# 🚀 Deployment Guide — WHERE IS MY BUS

This guide walks you through deploying **WHERE IS MY BUS** live to the internet using **Vercel** for the Next.js Frontend and **Render** (or **Railway**) for the Express Backend. Both platforms offer generous free tiers.

---

## 📋 Overview

| Service | Hosting Platform | Cost | Setup Time |
|---|---|---|---|
| **Frontend** (Next.js 15) | [Vercel](https://vercel.com) | Free | ~2 minutes |
| **Backend API** (Express + Prisma) | [Render](https://render.com) or [Railway](https://railway.app) | Free | ~3 minutes |

---

## Part 1: Deploying the Backend (Express API)

### Option A: Deploy on Render.com (Recommended & Free)

1. **Push your code to GitHub**:
   - Create a GitHub repository (e.g. `where-is-my-bus`).
   - Push your project to GitHub:
     ```bash
     git init
     git add .
     git commit -m "Initial commit for deployment"
     git remote add origin https://github.com/YOUR_USERNAME/where-is-my-bus.git
     git push -u origin main
     ```

2. **Create a Web Service on Render**:
   - Go to [dashboard.render.com](https://dashboard.render.com/) and click **New +** → **Web Service**.
   - Connect your GitHub repository.
   - Set Root Directory to `backend`.
   - **Build Command**: `npm install && npm run build && npm run db:seed`
   - **Start Command**: `npm run start`

3. **Set Environment Variables on Render**:
   Add the following variables in Render dashboard under **Environment**:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `JWT_SECRET`: `your_secure_random_jwt_secret_key_here`
   - `CORS_ORIGIN`: `*` (or your Vercel URL once generated)

4. **Deploy**:
   - Click **Create Web Service**.
   - Render will build your backend, seed all 196 bus trips into SQLite, and assign you a public URL (e.g. `https://whereismybus-backend.onrender.com`).
   - Copy this URL.

---

## Part 2: Deploying the Frontend (Next.js on Vercel)

1. **Sign in to Vercel**:
   - Go to [vercel.com](https://vercel.com) and log in with your GitHub account.

2. **Import Project**:
   - Click **Add New...** → **Project**.
   - Select your `where-is-my-bus` GitHub repository.

3. **Configure Project Settings**:
   - **Root Directory**: Click Edit and select `frontend`.
   - **Framework Preset**: Next.js (automatically detected).

4. **Set Environment Variables**:
   Under **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL`: Your Render backend URL (e.g. `https://whereismybus-backend.onrender.com`).

5. **Deploy**:
   - Click **Deploy**.
   - Vercel will build the frontend and provide you with a production domain (e.g. `https://whereismybus.vercel.app`).

---

## 🛠️ Verification Checklist After Deployment

- [ ] Open your live Vercel URL in your browser.
- [ ] Test searching buses (e.g. **Silda → Bankura** or **Raipur → Howrah**).
- [ ] Test live tracking map and 3D ARUP bus animation.
- [ ] Test submitting a message in the **Community Contribution** section.
- [ ] Log into the Admin Panel at `/admin/login` (Email: `admin@whereismybus.in` / Password: `Admin@123`) to view live contributions in the admin inbox.
