const closeIcon = `<svg width="15" height="15" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg" style="fill: #bfc9e0;"><path d="M1490 1322q0 40-28 68l-136 136q-28 28-68 28t-68-28l-294-294-294 294q-28 28-68 28t-68-28l-136-136q-28-28-28-68t28-68l294-294-294-294q-28-28-28-68t28-68l136-136q28-28 68-28t68 28l294 294 294-294q28-28 68-28t68 28l136 136q28 28 28 68t-28 68l-294 294 294 294q28 28 28 68z"></path></svg>`;

const pricingPopup = document.querySelector('#pricing-popup');
const openBtn = document.querySelector('#pricing-open');
const pricingBtn = document.querySelector('#pricing-close');
const pricingMask = document.querySelector('#pricing-mask');
const closePopup = (el) => () => {
  el.style.setProperty('display', 'none');
  document.querySelector('#pricing-frame').remove();
  document.body.style.removeProperty('overflow');
};
if (pricingBtn) {
  pricingBtn.innerHTML = closeIcon;
  pricingBtn.addEventListener('click', closePopup(pricingPopup));
  pricingMask.addEventListener('click', closePopup(pricingPopup));
  openBtn.addEventListener('click', () => {
    const f = document.createElement('iframe');
    f.setAttribute('id', 'pricing-frame');
    f.setAttribute('src', 'https://app.bumobiledetailing.com/pricing');
    f.setAttribute('frameborder', '0');
    f.setAttribute('style', 'width: 100%; min-height: 324px;');
    document.querySelector('#pricing-frame-container').appendChild(f);
    pricingPopup.style.setProperty('display', 'block');
    const pricingDialog = document.querySelector('#pricing-dialog');
    setTimeout(() => {
      document.body.style.setProperty('overflow', 'hidden');
      pricingDialog.style.setProperty('visibility', 'visible');
    }, 300);
  });

  window.addEventListener(
    'message',
    function (event) {
      console.log({ event });
      const iframe = document.getElementById('pricing-frame');
      const w = document.body.clientWidth;

      if (w < 768) {
        iframe.style.height = 'calc(100vh - 100px)';
        return;
      }
      iframe.style.height = event.data + 'px';
    },
    false,
  );
}
