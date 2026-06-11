# Voice AI & TTS Architecture

## 1. Overview

The Voice AI system transforms the platform from a visual-only interface into a **multimodal conversational experience**. Users can speak their transactions, hear AI analysis read aloud, and interact with the system through natural language voice commands. The Text-to-Speech (TTS) engine powered by Gemini's `gemini-3.1-flash-tts-preview` model produces high-fidelity spoken narration of financial analyses, journal entry explanations, and compliance reports.

---

## 2. Voice AI Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    VOICE AI PIPELINE                         │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  Voice Input  │───→│  ASR Engine  │───→│  NLP Parser  │  │
│  │  (Microphone) │    │  (Browser)   │    │  (Gemini)    │  │
│  └──────────────┘    └──────────────┘    └──────┬───────┘  │
│                                                  │          │
│                                          ┌───────┴───────┐  │
│                                          │  Intent       │  │
│                                          │  Classifier   │  │
│                                          └───────┬───────┘  │
│                                                  │          │
│                    ┌─────────────────────────────┤          │
│                    │                             │          │
│              ┌─────┴─────┐              ┌───────┴──────┐   │
│              │  Command   │              │  Transaction  │   │
│              │  Executor  │              │  Creator      │   │
│              └───────────┘              └───────┬───────┘   │
│                                                  │          │
│                                          ┌───────┴───────┐  │
│                                          │  AI Accountant │  │
│                                          │  Review        │  │
│                                          └───────┬───────┘  │
│                                                  │          │
│  ┌──────────────┐    ┌──────────────┐    ┌───────┴───────┐  │
│  │  Audio Output │←──│  TTS Engine  │←──│  Narrative    │  │
│  │  (Speakers)   │    │  (Gemini)    │    │  Generator    │  │
│  └──────────────┘    └──────────────┘    └───────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Speech-to-Text (STT / ASR)

### 3.1 Voice Input Methods

| Input Method | Trigger | Use Case |
|-------------|---------|----------|
| **Microphone button** | Click in `AIInputForm` or `TransactionDirectorModal` | Voice-based transaction entry |
| **AI Accountant tab** | Switch to AI tab in transaction modal | Natural language accounting commands |
| **Support chat** | Microphone icon in `SupportChat` | Voice-based support queries |
| **Command palette** | Voice shortcut activation | Voice navigation commands |

### 3.2 ASR Processing Pipeline

```
User Speaks
    │
    ├── 1. Audio Capture
    │   └── Browser MediaRecorder API → WebM/Opus audio stream
    │
    ├── 2. Audio Preprocessing
    │   ├── Noise reduction (Web Audio API)
    │   ├── Volume normalization
    │   └── Silence trimming
    │
    ├── 3. Speech Recognition
    │   ├── Option A: Web Speech API (browser-native)
    │   │   └── Real-time transcription with interim results
    │   └── Option B: Gemini Audio API
    │       └── Send audio to Gemini for transcription
    │
    ├── 4. Text Post-Processing
    │   ├── Number normalization ("five hundred" → "500")
    │   ├── Currency normalization ("dollars" → "USD")
    │   ├── Date normalization ("January fifteenth" → "01/15")
    │   └── Financial term recognition ("accounts receivable" → mapping)
    │
    └── 5. Intent Parsing
        └── Send processed text to Gemini for structured extraction
```

### 3.3 Voice Transaction Examples

| Voice Input | Parsed Intent | Generated Journal Entry |
|------------|--------------|------------------------|
| "Record a rent payment of $5,000 to Landlord Corp" | `CREATE_TRANSACTION` | Debit: Rent Expense $5,000 / Credit: Cash $5,000 |
| "We received $12,000 from Client X for the project" | `CREATE_RECEIPT` | Debit: Cash $12,000 / Credit: Revenue $12,000 |
| "Pay salaries for this month, total $45,000" | `RUN_PAYROLL` | Triggers payroll processing workflow |
| "Show me the cash flow forecast" | `VIEW_REPORT` | Navigates to CashFlowForecastWidget |
| "What's our accounts receivable aging?" | `VIEW_REPORT` | Opens AgingSummary component |

