import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HostListener } from '@angular/core';
@Component({
  selector: 'app-chatbot',
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Chatbot {
  userInput: string = '';
  showCenter: boolean = true;
  isListening = false;
  recognition: any;

  messages: { text: string; type: 'user' | 'bot' }[] = [];

  ngOnInit() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();

      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        let transcript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }

        this.userInput = transcript; //  live text in input
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };
    }
  }

  toggleMic() {
    if (!this.isListening) {
      this.userInput = ''; //  clears old text
    }
    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    } else {
      this.recognition.start();
      this.isListening = true;
    }
  }

  sendMessage() {
    const text = this.userInput.trim();
    if (!text) return;

    this.showCenter = false;

    this.messages.push({ text, type: 'user' });

    this.messages.push({
      text: 'Hey! 😊 What can I help you with today?',
      type: 'bot',
    });

    this.userInput = '';
  }

  @HostListener('document:keydown.enter', ['$event'])
  handleGlobalEnter(event: Event) {
    const e = event as KeyboardEvent; // ✅ fix error

    //  do nothing if empty
    if (!this.userInput || !this.userInput.trim()) return;

    e.preventDefault();

    //  stop mic if active
    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }

    // ✅ send message
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
    // 🧹 clear messages
    this.messages = [];

    // 🔄 show center screen again
    this.showCenter = true;

    // 🧼 clear input
    this.userInput = '';

    // 🎤 stop mic if running
    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
}
