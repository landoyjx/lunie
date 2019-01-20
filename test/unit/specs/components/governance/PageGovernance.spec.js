import setup from "../../../helpers/vuex-setup"
import Vuelidate from "vuelidate"
import PageGovernance from "renderer/components/governance/PageGovernance"
import ModalPropose from "renderer/components/governance/ModalPropose"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

const proposal = {
  amount: 15,
  title: `A new text proposal for Cosmos`,
  description: `a valid description for the proposal`,
  type: `Text`,
  password: `1234567890`
}
const { governanceParameters, stakingParameters } = lcdClientMock.state
const depositDenom = governanceParameters.deposit.min_deposit[0].denom

describe(`PageGovernance`, () => {
  let wrapper, store
  let { mount, localVue } = setup()
  localVue.use(Vuelidate)
  localVue.directive(`tooltip`, () => {})
  localVue.directive(`focus`, () => {})

  beforeEach(() => {
    let instance = mount(PageGovernance, {
      doBefore: ({ store }) => {
        store.commit(`setGovParameters`, governanceParameters)
        store.state.governanceParameters.loaded = true
        store.commit(`setStakingParameters`, stakingParameters.parameters)
        store.commit(`setConnected`, true)
      }
    })
    wrapper = instance.wrapper
    store = instance.store
    store.state.user.address = lcdClientMock.addresses[0]
    store.dispatch(`updateDelegates`)
    store.commit(`setAtoms`, 1337)
  })

  it(`has the expected html structure`, async () => {
    // somehow we need to wait one tick for the total atoms to update
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`disables proposal creation if not connected`, async () => {
    expect(
      wrapper.vm.$el.querySelector(`#propose-btn`).getAttribute(`disabled`)
    ).toBeNull()
    store.commit(`setConnected`, false)
    expect(
      wrapper.vm.$el.querySelector(`#propose-btn`).getAttribute(`disabled`)
    ).not.toBeNull()
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  describe(`Modal onPropose modal on click`, () => {
    it(`displays the Propose modal`, () => {
      let proposeBtn = wrapper.find(`#propose-btn`)
      proposeBtn.trigger(`click`)
      expect(wrapper.contains(ModalPropose)).toEqual(true)
    })
  })
})
