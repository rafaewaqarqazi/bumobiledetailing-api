const closeIcon = `<svg width="15" height="15" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg" style="fill: #bfc9e0;"><path d="M1490 1322q0 40-28 68l-136 136q-28 28-68 28t-68-28l-294-294-294 294q-28 28-68 28t-68-28l-136-136q-28-28-28-68t28-68l294-294-294-294q-28-28-28-68t28-68l136-136q28-28 68-28t68 28l294 294 294-294q28-28 68-28t68 28l136 136q28 28 28 68t-28 68l-294 294 294 294q28 28 28 68z"></path></svg>`;
const serverURL = 'https://api.bumobiledetailing.com';
let shown = false;
const pricingPopup = document.querySelector('#pricing-popup');
const openBtn = document.querySelector('#pricing-open');
const pricingBtn = document.querySelector('#pricing-close');
const pricingWrap = document.querySelector('#pricing-wrap');
const bookingPopup = document.querySelector('#booking-popup');
const bookingOpenBtn = document.querySelectorAll('.booking-open');
const bookingCloseBtn = document.querySelector('#booking-close');
const bookingWrap = document.querySelector('#booking-wrap');
const closePopup = (el, f) => () => {
  el.style.setProperty('display', 'none');
  if (!!f) {
    document.querySelector(f).remove();
  }
  document.body.style.removeProperty('overflow');
};
const bodyOverflowHidden = () => {
  document.body.style.setProperty('overflow', 'hidden');
};
const handleOpen = ({ frame, popup, url }) => {
  const f = document.createElement('iframe');
  f.setAttribute('id', `${frame}-frame`);
  f.setAttribute('src', `https://app.bumobiledetailing.com/${url}`);
  f.setAttribute('frameborder', '0');
  f.setAttribute('style', 'width: 100%; min-height: 324px;');
  document.querySelector(`#${frame}-frame-container`).appendChild(f);
  popup.style.setProperty('display', 'block');
  const d = document.querySelector(`#${frame}-dialog`);
  setTimeout(() => {
    bodyOverflowHidden();
    d.style.setProperty('visibility', 'visible');
  }, 300);
};
const handlePopup = ({
  openBtn,
  openBtns,
  closeBtn,
  popup,
  wrap,
  frame,
  url,
}) => {
  closeBtn.innerHTML = closeIcon;
  closeBtn.addEventListener('click', closePopup(popup, `#${frame}-frame`));
  wrap.addEventListener('click', closePopup(popup, `#${frame}-frame`));
  if (openBtns?.length) {
    openBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        handleOpen({ frame, popup, url });
      });
    });
  }
  if (openBtn) {
    openBtn.addEventListener('click', () => {
      handleOpen({ frame, popup, url });
    });
  }

  window.addEventListener(
    'message',
    function (event) {
      const iframe = document.getElementById(`${frame}-frame`);
      iframe.style.height = event.data + 5 + 'px';
    },
    false,
  );
};
if (pricingBtn) {
  handlePopup({
    popup: pricingPopup,
    openBtn,
    closeBtn: pricingBtn,
    wrap: pricingWrap,
    frame: 'pricing',
    url: 'pricing',
  });
}
if (bookingCloseBtn) {
  handlePopup({
    popup: bookingPopup,
    openBtns: bookingOpenBtn,
    closeBtn: bookingCloseBtn,
    wrap: bookingWrap,
    frame: 'booking',
    url: 'get-started-popup',
  });
}
const showError = (msg, el) => {
  el.style.border = '1px solid red';
  const error = document.querySelector('#intent-popup-error');
  error.innerHTML = msg;
  error.style.display = 'block';
};
const hideError = (el) => {
  el.style.border = '1px solid #E7ECF1';
  const error = document.querySelector('#intent-popup-error');
  error.innerHTML = '';
  error.style.display = 'none';
};
const showCoupon = () => {
  const heading = document.querySelector('#intent-popup-heading');
  heading.innerHTML = 'Thankyou!';
  document.querySelector('#intent-popup-text').remove();
  document.querySelector('#intent-popup-form').remove();
  const coupon = document.querySelector('#intent-popup-coupon');
  coupon.style.display = 'block';
};
const handleCopy = () => {
  const range = document.createRange();
  range.selectNode(document.querySelector('.coupon'));
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);
  document.execCommand('copy');
  window.getSelection().removeAllRanges();
  const s = document.querySelector('.success');
  s.style.setProperty('display', 'block');
  setTimeout(() => {
    s.style.setProperty('display', 'none');
  }, 2000);
};
const onSubmit = (e) => {
  e.preventDefault();

  const email = document.getElementById('intent-popup-email');
  hideError(email);
  if (!email.value) {
    showError('Please enter email', email);
    return;
  }
  if (!email.value.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
    showError('Please enter valid email', email);
    return;
  }
  const data = {
    email: email.value,
  };
  fetch(`${serverURL}/api/customer/intent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }).then(() => {
    showCoupon();
  });
};
const handleIntent = () => {
  const intent = document.createElement('div');
  intent.setAttribute('id', 'intent-popup');
  intent.classList.add('pricing-main');
  intent.innerHTML = `<div class="pricing-popup-mask"></div>
<div class="pricing-popup-wrap" id='intent-popup-wrap' >
<div id='intent-popup-dialog' class="pricing-popup-dialog intent-popup-dialog">
 <div class="pricing-popup-content intent-popup-content">
 <button type="button" class='pricing-popup-close-button' id='intent-popup-close'>
${closeIcon}
</button>
<h2 id='intent-popup-heading' class="intent-popup-heading">Wait, we have a special offer for you!</h2>
<h1 id='intent-popup-text' class="intent-popup-text">Checkout now &amp; receive 15% OFF your first order</h1>
<form id='intent-popup-form' class="intent-popup-form">
<div class="intent-popup-sub">Enter your email for your exclusive offer</div>
<div class="intent-popup-input-wrapper">
<div style='width: 100%'>
<input placeholder="Your email address" id="intent-popup-email" type="text" value="" class="intent-popup-input">
<span id='intent-popup-error' style='display: none;color: red'></span>
</div>
</div>
<div style="display: flex;justify-content: center;margin-top: 24px;">
<button type="submit" class="intent-popup-submit">
GET MY 15% OFF
</button>
</div>
</form>
<div id='intent-popup-coupon' class='intent-popup-form' style='display: none'>
<div class='mt-24' style="display: flex;flex-direction: column">
<p class="intent-popup-sub" style='max-width: 24rem;margin: 0 auto'>Use the following code & complete
your order now:</p>
<div style='display: flex; justify-content: center' class='mt-24'>
<span class="intent-popup-input coupon">LABOR</span></div>
<button type="button" class="intent-popup-submit mt-24">
Copy Code!
</button>
<span class='success'>Copied!</span>
</div>
</div>
</div>
</div>
</div>
</div>`;

  document.body.appendChild(intent);
  const btn = document.querySelector('#intent-popup-close');
  const dialog = document.querySelector('#intent-popup-dialog');
  const form = document.querySelector('#intent-popup-form');
  const copyBtn = document.querySelector('#intent-popup-coupon button');
  btn.addEventListener('click', closePopup(intent));
  setTimeout(() => {
    bodyOverflowHidden();
    dialog.style.setProperty('visibility', 'visible');
  }, 300);
  form.addEventListener('submit', onSubmit);
  copyBtn.addEventListener('click', handleCopy);
  shown = true;
};

window.addEventListener(
  'scroll',
  () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollPercentage =
      (scrollTop / (documentHeight - windowHeight)) * 100;

    if (scrollPercentage >= 50 && !shown) {
      shown = true;
      setTimeout(function () {
        handleIntent();
      }, 500);
    }
  },
  false,
);
