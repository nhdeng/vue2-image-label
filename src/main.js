import ImageLabel from "./packages/image-label";

const components = [
    ImageLabel
]

const install = function (Vue) {
    components.forEach(component => {
        Vue.component(component.name, component)
    })
}

export default {
    install
}