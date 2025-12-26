<template>
  <div>
    <VpForm v-model="model" :schema="schema" ref="formRef">
      <template #actions>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">Create</el-button>
          <el-button @click="onCancel">Cancel</el-button>
        </el-form-item>
      </template>
    </VpForm>
    {{ model }}
  </div>
</template>

<script setup lang="tsx">
import type { VpFormSchema } from 'el-admin-components'
// import { useForm } from 'el-admin-components'
import type { FormInstance, FormItemInstance } from 'element-plus'

const icon = () => {
  return (
    <>
      <i class='i-el:home mr-2'> hello </i>
    </>
  )
}

definePage({
  meta: {
    title: 'pages.form-basic',
    icon: 'fluent:form-multiple-28-regular'
  }
})
const formRef = ref<FormInstance>()
const formItemRef = ref<FormItemInstance>()

const schema = ref([
  {
    prop: 'name',
    value: '',
    label: 'Activity name',
    type: 'input',
    prefixSlot: icon,
    rules: [
      { required: true, message: 'Please input Activity name', trigger: 'blur' },
      { min: 3, max: 5, message: 'Length should be 3 to 5', trigger: 'blur' }
    ],
    itemRef: (ref: FormItemInstance) => {
      formItemRef.value = ref
    },
    class: 'flex'
  },
  {
    prop: 'region',
    value: '',
    label: 'Activity zone',
    type: 'select',
    rules: [
      {
        required: true,
        message: 'Please select Activity zone'
      }
    ],
    children: [
      {
        label: 'Zone one',
        value: 'shanghai'
      },
      {
        label: 'Zone two',
        value: 'beijing'
      }
    ]
  },
  {
    span: 11,
    prop: 'date1',
    value: '',
    type: 'date-picker',
    label: 'Pick a date~~~',
    attrs: {
      type: 'date',
      placeholder: 'Pick a datehaha',
      style: {
        width: '100%'
      },
      clearable: true
    },
    rules: [
      {
        type: 'date',
        required: true,
        message: 'Please pick a date',
        trigger: 'change'
      }
    ]
  },
  {
    prop: '',
    label: 'Activity time',
    schema: [
      {
        span: 11,
        prop: 'date12',
        value: '',
        type: 'date-picker',
        label: 'Pick a date111',
        attrs: {
          type: 'date',
          placeholder: 'Pick a date aaa',
          style: {
            width: '100%'
          },
          clearable: true
        },
        events: {
          change: (e: any) => {
            console.log('🚀 ~ e:', e)
          }
        },
        rules: [
          {
            type: 'date',
            required: true,
            message: 'Please pick a date!!!!',
            trigger: 'change'
          }
        ]
      },
      {
        span: 2,
        value: '-',
        attrs: {
          class: 'text-center w-full'
        }
      },
      {
        span: 11,
        type: 'time-picker',
        prop: 'date2',
        value: '',
        label: 'Pick a time',
        attrs: {
          placeholder: 'Pick a time',
          style: {
            width: '100%'
          },
          clearable: true
        },
        rules: [
          {
            type: 'date',
            required: true,
            message: 'Please pick a time',
            trigger: 'change'
          }
        ]
      }
    ]
  },
  { prop: 'delivery', value: false, label: 'Instant delivery', type: 'switch' },
  {
    type: 'rate',
    prop: 'rate',
    value: '',
    label: 'Rate'
  },
  {
    prop: 'type',
    value: [],
    label: 'Activity type',
    type: 'checkbox-group',
    rules: [
      {
        type: 'array',
        required: true,
        message: 'Please select at least one activity type',
        trigger: 'change'
      }
    ],
    children: [
      {
        type: 'checkbox',
        label: 'Online activities',
        name: 'type'
      },
      {
        type: 'checkbox',
        label: 'Promotion activities',
        name: 'type'
      },
      {
        type: 'checkbox',
        label: 'Offline activities',
        name: 'type'
      },
      {
        type: 'checkbox',
        label: 'Simple brand exposure',
        name: 'type'
      }
    ]
  },
  {
    type: 'radio-group',
    prop: 'resource',
    label: 'Resources',
    value: 1,
    children: [
      {
        type: 'radio',
        label: 'Sponsor',
        value: 1
      },
      {
        type: 'radio',
        label: 'Venue',
        value: 2
      }
    ],
    rules: [
      {
        required: true,
        message: 'Please select activity resource',
        trigger: 'change'
      }
    ]
  },
  {
    type: 'input',
    prop: 'desc',
    value: '',
    attrs: {
      type: 'textarea'
    },
    rules: [{ required: true, message: 'Please input activity form', trigger: 'blur' }]
  },
  {
    type: 'cascader',
    prop: 'component',
    attrs: {
      options: [
        {
          value: 'guide',
          label: 'Guide',
          children: [
            {
              value: 'disciplines',
              label: 'Disciplines',
              children: [
                {
                  value: 'consistency',
                  label: 'Consistency'
                },
                {
                  value: 'feedback',
                  label: 'Feedback'
                },
                {
                  value: 'efficiency',
                  label: 'Efficiency'
                },
                {
                  value: 'controllability',
                  label: 'Controllability'
                }
              ]
            },
            {
              value: 'navigation',
              label: 'Navigation',
              children: [
                {
                  value: 'side nav',
                  label: 'Side Navigation'
                },
                {
                  value: 'top nav',
                  label: 'Top Navigation'
                }
              ]
            }
          ]
        },
        {
          value: 'component',
          label: 'Component',
          children: [
            {
              value: 'basic',
              label: 'Basic',
              children: [
                {
                  value: 'layout',
                  label: 'Layout'
                },
                {
                  value: 'color',
                  label: 'Color'
                },
                {
                  value: 'typography',
                  label: 'Typography'
                },
                {
                  value: 'icon',
                  label: 'Icon'
                },
                {
                  value: 'button',
                  label: 'Button'
                }
              ]
            },
            {
              value: 'form',
              label: 'Form',
              children: [
                {
                  value: 'radio',
                  label: 'Radio'
                },
                {
                  value: 'checkbox',
                  label: 'Checkbox'
                },
                {
                  value: 'input',
                  label: 'Input'
                },
                {
                  value: 'input-number',
                  label: 'InputNumber'
                },
                {
                  value: 'select',
                  label: 'Select'
                },
                {
                  value: 'cascader',
                  label: 'Cascader'
                },
                {
                  value: 'switch',
                  label: 'Switch'
                },
                {
                  value: 'slider',
                  label: 'Slider'
                },
                {
                  value: 'time-picker',
                  label: 'TimePicker'
                },
                {
                  value: 'date-picker',
                  label: 'DatePicker'
                },
                {
                  value: 'datetime-picker',
                  label: 'DateTimePicker'
                },
                {
                  value: 'upload',
                  label: 'Upload'
                },
                {
                  value: 'rate',
                  label: 'Rate'
                },
                {
                  value: 'form',
                  label: 'Form'
                }
              ]
            },
            {
              value: 'data',
              label: 'Data',
              children: [
                {
                  value: 'table',
                  label: 'Table'
                },
                {
                  value: 'tag',
                  label: 'Tag'
                },
                {
                  value: 'progress',
                  label: 'Progress'
                },
                {
                  value: 'tree',
                  label: 'Tree'
                },
                {
                  value: 'pagination',
                  label: 'Pagination'
                },
                {
                  value: 'badge',
                  label: 'Badge'
                }
              ]
            },
            {
              value: 'notice',
              label: 'Notice',
              children: [
                {
                  value: 'alert',
                  label: 'Alert'
                },
                {
                  value: 'loading',
                  label: 'Loading'
                },
                {
                  value: 'message',
                  label: 'Message'
                },
                {
                  value: 'message-box',
                  label: 'MessageBox'
                },
                {
                  value: 'notification',
                  label: 'Notification'
                }
              ]
            },
            {
              value: 'navigation',
              label: 'Navigation',
              children: [
                {
                  value: 'menu',
                  label: 'Menu'
                },
                {
                  value: 'tabs',
                  label: 'Tabs'
                },
                {
                  value: 'breadcrumb',
                  label: 'Breadcrumb'
                },
                {
                  value: 'dropdown',
                  label: 'Dropdown'
                },
                {
                  value: 'steps',
                  label: 'Steps'
                }
              ]
            },
            {
              value: 'others',
              label: 'Others',
              children: [
                {
                  value: 'dialog',
                  label: 'Dialog'
                },
                {
                  value: 'tooltip',
                  label: 'Tooltip'
                },
                {
                  value: 'popover',
                  label: 'Popover'
                },
                {
                  value: 'card',
                  label: 'Card'
                },
                {
                  value: 'carousel',
                  label: 'Carousel'
                },
                {
                  value: 'collapse',
                  label: 'Collapse'
                }
              ]
            }
          ]
        },
        {
          value: 'resource',
          label: 'Resource',
          children: [
            {
              value: 'axure',
              label: 'Axure Components'
            },
            {
              value: 'sketch',
              label: 'Sketch Templates'
            },
            {
              value: 'docs',
              label: 'Design Documentation'
            }
          ]
        }
      ]
    },
    events: {
      change: (value: any) => {
        console.log(value)
      }
    }
  }
] as VpFormSchema)

const { model } = useForm(schema.value)

const onSubmit = () => {
  formRef.value?.validate()
  console.log('submit!')
}

const onCancel = () => {
  formRef.value?.clearValidate()
  console.log('cancel!', formItemRef.value?.size)
}
</script>

<style scoped></style>
