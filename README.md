Backend Communication Patterns: Food Delivery
This repository contains a study on various backend communication patterns applied to a food delivery application. The project examines various communication methods to strike a balance between performance, scalability, and user experience across multiple features. The full report with detailed analysis for each feature is included in this repository.

Communication Patterns Summary
The following table summarizes the chosen communication patterns for each core feature of the application:

Feature	Communication Pattern
Customer Account Management	Sync Request-Response
Order Tracking	Short Polling
Driver Location Updates	Server-Sent Events (SSE)
Restaurant Order Notifications	Pub/Sub + SSE
Customer Support Chat	WebSocket
System-Wide Announcements	Pub/Sub + SSE
Menu Item Image Upload	Long Polling

التصدير إلى "جداول بيانات Google"
Running the Demo (Feature 6: System-Wide Announcements)
To see the Pub/Sub and SSE pattern in action, you can go ahead and run the demo for system-wide announcements.

Install Dependencies:
Make sure you have Node.js installed. Open your terminal in the project directory and run:

Bash

npm install express cors
Start the Servers:
You need to run two separate servers. Open two terminal windows.

In Terminal 1 (Dashboard Server):

Bash

node server-dashboard.js
In Terminal 2 (Announcements Server):

Bash

node server-announcements.js
Access the Application:
Open your web browser and navigate to http://localhost:5500. You can now send an announcement from the page and see it appear in real-time.
