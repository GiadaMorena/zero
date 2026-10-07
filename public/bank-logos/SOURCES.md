# Bank logo sources

Original assets retrieved 2026-10-04. Logos identify the bank of a user-entered card; they do not imply a banking integration or affiliation.

- Intesa Sanpaolo: https://group.intesasanpaolo.com/en/newsroom/PressKit
  Asset: https://group.intesasanpaolo.com/etc/designs/portalgroup/clientlib-all/images/logo/ISP_logo-01.png
- Revolut: https://developer.revolut.com/docs/resources/open-banking-logo-guidelines
  Asset: https://assets.revolut.com/Brand/Retail/Logos/Wordmark/Revolut_Black.svg
- Fineco: https://finecobank.com/it/online/
  Asset: https://images.finecobank.com/common-global/img/logo/logo-fineco.svg
- Allianz: logo del gruppo, senza inferire una specifica carta Allianz Bank.
  Source: https://commons.wikimedia.org/wiki/File:Allianz_logo.svg (author Allianz)
  Asset: https://upload.wikimedia.org/wikipedia/commons/6/6e/Allianz_logo.svg
- Wordmark variants: background plates removed and viewBox fitted to the original lettering. Original paths and brand colors preserved.

## Added bank identities
- UniCredit: https://www.unicredit.it/etc/designs/ucpublic/it/img/UC-logo-white.svg
- N26: https://n26.com/logo-112x112.png
- ING: https://www.ing.it/includes/v2025/img/logo-primary-large.svg
- BPER: https://www.bper.it/o/bper-2026-theme/images/BPER_Logo_Verde_SITOCOMM.svg (viewBox tightened around lettering)
- BBVA: https://www.bbva.com/wp-content/themes/coronita-bbvacom/assets/images/logos/bbva-logo-900x269.png
- HYPE: https://www.datocms-assets.com/81014/1773674622-logo-hype-positive.svg (symbol retained; parent-company tagline excluded)
- Crédit Agricole: https://www.credit-agricole.it/images/logo.png
- PostePay: https://commons.wikimedia.org/wiki/File:Logo_Postepay.svg; asset https://upload.wikimedia.org/wikipedia/commons/2/22/Logo_Postepay.svg
- Sella: https://commons.wikimedia.org/wiki/File:Banca_Sella_Logo.svg; asset https://upload.wikimedia.org/wikipedia/commons/a/a4/Banca_Sella_Logo.svg
- BancoPosta: https://seeklogo.com/vector-logo/16109/bancoposta; asset https://seeklogo.com/images/B/BancoPosta-logo-E3FC7D4E7A-seeklogo.com.gif
Monochrome white rendering on dark cards for contrast; sources remain available locally.

## Additional identities (2026-10-07)
- Banco BPM: https://www.bancobpm.it/media/2022/05/logoBancoBPM.svg
- MPS: https://www.mps.it/includes/v2021/img/logo-mps-white.png
- BNL: https://bnl.it/it/persone/public/assets/images/logo_dark_bg.svg
- Mediolanum: https://www.bancamediolanum.it/static-assets/images/elementi/menu/2022/07/26/logo-bancamediolanum-positivo.svg
- Credem: https://www.credem.it/content/dam/credem/immagini/loghi/Credem%20Banca_CMYK.svg
- Widiba: https://www.widiba.it/sf-images/default-source/theme/logo.svg (UTF-8 declaration corrected)
- illimity: https://illimity.com/assets/img/logo-illimity.png
- Deutsche Bank: https://www.db.com/application/project/images/logos/identifier_RETINA.png (official wordmark)
- Banca Ifis: https://www.bancaifis.it/app/uploads/2026/01/BANCAIFIS_Logo_Footer_Blu.svg (bottom empty viewBox space removed)

/test-banche is an isolated, read-only fictional profile containing one card per supported brand. It uses the same BankCardDetails and cardAppearance as the app and does not create an authentication identity or write into a user's account.
SVGs without intrinsic dimensions (UniCredit, PostePay, Mediolanum, Ifis) now explicitly declare width/height to prevent zero-size flex rendering. Credem retains its original left square emblem with native wordmark text beside it.

## Refined Intesa and BancoPosta marks (2026-10-07)
- Intesa Sanpaolo: https://commons.wikimedia.org/wiki/File:Intesa_Sanpaolo_logo.svg (attributed to Intesa Sanpaolo); https://upload.wikimedia.org/wikipedia/commons/5/51/Intesa_Sanpaolo_logo.svg. White monochrome rendering, no background plate.
- BancoPosta: original vector paths extracted from the official Poste document https://www.media.poste.it/934cb944-c811-43c6-8180-17743c8a3403/web/bollettini-soggetti-beneficiari (page 1, wordmark at top left). No raster enlargement or crop mask.
Intesa vector lettering is white; original multicolor arch emblem preserved.
