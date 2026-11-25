# Changelog

## 1.0.1

- Validate message and focus options, plus scrolling direction and reverse options, before changing a running effect. Invalid values throw `TypeError`.
- Allow restore to ignore effect-specific options, including an invalid default speed.
- Preserve whole grapheme clusters while scrolling when `Intl.Segmenter` is available, including joined emoji, flags, and combining marks. Fall back to Unicode code points otherwise.
- Clarify option validation, focus behaviour, per-call settings, callbacks, and Unicode support in the README.

## 1.0.0

- Initial npm release with blink, scroll, constant-title, and restore actions.
- Browser-script and CommonJS registration support through `$.dynTitles`.
- Released under AGPL-3.0-only.
