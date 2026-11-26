# Changelog

## 1.1.0

- Accept case-insensitive values for effect type, named speed, and scrolling direction. Message capitalisation and option names remain unchanged.
- Accept `forward` and `backward` as aliases for `fwd` and `bwd`, including mixed-case variants.
- Preserve supplied options and defaults by normalising only the per-call settings. Existing validation still rejects invalid values.
- Update the README introduction and document case-insensitive values and direction aliases.

## 1.0.1

- Validate message and focus options, plus scrolling direction and reverse options, before changing a running effect. Invalid values throw `TypeError`.
- Allow restore to ignore effect-specific options, including an invalid default speed.
- Preserve whole grapheme clusters while scrolling when `Intl.Segmenter` is available, including joined emoji, flags, and combining marks. Fall back to Unicode code points otherwise.
- Clarify option validation, focus behaviour, per-call settings, callbacks, and Unicode support in the README.

## 1.0.0

- Initial npm release with blink, scroll, constant-title, and restore actions.
- Browser-script and CommonJS registration support through `$.dynTitles`.
- Released under AGPL-3.0-only.
