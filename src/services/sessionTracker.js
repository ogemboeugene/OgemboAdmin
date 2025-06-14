/**
 * Session Tracker Service
 * Handles device detection, location tracking, and session management
 */
class SessionTracker {
  constructor() {
    this.sessionInfo = null;
    this.deviceFingerprint = null;
  }

  // Get comprehensive device and browser information
  getDeviceInfo() {
    const userAgent = navigator.userAgent;
    
    // Extract browser info with version
    let browser = 'Unknown';
    let browserVersion = 'Unknown';
    
    if (userAgent.includes('Chrome')) {
      browser = 'Chrome';
      const match = userAgent.match(/Chrome\/([0-9.]+)/);
      browserVersion = match ? match[1] : 'Unknown';
    } else if (userAgent.includes('Firefox')) {
      browser = 'Firefox';
      const match = userAgent.match(/Firefox\/([0-9.]+)/);
      browserVersion = match ? match[1] : 'Unknown';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      browser = 'Safari';
      const match = userAgent.match(/Version\/([0-9.]+)/);
      browserVersion = match ? match[1] : 'Unknown';
    } else if (userAgent.includes('Edge')) {
      browser = 'Edge';
      const match = userAgent.match(/Edg\/([0-9.]+)/);
      browserVersion = match ? match[1] : 'Unknown';
    } else if (userAgent.includes('Opera')) {
      browser = 'Opera';
      const match = userAgent.match(/OPR\/([0-9.]+)/);
      browserVersion = match ? match[1] : 'Unknown';
    }

    // Extract OS info with version
    let os = 'Unknown';
    if (userAgent.includes('Windows NT 10.0')) os = 'Windows 10';
    else if (userAgent.includes('Windows NT 6.3')) os = 'Windows 8.1';
    else if (userAgent.includes('Windows NT 6.1')) os = 'Windows 7';
    else if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac OS X')) {
      const match = userAgent.match(/Mac OS X ([0-9_]+)/);
      if (match) {
        const version = match[1].replace(/_/g, '.');
        os = `macOS ${version}`;
      } else {
        os = 'macOS';
      }
    } else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) {
      const match = userAgent.match(/Android ([0-9.]+)/);
      os = match ? `Android ${match[1]}` : 'Android';
    } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
      const match = userAgent.match(/OS ([0-9_]+)/);
      if (match) {
        const version = match[1].replace(/_/g, '.');
        os = `iOS ${version}`;
      } else {
        os = 'iOS';
      }
    }

    // Determine device type and generate device name
    let deviceType = 'Desktop';
    let deviceName = '';
    
    if (/Mobile|Android|iPhone/.test(userAgent)) {
      deviceType = 'Mobile';
      if (userAgent.includes('iPhone')) {
        // Try to detect iPhone model
        if (userAgent.includes('iPhone15')) deviceName = 'iPhone 15';
        else if (userAgent.includes('iPhone14')) deviceName = 'iPhone 14';
        else if (userAgent.includes('iPhone13')) deviceName = 'iPhone 13';
        else deviceName = 'iPhone';
      } else if (userAgent.includes('Android')) {
        deviceName = 'Android Device';
      } else {
        deviceName = 'Mobile Device';
      }
    } else if (/iPad/.test(userAgent)) {
      deviceType = 'Tablet';
      deviceName = 'iPad';
    } else {
      deviceType = 'Desktop';
      if (os.includes('Windows')) {
        deviceName = 'Windows PC';
      } else if (os.includes('macOS')) {
        deviceName = "Brian's MacBook Pro"; // You can make this dynamic
      } else if (os.includes('Linux')) {
        deviceName = 'Linux PC';
      } else {
        deviceName = 'Desktop Computer';
      }
    }

    // Get additional info
    const screenResolution = `${screen.width}x${screen.height}`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return {
      browser,
      browserVersion,
      os,
      deviceType,
      deviceName,
      screenResolution,
      timezone,
      userAgent,
      language: navigator.language,
      platform: navigator.platform
    };
  }

  // Get location info (requires user permission or IP-based)
  async getLocationInfo() {
    try {
      // Try IP-based location first (more reliable)
      const ipInfo = await this.getIPLocation();
      
      if (ipInfo) {
        return {
          latitude: null,
          longitude: null,
          city: ipInfo.city || 'Unknown',
          country: ipInfo.country || 'Unknown',
          region: ipInfo.region || 'Unknown',
          ip: ipInfo.ip || 'Unknown',
          location: `${ipInfo.city || 'Unknown'}, ${ipInfo.country || 'Unknown'}`
        };
      }

      // Fallback to browser geolocation if IP fails
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 5000,
          enableHighAccuracy: false
        });
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        city: 'Unknown',
        country: 'Unknown',
        region: 'Unknown',
        ip: 'Unknown',
        location: 'Unknown'
      };
    } catch (error) {
      console.warn('Location detection failed:', error);
      
      return {
        latitude: null,
        longitude: null,
        city: 'Unknown',
        country: 'Unknown',
        region: 'Unknown',
        ip: 'Unknown',
        location: 'Unknown'
      };
    }
  }

  // Get IP-based location info
  async getIPLocation() {
    try {
      // Try multiple IP location services
      const services = [
        'https://ipapi.co/json/',
        'https://ip-api.com/json/',
        'https://ipinfo.io/json'
      ];

      for (const service of services) {
        try {
          const response = await fetch(service, {
            timeout: 3000
          });
          
          if (!response.ok) continue;
          
          const data = await response.json();
          
          // Normalize response based on service
          if (service.includes('ipapi.co')) {
            return {
              ip: data.ip,
              city: data.city,
              region: data.region,
              country: data.country_name,
              countryCode: data.country_code
            };
          } else if (service.includes('ip-api.com')) {
            return {
              ip: data.query,
              city: data.city,
              region: data.regionName,
              country: data.country,
              countryCode: data.countryCode
            };
          } else if (service.includes('ipinfo.io')) {
            return {
              ip: data.ip,
              city: data.city,
              region: data.region,
              country: data.country,
              countryCode: data.country
            };
          }
        } catch (serviceError) {
          console.warn(`IP service ${service} failed:`, serviceError);
          continue;
        }
      }
      
      return null;
    } catch (error) {
      console.warn('All IP location services failed:', error);
      return null;
    }
  }

  // Generate device fingerprint
  generateDeviceFingerprint() {
    const deviceInfo = this.getDeviceInfo();
    
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
      
      const fingerprintData = {
        userAgent: deviceInfo.userAgent,
        screen: deviceInfo.screenResolution,
        timezone: deviceInfo.timezone,
        language: deviceInfo.language,
        platform: deviceInfo.platform,
        canvas: canvas.toDataURL(),
        timestamp: Date.now()
      };
      
      // Create a simple hash of the fingerprint data
      const fingerprint = btoa(JSON.stringify(fingerprintData))
        .replace(/[^a-zA-Z0-9]/g, '')
        .substring(0, 32);

      return `fp_${fingerprint}`;
    } catch (error) {
      console.warn('Fingerprint generation failed:', error);
      return `fp_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }
  }

  // Create comprehensive session data
  async createSessionData() {
    const deviceInfo = this.getDeviceInfo();
    const locationInfo = await this.getLocationInfo();
    const fingerprint = this.generateDeviceFingerprint();

    // Calculate expiration (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    this.sessionInfo = {
      device_fingerprint: fingerprint,
      device_name: deviceInfo.deviceName,
      device_type: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      browser_version: deviceInfo.browserVersion,
      os: deviceInfo.os,
      ip_address: locationInfo.ip,
      location: locationInfo.location,
      city: locationInfo.city,
      country: locationInfo.country,
      region: locationInfo.region,
      timezone: deviceInfo.timezone,
      user_agent: deviceInfo.userAgent,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString(),
      last_activity: new Date().toISOString()
    };

    console.log('🔍 Created session data:', this.sessionInfo);
    return this.sessionInfo;
  }

  // Update last activity timestamp
  updateLastActivity() {
    if (this.sessionInfo) {
      this.sessionInfo.last_activity = new Date().toISOString();
    }
  }

  // Get current session info
  getSessionInfo() {
    return this.sessionInfo;
  }

  // Reset session info
  reset() {
    this.sessionInfo = null;
    this.deviceFingerprint = null;
  }
}

// Export singleton instance
const sessionTracker = new SessionTracker();
export default sessionTracker;
