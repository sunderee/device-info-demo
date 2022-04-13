class BrowserModel {
    constructor(os, osVersion, browserName, browserVersion) {
        this.os = os;
        this.osVersion = osVersion;
        this.browserName = browserName;
        this.browserVersion = browserVersion;
    }
}

class BatteryModel {
    constructor(percentage, isCharging) {
        this.percentage = percentage;
        this.isCharging = isCharging;
    }
}

class GeoIPModel {
    constructor(city, region, country, latitude, longitude, isp, ipAddress) {
        this.city = city;
        this.region = region;
        this.country = country;
        this.latitude = latitude;
        this.longitude = longitude;
        this.isp = isp;
        this.ipAddress = ipAddress;
    }
}

const getBrowserData = () => new BrowserModel(
    platform.os.family,
    platform.os.version,
    platform.name,
    platform.version
);

const getBatteryData = async () => {
    var battery = navigator.battery || navigator.webkitBattery || navigator.mozBattery;
    if (navigator.getBattery) {
        const battery = await navigator.getBattery();
        return new BatteryModel(battery.level, battery.charging);
    } else if (battery) {
        return new BatteryModel(battery.level, battery.charging);
    } else {
        return null;
    }
};

const geolocateIP = async () => {
    const rawResult = await makeAPIRequest("GET", "https://ipwhois.app/json/");
    const result = JSON.parse(rawResult);
    return new GeoIPModel(
        result.city,
        result.region,
        result.country,
        result.latitude,
        result.longitude,
        result.isp,
        result.ip
    );
};

function makeAPIRequest(method, url) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.response);
            } else {
                reject({
                    status: xhr.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: xhr.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    });
}

async function populateWebsiteData() {
    const browserData = getBrowserData();
    document.getElementById('os').innerHTML = `${browserData.os} ${browserData.osVersion}`;
    document.getElementById('browser').innerHTML = `${browserData.browserName} ${browserData.browserVersion}`;

    const batteryData = await getBatteryData();
    document.getElementById('battery-percentage').innerHTML = batteryData.percentage;
    document.getElementById('battery-charging').innerHTML = batteryData.isCharging ? 'Charging' : 'Not charging';

    const ipData = await geolocateIP();
    document.getElementById('ip-address').innerHTML = ipData.ipAddress;
    document.getElementById('ip-location').innerHTML = [ipData.city, ipData.region, ipData.country].filter((value) => value != null).join(', ');
    document.getElementById('ip-isp').innerHTML = ipData.isp;
}

populateWebsiteData();