---

## 4. Text-to-Speech (TTS) Engine

### 4.1 Gemini TTS Integration (`services/gemini/audio.ts`)

```typescript
// TTS Service powered by Gemini 3.1 Flash TTS Preview
class AudioService {
  /**
   * Converts text to speech using Gemini's TTS model.
   * Returns Base64-encoded WAV audio data.
   */
  async speakText(text: string, options?: TTSOptions): Promise<string> {
    const zai = await ZAI.create();

    const response = await zai.chat.completions.create({
      model: 'gemini-3.1-flash-tts-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a professional financial narrator. Read the following text clearly and at a measured pace suitable for business review.'
        },
        {
          role: 'user',
          content: text
        }
      ],
      // TTS-specific parameters
    });

    // Extract Base64 audio data from response
    const audioBase64 = response.choices[0]?.message?.content;
    return audioBase64;
  }

  /**
   * Plays audio from Base64 data through browser speakers.
   */
  async playAudio(base64Audio: string): Promise<void> {
    // Convert Base64 to ArrayBuffer
    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Create audio context and play
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start(0);
  }
}

interface TTSOptions {
  language?: string;        // Target language
  speed?: number;           // Speech rate (0.5 - 2.0)
  voice?: string;           // Voice selection
  format?: 'wav' | 'mp3';  // Output format
}
```

### 4.2 TTS Integration Points

| Component | Trigger | Content Read Aloud |
|-----------|---------|-------------------|
| `AIReviewForm` | Volume icon button click | AI review explanation, entry details, risk assessment |
| `SectorAiAnalyst` | Play button in results panel | Industry analysis summary, risk highlights, recommendations |
| `AnomalyDetection` | Audio alert on detection | Anomaly description, affected transactions, recommended actions |
| `NotificationCenter` | Voice notification (configurable) | Alert title and description |
| `SupportChat` | Auto-read AI responses | Chat responses from AI support agent |

### 4.3 AI Review Form Voice Integration

The `AIReviewForm` component includes an interactive voice playback button:

```typescript
// Voice button in AIReviewForm
const VoicePlaybackButton: React.FC<{ text: string }> = ({ text }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);

  const handlePlay = async () => {
    setIsPlaying(true);
    try {
      // 1. Generate speech via Gemini TTS
      const base64Audio = await audioService.speakText(text);

      // 2. Play through Web Audio API
      await audioService.playAudio(base64Audio);
    } finally {
      setIsPlaying(false);
    }
  };

  return (
    <button
      onClick={handlePlay}
      className={cn(
        "p-2 rounded-lg transition-all",
        isPlaying ? "bg-blue-500/20 animate-pulse" : "bg-white/5 hover:bg-white/10"
      )}
      disabled={isPlaying}
      aria-label={isPlaying ? "Playing audio..." : "Read aloud"}
    >
      <Volume2 className={cn("w-4 h-4", isPlaying && "animate-pulse")} />
    </button>
  );
};
```

---

## 5. Voice Command Architecture

### 5.1 Command Recognition

Voice commands are parsed through the Gemini NLP engine and routed to the appropriate automation handler:

```typescript
interface VoiceCommand {
  intent: VoiceIntent;
  entities: Record<string, any>;
  confidence: number;
  rawTranscript: string;
}

enum VoiceIntent {
  CREATE_TRANSACTION = 'create_transaction',
  VIEW_REPORT = 'view_report',
  NAVIGATE = 'navigate',
  SEARCH = 'search',
  ANALYZE = 'analyze',
  APPROVE = 'approve',
  REJECT = 'reject',
  READ_ALOUD = 'read_aloud',
}
```

### 5.2 Voice Command Processing

