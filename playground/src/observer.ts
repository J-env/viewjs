import { reactive, watch } from '@viewjs/observer'

const data = reactive({
  a: 0,

  add() {
    this.a++
  }
})

const dom = document.createElement('div')
// dom.innerHTML = String(data.a)
document.body.appendChild(dom)

watch(data, 'a', (value, oldValue) => {
  dom.innerHTML = ` value: ${value}, oldValue: ${oldValue}`

  console.log('watch()')
}, {
  immediate: true,
})

document.addEventListener('click', function () {
  data.add();
  data.add();
})

console.log(data)
