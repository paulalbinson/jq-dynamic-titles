# jQuery Dynamic Titles

Blink, scroll, or replace a browser tab's title using `$.dynTitles`.
This utility changes `document.title` for the page, so no element selection is needed.

## Installation

Load jQuery before the plugin, then call `$.dynTitles`:

```html
<script src="scripts/jquery.min.js"></script>
<script src="scripts/jq-dynamic-titles.js"></script>
<script>
    $.dynTitles({
        type: 'blink',
        message: 'New message',
        onlyOnNonFocus: false
    });
</script>
```

Load the plugin after the page's `<title>` element, because it captures the original title when it registers. Load it once per page.

The package is published on npm: [jq-dynamic-titles](https://www.npmjs.com/package/jq-dynamic-titles). Install it with:

```sh
npm install jq-dynamic-titles jquery
```

The plugin file is `scripts/jq-dynamic-titles.js` within the package. Browser script tags register it automatically using global `jQuery` and `window`.

For CommonJS in a browser bundle, register it with your jQuery instance and browser window:

```js
const $ = require('jquery');
const registerDynTitles = require('jq-dynamic-titles');

registerDynTitles($, window);

$.dynTitles({ message: 'New message', onlyOnNonFocus: false });
```

With an ES module bundler that supports CommonJS interoperability:

```js
import $ from 'jquery';
import registerDynTitles from 'jq-dynamic-titles';

registerDynTitles($, window);

$.dynTitles({ message: 'New message', onlyOnNonFocus: false });
```

The package exports a CommonJS registration function, not a native ES module. Importing or requiring it alone does not register the plugin or access a browser window. Call the registration function after the page's `<title>` exists; it uses the supplied window and its document and returns `$.dynTitles`. Continue calling the effect through `$.dynTitles(...)`.

Register once per jQuery/window pair. Repeated registration replaces the utility and adds more event handlers. Use separate jQuery instances when working with separate windows. A browser DOM is required to register and run the plugin; it cannot run during server-side rendering without one.

## Usage

```js
// Blink between the message and the original title while the page is unfocused.
$.dynTitles({ type: 'blink', message: 'New message' });

// Scroll immediately, even while the page has focus.
$.dynTitles({
    type: 'scroll',
    message: "Bob's message",
    onlyOnNonFocus: false
});

// Set a constant title, even while focused.
$.dynTitles({
    type: 'const',
    message: 'Upload finished',
    onlyOnNonFocus: false
});

// Stop the animation and restore the title captured when the plugin loaded.
$.dynTitles({ type: 'restore' });
```

Each call cancels the previous animation timer. The original title remains the value captured when the plugin registered; it is not captured again on each call. Changes made to `document.title` by other scripts do not update that saved value.

## Options

| Option | Default | Description |
| --- | --- | --- |
| `type` | `'blink'` | `'blink'`, `'scroll'`, `'const'`, or `'restore'` |
| `message` | `'New Message'` | String to display; unused for restore |
| `speed` | `'medium'` | `'fast'`, `'medium'`, `'slow'`, or a positive finite number of milliseconds, up to 2147483647 |
| `direction` | `'fwd'` | Starting scroll direction: `'fwd'` or `'bwd'` |
| `reverse` | `true` | Alternate scroll directions; use `false` to repeat the starting direction |
| `onlyOnNonFocus` | `true` | Apply the effect only when the window does not have focus; restore and stop when focus returns |

Forward scrolling progressively reveals the message from the beginning. Backward scrolling progressively removes characters from the beginning. At the end of a cycle, the original title is shown before scrolling restarts. Scrolling uses 2000 ms pauses at the full message when reversing or starting backward, and 1500 ms pauses at the original title.

Named speeds have different timings for scrolling and blinking:

| Speed | Scroll | Blink |
| --- | --- | --- |
| `'fast'` | 200 ms | 1000 ms |
| `'medium'` | 400 ms | 2000 ms |
| `'slow'` | 1000 ms | 5000 ms |

Numeric speeds are used unchanged for either effect. Speed has no visual effect on `const` or `restore`, but is still validated for every call. Invalid `speed` or `type` values throw `TypeError` before cancelling the existing animation. Other options are not currently validated; supply a string message and boolean values for `reverse` and `onlyOnNonFocus`.

The implementation also accepts an optional `position` value for scrolling, but normal usage should omit it to use the starting position for the chosen direction.

## Focus behaviour

With `onlyOnNonFocus: true`, call the utility after the window has lost focus, such as from an asynchronous notification or a delayed callback. Calling while focused restores the saved title without starting an effect. It does not queue an effect to start on the next blur.

When focus returns, the original title is restored immediately and the effect stops, including a constant title. A later blur does not restart it; call `$.dynTitles` again for another notification. With `onlyOnNonFocus: false`, focus changes do not interrupt the effect.

Focus is tracked using `document.hasFocus()` initially and window `focus`/`blur` events thereafter. The plugin does not listen for document visibility changes. Its namespaced event handlers remain attached for the lifetime of the page.

## Defaults and callback

Change public defaults before making a call:

```js
$.dynTitles.defaults.speed = 'slow';

$.dynTitles({ message: 'Ready', onlyOnNonFocus: false }, function () {
    console.log('Title effect configured');
});
```

Each call copies the defaults before applying its options. The optional callback runs once, synchronously after the call has processed the requested effect, even if focus prevented the effect from starting. It is not an animation completion callback. A callback can also be the only argument; that call uses the defaults.

When invoked as `$.dynTitles(...)`, the callback's `this` value and the utility's return value are jQuery. This is a utility on `$`, not a method on jQuery element collections.

## Compatibility and limitations

The package declares jQuery `^3.7.1 || ^4.0.0` as a peer dependency. The current version has no automated test suite; verify the demos with the jQuery versions and browsers you intend to support.

The plugin uses `Number.isFinite`, so older browsers need a suitable polyfill. Background tabs may throttle timers, making animation delays approximate. Scrolling uses JavaScript string indexes (UTF-16 code units), so it can split emoji, surrogate pairs, and combined characters.

## Documentation and demos

Documentation and interactive examples are available on the [jQuery Dynamic Titles demo page](https://paulalbinson.com/code-and-demos/jquery/jq-dynamic-titles).

The demo page is hosted separately from this package.

## Preparing a release

1. Verify the demos, including focus restoration, replacement effects, numeric and named speeds, both scroll directions, and invalid `type`/`speed` values.
2. Confirm the npm package name and release version. Add the actual GitHub `repository`, `homepage`, and `bugs` URLs to `package.json`.
3. Run `npm pack --dry-run` and inspect the file list. The package includes the plugin, README, licence, and package manifest; the website assets and bundled jQuery are excluded.
4. Review the provenance and licensing of any third-party code or assets before distribution. The original scrolling effect was inspired by HIOX INDIA / hscripts.com.
5. Publish to npm when ready, using `npm publish` (or `npm publish --access public` for a public scoped package).

There is currently no `npm test` script or GitHub Actions workflow.

## Licence

Copyright (C) 2010-2026 Paul Albinson.

The plugin is licensed under the GNU Affero General Public License, version 3 only (`AGPL-3.0-only`); see [LICENSE](LICENSE). Preserve its copyright and licence notices, and identify modifications as required by the licence. The software is provided without warranty.

Third-party dependencies and assets retain their respective licences.
