import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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

  messages: { text: string; type: 'user' | 'bot' }[] = [];

  sendMessage() {
    const text = this.userInput.trim();
    if (!text) return;

    // hide center screen
    this.showCenter = false;

    // user message
    this.messages.push({
      text: text,
      type: 'user',
    });

    // static bot reply
    this.messages.push({
      text: 'Hello! This is a static reply.',
      type: 'bot',
    });

    this.userInput = '';
  }
}
