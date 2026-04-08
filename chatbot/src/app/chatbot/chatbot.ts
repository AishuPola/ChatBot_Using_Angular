import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HostListener } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Api } from '../shared/services/api';
import { ChangeDetectorRef } from '@angular/core';
import { NgZone } from '@angular/core';
@Component({
  selector: 'app-chatbot',
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Chatbot {
  public userInput: string = '';
  public showCenter: boolean = true;
  public isListening = false;
  public recognition: any;
  public silenceTimer: any;
  public finalTranscript = '';
  public showGreetingNote: boolean = false;

  searchScope: 'none' | 'my-docs' | 'shared-docs' = 'none';
  public isLoading: boolean = false;
  public showTooltip: boolean = false;
  private tooltipTimeout: any;

  messages: {
    text: string;
    type: 'user' | 'bot';
    copied?: boolean;
    playing?: boolean;
    paused?: boolean;
  }[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private api: Api,
    private zone: NgZone,
  ) {}

  ngOnInit() {
    // 1. Check if the user has already seen the note this session
    const hasSeenNote = sessionStorage.getItem('hasSeenGreetingNote');

    // 2. If they HAVEN'T seen it
    if (!hasSeenNote) {
      // Slight 500ms delay to let the UI draw first
      setTimeout(() => {
        this.showGreetingNote = true;
        sessionStorage.setItem('hasSeenGreetingNote', 'true');
        this.cdr.detectChanges();

        // 3. Hide the note after 10 seconds
        setTimeout(() => {
          this.showGreetingNote = false;
          this.cdr.detectChanges();
        }, 10000);
      }, 500);
    } else {
      console.log('The browser remembers you already saw the note! Skipping.');
    }
  }

  @ViewChild('chatContainer') chatContainer!: ElementRef;

  public scrollToBottom() {
    if (!this.chatContainer) return;
    const element = this.chatContainer.nativeElement;
    element.scrollTop = element.scrollHeight;
  }

  //tooltip for selecting the doc type, before giving the ui.
  public triggerTooltip() {
    if (this.searchScope === 'none') {
      this.showTooltip = true;
      this.cdr.detectChanges();

      // Auto-hide the tooltip after 3 seconds
      // clearTimeout(this.tooltipTimeout);
      // this.tooltipTimeout = setTimeout(() => {
      //   this.showTooltip = false;
      //   this.cdr.detectChanges();
      // }, 3000);
    }
  }

  // --- ADD THIS NEW FUNCTION ---
  public hideTooltip() {
    this.showTooltip = false;
    this.cdr.detectChanges();
  }

  public toggleScope(scope: 'my-docs' | 'shared-docs') {
    // Hide the tooltip immediately if scope is selected
    this.showTooltip = false;
    if (this.searchScope === scope) {
      this.searchScope = 'none';
      this.userInput = '';
    } else {
      this.searchScope = scope;
      // also clear when switching
      this.userInput = '';
    }
  }

  public async sendMessage() {
    const text = this.userInput.trim();
    if (!text || this.isLoading) return;

    this.showCenter = false;
    this.messages.push({ text, type: 'user' });
    this.userInput = '';

    setTimeout(() => {
      this.scrollToBottom();
    }, 0);

    // 1. Standard Chat Logic
    // if (this.searchScope === 'none') {
    //   this.messages.push({
    //     text: 'Hey! 😊 What can I help you with today?',
    //     type: 'bot',
    //   });
    //   setTimeout(() => this.scrollToBottom(), 0);
    //   return;
    // }

    if (this.searchScope === 'none') {
      return;
    }
    // ADDED THIS: Force the backend API to strictly reply in English
    const queryForApi = `${text}\n\n(IMPORTANT: Please reply entirely in English.)`;
    // 2. Shared Documents API Logic
    if (this.searchScope === 'shared-docs') {
      this.isLoading = true;
      try {
        // const data = await firstValueFrom(this.api.querySharedDocuments(text));
        const data = await firstValueFrom(this.api.querySharedDocuments(queryForApi));

        if (data && data.success && data.answer) {
          this.messages.push({ text: data.answer, type: 'bot' });
        } else {
          this.messages.push({
            text: "I couldn't find an answer in the shared documents.",
            type: 'bot',
          });
        }
      } catch (error) {
        console.error('API Error:', error);
        this.messages.push({
          text: 'Sorry, there was an error connecting to the document server.',
          type: 'bot',
        });
      } finally {
        this.isLoading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.scrollToBottom(), 0);
      }
    }

    // 3. My Documents API Logic
    if (this.searchScope === 'my-docs') {
      this.isLoading = true;
      try {
        const data = await firstValueFrom(this.api.queryMyDocuments(text));

        if (data && data.success && data.answer) {
          this.messages.push({ text: data.answer, type: 'bot' });
        } else {
          this.messages.push({ text: "I couldn't find an answer in your documents.", type: 'bot' });
        }
      } catch (error) {
        console.error('API Error:', error);
        this.messages.push({
          text: 'Sorry, there was an error connecting to the document server.',
          type: 'bot',
        });
      } finally {
        this.isLoading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.scrollToBottom(), 0);
      }
    }
  }

  // ADDED: Replaces \n with <br> and parses basic **bold** tags from the response
  formatBotResponse(text: string): string {
    if (!text) return '';
    let formattedText = text.replace(/\n/g, '<br>');
    // Parse the **bold** formatting specifically useful for document extraction
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return formattedText;
  }

  // speak(text: string) {
  //   const speech = new SpeechSynthesisUtterance(text);
  //   speech.lang = 'en-US';
  //   speech.rate = 1;
  //   window.speechSynthesis.cancel();
  //   window.speechSynthesis.speak(speech);
  // }

  // for stopping the audio
  // speak(msg: any) {
  //   // 1. If this specific message is already playing, STOP it.
  //   if (msg.playing) {
  //     window.speechSynthesis.cancel();
  //     msg.playing = false;
  //     return; // Exit the function so it doesn't start playing again
  //   }

  //   // 2. Stop any OTHER audio that might be currently playing
  //   window.speechSynthesis.cancel();

  //   // 3. Reset the 'playing' status for all messages in the chat
  //   this.messages.forEach((m) => (m.playing = false));

  //   // 4. Set THIS message to playing
  //   msg.playing = true;

  //   // 5. Create and configure the speech
  //   const speech = new SpeechSynthesisUtterance(msg.text);
  //   speech.lang = 'en-US';
  //   speech.rate = 1;

  //   // 6. When the audio naturally finishes, reset the icon
  //   speech.onend = () => {
  //     msg.playing = false;
  //     this.cdr.detectChanges(); // Update the UI
  //   };

  //   // 7. If the audio fails/errors out, reset the icon safely
  //   speech.onerror = () => {
  //     msg.playing = false;
  //     this.cdr.detectChanges(); // Update the UI
  //   };

  //   // 8. Start speaking
  //   window.speechSynthesis.speak(speech);
  // }

  speak(msg: any) {
    // 1. If this exact message is currently playing, PAUSE it.
    if (msg.playing) {
      window.speechSynthesis.pause();
      msg.playing = false;
      msg.paused = true; // Mark it as paused
      this.cdr.detectChanges();
      return;
    }

    // 2. If this exact message is currently paused, RESUME it.
    if (msg.paused) {
      window.speechSynthesis.resume();
      msg.paused = false;
      msg.playing = true; // Mark it as playing again
      this.cdr.detectChanges();
      return;
    }

    // 3. If it's a completely new message: Stop anything else playing
    window.speechSynthesis.cancel();

    // 4. Reset states for all messages in the chat
    this.messages.forEach((m) => {
      m.playing = false;
      m.paused = false;
    });

    // 5. Start fresh with THIS message
    msg.playing = true;
    msg.paused = false;

    const speech = new SpeechSynthesisUtterance(msg.text);
    speech.lang = 'en-US';
    speech.rate = 1;

    // 6. Reset icons automatically when finished
    speech.onend = () => {
      this.zone.run(() => {
        msg.playing = false;
        msg.paused = false;
        this.cdr.detectChanges();
      });
    };

    // 7. Reset icons if an error occurs
    speech.onerror = () => {
      this.zone.run(() => {
        msg.playing = false;
        msg.paused = false;
        this.cdr.detectChanges();
      });
    };

    // 8. Trigger the speech
    window.speechSynthesis.speak(speech);
  }
  copyText(msg: any) {
    msg.copied = true;
    navigator.clipboard.writeText(msg.text);
    setTimeout(() => {
      msg.copied = false;
      this.cdr.detectChanges();
    }, 2000);
  }

  startListening() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Use Chrome browser');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'en-US';
    this.recognition.continuous = true;
    this.recognition.interimResults = true;

    this.isListening = true;
    this.cdr.detectChanges();

    this.recognition.onresult = (event: any) => {
      this.zone.run(() => {
        let finalText = '';
        let interimText = '';
        let hasSpeech = false;

        for (let i = 0; i < event.results.length; i++) {
          const text = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += text + ' ';
            hasSpeech = true;
          } else {
            interimText += text;
            if (text.trim().length > 2) {
              hasSpeech = true;
            }
          }
        }

        this.userInput = finalText + interimText;
        this.cdr.detectChanges();

        if (hasSpeech) {
          clearTimeout(this.silenceTimer);
          this.silenceTimer = setTimeout(() => {
            this.stopListening();
          }, 3000);
        }
      });
    };

    this.recognition.onend = () => {
      this.zone.run(() => {
        this.isListening = false;
        this.cdr.detectChanges();
      });
    };

    this.recognition.onerror = () => {
      this.zone.run(() => {
        this.isListening = false;
        this.cdr.detectChanges();
      });
    };

    this.recognition.start();
  }

  toggleMic() {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.userInput = '';
      this.startListening();
    }
  }

  stopListening() {
    if (this.recognition) {
      this.recognition.stop();
    }
    clearTimeout(this.silenceTimer);
    this.isListening = false;
    this.cdr.detectChanges();
  }

  @HostListener('document:keydown.enter', ['$event'])
  handleGlobalEnter(event: Event) {
    const e = event as KeyboardEvent;
    if (!this.userInput || !this.userInput.trim || this.isLoading) return;
    e.preventDefault();

    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
    this.sendMessage();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.showCenter = false;
    this.messages.push({
      text: `Uploaded: ${file.name}`,
      type: 'user',
    });

    this.messages.push({
      text: 'File received successfully.',
      type: 'bot',
    });
  }

  startNewChat() {
    this.messages = [];
    this.showCenter = true;
    this.userInput = '';

    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
}
