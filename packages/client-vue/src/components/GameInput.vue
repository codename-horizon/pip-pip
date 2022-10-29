<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

const emit = defineEmits([
    "update:modelValue", 
    "enter", "focus", "blur",
    "enter", "up",
])
const props = defineProps({
    placeholder: {
        type: String,
        default: "",
    },
    type: {
        type: String,
        default: "text",
    },
    modelValue: {
        type: String,
    },
})

const input = ref<HTMLInputElement>()

function focus(){
    input.value?.focus()
}

const inputEventListener = (e: Event) => {
    if(e.type === "focus"){
        // const event = e as FocusEvent
        emit("focus")
    }
    if(e.type === "keyup"){
        const event = e as KeyboardEvent
        if(event.code === "Escape"){
            input.value?.blur()
            e.preventDefault()
        }
        if(event.code === "Enter"){
            emit("enter")
            e.preventDefault()
        }
        if(event.code === "Up"){
            emit("up")
            e.preventDefault()
        }
    }
    if(e.type === "blur"){
        // const event = e as FocusEvent
        emit("blur")
    }
    if(e.type === "click"){
        if(e.target !== input.value){
            input.value?.blur()
        }
    }
}

onMounted(() => {
    input.value?.addEventListener("focus", inputEventListener)
    input.value?.addEventListener("blur", inputEventListener)
    input.value?.addEventListener("keyup", inputEventListener)
    document.body?.addEventListener("click", inputEventListener)
})

onUnmounted(() => {
    input.value?.removeEventListener("focus", inputEventListener)
    input.value?.removeEventListener("blur", inputEventListener)
    input.value?.removeEventListener("keyup", inputEventListener)
    document.body?.removeEventListener("click", inputEventListener)
})

const inputModel = computed({
    get(){
        return props.modelValue
    },
    set(value){
        emit("update:modelValue", value)
    }
})

defineExpose({
    inputModel,
    focus,
    input,
})

</script>

<template lang="pug">
.input
    input(
        ref="input" 
        :type="props.type" 
        v-model="inputModel"
        :placeholder="props.placeholder"
        @click="focus")
</template>

<style scoped lang="sass">
@import "../styles/_variables.sass"

.input
    input
        appearance: none
        border: 0
        outline: 0
        user-select: text
        font-size: $font-size-input
        padding: $text-padding-y $text-padding-x
        border: $border-size solid
        border-radius: $border-radius
        display: block
        width: 100%


.input
    input
        background-color: white
        border-color: $color-border
        color: $color-dark-2
        &:focus
            border-color: $color-dark-3
        &::selection
            color: white
            background: $color-main-darker
            

</style>