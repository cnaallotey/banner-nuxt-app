<script setup>
const config = useRuntimeConfig()
const props = defineProps({
  affiliate: String,
});

const now = new Date();
const banner = ref(null);
const bannerStyles = ref(null);
const countdownParts = ref({
  hours: 0,
  minutes: 0,
  seconds: 0
});
let countdownInterval = null;
const backgroundStyles = ref('');

watchEffect(async () => {
  try {
    // Fetch banner data
    const response = await $fetch("https://staging-banner.bitterbrains.com/json", {
      query: { affiliate: props.affiliate },
    });
    
    const activeBanner = response
      .flat()
      .map(item => ({ ...item, remaining: new Date(item.ends) - now }))
      .find(item => item.remaining > 0);
    
    banner.value = activeBanner;
    
    // Generate background style variables if assets are available
    if (activeBanner && activeBanner.assets) {
      const assetRoot = "https://staging-banner.bitterbrains.com"; // Adjust this URL as needed
      
      backgroundStyles.value = ["mobile", "tablet", "desktop"]
        .map(
          (breakpoint) =>
            `--bb-bg-${breakpoint}: url(${assetRoot}/images/banners/assets/${activeBanner.assets}/bg-${breakpoint}.${
              activeBanner.assetsFormat || "png"
            })`
        )
        .join(";");
    } else {
      backgroundStyles.value = '';
    }
    
    // If banner has a cssUrl property, load that CSS
    if (activeBanner && activeBanner.classes) {
        console.log(config.public.appRoot)
      loadCss(`${config.public.appRoot}/css/${activeBanner.classes[0]}.css`);
    } else {
      // Fallback to a default CSS if needed
      loadCss(`${config.public.appRoot}/css/base.css`);
    }
    
    // Start the countdown when banner is loaded
    if (activeBanner && activeBanner.showCountdown) {
      startCountdown();
    }
  } catch (error) {
    console.error('Error fetching banner data:', error);
  }
});

// Function to load CSS dynamically
const loadCss = (url) => {
  // Make sure the URL ends with .css if it doesn't already
  if (!url.endsWith('.css')) {
    url = `${url}.css`;
  }
  
  // Remove any previously loaded banner styles
  if (bannerStyles.value && document.head.contains(bannerStyles.value)) {
    document.head.removeChild(bannerStyles.value);
  }
  
  // Create new stylesheet link
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  link.type = 'text/css'; // Explicitly set the type
  link.onload = () => console.log(`CSS loaded: ${url}`);
  link.onerror = (e) => {
    console.error(`Error loading CSS from ${url}:`, e);
  };
  
  // Add to document and store reference
  document.head.appendChild(link);
  bannerStyles.value = link;
};

function startCountdown() {
  // Clear any existing interval
  if (countdownInterval) clearInterval(countdownInterval);

  // Initial update
  updateCountdown();
  
  // Don't start interval if static countdown
  if (banner.value.isCountdownStatic) return;
  
  // Set interval for countdown
  countdownInterval = setInterval(() => {
    const now = new Date();
    const countdownRemaining = new Date(banner.value.ends) - now;
    
    if (countdownRemaining > 0) {
      updateCountdown();
    } else {
      // Stop countdown when time is up
      clearInterval(countdownInterval);
    }
  }, 1000);
}

