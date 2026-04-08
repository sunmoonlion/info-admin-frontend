import type { Directive } from 'vue'

const blinkAnimationStyle = `
@keyframes blink {
  to {
    visibility: hidden
  }
}

.cursor1:after {
  -webkit-animation: blink 1s steps(5, start) infinite;
  animation: blink 1s steps(5, start) infinite;
  content: "_";
  margin-left: .25rem;
  vertical-align: baseline
}
`

function addStylesOnce(css: string, id: string) {
  if (!document.head.querySelector(`#${id}`)) {
    const style = document.createElement('style')
    style.id = id
    style.appendChild(document.createTextNode(css))
    document.head.appendChild(style)
  }
}

const timerMap = new WeakMap<Element, number[]>()

function clearTimers(el: Element) {
  const timers = timerMap.get(el)
  if (timers) {
    timers.forEach(clearInterval)
    timerMap.delete(el)
  }
}

// 一段文字
const flash: Directive = {
  mounted: function (el: HTMLElement) {
    // css -> 模拟光标
    addStylesOnce(blinkAnimationStyle, 'v-flash-animation')
    // js -> DOM文字的显示 -> 计时器来进行定时执行
    // 1.拿到DOM中的文字text -> 总长度
    const text = el.innerText
    const children = el.children

    const run = (elem: Element, txt: string, cb?: () => void) => {
      clearTimers(elem)
      elem.classList.add('cursor1')
      // 2.设置一个随机数random，长度小于上面的文本长度
      const len = txt.length
      const random = Math.floor(Math.random() * len)
      let content = txt
      // 3.删除text中random个字符，每隔200ms删除一个，直到删除random个
      const timer1 = setInterval(() => {
        content = content.substring(0, content!.length - 1)
        elem.textContent = content
        if (content!.length === random) {
          // 4.删除完成之后，每隔0.5s添加一个字符，直到添加完毕，这个是一个轮回。
          const timer2 = setInterval(() => {
            content = content + txt!.charAt(content!.length)
            elem.textContent = content
            if (content.length === txt.length) {
              clearInterval(timer2)
              elem.classList.remove('cursor1')

              setTimeout(() => {
                if (typeof cb === 'function') {
                  cb()
                } else {
                  run(elem, txt)
                }
              }, 5000)
            }
          }, 500)
          clearInterval(timer1)
          timerMap.get(elem)?.push(timer2 as unknown as number)
        }
      }, 200)
      timerMap.get(elem)?.push(timer1 as unknown as number)
    }

    const runChildren = () => {
      // children长度，随机一个数
      // 对随机的child执行run方法
      const random = Math.floor(Math.random() * children.length)
      const node = children[random]
      const textNode = node?.textContent
      if (node && textNode) {
        run(node, textNode, runChildren)
      }
    }

    if (text && children.length === 0) {
      run(el, text)
    } else {
      runChildren()
    }
  },
  beforeUnmount: function (el) {
    clearTimers(el)
  }
}

export default flash
