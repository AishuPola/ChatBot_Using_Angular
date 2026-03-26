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

    this.showCenter = false;

    this.messages.push({ text, type: 'user' });

    this.messages.push({
      text: 'Hey! 😊 What can I help you with today?',
      type: 'bot',
    });

    this.userInput = '';
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
}
