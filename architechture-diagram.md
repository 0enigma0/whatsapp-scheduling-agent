# My Diagram Test

This is a test to see if Mermaid is working.

```mermaid
graph TD

    subgraph "User Interaction"
        A[👤 User on WhatsApp] -->|Sends message: Dentist appt tomorrow 2pm| B{Twilio API}
    end

    subgraph "Your Backend Service (Hosted on Render)"
        B -->|POST Webhook| C[Express.js Server]
        C -->|Extracts message & sender| D[Event Parsing Logic]
        D -->|1. Crafts detailed prompt| E[🧠 Google Gemini API]
        E -->|2. Returns structured JSON| D
        D -->|3. Validates JSON| F{Event Handler}
        F -- Event Data (title, datetime, recurrence) --> G[📅 Google Calendar Module]
        G -->|Creates Event via API| H{Google Calendar API}
        H -- Confirms Event Creation --> G
        G -- Success --> F
        F -- Event Data & Sender Info --> I[⏰ Reminder Scheduler]
        I -- Schedules Job (e.g., node-cron) --> J[In-Memory Cron Job]
    end

    subgraph "External Services"
        H --> K[🗓️ User's Google Calendar]
    end

    subgraph "User Notification (Later)"
        J -->|Triggers at scheduled time| L[Twilio API]
        L -->|Sends reminder message| A
    end

    style A fill:#25D366,stroke:#fff,stroke-width:2px
    style B fill:#F22F46,stroke:#fff,stroke-width:2px
    style C fill:#444,stroke:#fff,stroke-width:2px
    style D fill:#673ab7,stroke:#fff,stroke-width:2px
    style E fill:#4285F4,stroke:#fff,stroke-width:2px
    style F fill:#673ab7,stroke:#fff,stroke-width:2px
    style G fill:#0F9D58,stroke:#fff,stroke-width:2px
    style H fill:#0F9D58,stroke:#fff,stroke-width:2px
    style K fill:#34A853,stroke:#fff,stroke-width:2px
    style I fill:#f0ad4e,stroke:#fff,stroke-width:2px
    style J fill:#f0ad4e,stroke:#fff,stroke-width:2px
    style L fill:#F22F46,stroke:#fff,stroke-width:2px