```
Voice Command Detected
    │
    ├── Parse Intent & Entities (Gemini NLP)
    │   ├── "Create an invoice for $5,000 to Acme Corp"
    │   │   → intent: CREATE_TRANSACTION
    │   │   → entities: { type: 'invoice', amount: 5000, party: 'Acme Corp' }
    │   │
    │   └── "What's our revenue this quarter?"
    │       → intent: VIEW_REPORT
    │       → entities: { metric: 'revenue', period: 'quarter' }
    │
    ├── Route to Automation Handler
    │   ├── CREATE_TRANSACTION → TransactionDirector
    │   ├── VIEW_REPORT → ReportingEngine
    │   ├── NAVIGATE → NavigationService
    │   ├── SEARCH → SearchEngine
    │   ├── ANALYZE → GeminiAnalysisService
    │   ├── APPROVE/REJECT → WorkflowEngine
    │   └── READ_ALOUD → AudioService (TTS)
    │
    └── Execute & Respond
        ├── Visual: Update UI with results
        ├── Audio: TTS reads summary of action taken
        └── Haptic: (Mobile) Subtle vibration on completion
```

---

## 6. Audio Data Handling

### 6.1 Audio Storage & Processing

| Data Type | Storage | Retention | Encryption |
|-----------|---------|-----------|-----------|
| **Voice recordings (input)** | Memory only (not persisted) | Session-only | N/A |
| **ASR transcriptions** | Firestore (audit log) | 2 years | AES-256 (at rest) |
| **TTS generated audio** | Memory only (not persisted) | Playback-only | N/A |
| **AI narrations (text)** | Firestore (audit log) | 6 months | AES-256 (at rest) |

### 6.2 Privacy & Consent

- **Voice recordings are never stored** — processed in real-time and discarded
- **Transcriptions are logged** for audit purposes but marked as voice-originated
- **User consent required** before enabling voice features (first-use dialog)
- **Voice data is not shared** with third parties beyond the Gemini API call
- **Opt-out available** — all voice features are optional alternatives to text input

### 6.3 Audio Quality Requirements

| Parameter | Minimum | Recommended |
|-----------|---------|-------------|
| **Sample Rate** | 16 kHz | 44.1 kHz |
| **Bit Depth** | 16-bit | 24-bit |
| **Channels** | Mono | Mono |
| **Format** | WebM/Opus | WAV/PCM |
| **Max Duration** | 60 seconds | 30 seconds |
| **Noise Level** | < -40 dB | < -50 dB |

---

## 7. Voice UI Design Patterns

### 7.1 Visual Feedback for Voice States

| State | Visual Indicator | Description |
|-------|-----------------|-------------|
| **Idle** | Microphone icon (default) | Ready to accept voice input |
| **Listening** | Pulsing red circle + waveform | Actively capturing audio |
| **Processing** | Spinning indicator | ASR/NLP processing in progress |
| **Success** | Green checkmark + transcript | Command recognized and routed |
| **Error** | Red X + error message | Recognition failed, try again |
| **Playing (TTS)** | Pulsing blue volume icon | Audio playback in progress |

### 7.2 Ambient Voice Feedback

The platform provides **ambient audio notifications** for critical events (configurable):

| Event | Audio Feedback | Default |
|-------|---------------|---------|
| New transaction auto-posted | Soft chime | Off |
| Anomaly detected | Alert tone + TTS summary | On |
| Approval required | Notification sound | On |
| AI analysis complete | Subtle ding | Off |
| Support chat response | Message tone | On |

### 7.3 Accessibility Considerations

- **All voice features have text alternatives** — no voice-only workflows
- **Deaf/hard-of-hearing users** see full transcripts of all audio content
- **Visual captions** available for TTS output (synchronized text display)
- **Keyboard shortcuts** for all voice commands (Ctrl+Shift+M for microphone)
- **Adjustable speech rate** for TTS playback (0.5x to 2.0x)
