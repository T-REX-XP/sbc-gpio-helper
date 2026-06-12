# Requirements

Original goals for the GPIO visualizer.

## Core

Build a web app to visualize the GPIO header of Raspberry Pi and compatible boards.

Ensure pins in use for different display HATs are clearly shown on the header.

## Display HATs (initial scope)

- [2.13″ e-Paper HAT](https://www.waveshare.com/wiki/2.13inch_e-Paper_HAT_Manual)
- [1.3″ LCD HAT](https://www.waveshare.com/wiki/1.3inch_LCD_HAT) — [product](https://www.waveshare.com/1.3inch-lcd-hat.htm)
- [1.44″ LCD HAT](https://www.waveshare.com/wiki/1.44inch_LCD_HAT) — [product](https://www.waveshare.com/1.44inch-lcd-hat.htm)

## Implemented extensions

- Multi-platform support (Raspberry Pi, Radxa Zero, Radxa Zero 3)
- Platform comparison and SPI bus views
- Radxa device-tree overlay reference
- Hardware registry (SBC + HAT catalog with SoC metadata)
- Optional [Umami analytics](analytics.md) for usage tracking
- [GitHub Pages](deployment.md) static hosting via GitHub Actions
