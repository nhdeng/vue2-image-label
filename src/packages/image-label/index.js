import ImageLabel from './src/index.vue'

ImageLabel.install = function (Vue) {
    Vue.component(ImageLabel.name, ImageLabel)
}

export default ImageLabel