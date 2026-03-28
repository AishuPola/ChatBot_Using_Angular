import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HostListener } from '@angular/core';

import { ChangeDetectorRef } from '@angular/core';
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
  silenceTimer: any;
  finalTranscript = '';

  messages: { text: string; type: 'user' | 'bot'; copied?: boolean }[] = [];
  @ViewChild('chatContainer') chatContainer!: ElementRef; // showing latest messages instead of seeing at after scrolling.
  //@ view child--is used for
  //It connects your HTML → TypeScript
  //It gives you a reference to a specific DOM element, instead of using -->document.querySelector('.messages'), directly we can use this.chatContainer

  // native element:
  // Converts Angular reference → real DOM element
  // so that we can use :scrollTop
  // scrollHeight;
  //scrollTo();
  scrollToBottom() {
    const element = this.chatContainer.nativeElement;
    //element.scrollTop-->Current scroll position from top
    // element.scrollHeight-->👉 Total height of ALL content inside the container, includes hidden (overflow) content
    element.scrollTop = element.scrollHeight; // “Move scroll position to FULL content height”
  }
  //@ViewChild → find the element
  //nativeElement → control the element
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

    setTimeout(() => {
      this.scrollToBottom();
    }, 0);
  }

  //covert text to speak
  speak(text: string) {
    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = 'en-US';
    speech.rate = 1;

    window.speechSynthesis.cancel(); // stop previous
    window.speechSynthesis.speak(speech);
  }
  //copy the bot text:
  copyText(msg: any) {
    // ✅ 1. update UI instantly
    msg.copied = true;

    // ✅ 2. copy in background (no delay for UI)
    navigator.clipboard.writeText(msg.text);

    // ✅ 3. reset after 1.5 sec
    setTimeout(() => {
      msg.copied = false;
      this.cdr.detectChanges();
    }, 2000);
  }
  constructor(private cdr: ChangeDetectorRef) {}

  startListening() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Use Chrome browser');
      return;
    }

    this.recognition = new SpeechRecognition();

    this.recognition.lang = 'en-IN';
    this.recognition.continuous = true;
    this.recognition.interimResults = true;

    this.isListening = true;
    this.cdr.detectChanges(); //  important

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
            hasSpeech = true; // ignore noise
          }
        }
      }

      // 🔥 LIVE update
      this.userInput = finalText + interimText;

      this.cdr.detectChanges(); // 🔥 CRITICAL

      if (hasSpeech) {
        clearTimeout(this.silenceTimer);

        this.silenceTimer = setTimeout(() => {
          this.stopListening();
        }, 3000); // ⏱ increase time
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
      this.userInput = ''; // reset
      this.startListening();
    }
  }

  stopListening() {
    if (this.recognition) {
      this.recognition.stop();
    }
    clearTimeout(this.silenceTimer); // 🔥 important
    // important
    this.isListening = false;
    this.cdr.detectChanges();
  }
  @HostListener('document:keydown.enter', ['$event'])
  handleGlobalEnter(event: Event) {
    const e = event as KeyboardEvent; // fix error

    //  do nothing if empty
    if (!this.userInput || !this.userInput.trim()) return;

    e.preventDefault();

    //  stop mic if active
    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }

    //  send message
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
    // clear messages
    this.messages = [];

    // show center screen again
    this.showCenter = true;

    //  clear input
    this.userInput = '';

    //  stop mic if running
    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
}
