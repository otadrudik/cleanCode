function renderBanner(platform, browser, resize, isInitialized) {
  const isMacOs = platform.toUpperCase().indexOf("MAC") > -1;
  const isIE = browser.toUpperCase().indexOf("IE") > -1;
  const isResized = resize > 0;

  if (isMacOs && isIE && isInitialized && isResized) {
    // do something
  }
}
