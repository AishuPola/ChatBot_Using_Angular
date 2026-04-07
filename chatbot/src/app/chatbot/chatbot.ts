import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HostListener } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Api } from '../shared/services/api';
import { ChangeDetectorRef } from '@angular/core';

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

  searchScope: 'none' | 'my-docs' | 'shared-docs' = 'none';
  public isLoading: boolean = false;

  messages: { text: string; type: 'user' | 'bot'; copied?: boolean }[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private api: Api,
  ) {}

  @ViewChild('chatContainer') chatContainer!: ElementRef;

  public scrollToBottom() {
    if (!this.chatContainer) return;
    const element = this.chatContainer.nativeElement;
    element.scrollTop = element.scrollHeight;
  }

  public toggleScope(scope: 'my-docs' | 'shared-docs') {
    if (this.searchScope === scope) {
      this.searchScope = 'none';
    } else {
      this.searchScope = scope;
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
    if (this.searchScope === 'none') {
      this.messages.push({
        text: 'Hey! 😊 What can I help you with today?',
        type: 'bot',
      });
      setTimeout(() => this.scrollToBottom(), 0);
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

  speak(text: string) {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = 'en-US';
    speech.rate = 1;
    window.speechSynthesis.cancel();
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
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.cdr.detectChanges();
    };

    this.recognition.onerror = () => {
      this.isListening = false;
      this.cdr.detectChanges();
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
