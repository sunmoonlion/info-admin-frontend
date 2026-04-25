import Sortable from 'sortablejs'
import { h, nextTick } from 'vue'
import DragIcon from '../DragIcon.vue'

export function useDrag() {
  function addId(flag: boolean, arr: any[]) {
    const ids = Math.random().toString(36).slice(2)
    if (flag && arr.length && !arr[0].id) {
      arr.forEach((item, index) => {
        item.id = ids + '-' + index
      })
      // rowKey.value = 'id'
    }
    return arr
  }

  function columnDrop(
    elem: HTMLElement,
    handle = '.el-table__header-wrapper tr',
    cb?: (evt: Sortable.SortableEvent) => void
  ) {
    nextTick(() => {
      const el = elem.querySelector(handle)
      Sortable.create(el as HTMLElement, {
        delay: 0,
        animation: 300,
        onEnd: (evt: Sortable.SortableEvent) => {
          cb && cb(evt)
        }
      })
    })
  }

  function rowDrop(
    elem: HTMLElement,
    handle = '.el-table__body-wrapper tbody',
    cb?: (evt: Sortable.SortableEvent) => void
  ) {
    nextTick(() => {
      const el = elem.querySelector(handle)
      Sortable.create(el as HTMLElement, {
        delay: 0,
        handle: '.drag-btn',
        animation: 300,
        onEnd: (evt: Sortable.SortableEvent) => {
          cb && cb(evt)
        }
      })
    })
  }

  function setColumn(arr: any[]) {
    const defaultSlot = arr[0].defaultSlot
    arr[0].defaultSlot = (_prop: any) => {
      return h(
        DragIcon,
        { icon: 'i-icon-park-outline:drag' },
        {
          default: () => {
            const { row } = _prop
            return defaultSlot
              ? defaultSlot(_prop)
              : h('span', {}, arr[0]?.prop ? row[arr[0].prop] : '')
          }
        }
      )
    }
  }

  return {
    addId,
    columnDrop,
    rowDrop,
    setColumn
  }
}
