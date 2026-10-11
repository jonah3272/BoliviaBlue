import { languageForLocation } from './pageLocale.js';

// Keep the crawlable, readable homepage in place while its route chunk downloads.
// Passing the resolved component to App avoids React.lazy's first-render suspend,
// even when the module was already imported. Other entry routes stay lazy.
export async function startInitialApp({ rootElement, location, loadHome, mount, retry, timeoutMs = 15000 }) {
  if (location.pathname !== '/') {
    mount();
    return;
  }

  rootElement.setAttribute('data-loading-state', 'true');
  rootElement.setAttribute('data-adsense-block', 'initial-home');
  const showRecovery = () => {
    if (rootElement.querySelector('[data-home-startup-notice]')) return;
    const english = languageForLocation(location) === 'en';
    const notice = rootElement.ownerDocument.createElement('div');
    notice.setAttribute('data-home-startup-notice', '');
    notice.setAttribute('role', 'status');
    notice.className = 'mx-auto max-w-3xl p-4 text-center text-sm text-gray-900 bg-amber-50';
    const message = rootElement.ownerDocument.createElement('p');
    message.textContent = english
      ? 'The interactive page has not loaded. The information below is the initial snapshot and is not updating.'
      : 'La página interactiva no se ha cargado. La información de abajo es la lectura inicial y no se está actualizando.';
    const button = rootElement.ownerDocument.createElement('button');
    button.type = 'button';
    button.className = 'mt-2 min-h-11 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white';
    button.textContent = english ? 'Reload page' : 'Recargar página';
    // Reload also retrieves the latest asset manifest after a deployment.
    button.addEventListener('click', retry);
    notice.append(message, button);
    rootElement.prepend(notice);
  };

  // One bounded notice timer, no automatic retry/reload loop. A slow import can
  // still finish normally after this notice is shown.
  const timer = setTimeout(showRecovery, timeoutMs);
  let Home;
  try {
    Home = (await loadHome()).default;
  } catch (error) {
    clearTimeout(timer);
    console.error('[Homepage startup]', error);
    showRecovery();
    return;
  }
  clearTimeout(timer);
  rootElement.querySelector('[data-home-startup-notice]')?.remove();
  rootElement.removeAttribute('data-loading-state');
  rootElement.removeAttribute('data-adsense-block');
  mount(Home);
}
