import { shallowMount } from "@vue/test-utils"
import TmBalance from "common/TmBalance"

describe(`TmBalance`, () => {
  let wrapper, $store, $apollo

  beforeEach(async () => {
    $store = {
      getters: {
        address: "cosmos1address",
        network: "test-network"
      },
      state: {
        connection: {
          network: "cosmos-hub-mainnet"
        },
        session: {
          experimentalMode: true
        }
      }
    }

    $apollo = {
      queries: {
        overview: {
          loading: false,
          error: false
        }
      }
    }

    wrapper = shallowMount(TmBalance, {
      mocks: {
        $store,
        $apollo
      }
    })
    wrapper.setData({
      stakingDenom: "ATOM",
      overview: {
        totalStake: 3210,
        liquidStake: 1230,
        totalRewards: 1000.45,
        rewards: [
          {
            amount: 1,
            denom: `TOKEN1`
          },
          {
            amount: 2,
            denom: `TOKEN1`
          },
          {
            amount: 1.5,
            denom: `TOKEN1`
          }
        ]
      }
    })
  })

  it(`show the balance header when signed in`, () => {
    expect(wrapper.element).toMatchSnapshot()
    expect(wrapper.text()).toMatch(/Total ATOM.*3,210/s)
    expect(wrapper.text()).toMatch(/Available ATOM.*1,230/s)
    expect(wrapper.text()).toMatch(/Total Rewards.*1,000.45/s)
    expect(wrapper.text()).toContain("Total ATOM")
    expect(wrapper.text()).toContain("Total ATOM")
    expect(wrapper.text()).toContain("Total ATOM")
  })

  it(`do not show available atoms when the user has none in the first place`, () => {
    // This *should* set overview to an empty Object, but the call is ignored?
    // Setting it to false has the desired effect.
    wrapper.setData({
      overview: {
        totalStake: 0,
        liquidStake: 0,
        totalRewards: 0
      }
    })
    expect(wrapper.element).toMatchSnapshot()
    expect(wrapper.text()).toContain("Total ATOM")
    expect(wrapper.text()).not.toContain("Available ATOM")
    expect(wrapper.text()).not.toContain("Total Rewards")
  })

  it(`opens send modal`, () => {
    const $refs = { SendModal: { open: jest.fn() } }
    wrapper.vm.$refs = $refs
    wrapper.find(".send-button").trigger("click")
    expect($refs.SendModal.open).toHaveBeenCalled()
  })

  it(`opens claim rewards modal`, () => {
    const $refs = { ModalWithdrawRewards: { open: jest.fn() } }
    wrapper.vm.$refs = $refs
    wrapper.find("#withdraw-btn").trigger("click")
    expect($refs.ModalWithdrawRewards.open).toHaveBeenCalled()
  })

  it(`disables claim rewards button when no rewards`, () => {
    wrapper.setData({
      overview: {
        totalRewards: 0
      }
    })
    const $refs = { ModalWithdrawRewards: { open: jest.fn() } }
    wrapper.vm.$refs = $refs
    wrapper.find("#withdraw-btn").trigger("click")
    expect($refs.ModalWithdrawRewards.open).not.toHaveBeenCalled()
  })

  it(`if no balances are found, then it returns the staking denom`, () => {
    wrapper.setData({
      balances: []
    })
    expect(wrapper.vm.getAllDenoms).toEqual(["ATOM"])
  })

  it(`should return true if rewards contain multiple denoms`, () => {
    wrapper.setData({
      balances: [
        {
          amount: 1,
          denom: "ATOM",
          fiatValue: `33€`
        },
        {
          amount: 2,
          denom: "TOKEN1",
          fiatValue: `1.5€`
        }
      ]
    })
    expect(wrapper.vm.isMultiDenomNetwork).toBe(true)
  })

  it(`should show How To Get Tokens tutorial`, () => {
    wrapper.setData({
      showTutorial: false
    })
    wrapper.vm.openTutorial()
    expect(wrapper.vm.showTutorial).toBe(true)
  })

  it(`should hide How To Get Tokens tutorial`, () => {
    wrapper.setData({
      showTutorial: true
    })
    wrapper.vm.hideTutorial()
    expect(wrapper.vm.showTutorial).toBe(false)
  })

  it(`should calculate the total rewards amount for each denom when rewards contain multiple denoms`, () => {
    const totalDenomRewards = wrapper.vm.calculateTotalRewardsDenom(`TOKEN1`)
    expect(totalDenomRewards).toBe(4.5)
  })
})
