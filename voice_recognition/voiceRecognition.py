import tkinter as tk
from tkinter import scrolledtext
import speech_recognition as sr
import threading

class SpeechToTextApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Speech-to-Text")
        
        # Initialize recognizer
        self.recognizer = sr.Recognizer()
        self.is_listening = False
        self.thread = None
        
        # GUI Elements
        self.create_widgets()
        
    def create_widgets(self):
        # Text area to display recognized text
        self.text_area = scrolledtext.ScrolledText(self.root, wrap=tk.WORD, height=15, width=50)
        self.text_area.pack(padx=10, pady=10)
        
        # Start/Stop button
        self.start_button = tk.Button(self.root, text="Start Listening", command=self.toggle_listening)
        self.start_button.pack(padx=10, pady=10)
    
    def toggle_listening(self):
        if self.is_listening:
            self.stop_listening()
        else:
            self.start_listening()
    
    def start_listening(self):
        self.is_listening = True
        self.start_button.config(text="Stop Listening")
        self.thread = threading.Thread(target=self.listen)
        self.thread.start()
    
    def stop_listening(self):
        self.is_listening = False
        self.start_button.config(text="Start Listening")
    
    def listen(self):
        with sr.Microphone() as source:
            self.recognizer.adjust_for_ambient_noise(source)
            print("Listening started")
            while self.is_listening:
                try:
                    # Listen for audio indefinitely
                    audio = self.recognizer.listen(source)
                    text = self.recognizer.recognize_google(audio)
                    words = text.split()  # Split recognized text into words
                    for word in words:
                        self.root.after(0, self.update_text_area, word)  # Update GUI with each word
                except sr.UnknownValueError:
                    # Handle unknown value errors
                    self.root.after(0, self.update_text_area, "[Unrecognized speech]")
                except sr.RequestError as e:
                    # Handle request errors
                    self.root.after(0, self.update_text_area, f"[Request Error: {e}]")
                except Exception as e:
                    # Handle other possible exceptions
                    print(f"An unexpected error occurred: {e}")

    def update_text_area(self, text):
        self.text_area.insert(tk.END, text + " ")
        self.text_area.yview(tk.END)

def main():
    root = tk.Tk()
    app = SpeechToTextApp(root)
    root.mainloop()

if __name__ == "__main__":
    main()
