import { shallowMount, createLocalVue } from "@vue/test-utils"
import TableInvoice from "src/ActionModal/components/TableInvoice"

describe(`TableInvoice`, () => {
  let wrapper
  const localVue = createLocalVue()
  localVue.directive(`tooltip`, () => {})

  const $store = {
    getters: {
      bondDenom: `STAKE`
    }
  }

  beforeEach(() => {
    wrapper = shallowMount(TableInvoice, {
      localVue,
      mocks: { $store },
      propsData: {
        amount: 1,
        estimatedFee: 0.00030864
      }
    })
  })

  it(`should show the transaction invoice summary`, async () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})