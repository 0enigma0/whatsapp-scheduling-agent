```mermaid
graph TD
    A[👤 User Input] --> B["Agent Core (Loop & Memory)"]
    B -->|Goal + History + Tools| C[🧠 LLM Planner]
    C -->|Decision: Use Tool X with arguments| B
    B -->|Executes Tool| D[🛠️ Toolbelt]
    
    subgraph "🛠️ Toolbelt (Your Functions)"
        D1[addEventToCalendar]
        D2[askClarifyingQuestion]
        D3[searchUserPreferences]
        D4[... more tools]
    end
    
    D -->|Tool X| D1
    D1 -->|Observation: Event created| B
    B -->|Is goal complete?| B
    B -->|No, more steps needed| C
    B -->|Yes, goal complete!| E[✅ Final Response to User]