function updateCountdown() {
  if (!banner.value || !banner.value.ends) return;
  
  const { ends, showDaysAsHours } = banner.value;
  const now = new Date();
  const countdownRemaining = new Date(ends) - now;
  
  if (countdownRemaining <= 0) {
    // Handle countdown completion
    countdownParts.value = { hours: 0, minutes: 0, seconds: 0 };
    if (countdownInterval) clearInterval(countdownInterval);
    return;
  }
  
  const parts = {
    days: Math.floor(countdownRemaining / (1000 * 60 * 60 * 24)),
    hours: Math.floor((countdownRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((countdownRemaining % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((countdownRemaining % (1000 * 60)) / 1000),
  };
  
  if (showDaysAsHours) {
    parts.hours = parts.hours + parts.days * 24;
    delete parts.days;
  }
  
  // Update reactive countdown values
  countdownParts.value = parts;
}

// Clean up function to remove the CSS and clear interval when component is unmounted
onUnmounted(() => {
  if (bannerStyles.value && document.head.contains(bannerStyles.value)) {
    document.head.removeChild(bannerStyles.value);
  }
  
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
});
</script>
<template>
  <div>
    <div v-if="banner" id="bb-banner-container" class="card">
      <a
        id="bb-banner"
        :class="banner.classes[0]"
        target="_blank"
        :href="`${banner.link}?utm_source=vuejsforge&amp;utm_medium=website&amp;utm_campaign=affiliate&amp;utm_content=inline_banner&amp;banner_type=inline&amp;friend=${props.affiliate.toUpperCase()}`"
        class="bb-campaign-vs-test"
      >
        <div class="bb-background" :style="backgroundStyles"></div>
        <div class="bb-logo"></div>
        <div class="bb-side-image"></div>
        <div class="bb-core">
          <div class="bb-slogan">
            <div v-if="banner.prelude" class="bb-prelude" v-html="banner.prelude"></div>
            <div class="bb-title-container">
              <div v-if="banner.title" class="bb-title" v-html="banner.title"></div>
              <div v-if="banner.subtitle" class="bb-subtitle" v-html="banner.subtitle"></div>
            </div>
            <div v-if="banner.interlude" class="bb-interlude" v-html="banner.interlude"></div>
          </div>
          <div v-if="banner.cta" class="bb-button-wrapper"><div class="bb-button">{{ banner.cta }}</div></div>
          <div class="bb-countdown-container">
            <div v-if="banner.addendum" class="bb-addendum">{{ banner.addendum }}</div>
            <div v-if="banner.showCountdown" class="bb-countdown-wrapper">
              <div v-if="banner.countdownFooter" class="bb-countdown-footer">{{ banner.countdownFooter }}</div>
              <div class="bb-countdown">
                <!-- Days (if using them) -->
                <div v-if="countdownParts.days !== undefined" class="bb-countdown-item">
                  <div class="bb-countdown-part">
                    <div data-countdown="days" class="bb-countdown-number">
                      {{ countdownParts.days.toString().padStart(2, '0') }}
                    </div>
                    <div class="bb-countdown-text">
                      <span class="bb-countdown-text-initial">d</span>
                      <span class="bb-countdown-text-rest">ays</span>
                    </div>
                  </div>
                  <div class="bb-countdown-colon">:</div>
                </div>

                <div class="bb-countdown-item">
                  <div class="bb-countdown-part">
                    <div data-countdown="hours" class="bb-countdown-number">
                      {{ countdownParts.hours.toString().padStart(2, '0') }}
                    </div>
                    <div class="bb-countdown-text">
                      <span class="bb-countdown-text-initial">h</span>
                      <span class="bb-countdown-text-rest">ours</span>
                    </div>
                  </div>
                  <div class="bb-countdown-colon">:</div>
                </div>

                <div class="bb-countdown-item">
                  <div class="bb-countdown-part">
                    <div data-countdown="minutes" class="bb-countdown-number">
                      {{ countdownParts.minutes.toString().padStart(2, '0') }}
                    </div>
                    <div class="bb-countdown-text">
                      <span class="bb-countdown-text-initial">m</span>
                      <span class="bb-countdown-text-rest">inutes</span>
                    </div>
                  </div>
                  <div class="bb-countdown-colon">:</div>
                </div>

                <div class="bb-countdown-item">
                  <div class="bb-countdown-part">
                    <div data-countdown="seconds" class="bb-countdown-number">
                      {{ countdownParts.seconds.toString().padStart(2, '0') }}
                    </div>
                    <div class="bb-countdown-text">
                      <span class="bb-countdown-text-initial">s</span>
                      <span class="bb-countdown-text-rest">econds</span>
                    </div>
                  </div>
                  <div class="bb-countdown-colon">:</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </a>
    </div>
  </div>
</template>

<style>
@import url('/public/css/base.css');
</style>