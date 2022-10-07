import { defineStore } from "pinia"
import { computed, ref } from "vue"

export const useGameStore = defineStore("game", () => {
    const loading = ref(false)
    const ready = ref(false)

    const isReady = computed(() => ready.value && !loading.value)

    const test = () => {
        ready.value = !ready.value
    }

    return {
        loading, ready,

        isReady,

        test,
    }
})