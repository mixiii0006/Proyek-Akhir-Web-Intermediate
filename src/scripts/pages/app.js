import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import { subscribeNotification } from "../data/api";

const VAPID_PUBLIC_KEY = "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._setupDrawer();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener("click", () => {
      this.#navigationDrawer.classList.toggle("open");
    });

    document.body.addEventListener("click", (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove("open");
      }

      this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove("open");
        }
      });
    });
  }

  async registerServiceWorkerAndSubscribe() {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service workers are not supported in this browser.');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered with scope:', registration.scope);

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission not granted.');
        return;
      }

      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log('Already subscribed to push notifications.');
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('User token not found, cannot subscribe to push notifications.');
        return;
      }

      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')),
        },
      };

      await subscribeNotification(token, subscriptionData);
      console.log('Subscribed to push notifications.');
    } catch (error) {
      console.error('Failed to register service worker or subscribe:', error);
    }
  }

  handleAddToHomeScreen() {
    let deferredPrompt;
    const addBtn = document.createElement('button');
    addBtn.textContent = 'Add to Homescreen';
    addBtn.style.position = 'fixed';
    addBtn.style.bottom = '20px';
    addBtn.style.right = '20px';
    addBtn.style.padding = '10px 20px';
    addBtn.style.backgroundColor = '#4CAF50';
    addBtn.style.color = 'white';
    addBtn.style.border = 'none';
    addBtn.style.borderRadius = '5px';
    addBtn.style.cursor = 'pointer';
    addBtn.style.zIndex = '1000';
    addBtn.style.display = 'none';

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      addBtn.style.display = 'block';
    });

    addBtn.addEventListener('click', async () => {
      addBtn.style.display = 'none';
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        } else {
          console.log('User dismissed the A2HS prompt');
        }
        deferredPrompt = null;
      }
    });

    document.body.appendChild(addBtn);
  }

  async renderPage() {
    const url = getActiveRoute();
    let page = routes[url];

    if (!page) {
      page = routes["*"];
    }

    if (document.startViewTransition) {
      document.startViewTransition(async () => {
        this.#content.innerHTML = await page.render();
        await page.afterRender();
        await this.registerServiceWorkerAndSubscribe();
        this.handleAddToHomeScreen();
      });
    } else if (this.#content.animate) {

      const fadeOut = this.#content.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 300,
        easing: "ease-in",
      });
      fadeOut.onfinish = async () => {
        this.#content.innerHTML = await page.render();
        await page.afterRender();
        this.#content.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 300,
          easing: "ease-out",
        });
        await this.registerServiceWorkerAndSubscribe();
        this.handleAddToHomeScreen();
      };
    } else {
      this.#content.innerHTML = await page.render();
      await page.afterRender();
      await this.registerServiceWorkerAndSubscribe();
      this.handleAddToHomeScreen();
    }
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  async renderPage() {
    const url = getActiveRoute();
    let page = routes[url];

    if (!page) {
      page = routes["*"];
    }

    if (document.startViewTransition) {
      document.startViewTransition(async () => {
        this.#content.innerHTML = await page.render();
        await page.afterRender();
        await this.registerServiceWorkerAndSubscribe();
        this.handleAddToHomeScreen();
      });
    } else if (this.#content.animate) {

      const fadeOut = this.#content.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 300,
        easing: "ease-in",
      });
      fadeOut.onfinish = async () => {
        this.#content.innerHTML = await page.render();
        await page.afterRender();
        this.#content.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 300,
          easing: "ease-out",
        });
        await this.registerServiceWorkerAndSubscribe();
        this.handleAddToHomeScreen();
      };
    } else {
      this.#content.innerHTML = await page.render();
      await page.afterRender();
      await this.registerServiceWorkerAndSubscribe();
      this.handleAddToHomeScreen();
    }
  }
}

export default App;
