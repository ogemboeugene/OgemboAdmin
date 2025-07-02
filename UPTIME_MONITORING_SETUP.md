# UptimeRobot Configuration for Brain Ogembo Admin

## Setup Instructions

### 1. Create UptimeRobot Account
- Go to: https://uptimerobot.com
- Sign up for free account
- Verify your email

### 2. Add Multiple Monitors

#### Monitor 1: Main Website
- **Monitor Type:** HTTP(s)
- **Friendly Name:** Brain Ogembo Admin - Main
- **URL:** https://brainogembo.codes
- **Monitoring Interval:** 5 minutes
- **Alert Contacts:** Your email

#### Monitor 2: Health Check
- **Monitor Type:** HTTP(s)
- **Friendly Name:** Brain Ogembo Admin - Health
- **URL:** https://brainogembo.codes/health.html
- **Monitoring Interval:** 10 minutes
- **Alert Contacts:** Your email

#### Monitor 3: Keep-Alive Endpoint
- **Monitor Type:** HTTP(s)
- **Friendly Name:** Brain Ogembo Admin - Keep Alive
- **URL:** https://brainogembo.codes/keep-alive.html
- **Monitoring Interval:** 30 minutes
- **Alert Contacts:** Your email

### 3. Alert Settings
- **Email Notifications:** Enabled
- **Down Alert:** Immediately
- **Up Alert:** Immediately
- **SSL Certificate Expiry:** 30 days before

### 4. Benefits
- ✅ Monitors your site 24/7
- ✅ Sends requests every 5-30 minutes
- ✅ Keeps your server active
- ✅ Alerts you if site goes down
- ✅ Free for up to 50 monitors
- ✅ Prevents server from sleeping

## Alternative Services
- **Pingdom** (limited free tier)
- **StatusCake** (free tier available)
- **Freshping** (free tier)

## GitHub Actions Backup
The GitHub Actions workflow in `.github/workflows/keep-alive.yml` provides additional redundancy.
