import Item from 'playlist/item';
import ProvidersSupported from 'providers/providers-supported';
import Promise from 'polyfills/promise';

let bundlePromise = null;

export default function loadCoreBundle(model) {
    if (!bundlePromise) {
        bundlePromise = selectBundle(model);
    }
    return bundlePromise;
}

export function chunkLoadErrorHandler(/* error */) {
    // Webpack require.ensure error: "Loading chunk 3 failed"
    throw new Error('Network error');
}

export function selectBundle(model) {
    const controls = model.get('controls');
    const polyfills = requiresPolyfills();
    const html5Provider = requiresProvider(model, 'html5');

    if (controls && polyfills && html5Provider) {
        return loadControlsPolyfillHtml5Bundle();
    }
    if (controls && html5Provider) {
        return loadControlsHtml5Bundle();
    }
    if (controls && polyfills) {
        return loadControlsPolyfillBundle();
    }
    if (controls) {
        return loadControlsBundle();
    }
    return loadCore();
}

export function requiresPolyfills() {
    const IntersectionObserverEntry = window.IntersectionObserverEntry;
    return !IntersectionObserverEntry ||
        !('IntersectionObserver' in window) ||
        !('intersectionRatio' in IntersectionObserverEntry.prototype);
}

export function requiresProvider(model, providerName) {
    const playlist = model.get('playlist');
    if (Array.isArray(playlist) && playlist.length) {
        const firstSource = Item(playlist[0]).sources[0];
        if (firstSource) {
            for (let i = ProvidersSupported.length; i--;) {
                const providerSupports = ProvidersSupported[i];
                if (providerSupports.name === providerName) {
                    const providersManager = model.getProviders();
                    return providersManager.providerSupports(providerSupports, firstSource);
                }
            }
        }
    }
    return false;
}

function loadControlsHtml5Bundle() {
    return require.ensure([
        'controller/controller',
        'view/controls/controls',
        'providers/html5'
    ], function (require) {
        return require('controller/controller').default;
    }, chunkLoadErrorHandler, 'jwplayer.core.controls.html5');
}

function loadControlsPolyfillHtml5Bundle() {
    return require.ensure([
        'controller/controller',
        'view/controls/controls',
        'intersection-observer',
        'providers/html5'
    ], function (require) {
        require('intersection-observer');
        return require('controller/controller').default;
    }, chunkLoadErrorHandler, 'jwplayer.core.controls.polyfills.html5');
}

function loadControlsPolyfillBundle() {
    return require.ensure([
        'controller/controller',
        'view/controls/controls',
        'intersection-observer'
    ], function (require) {
        require('intersection-observer');
        return require('controller/controller').default;
    }, chunkLoadErrorHandler, 'jwplayer.core.controls.polyfills');
}

function loadControlsBundle() {
    return require.ensure([
        'controller/controller',
        'view/controls/controls'
    ], function (require) {
        return require('controller/controller').default;
    }, chunkLoadErrorHandler, 'jwplayer.core.controls');
}

function loadCore() {
    return loadIntersectionObserverIfNeeded().then(() => {
        return require.ensure([
            'controller/controller'
        ], function (require) {
            return require('controller/controller').default;
        }, chunkLoadErrorHandler, 'jwplayer.core');
    });
}

function loadIntersectionObserverIfNeeded() {
    if (requiresPolyfills()) {
        return require.ensure([
            'intersection-observer'
        ], function (require) {
            return require('intersection-observer');
        }, chunkLoadErrorHandler, 'polyfills.intersection-observer');
    }
    return Promise.resolve();
}
