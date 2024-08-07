import sys
from PyQt5.QtWidgets import QApplication, QMainWindow, QToolBar, QAction
from PyQt5.QtWebEngineWidgets import QWebEngineView
from PyQt5.QtCore import QUrl

class WebBrowser(QMainWindow):
    def __init__(self):
        super().__init__()

        self.setWindowTitle("Not AI")
        self.setGeometry(100, 100, 1280, 720)

        self.webview = QWebEngineView()
        self.setCentralWidget(self.webview)

        # Loads NOT AI by default
        self.webview.load(QUrl("http://127.0.0.1:5000/"))

if __name__ == "__main__":
    app = QApplication(sys.argv)
    browser = WebBrowser()
    browser.show()
    sys.exit(app.exec_())
