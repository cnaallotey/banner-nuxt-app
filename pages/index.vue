<script setup>
const affiliate = ref("");

const unListedAffiliate = ref("");

const affiliates = [
  "masteringnuxt",
  "vueschool",
  "vueschool_premium",
  "vueschool_free",
  "vs_masteringpinia",
  "vueuse",
  "pinia",
  "vuerouter",
  "NSCRIPT",
  "vuejsnation",
  "vuejsforge",
  "nuxtnation",
  "angulartraining",
  "vuejs",
  "vuejsdevelopers",
  "nuxt",
  "SENODEV",
  "vuejobs",
  "VUEDEMY",
  "ANGADEMY",
];
</script>
<template>
    <Banner v-if="affiliate" :affiliate="affiliate" />
    <div>
      <div class="w-full h-lvh flex justify-center items-center p-4 md:p-10">
        <div class="max-w-md flex flex-col gap-4 w-full">
          <p class="text-gray-700 font-medium">Select your affiliate</p>
          <USelectMenu
            v-model="affiliate"
            :options="affiliates"
          />

          <form
            action="submit"
            @submit.prevent="affiliate=unListedAffiliate"
            class="flex flex-col gap-2 mt-6"
          >
            <p class="text-gray-700 font-medium">Enter your affiliate id if not listed</p>
            <UInput v-model="unListedAffiliate" />
            <UButton
              type="submit"
              class="w-full inline-flex items-center justify-center text-center"
              >Submit</UButton
            >
          </form>
        </div>
      </div>
    </div>
</template>