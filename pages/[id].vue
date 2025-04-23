<script setup>
const route = useRoute()
const params = route.params

</script>

<template>
    <div>
        <Banner v-if="params.id" :affiliate="params.id" />
    </div>
</template>