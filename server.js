<!DOCTYPE html>
<html>
<head>
    <title>Battery Status</title>
    <script src="/socket.io/socket.io.js"></script>
    <style>
        body { font-family: 'Segoe UI', sans-serif; background: #000; margin: 0; }

        /* TOP CENTER FIXED ROW */
        .top-nav {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 60px;
            background: #111;
            display: flex;
            justify-content: center; /* Center the battery box */
            align-items: center;
            border-bottom: 1px solid #333;
            z-index: 9999;
        }

        .battery-wrapper {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        /* Battery Box Styling */
        .battery-box {
            padding: 5px 15px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 1.4rem;
            min-width: 60px;
            text-align: center;
            transition: all 0.4s ease;
        }

        /* ONLINE: Dark Green Text, Light Green Background */
        .online {
            background-color: #90ee90; /* Light Green */
            color: #006400;            /* Dark Green */
        }

        /* OFFLINE: Dark Red Text, Light Red Background */
        .offline {
            background-color: #ffcccb; /* Light Red */
            color: #8b0000;            /* Dark Red */
        }

        /* Charging Bolt - next to the box */
        #charging-bolt {
            font-size: 1.5rem;
            color: #f1c40f;
            display: none; /* Hidden unless charging data is sent */
        }

        .content { padding-top: 80px; color: #555; text-align: center; }
    </style>
</head>
<body>

    <div class="top-nav">
        <div class="battery-wrapper">
            <div id="bat-box" class="battery-box offline">
                <span id="bat-pct">--</span>%
            </div>
            <span id="charging-bolt">⚡</span>
        </div>
    </div>

    <div class="content">
        <p>Dashboard Monitoring Active</p>
    </div>

    <script>
        const socket = io();
        const batBox = document.getElementById('bat-box');
        const batPct = document.getElementById('bat-pct');
        const bolt = document.getElementById('charging-bolt');

        // Handle Connection Status (Colors Only)
        socket.on('device-status', (status) => {
            if (status.online) {
                batBox.classList.remove('offline');
                batBox.classList.add('online');
            } else {
                batBox.classList.remove('online');
                batBox.classList.add('offline');
                batPct.innerText = "--";
                bolt.style.display = "none";
            }
        });

        // Handle Battery Data
        socket.on('ui-battery', (data) => {
            // Check if data is a number (85) or an object ({percent: 85})
            const percentage = (typeof data === 'object') ? data.percent : data;
            const isCharging = (typeof data === 'object') ? data.charging : false;

            // Update UI
            batPct.innerText = percentage;
            
            // Show/Hide bolt next to the box
            bolt.style.display = isCharging ? "inline" : "none";

            // Ensure color is green when receiving data
            batBox.classList.remove('offline');
            batBox.classList.add('online');
        });
    </script>
</body>
</html>
